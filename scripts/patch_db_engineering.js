const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
let content = fs.readFileSync(dbPath, 'utf8');

// 1. Add engineeringTasks to DatabaseState interface
const target1 = 'platformSettings?: import(\'./types\').PlatformSettings;';
if (!content.includes('engineeringTasks?: Record<string, import(\'./engineering/types\').EngineeringTask>;')) {
  content = content.replace(target1, target1 + '\r\n  engineeringTasks?: Record<string, import(\'./engineering/types\').EngineeringTask>;');
}

// 2. Add default initialization in loadDB
const target2 = '_cachedDbState = state;';
if (!content.includes('if (!state.engineeringTasks) state.engineeringTasks = {};')) {
  content = content.replace(target2, 'if (!state.engineeringTasks) state.engineeringTasks = {};\r\n\r\n    ' + target2);
}

// 3. Add methods to serverDB
const engineeringMethods = `
  // --- Engineering Tasks System (Parallel Hybrid AI Engineering & QA) ---
  getEngineeringTasks(filters?: import('./engineering/types').TaskFilterOptions): import('./engineering/types').EngineeringTask[] {
    const db = loadDB();
    const tasks = Object.values(db.engineeringTasks || {});
    if (!filters) return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return tasks.filter(t => {
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.workstream && t.workstream !== filters.workstream) return false;
      if (filters.taskType && t.taskType !== filters.taskType) return false;
      if (filters.requiresHumanApproval !== undefined && t.requiresHumanApproval !== filters.requiresHumanApproval) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getEngineeringTaskById(taskId: string): import('./engineering/types').EngineeringTask | null {
    const db = loadDB();
    return (db.engineeringTasks && db.engineeringTasks[taskId]) || null;
  },

  createEngineeringTask(taskData: {
    workstream: import('./engineering/types').EngineeringWorkstream;
    taskType: import('./engineering/types').TaskType;
    title: string;
    description: string;
    priority: import('./engineering/types').TaskPriority;
    affectedModules?: string[];
    assignedAgent?: string;
    requiresHumanApproval?: boolean;
    idempotencyKey?: string;
  }): import('./engineering/types').EngineeringTask {
    const db = loadDB();
    if (!db.engineeringTasks) db.engineeringTasks = {};

    const idempotencyKey = taskData.idempotencyKey || (taskData.workstream + '_' + taskData.taskType + '_' + Buffer.from(taskData.title).toString('base64').substring(0, 16));
    
    // Check if task with identical idempotencyKey already exists and is active
    const existing = Object.values(db.engineeringTasks).find(t => t.idempotencyKey === idempotencyKey && !['VERIFIED', 'DEPLOYED'].includes(t.status));
    if (existing) {
      return existing;
    }

    const timestamp = new Date().toISOString();
    const taskId = 'TASK-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const newTask: import('./engineering/types').EngineeringTask = {
      taskId,
      workstream: taskData.workstream,
      taskType: taskData.taskType,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      affectedModules: taskData.affectedModules || [],
      status: 'QUEUED',
      assignedAgent: taskData.assignedAgent || 'Agent: Master Orchestrator',
      idempotencyKey,
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: timestamp,
      updatedAt: timestamp,
      checkpoints: [
        {
          timestamp,
          stage: 'QUEUED',
          message: 'Task created and queued in state machine'
        }
      ],
      requiresHumanApproval: !!taskData.requiresHumanApproval
    };

    db.engineeringTasks[taskId] = newTask;
    saveDB(db);
    return newTask;
  },

  acquireNextEngineeringTask(workerId: string, allowedWorkstreams?: import('./engineering/types').EngineeringWorkstream[]): import('./engineering/types').EngineeringTask | null {
    const db = loadDB();
    if (!db.engineeringTasks) db.engineeringTasks = {};

    const now = new Date();
    const tasks = Object.values(db.engineeringTasks);

    // Reclaim expired leases
    for (const task of tasks) {
      if ((task.status === 'AUDITING' || task.status === 'REPAIRING' || task.status === 'TESTING') && task.leaseExpiresAt) {
        if (new Date(task.leaseExpiresAt).getTime() < now.getTime()) {
          task.status = task.attemptCount >= task.maxAttempts ? 'NEEDS_HUMAN_REVIEW' : 'RETRY_PENDING';
          task.leasedByWorker = undefined;
          task.leaseExpiresAt = undefined;
          task.updatedAt = now.toISOString();
          task.checkpoints.push({
            timestamp: now.toISOString(),
            stage: task.status,
            message: 'Lease expired on worker ' + workerId + '. Reclaimed for retry or human review.'
          });
        }
      }
    }

    // Priority ordering
    const priorityWeights: Record<import('./engineering/types').TaskPriority, number> = {
      'P0_CRITICAL': 400,
      'P1_HIGH': 300,
      'P2_MEDIUM': 200,
      'P3_LOW': 100
    };

    // Candidates: QUEUED or RETRY_PENDING
    const eligible = tasks.filter(t => {
      if (t.status !== 'QUEUED' && t.status !== 'RETRY_PENDING') return false;
      if (t.attemptCount >= t.maxAttempts) return false;
      if (allowedWorkstreams && allowedWorkstreams.length > 0 && !allowedWorkstreams.includes(t.workstream)) return false;
      return true;
    }).sort((a, b) => {
      const pDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    if (eligible.length === 0) {
      saveDB(db);
      return null;
    }

    const taskToLease = eligible[0];
    const leaseDurationMs = 10 * 60 * 1000; // 10 minutes lease
    const expiresAt = new Date(now.getTime() + leaseDurationMs).toISOString();

    taskToLease.leasedByWorker = workerId;
    taskToLease.leaseExpiresAt = expiresAt;
    taskToLease.attemptCount += 1;
    taskToLease.startedAt = taskToLease.startedAt || now.toISOString();
    taskToLease.updatedAt = now.toISOString();

    if (taskToLease.taskType === 'REPAIR') {
      taskToLease.status = 'REPAIRING';
    } else if (taskToLease.taskType === 'BROWSER_QA' || taskToLease.taskType === 'REGRESSION') {
      taskToLease.status = 'TESTING';
    } else {
      taskToLease.status = 'AUDITING';
    }

    taskToLease.checkpoints.push({
      timestamp: now.toISOString(),
      stage: taskToLease.status,
      message: 'Leased by worker ' + workerId + '. Attempt #' + taskToLease.attemptCount + '. Lease expires at ' + expiresAt
    });

    db.engineeringTasks[taskToLease.taskId] = taskToLease;
    saveDB(db);
    return taskToLease;
  },

  heartbeatEngineeringTask(taskId: string, workerId: string, extensionMinutes = 10): boolean {
    const db = loadDB();
    if (!db.engineeringTasks || !db.engineeringTasks[taskId]) return false;
    const task = db.engineeringTasks[taskId];
    if (task.leasedByWorker !== workerId) return false;

    const now = new Date();
    task.leaseExpiresAt = new Date(now.getTime() + extensionMinutes * 60 * 1000).toISOString();
    task.updatedAt = now.toISOString();
    saveDB(db);
    return true;
  },

  completeEngineeringTask(taskId: string, workerId: string, summary: string, evidence?: string[]): import('./engineering/types').EngineeringTask | null {
    const db = loadDB();
    if (!db.engineeringTasks || !db.engineeringTasks[taskId]) return null;
    const task = db.engineeringTasks[taskId];
    if (task.leasedByWorker && task.leasedByWorker !== workerId) return null;

    const now = new Date().toISOString();
    task.status = task.requiresHumanApproval ? 'AWAITING_APPROVAL' : 'VERIFIED';
    task.completedAt = now;
    task.updatedAt = now;
    task.leasedByWorker = undefined;
    task.leaseExpiresAt = undefined;
    task.resultSummary = summary;
    if (evidence) {
      task.evidenceReferences = [...(task.evidenceReferences || []), ...evidence];
    }
    task.checkpoints.push({
      timestamp: now,
      stage: task.status,
      message: 'Task completed by worker ' + workerId + ': ' + summary
    });

    db.engineeringTasks[taskId] = task;
    saveDB(db);
    return task;
  },

  failEngineeringTask(taskId: string, workerId: string, error: { message: string; stackTrace?: string; failedRoute?: string }): import('./engineering/types').EngineeringTask | null {
    const db = loadDB();
    if (!db.engineeringTasks || !db.engineeringTasks[taskId]) return null;
    const task = db.engineeringTasks[taskId];
    if (task.leasedByWorker && task.leasedByWorker !== workerId) return null;

    const now = new Date().toISOString();
    task.leasedByWorker = undefined;
    task.leaseExpiresAt = undefined;
    task.updatedAt = now;
    task.errorDetails = error;

    if (task.attemptCount >= task.maxAttempts) {
      task.status = 'FAILED';
    } else {
      task.status = 'RETRY_PENDING';
    }

    task.checkpoints.push({
      timestamp: now,
      stage: task.status,
      message: 'Execution failed on worker ' + workerId + ': ' + error.message + ' (Attempt ' + task.attemptCount + '/' + task.maxAttempts + ')'
    });

    db.engineeringTasks[taskId] = task;
    saveDB(db);
    return task;
  },

  recordEngineeringTaskApproval(taskId: string, approvedBy: string, decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED', notes?: string): import('./engineering/types').EngineeringTask | null {
    const db = loadDB();
    if (!db.engineeringTasks || !db.engineeringTasks[taskId]) return null;
    const task = db.engineeringTasks[taskId];

    const now = new Date().toISOString();
    task.approvalStatus = decision;
    task.approvedBy = approvedBy;
    task.approvedAt = now;
    task.approvalNotes = notes;
    task.updatedAt = now;

    if (decision === 'APPROVED') {
      task.status = 'READY_FOR_RELEASE';
    } else if (decision === 'REJECTED') {
      task.status = 'FAILED';
    } else {
      task.status = 'RETRY_PENDING';
    }

    task.checkpoints.push({
      timestamp: now,
      stage: task.status,
      message: 'Human approval recorded by ' + approvedBy + ': ' + decision + '. ' + (notes || '')
    });

    db.engineeringTasks[taskId] = task;
    saveDB(db);
    return task;
  }
`;

if (!content.includes('getEngineeringTasks')) {
  const lastClose = content.lastIndexOf('};\r\n');
  if (lastClose !== -1) {
    content = content.substring(0, lastClose) + engineeringMethods + '\r\n};\r\n';
  } else {
    const altClose = content.lastIndexOf('};');
    content = content.substring(0, altClose) + engineeringMethods + '\r\n};';
  }
}

fs.writeFileSync(dbPath, content, 'utf8');
console.log('Successfully updated src/lib/db.ts');

