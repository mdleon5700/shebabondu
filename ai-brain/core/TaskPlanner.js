class TaskPlanner {
  constructor() {}

  planFromFindings(projectId, findings = [], customTasks = []) {
    const tasks = [];
    let counter = 1;

    // 1. Convert findings to tasks
    for (const finding of findings) {
      const priorityMap = {
        CRITICAL: 1,
        HIGH: 2,
        MEDIUM: 3,
        LOW: 4,
        INFO: 5
      };

      const taskId = `TASK-${projectId}-${String(counter++).padStart(3, '0')}`;
      tasks.push({
        taskId,
        projectId,
        title: `Fix ${finding.category}: ${finding.description.slice(0, 60)}`,
        description: finding.description,
        findingId: finding.issueId,
        category: finding.category,
        priority: priorityMap[finding.severity] || 3,
        severity: finding.severity,
        dependencies: [],
        relevantFiles: [finding.file],
        acceptanceCriteria: [
          `No ${finding.category} error in ${finding.file}`,
          `Verification test passes cleanly`
        ],
        risk: finding.severity === 'CRITICAL' ? 'HIGH' : 'LOW',
        state: 'QUEUED',
        attemptCount: 0,
        maxAttempts: 3,
        checkpointId: null,
        evidence: null,
        createdAt: new Date().toISOString()
      });
    }

    // 2. Add custom tasks (e.g. user requirements)
    for (const custom of customTasks) {
      const taskId = custom.taskId || `TASK-${projectId}-${String(counter++).padStart(3, '0')}`;
      tasks.push({
        taskId,
        projectId,
        title: custom.title,
        description: custom.description || custom.title,
        priority: custom.priority || 3,
        severity: custom.severity || 'MEDIUM',
        dependencies: custom.dependencies || [],
        relevantFiles: custom.relevantFiles || [],
        acceptanceCriteria: custom.acceptanceCriteria || ['Task execution succeeds without regressions'],
        risk: custom.risk || 'LOW',
        state: 'QUEUED',
        attemptCount: 0,
        maxAttempts: custom.maxAttempts || 3,
        checkpointId: null,
        evidence: null,
        createdAt: new Date().toISOString()
      });
    }

    // 3. Resolve dependencies & set initial READY states
    this.updateReadyStates(tasks);
    return tasks;
  }

  updateReadyStates(tasks) {
    const completedSet = new Set(tasks.filter(t => t.state === 'COMPLETED').map(t => t.taskId));

    for (const task of tasks) {
      if (task.state === 'QUEUED' || task.state === 'WAITING_FOR_DEPENDENCY') {
        const allDepsSatisfied = task.dependencies.every(depId => completedSet.has(depId));
        if (allDepsSatisfied) {
          task.state = 'READY';
        } else {
          task.state = 'WAITING_FOR_DEPENDENCY';
        }
      }
    }
    return tasks;
  }

  getExecutableTasks(tasks) {
    return tasks
      .filter(t => t.state === 'READY')
      .sort((a, b) => a.priority - b.priority);
  }
}

module.exports = TaskPlanner;
