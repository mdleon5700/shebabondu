const fs = require('fs');
const path = require('path');
const TaskPlanner = require('../core/TaskPlanner');
const PersistentQueue = require('../core/PersistentQueue');
const CheckpointManager = require('../core/CheckpointManager');

function runMilestone2Tests() {
  console.log('--- STARTING MILESTONE 2 VERIFICATION ---');
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

  const testProjectId = 'test-ms2-project';
  const planner = new TaskPlanner();
  const queue = new PersistentQueue();
  const checkpoint = new CheckpointManager();

  // Test 1: Task Planner Dependency Graph
  const customTasks = [
    { taskId: 'T-BASE', title: 'Base Infrastructure', priority: 1 },
    { taskId: 'T-FEAT', title: 'Feature Module', dependencies: ['T-BASE'], priority: 2 }
  ];

  const planned = planner.planFromFindings(testProjectId, [], customTasks);
  assert(planned.length === 2, 'Planner generated 2 tasks');
  assert(planned.find(t => t.taskId === 'T-BASE').state === 'READY', 'Base task without dependencies is READY');
  assert(planned.find(t => t.taskId === 'T-FEAT').state === 'WAITING_FOR_DEPENDENCY', 'Feature task with unmet dependency is WAITING_FOR_DEPENDENCY');

  // Test 2: Persistent Queue Lease & State Management
  queue.enqueue(testProjectId, planned);
  const loaded = queue.load(testProjectId);
  assert(loaded.length === 2, 'Persistent queue saved and reloaded tasks from disk');

  // Worker 1 acquires lease
  const lease1 = queue.acquireLease(testProjectId, 'worker-1', 5000);
  assert(lease1 && lease1.taskId === 'T-BASE', 'Worker acquired lease for READY high-priority task T-BASE');
  assert(lease1.state === 'RUNNING', 'Task state transitioned to RUNNING');

  // Simulate completion of T-BASE
  queue.updateTaskState(testProjectId, 'T-BASE', 'COMPLETED', { resultEvidence: 'Base created cleanly' });
  const featTask = queue.getQueueSummary(testProjectId);
  assert(featTask.completed === 1, 'Task T-BASE recorded as COMPLETED');
  
  // T-FEAT should now be READY
  const updatedFeat = queue.load(testProjectId).find(t => t.taskId === 'T-FEAT');
  assert(updatedFeat.state === 'READY', 'T-FEAT automatically transitioned to READY upon dependency completion');

  // Test 3: Stale Worker Lease Expiration & Reclaiming
  const lease2 = queue.acquireLease(testProjectId, 'worker-2', 10); // 10ms short lease
  assert(lease2.taskId === 'T-FEAT', 'Worker 2 leased T-FEAT');

  // Wait 25ms to let lease expire
  const start = Date.now();
  while (Date.now() - start < 25) {}

  const reclaimed = queue.reclaimStaleTasks(testProjectId);
  assert(reclaimed === 1, `Queue successfully reclaimed 1 stale task (reclaimed count: ${reclaimed})`);
  const reclaimedTask = queue.load(testProjectId).find(t => t.taskId === 'T-FEAT');
  assert(reclaimedTask.state === 'READY', 'Reclaimed task returned to READY state for safe retry');

  // Test 4: Checkpoint Manager & Rollback
  const tempTestFile = path.join(__dirname, 'temp_checkpoint_test.txt');
  fs.writeFileSync(tempTestFile, 'ORIGINAL_CONTENT_SAFE_VALUE', 'utf8');

  const cp = checkpoint.createCheckpoint(testProjectId, 'T-FEAT', __dirname, ['temp_checkpoint_test.txt']);
  assert(cp && cp.checkpointId, `Checkpoint created: ${cp.checkpointId}`);

  // Modify file
  fs.writeFileSync(tempTestFile, 'CORRUPTED_MODIFIED_CONTENT_BAD_VALUE', 'utf8');
  assert(fs.readFileSync(tempTestFile, 'utf8') === 'CORRUPTED_MODIFIED_CONTENT_BAD_VALUE', 'File successfully corrupted for test');

  // Perform Rollback
  const rollbackResult = checkpoint.rollback(cp.checkpointId);
  assert(rollbackResult.success === true, 'Rollback executed with success: true');
  const restoredContent = fs.readFileSync(tempTestFile, 'utf8');
  assert(restoredContent === 'ORIGINAL_CONTENT_SAFE_VALUE', 'File restored 100% identically to original content');

  // Cleanup temp file
  if (fs.existsSync(tempTestFile)) fs.unlinkSync(tempTestFile);

  console.log(`--- MILESTONE 2 COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
  if (failCount > 0) process.exit(1);
}

runMilestone2Tests();
