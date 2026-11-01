const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DiscoveryEngine = require('../core/DiscoveryEngine');
const ProjectProfileManager = require('../core/ProjectProfileManager');
const DeterministicScanner = require('../core/DeterministicScanner');
const TaskPlanner = require('../core/TaskPlanner');
const PersistentQueue = require('../core/PersistentQueue');
const CheckpointManager = require('../core/CheckpointManager');
const PatchExecutor = require('../core/PatchExecutor');
const TestOrchestrator = require('../core/TestOrchestrator');
const FailureMemory = require('../core/FailureMemory');
const GeminiProvider = require('../core/GeminiProvider');

async function runE2EAcceptance() {
  console.log('================================================================');
  console.log('  STARTING UNIVERSAL AUTONOMOUS AI BRAIN END-TO-END ACCEPTANCE  ');
  console.log('================================================================');

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

  // Set up disposable test project directory
  const disposableDir = path.resolve(__dirname, '..', 'disposable_test_target');
  if (fs.existsSync(disposableDir)) {
    fs.rmSync(disposableDir, { recursive: true, force: true });
  }
  fs.mkdirSync(disposableDir, { recursive: true });

  const projectId = 'disposable-demo-app';

  // Seed disposable project with known defects and user files
  fs.writeFileSync(path.join(disposableDir, 'package.json'), JSON.stringify({
    name: 'disposable-test-app',
    version: '1.0.0',
    scripts: { test: 'node test.js' }
  }, null, 2), 'utf8');

  // Defect 1: Broken import
  fs.writeFileSync(path.join(disposableDir, 'app.js'), 'const mod = require("./broken_dependency");\nmodule.exports = mod;\n', 'utf8');

  // Defect 2: Corrupted string
  fs.writeFileSync(path.join(disposableDir, 'messages.json'), JSON.stringify({
    greeting: 'স্বাগতম ??? চাকরি সেবা'
  }, null, 2), 'utf8');

  // Unrelated user modification that must NEVER be lost
  fs.writeFileSync(path.join(disposableDir, 'user_notes.txt'), 'CRITICAL_USER_UNCOMMITTED_NOTES_DO_NOT_TOUCH', 'utf8');

  // Failing test runner
  fs.writeFileSync(path.join(disposableDir, 'test.js'), `
const fs = require('fs');
try {
  require('./app');
  const msg = JSON.parse(fs.readFileSync('./messages.json', 'utf8'));
  if (msg.greeting.includes('???')) throw new Error('Corrupted message found');
  console.log('APP_SELF_TEST_PASSED');
  process.exit(0);
} catch (e) {
  console.error('APP_SELF_TEST_FAILED:', e.message);
  process.exit(1);
}
`, 'utf8');

  console.log('\n--- STEP 1: REPOSITORY DISCOVERY ---');
  const discovery = new DiscoveryEngine();
  const report = discovery.discover(disposableDir);
  assert(report.workspacePath === disposableDir, 'Step 1: Successfully discovered target repository root');
  assert(report.packageInfo.exists === true, 'Step 1: Detected package.json structure');

  console.log('\n--- STEP 2: PROJECT PROFILE REGISTRATION ---');
  const profileManager = new ProjectProfileManager();
  const profile = profileManager.createOrUpdateProfile({
    projectId,
    displayName: 'Disposable Test Target',
    workspacePath: disposableDir,
    mode: 'AUDIT_AND_REPAIR'
  });
  assert(profile.projectId === projectId, 'Step 2: Isolated project profile created');

  console.log('\n--- STEP 3: DETERMINISTIC DEFECT DETECTION ---');
  const scanner = new DeterministicScanner();
  const scanResult = scanner.scan(disposableDir);
  assert(scanResult.findings.length >= 2, `Step 3: Detected ${scanResult.findings.length} confirmed defects`);
  const hasBrokenImport = scanResult.findings.some(f => f.category === 'IMPORT');
  const hasEncodingBug = scanResult.findings.some(f => f.category === 'ENCODING');
  assert(hasBrokenImport === true, 'Step 3: Correctly detected broken import in app.js');
  assert(hasEncodingBug === true, 'Step 3: Correctly detected UTF-8 encoding corruption in messages.json');

  console.log('\n--- STEP 4: TASK DECOMPOSITION & QUEUE PERSISTENCE ---');
  const planner = new TaskPlanner();
  const plannedTasks = planner.planFromFindings(projectId, scanResult.findings);
  assert(plannedTasks.length >= 2, `Step 4: Decomposed defects into ${plannedTasks.length} prioritized tasks`);

  const queue = new PersistentQueue();
  queue.enqueue(projectId, plannedTasks);
  const queueState = queue.load(projectId);
  assert(queueState.length === plannedTasks.length, 'Step 4: Tasks persisted to durable disk queue');

  console.log('\n--- STEP 5: CHECKPOINT CREATION ---');
  const checkpoint = new CheckpointManager();
  const cp = checkpoint.createCheckpoint(projectId, 'TASK-REPAIR-01', disposableDir, ['app.js', 'messages.json']);
  assert(cp && cp.checkpointId, `Step 5: Pre-repair safety checkpoint created: ${cp.checkpointId}`);

  console.log('\n--- STEP 6: CONTROLLED PATCH APPLICATION ---');
  const executor = new PatchExecutor();
  // 6a: Create the missing dependency
  fs.writeFileSync(path.join(disposableDir, 'broken_dependency.js'), 'module.exports = { status: "ACTIVE" };\n', 'utf8');
  // 6b: Fix messages.json
  const fixPatch = executor.executePatch(profile, checkpoint, 'TASK-FIX-01', {
    files: [
      {
        path: 'messages.json',
        content: JSON.stringify({ greeting: 'স্বাগতম চাকরি সেবা বিডি' }, null, 2)
      }
    ]
  });
  assert(fixPatch.success === true, 'Step 6: Safe patch applied to messages.json');

  console.log('\n--- STEP 7: FOCUSED TEST EXECUTION & VERIFICATION ---');
  const orchestrator = new TestOrchestrator();
  const testRun = orchestrator.runCommandTest(disposableDir, 'E2E-TEST', 'node test.js');
  assert(testRun.status === 'PASS', 'Step 7: Project self-test passed cleanly after patch');
  assert(testRun.output.includes('APP_SELF_TEST_PASSED'), 'Step 7: Captured test passing evidence');

  console.log('\n--- STEP 8: PRESERVATION OF UNRELATED USER DATA ---');
  const userNotes = fs.readFileSync(path.join(disposableDir, 'user_notes.txt'), 'utf8');
  assert(userNotes === 'CRITICAL_USER_UNCOMMITTED_NOTES_DO_NOT_TOUCH', 'Step 8: Unrelated user files remained 100% untouched and intact');

  console.log('\n--- STEP 9: REJECTION OF UNSAFE COMMANDS ---');
  const unsafeResult = executor.executePatch(profile, checkpoint, 'TASK-UNSAFE', {
    files: [],
    command: 'rm -rf /'
  });
  assert(unsafeResult.success === false, 'Step 9: Dangerous command rejected by security policy');

  console.log('\n--- STEP 10: FAILED PATCH AUTOMATIC ROLLBACK ---');
  const badPatch = executor.executePatch(profile, checkpoint, 'TASK-BAD', {
    files: [
      { path: 'messages.json', content: 'MALFORMED_NON_JSON_CONTENT' }
    ],
    command: 'node test.js'
  });
  assert(badPatch.success === false, 'Step 10: Patch causing test failure was rejected');
  assert(badPatch.rolledBack === true, 'Step 10: Automatic rollback executed');
  assert(fs.readFileSync(path.join(disposableDir, 'messages.json'), 'utf8').includes('স্বাগতম'), 'Step 10: Valid file content restored via rollback');

  console.log('\n--- STEP 11: WORKER RECOVERY AFTER RESTART ---');
  // Simulate worker crash by acquiring a lease with 10ms duration
  const workerTask = queue.acquireLease(projectId, 'worker-alpha', 10);
  assert(workerTask !== null, 'Step 11: Worker acquired task lease');
  // Wait 25ms to simulate crashed worker
  const t0 = Date.now();
  while (Date.now() - t0 < 25) {}
  // Reclaim
  const reclaimedCount = queue.reclaimStaleTasks(projectId);
  assert(reclaimedCount === 1, 'Step 11: Worker restart successfully reclaimed orphaned task');

  console.log('\n--- STEP 12: FAILURE MEMORY INTEGRATION ---');
  const memory = new FailureMemory();
  memory.recordDefectAndFix(projectId, {
    defectId: 'DEF-DISPOSABLE-01',
    signature: 'BROKEN_MODULE_IMPORT',
    category: 'IMPORT',
    rootCause: 'Missing dependency file broken_dependency.js',
    successfulPatchSummary: 'Created broken_dependency.js and verified node test.js',
    verificationEvidence: 'Test returned APP_SELF_TEST_PASSED'
  });
  const memEntries = memory.load(projectId);
  assert(memEntries.length === 1, 'Step 12: Defect and verified fix preserved in failure memory');

  console.log('\n--- STEP 13: GEMINI API MODEL CONNECTIVITY ---');
  const gemini = new GeminiProvider();
  const conn = await gemini.verifyConnectivity();
  assert(conn.connected === true, `Step 13: Live Google Gemini API connected (${conn.modelsCount} models)`);

  console.log('\n================================================================');
  console.log(`  E2E ACCEPTANCE SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('================================================================\n');

  // Clean up disposable test target
  if (fs.existsSync(disposableDir)) {
    fs.rmSync(disposableDir, { recursive: true, force: true });
  }

  if (failCount > 0) process.exit(1);
}

runE2EAcceptance();
