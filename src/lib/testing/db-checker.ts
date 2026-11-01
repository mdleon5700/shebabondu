import fs from 'fs';
import path from 'path';

export interface DatabaseSnapshotStats {
  candidatesCount: number;
  syntheticCandidatesCount: number;
  jobsCount: number;
  sourcesCount: number;
  companiesCount: number;
  isStoreAccessible: boolean;
  storeSizeKb: number;
}

export class DatabaseConsistencyChecker {
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'src', 'db', 'local_store.json');
  }

  getSnapshot(): DatabaseSnapshotStats {
    if (!fs.existsSync(this.dbPath)) {
      return {
        candidatesCount: 0,
        syntheticCandidatesCount: 0,
        jobsCount: 0,
        sourcesCount: 0,
        companiesCount: 0,
        isStoreAccessible: false,
        storeSizeKb: 0
      };
    }

    try {
      const stats = fs.statSync(this.dbPath);
      const raw = fs.readFileSync(this.dbPath, 'utf8');
      const data = JSON.parse(raw);

      const candidates = data.candidates ? Object.values(data.candidates) : [];
      const synthetic = candidates.filter((c: any) => c.isSynthetic === true || c.id?.startsWith('SYNTH-'));
      const jobs = data.jobs ? (Array.isArray(data.jobs) ? data.jobs : Object.values(data.jobs)) : [];
      const sources = data.sources ? (Array.isArray(data.sources) ? data.sources : Object.values(data.sources)) : [];
      const companies = data.companies ? (Array.isArray(data.companies) ? data.companies : Object.values(data.companies)) : [];

      return {
        candidatesCount: candidates.length,
        syntheticCandidatesCount: synthetic.length,
        jobsCount: jobs.length,
        sourcesCount: sources.length,
        companiesCount: companies.length,
        isStoreAccessible: true,
        storeSizeKb: Math.round(stats.size / 1024)
      };
    } catch {
      return {
        candidatesCount: 0,
        syntheticCandidatesCount: 0,
        jobsCount: 0,
        sourcesCount: 0,
        companiesCount: 0,
        isStoreAccessible: false,
        storeSizeKb: 0
      };
    }
  }

  verifyCandidateExists(id: string): boolean {
    try {
      const raw = fs.readFileSync(this.dbPath, 'utf8');
      const data = JSON.parse(raw);
      return Boolean(data.candidates && data.candidates[id]);
    } catch {
      return false;
    }
  }
}