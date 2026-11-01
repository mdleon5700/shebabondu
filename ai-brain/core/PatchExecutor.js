const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PatchExecutor {
  constructor(options = {}) {
    this.defaultTimeoutMs = options.defaultTimeoutMs || 30000;
  }

  executePatch(profile, checkpointManager, taskId, patchOperation) {
    const { files = [], command = null } = patchOperation;
    const workspacePath = path.resolve(profile.workspacePath);

    // 1. Boundary & Risk Check
    const relPaths = [];
    for (const item of files) {
      const fullPath = path.isAbsolute(item.path) ? item.path : path.join(workspacePath, item.path);
      const isInside = fullPath === workspacePath || fullPath.startsWith(workspacePath + path.sep);
      if (!isInside) {
        throw new Error(`SECURITY VIOLATION: Target path '${item.path}' is outside allowed project boundary '${workspacePath}'`);
      }
      relPaths.push(path.relative(workspacePath, fullPath));
    }

    // 2. Create Safety Checkpoint Before Modifications
    const checkpoint = checkpointManager.createCheckpoint(
      profile.projectId,
      taskId,
      workspacePath,
      relPaths
    );

    try {
      // 3. Apply File Modifications
      for (const item of files) {
        const fullPath = path.isAbsolute(item.path) ? item.path : path.join(workspacePath, item.path);
        const parentDir = path.dirname(fullPath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }
        fs.writeFileSync(fullPath, item.content, 'utf8');
      }

      // 4. Run Verification Command if specified
      let commandOutput = null;
      if (command) {
        // Validate command safety
        const cmdCheck = this._validateCommand(profile, command);
        if (!cmdCheck.allowed) {
          throw new Error(`Command blocked by safety policy: ${cmdCheck.reason}`);
        }

        commandOutput = execSync(command, {
          cwd: workspacePath,
          timeout: this.defaultTimeoutMs,
          stdio: ['pipe', 'pipe', 'pipe'],
          encoding: 'utf8'
        });
      }

      return {
        success: true,
        checkpointId: checkpoint.checkpointId,
        modifiedFiles: relPaths,
        commandOutput
      };

    } catch (err) {
      // 5. Automatic Recovery on Failure
      const rollbackResult = checkpointManager.rollback(checkpoint.checkpointId);
      return {
        success: false,
        rolledBack: rollbackResult.success,
        checkpointId: checkpoint.checkpointId,
        error: err.message || String(err),
        stdout: err.stdout ? String(err.stdout) : null,
        stderr: err.stderr ? String(err.stderr) : null
      };
    }
  }

  _validateCommand(profile, commandLine) {
    const trimmed = (commandLine || '').trim();
    const forbidden = [
      /rm\s+-rf\s+[\/\\]/i,
      /del\s+\/s/i,
      /format\s+[a-z]:/i,
      /shutdown/i,
      /drop\s+database/i
    ];

    for (const pat of forbidden) {
      if (pat.test(trimmed)) {
        return { allowed: false, reason: `Matches forbidden pattern: ${pat}` };
      }
    }

    return { allowed: true };
  }
}

module.exports = PatchExecutor;
