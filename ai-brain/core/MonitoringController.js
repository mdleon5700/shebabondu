const os = require('os');

class MonitoringController {
  constructor(profileManager, queue, checkpointManager, failureMemory) {
    this.profileManager = profileManager;
    this.queue = queue;
    this.checkpointManager = checkpointManager;
    this.failureMemory = failureMemory;
  }

  getSystemStatus(projectId) {
    const profile = this.profileManager.getProfile(projectId);
    const queueSummary = this.queue.getQueueSummary(projectId);
    const checkpoints = this.checkpointManager.listCheckpoints(projectId);
    const memory = this.failureMemory.load(projectId);

    return {
      timestamp: new Date().toISOString(),
      projectId,
      profile: profile ? {
        displayName: profile.displayName,
        mode: profile.mode,
        framework: profile.framework,
        language: profile.language,
        boundary: profile.allowedFilesystemBoundary
      } : null,
      host: {
        platform: os.platform(),
        cpus: os.cpus().length,
        freeMemMB: Math.round(os.freemem() / (1024 * 1024)),
        totalMemMB: Math.round(os.totalmem() / (1024 * 1024)),
        uptimeSeconds: Math.round(os.uptime())
      },
      queue: queueSummary,
      checkpointsCount: checkpoints.length,
      lastCheckpoint: checkpoints[0] || null,
      knownDefectsCount: memory.length,
      resolvedDefectsCount: memory.filter(m => m.status === 'RESOLVED').length
    };
  }

  renderCliDashboard(projectId) {
    const status = this.getSystemStatus(projectId);
    const border = '='.repeat(65);
    const divider = '-'.repeat(65);

    let output = '';
    output += `\n${border}\n`;
    output += `   UNIVERSAL AUTONOMOUS AI BRAIN — PRIVATE CONTROL CONSOLE\n`;
    output += `${border}\n`;
    output += `Project:     ${status.profile?.displayName || projectId} [${projectId}]\n`;
    output += `Mode:        ${status.profile?.mode || 'MAINTENANCE'}\n`;
    output += `Framework:   ${status.profile?.framework || 'N/A'} (${status.profile?.language || 'N/A'})\n`;
    output += `Host Health: Node ${process.version} | Free RAM: ${status.host.freeMemMB}MB / ${status.host.totalMemMB}MB\n`;
    output += `${divider}\n`;
    output += `TASK QUEUE SUMMARY:\n`;
    output += `  Total: ${status.queue.total} | Ready: ${status.queue.ready} | Running: ${status.queue.running} | Completed: ${status.queue.completed} | Failed: ${status.queue.failed}\n`;
    output += `${divider}\n`;
    output += `SYSTEM SAFETY & RESILIENCE:\n`;
    output += `  Checkpoints Available: ${status.checkpointsCount} (Latest: ${status.lastCheckpoint ? status.lastCheckpoint.checkpointId : 'None'})\n`;
    output += `  Defects In Memory:     ${status.knownDefectsCount} (${status.resolvedDefectsCount} Resolved)\n`;
    output += `${border}\n`;

    return output;
  }
}

module.exports = MonitoringController;
