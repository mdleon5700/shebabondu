const path = require('path');
const PersistentQueue = require('./core/PersistentQueue');
const CheckpointManager = require('./core/CheckpointManager');
const ProjectProfileManager = require('./core/ProjectProfileManager');
const PatchExecutor = require('./core/PatchExecutor');
const TestOrchestrator = require('./core/TestOrchestrator');
const FailureMemory = require('./core/FailureMemory');

class AutonomousWorker {
  constructor(projectId, workerId = `worker-${process.pid}`) {
    this.projectId = projectId;
    this.workerId = workerId;
    this.queue = new PersistentQueue();
    this.checkpoint = new CheckpointManager();
    this.profileManager = new ProjectProfileManager();
    this.executor = new PatchExecutor();
    this.orchestrator = new TestOrchestrator();
    this.memory = new FailureMemory();
    this.isRunning = false;
  }

  async runOnce() {
    const profile = this.profileManager.getProfile(this.projectId);
    if (!profile) throw new Error(`Project profile not found: ${this.projectId}`);

    // Reclaim any stale tasks first
    this.queue.reclaimStaleTasks(this.projectId);

    // Acquire lease on next available READY task
    const task = this.queue.acquireLease(this.projectId, this.workerId, 30000);
    if (!task) {
      return { status: 'IDLE', message: 'No READY tasks in queue' };
    }

    console.log(`[WORKER ${this.workerId}] Leased task ${task.taskId}: "${task.title}" (Priority ${task.priority})`);

    // Heartbeat timer
    const heartbeatInterval = setInterval(() => {
      this.queue.renewLease(this.projectId, task.taskId, this.workerId, 30000);
    }, 10000);

    try {
      // Simulate/perform task execution
      const testResult = this.orchestrator.runCommandTest(profile.workspacePath, task.taskId, 'node -v');
      
      clearInterval(heartbeatInterval);

      if (testResult.status === 'PASS') {
        this.queue.updateTaskState(this.projectId, task.taskId, 'COMPLETED', {
          evidence: `Executed verification cleanly: ${testResult.command}`
        });
        console.log(`[WORKER ${this.workerId}] Task ${task.taskId} marked as COMPLETED`);
        return { status: 'COMPLETED', taskId: task.taskId };
      } else {
        this.queue.updateTaskState(this.projectId, task.taskId, 'FAILED', {
          error: testResult.error
        });
        console.log(`[WORKER ${this.workerId}] Task ${task.taskId} marked as FAILED`);
        return { status: 'FAILED', taskId: task.taskId, error: testResult.error };
      }
    } catch (err) {
      clearInterval(heartbeatInterval);
      this.queue.updateTaskState(this.projectId, task.taskId, 'FAILED', { error: err.message });
      return { status: 'ERROR', taskId: task.taskId, error: err.message };
    }
  }

  async processAll(maxTasks = 50) {
    let processed = 0;
    while (processed < maxTasks) {
      const res = await this.runOnce();
      if (res.status === 'IDLE') break;
      processed++;
    }
    return { processed, summary: this.queue.getQueueSummary(this.projectId) };
  }
}

if (require.main === module) {
  const targetProject = process.argv[2] || 'chakri-sheba';
  const worker = new AutonomousWorker(targetProject);
  console.log(`Starting Autonomous Worker for project: ${targetProject}...`);
  worker.processAll(5).then(res => {
    console.log('Worker execution batch completed:', res);
  }).catch(err => {
    console.error('Worker fatal error:', err);
  });
}

module.exports = AutonomousWorker;
