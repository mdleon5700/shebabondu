const fs = require('fs');
const path = require('path');

class CheckpointManager {
  constructor(storageDir = path.join(__dirname, '..', 'storage', 'checkpoints')) {
    this.storageDir = storageDir;
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  createCheckpoint(projectId, taskId, workspacePath, filePaths = []) {
    const checkpointId = `CP-${projectId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cpDir = path.join(this.storageDir, checkpointId);
    fs.mkdirSync(cpDir, { recursive: true });

    const backedUpFiles = [];

    for (const relPath of filePaths) {
      const fullPath = path.isAbsolute(relPath) ? relPath : path.join(workspacePath, relPath);
      if (fs.existsSync(fullPath)) {
        const hashName = Buffer.from(relPath).toString('hex');
        const backupPath = path.join(cpDir, hashName);
        fs.copyFileSync(fullPath, backupPath);
        backedUpFiles.push({
          relPath,
          fullPath,
          backupPath
        });
      }
    }

    const manifest = {
      checkpointId,
      projectId,
      taskId,
      workspacePath,
      timestamp: new Date().toISOString(),
      files: backedUpFiles
    };

    fs.writeFileSync(path.join(cpDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    return manifest;
  }

  rollback(checkpointId) {
    const cpDir = path.join(this.storageDir, checkpointId);
    const manifestPath = path.join(cpDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Checkpoint manifest not found: ${checkpointId}`);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    let restoredCount = 0;

    for (const item of manifest.files) {
      if (fs.existsSync(item.backupPath)) {
        // Ensure parent directory exists
        const parentDir = path.dirname(item.fullPath);
        if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
        
        fs.copyFileSync(item.backupPath, item.fullPath);
        restoredCount++;
      }
    }

    return {
      success: true,
      checkpointId,
      restoredFiles: restoredCount
    };
  }

  listCheckpoints(projectId) {
    if (!fs.existsSync(this.storageDir)) return [];
    const entries = fs.readdirSync(this.storageDir);
    const list = [];

    for (const entry of entries) {
      const manifestPath = path.join(this.storageDir, entry, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          if (!projectId || m.projectId === projectId) {
            list.push(m);
          }
        } catch (e) {}
      }
    }

    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

module.exports = CheckpointManager;
