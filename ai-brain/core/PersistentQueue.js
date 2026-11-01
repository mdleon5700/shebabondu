const fs = require('fs');
const path = require('path');

const VALID_STATES = new Set([
  'QUEUED',
  'READY',
  'RUNNING',
  'WAITING_FOR_APPROVAL',
  'WAITING_FOR_DEPENDENCY',
  'VERIFYING',
  'RETRY_PENDING',
  'PAUSED',
  'BLOCKED',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
]);

class PersistentQueue {
  constructor(storageDir = path.join(__dirname, '..', 'storage', 'queues')) {
    this.storageDir = storageDir;
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  _getQueueFile(projectId) {
    return path.join(this.storageDir, `${projectId}.json`);
  }

  load(projectId) {
    const file = this._getQueueFile(projectId);
    if (!fs.existsSync(file)) return [];
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      return [];
    }
  }

  save(projectId, tasks) {
    const file = this._getQueueFile(projectId);
    const tempFile = file + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(tasks, null, 2), 'utf8');
    fs.renameSync(tempFile, file);
    return tasks;
  }

  enqueue(projectId, newTasks) {
    const tasks = this.load(projectId);
    const list = Array.isArray(newTasks) ? newTasks : [newTasks];
    
    for (const t of list) {
      const idx = tasks.findIndex(item => item.taskId === t.taskId);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...t };
      } else {
        tasks.push(t);
      }
    }
    this.save(projectId, tasks);
    return tasks;
  }

  acquireLease(projectId, workerId, leaseDurationMs = 30000) {
    this.reclaimStaleTasks(projectId);
    const tasks = this.load(projectId);
    const now = Date.now();

    // Find first READY task ordered by priority (1 is highest)
    const candidates = tasks
      .filter(t => t.state === 'READY')
      .sort((a, b) => a.priority - b.priority);

    if (candidates.length === 0) return null;

    const task = candidates[0];
    task.state = 'RUNNING';
    task.leaseOwner = workerId;
    task.leaseExpiresAt = now + leaseDurationMs;
    task.attemptCount = (task.attemptCount || 0) + 1;
    task.startedAt = new Date().toISOString();

    this.save(projectId, tasks);
    return task;
  }

  renewLease(projectId, taskId, workerId, leaseDurationMs = 30000) {
    const tasks = this.load(projectId);
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return false;

    if (task.leaseOwner === workerId && task.state === 'RUNNING') {
      task.leaseExpiresAt = Date.now() + leaseDurationMs;
      task.lastHeartbeat = new Date().toISOString();
      this.save(projectId, tasks);
      return true;
    }
    return false;
  }

  reclaimStaleTasks(projectId) {
    const tasks = this.load(projectId);
    const now = Date.now();
    let reclaimed = 0;

    for (const task of tasks) {
      if (task.state === 'RUNNING' && task.leaseExpiresAt && task.leaseExpiresAt < now) {
        if (task.attemptCount >= (task.maxAttempts || 3)) {
          task.state = 'FAILED';
          task.failureReason = 'Max retry attempts exceeded after worker timeout';
        } else {
          task.state = 'READY';
          task.leaseOwner = null;
          task.leaseExpiresAt = null;
        }
        reclaimed++;
      }
    }

    if (reclaimed > 0) {
      this.save(projectId, tasks);
    }
    return reclaimed;
  }

  updateTaskState(projectId, taskId, newState, metadata = {}) {
    if (!VALID_STATES.has(newState)) {
      throw new Error(`Invalid task state: ${newState}`);
    }

    const tasks = this.load(projectId);
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) throw new Error(`Task ${taskId} not found in project ${projectId}`);

    task.state = newState;
    task.updatedAt = new Date().toISOString();
    Object.assign(task, metadata);

    // If completed or failed, clear lease
    if (['COMPLETED', 'FAILED', 'BLOCKED', 'CANCELLED'].includes(newState)) {
      task.leaseOwner = null;
      task.leaseExpiresAt = null;
      task.completedAt = new Date().toISOString();
    }

    // Refresh ready states for any dependent tasks
    const completedSet = new Set(tasks.filter(t => t.state === 'COMPLETED').map(t => t.taskId));
    for (const t of tasks) {
      if (t.state === 'WAITING_FOR_DEPENDENCY') {
        const satisfied = (t.dependencies || []).every(dep => completedSet.has(dep));
        if (satisfied) t.state = 'READY';
      }
    }

    this.save(projectId, tasks);
    return task;
  }

  getQueueSummary(projectId) {
    const tasks = this.load(projectId);
    const summary = {
      total: tasks.length,
      ready: 0,
      running: 0,
      completed: 0,
      failed: 0,
      waiting: 0,
      blocked: 0
    };

    for (const t of tasks) {
      if (t.state === 'READY') summary.ready++;
      else if (t.state === 'RUNNING') summary.running++;
      else if (t.state === 'COMPLETED') summary.completed++;
      else if (t.state === 'FAILED') summary.failed++;
      else if (t.state.startsWith('WAITING')) summary.waiting++;
      else if (t.state === 'BLOCKED') summary.blocked++;
    }
    return summary;
  }
}

module.exports = PersistentQueue;
