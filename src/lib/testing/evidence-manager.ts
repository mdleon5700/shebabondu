import fs from 'fs';
import path from 'path';

export interface EvidenceRecord {
  scenarioId: string;
  stepName: string;
  relativePath: string;
  absolutePath: string;
  timestamp: string;
  sizeBytes: number;
}

export class EvidenceManager {
  private baseDir: string;
  private runId: string;

  constructor(runId: string, baseDir?: string) {
    this.runId = runId;
    this.baseDir = baseDir || path.join(process.cwd(), 'test-evidence', runId);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getEvidenceDir(): string {
    return this.baseDir;
  }

  listEvidence(): EvidenceRecord[] {
    if (!fs.existsSync(this.baseDir)) return [];
    const files = fs.readdirSync(this.baseDir);
    return files
      .filter(f => f.endsWith('.png') || f.endsWith('.json'))
      .map(filename => {
        const full = path.join(this.baseDir, filename);
        const stats = fs.statSync(full);
        const parts = filename.split('_');
        const scenarioId = parts[0] || 'UNKNOWN';
        const stepName = parts[1] || 'evidence';
        return {
          scenarioId,
          stepName,
          relativePath: `test-evidence/${this.runId}/${filename}`,
          absolutePath: full,
          timestamp: stats.mtime.toISOString(),
          sizeBytes: stats.size
        };
      });
  }
}