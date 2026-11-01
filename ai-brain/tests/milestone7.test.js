const path = require('path');
const FailureMemory = require('../core/FailureMemory');
const MonitoringController = require('../core/MonitoringController');
const ProjectProfileManager = require('../core/ProjectProfileManager');
const PersistentQueue = require('../core/PersistentQueue');
const CheckpointManager = require('../core/CheckpointManager');

function runMilestone7Tests() {
  console.log('--- STARTING MILESTONE 7 VERIFICATION ---');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failCount++;
    }
  }

  const testProjectId = 'test-ms7-project';
  const memory = new FailureMemory();
  const profileManager = new ProjectProfileManager();
  const queue = new PersistentQueue();
  const checkpoint = new CheckpointManager();

  profileManager.createOrUpdateProfile({
    projectId: testProjectId,
    displayName: 'Milestone 7 Test Target',
    workspacePath: path.resolve(__dirname, '..', '..'),
    framework: 'Next.js',
    language: 'TypeScript',
    mode: 'AUDIT_AND_REPAIR'
  });

  // Test 1: Record Defect & Repair in Failure Memory
  const defectEntry = memory.recordDefectAndFix(testProjectId, {
    defectId: 'DEF-BENGALI-CORRUPT',
    signature: 'TEXT_ENCODING_QUESTION_MARKS',
    category: 'ENCODING',
    rootCause: 'PowerShell Set-Content default ANSI encoding write corrupted UTF-8 strings',
    reproductionSteps: ['Check for ??? in text components'],
    affectedFiles: ['src/app/admin/page.tsx'],
    successfulPatchSummary: 'Rebuilt file using explicit UTF-8 Node writer',
    verificationEvidence: 'Deterministic scanner confirmed 0 ??? occurrences'
  });

  assert(defectEntry.signature === 'TEXT_ENCODING_QUESTION_MARKS', 'Defect entry successfully recorded in persistent memory');

  // Test 2: Failure Avoidance Memory Check
  memory.recordFailedAttempt(testProjectId, 'TEXT_ENCODING_QUESTION_MARKS', 'patch_fingerprint_ansi_write', 'Failed due to encoding');
  const hasFailedAttempt = memory.hasKnownFailedAttempt(testProjectId, 'TEXT_ENCODING_QUESTION_MARKS', 'patch_fingerprint_ansi_write');
  assert(hasFailedAttempt === true, 'FailureMemory correctly identifies and blocks previously failed patch fingerprint');

  const unknownPatchCheck = memory.hasKnownFailedAttempt(testProjectId, 'TEXT_ENCODING_QUESTION_MARKS', 'new_untested_utf8_patch');
  assert(unknownPatchCheck === false, 'New valid patch is not falsely blocked');

  // Test 3: Monitoring Controller System Status
  const monitor = new MonitoringController(profileManager, queue, checkpoint, memory);
  const status = monitor.getSystemStatus(testProjectId);
  assert(status.projectId === testProjectId, 'MonitoringController retrieves accurate project ID');
  assert(status.host.freeMemMB > 0, `Host memory reported (${status.host.freeMemMB}MB free)`);
  assert(status.knownDefectsCount >= 1, `Known defects reported accurately (count: ${status.knownDefectsCount})`);

  // Test 4: CLI Dashboard Output
  const cliText = monitor.renderCliDashboard(testProjectId);
  assert(cliText.includes('UNIVERSAL AUTONOMOUS AI BRAIN'), 'CLI dashboard contains title banner');
  assert(cliText.includes(testProjectId), 'CLI dashboard shows project ID');
  console.log(cliText);

  console.log(`--- MILESTONE 7 COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
  if (failCount > 0) process.exit(1);
}

runMilestone7Tests();
