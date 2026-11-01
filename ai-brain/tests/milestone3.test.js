const fs = require('fs');
const path = require('path');
const PatchExecutor = require('../core/PatchExecutor');
const CheckpointManager = require('../core/CheckpointManager');

function runMilestone3Tests() {
  console.log('--- STARTING MILESTONE 3 VERIFICATION ---');
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

  const executor = new PatchExecutor();
  const checkpoint = new CheckpointManager();
  const workspacePath = path.resolve(__dirname, '..', 'storage', 'temp_workspace_ms3');
  if (!fs.existsSync(workspacePath)) fs.mkdirSync(workspacePath, { recursive: true });

  const profile = {
    projectId: 'test-ms3',
    workspacePath,
    allowedFilesystemBoundary: workspacePath
  };

  const testFileRel = 'target_code.js';
  const testFileAbs = path.join(workspacePath, testFileRel);
  fs.writeFileSync(testFileAbs, 'console.log("INITIAL WORKING CODE");\n', 'utf8');

  // Test 1: Successful Patch Application
  const successPatch = executor.executePatch(profile, checkpoint, 'TASK-01', {
    files: [{ path: testFileRel, content: 'console.log("PATCHED CODE");\n' }],
    command: 'node target_code.js'
  });
  assert(successPatch.success === true, 'Successful patch applied and verified cleanly');
  assert(fs.readFileSync(testFileAbs, 'utf8').includes('PATCHED CODE'), 'File content updated to patched version');

  // Test 2: Boundary Violation Protection
  let boundaryBlocked = false;
  try {
    executor.executePatch(profile, checkpoint, 'TASK-02', {
      files: [{ path: '../../outside_file.txt', content: 'MALICIOUS_OVERWRITE' }]
    });
  } catch (err) {
    boundaryBlocked = err.message.includes('SECURITY VIOLATION');
  }
  assert(boundaryBlocked === true, 'PatchExecutor strictly blocks files outside project boundary');

  // Test 3: Automatic Rollback on Verification Failure
  // Let's create an intentionally broken patch that fails `node target_code.js`
  const failingPatch = executor.executePatch(profile, checkpoint, 'TASK-03', {
    files: [{ path: testFileRel, content: 'throw new Error("INTENTIONAL_COMPILATION_FAILURE");' }],
    command: 'node target_code.js'
  });
  assert(failingPatch.success === false, 'Patch with failing verification was flagged as failure');
  assert(failingPatch.rolledBack === true, 'Failed patch triggered automatic rollback');
  assert(fs.readFileSync(testFileAbs, 'utf8') === 'console.log("PATCHED CODE");\n', 'Original file content was 100% restored after failed patch');

  // Test 4: Command Safety Filter
  const forbiddenPatch = executor.executePatch(profile, checkpoint, 'TASK-04', {
    files: [{ path: testFileRel, content: 'console.log("TEST");' }],
    command: 'rm -rf /'
  });
  assert(forbiddenPatch.success === false, 'Forbidden dangerous command was blocked');

  // Cleanup
  if (fs.existsSync(testFileAbs)) fs.unlinkSync(testFileAbs);
  if (fs.existsSync(workspacePath)) fs.rmdirSync(workspacePath, { recursive: true });

  console.log(`--- MILESTONE 3 COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
  if (failCount > 0) process.exit(1);
}

runMilestone3Tests();
