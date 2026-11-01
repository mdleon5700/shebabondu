const fs = require('fs');
const path = require('path');

class FailureMemory {
  constructor(storageDir = path.join(__dirname, '..', 'storage', 'memory')) {
    this.storageDir = storageDir;
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  _getMemoryFile(projectId) {
    return path.join(this.storageDir, `${projectId}_memory.json`);
  }

  load(projectId) {
    const f = this._getMemoryFile(projectId);
    if (!fs.existsSync(f)) return [];
    try {
      return JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch (e) {
      return [];
    }
  }

  save(projectId, memoryEntries) {
    const f = this._getMemoryFile(projectId);
    fs.writeFileSync(f, JSON.stringify(memoryEntries, null, 2), 'utf8');
    return memoryEntries;
  }

  recordDefectAndFix(projectId, entry) {
    const memory = this.load(projectId);
    const record = {
      defectId: entry.defectId || `DEF-${Date.now()}`,
      signature: entry.signature,
      category: entry.category,
      rootCause: entry.rootCause,
      reproductionSteps: entry.reproductionSteps || [],
      affectedFiles: entry.affectedFiles || [],
      failedPatchAttempts: entry.failedPatchAttempts || [],
      successfulPatchSummary: entry.successfulPatchSummary || null,
      verificationEvidence: entry.verificationEvidence || null,
      status: entry.status || 'RESOLVED',
      timestamp: new Date().toISOString()
    };

    const idx = memory.findIndex(m => m.signature === record.signature);
    if (idx !== -1) {
      memory[idx] = { ...memory[idx], ...record };
    } else {
      memory.push(record);
    }

    this.save(projectId, memory);
    return record;
  }

  hasKnownFailedAttempt(projectId, signature, patchFingerprint) {
    const memory = this.load(projectId);
    const entry = memory.find(m => m.signature === signature);
    if (!entry) return false;
    return (entry.failedPatchAttempts || []).includes(patchFingerprint);
  }

  recordFailedAttempt(projectId, signature, patchFingerprint, failureReason) {
    const memory = this.load(projectId);
    let entry = memory.find(m => m.signature === signature);
    if (!entry) {
      entry = {
        defectId: `DEF-${Date.now()}`,
        signature,
        failedPatchAttempts: [],
        timestamp: new Date().toISOString()
      };
      memory.push(entry);
    }
    if (!entry.failedPatchAttempts.includes(patchFingerprint)) {
      entry.failedPatchAttempts.push(patchFingerprint);
    }
    entry.lastFailureReason = failureReason;
    this.save(projectId, memory);
    return entry;
  }
}

module.exports = FailureMemory;
