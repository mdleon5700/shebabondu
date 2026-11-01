import fs from 'fs';
import path from 'path';
import { JobCircular } from '@/lib/types';

export class SyntheticJobManager {
  private static storePath = path.join(process.cwd(), 'src', 'db', 'synthetic_jobs_store.json');
  private static realStorePath = path.join(process.cwd(), 'src', 'db', 'local_store.json');
  private static inMemoryStore: Record<string, JobCircular> | null = null;
  private static lastMtimeMs: number = 0;

  private static loadStore(): Record<string, JobCircular> {
    if (fs.existsSync(this.storePath)) {
      try {
        const stat = fs.statSync(this.storePath);
        if (this.inMemoryStore && stat.mtimeMs === this.lastMtimeMs) {
          return this.inMemoryStore;
        }
        const raw = fs.readFileSync(this.storePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.inMemoryStore = parsed;
          this.lastMtimeMs = stat.mtimeMs;
          return this.inMemoryStore!;
        }
      } catch (e) {
        console.warn('[SyntheticJobManager] store read error:', e);
      }
    }
    if (!this.inMemoryStore) this.inMemoryStore = {};
    return this.inMemoryStore;
  }

  private static persistStore(): void {
    if (!this.inMemoryStore) return;
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify(this.inMemoryStore, null, 2), 'utf8');
  }

  static getJobById(id: string): JobCircular | null {
    const store = this.loadStore();
    if (store[id]) return store[id];
    const match = Object.values(store).find(j => j.id === id || j.slug === id);
    return match || null;
  }

  static getAllSyntheticJobs(): JobCircular[] {
    const store = this.loadStore();
    return Object.values(store);
  }

  static getPublishedJobs(): JobCircular[] {
    const store = this.loadStore();
    return Object.values(store).filter(j => {
      const st = (j.status || '').toUpperCase();
      const pubStatus = ((j as any).publicationStatus || '').toUpperCase();
      if (st === 'DRAFT' || st === 'PENDING_REVIEW' || st === 'UNPUBLISHED' || pubStatus === 'UNPUBLISHED' || pubStatus === 'DRAFT') {
        return false;
      }
      if ((j as any).targetPublishTimeUtc && new Date((j as any).targetPublishTimeUtc).getTime() > Date.now()) {
        return false;
      }
      return st === 'PUBLISHED' || pubStatus === 'PUBLISHED' || pubStatus === 'PUBLISHED_WITH_WARNINGS';
    });
  }

  static saveJob(job: Partial<JobCircular> & { id: string }, adminId = 'ADMIN'): JobCircular {
    const store = this.loadStore();
    const existing = store[job.id] || {};
    const merged: JobCircular = {
      ...existing,
      ...job,
      id: job.id,
      title: job.title || existing.title || '',
      organization: job.organization || existing.organization || '',
      category: job.category || existing.category || 'govt',
      categoryLabel: job.categoryLabel || existing.categoryLabel || 'সরকারি চাকরি',
      grade: job.grade || existing.grade || '৯ম গ্রেড',
      totalPosts: job.totalPosts ?? existing.totalPosts ?? 1,
      salary: job.salary || existing.salary || '২২,০০০ - ৫৩,০৬০ টাকা',
      minEducation: job.minEducation || existing.minEducation || 'স্নাতক বা সমমান',
      minAge: job.minAge ?? existing.minAge ?? 18,
      maxAge: job.maxAge ?? existing.maxAge ?? 32,
      districts: job.districts || existing.districts || 'সকল জেলা',
      deadline: job.deadline || existing.deadline || '২০২৭-১২-৩১',
      daysRemaining: job.daysRemaining ?? existing.daysRemaining ?? 30,
      govtFee: job.govtFee ?? existing.govtFee ?? 0,
      serviceFee: job.serviceFee ?? existing.serviceFee ?? 0,
      officialLink: job.officialLink || existing.officialLink || 'https://alljobs.teletalk.com.bd',
      circularImage: job.circularImage || existing.circularImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
      audioSummary: job.audioSummary || existing.audioSummary || '',
      publishedDate: job.publishedDate || existing.publishedDate || new Date().toLocaleDateString('bn-BD'),
      requirements: job.requirements || existing.requirements || ['স্নাতক বা সমমান', 'বয়স: ১৮-৩২ বছর'],
      logo: job.logo || existing.logo || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
      status: job.status || (job.status === undefined ? existing.status : undefined) || 'DRAFT'
    };
    (merged as any).publicationStatus = (job as any).publicationStatus !== undefined 
      ? (job as any).publicationStatus 
      : (job.status ? job.status : ((existing as any).publicationStatus || 'DRAFT'));
    (merged as any).isSynthetic = true;
    (merged as any).updatedAt = new Date().toISOString();

    // Preserve distinct publishedAt vs updatedAt timestamps
    if ((job as any).publishedAt) {
      (merged as any).publishedAt = (job as any).publishedAt;
    } else if ((existing as any).publishedAt) {
      (merged as any).publishedAt = (existing as any).publishedAt;
    } else if (merged.status === 'PUBLISHED' || (merged as any).publicationStatus === 'PUBLISHED') {
      (merged as any).publishedAt = (merged as any).createdAt || new Date().toISOString();
    }

    if ((existing as any).publishedAt && (job as any).updatedAt) {
      (merged as any).lastUpdatedDate = (job as any).updatedAt;
    }
    store[job.id] = merged;
    this.inMemoryStore = store;
    this.persistStore();
    return merged;
  }

  static updateJobStatus(jobId: string, status: string, publicationStatus?: string): boolean {
    const store = this.loadStore();
    const job = store[jobId];
    if (!job) return false;
    job.status = status;
    (job as any).publicationStatus = publicationStatus || status;
    this.inMemoryStore = store;
    this.persistStore();
    return true;
  }

  static deleteJob(jobId: string): boolean {
    const store = this.loadStore();
    if (!store[jobId]) return false;
    delete store[jobId];
    this.inMemoryStore = store;
    this.persistStore();
    return true;
  }

  // Strict verification of database isolation
  static verifyJobDataIsolation(): { isIsolated: boolean; realJobsCount: number; syntheticJobsCount: number } {
    if (!fs.existsSync(this.realStorePath)) {
      throw new Error(`Real store not found at ${this.realStorePath}`);
    }
    const realStore = JSON.parse(fs.readFileSync(this.realStorePath, 'utf8'));
    const realJobs = Object.values(realStore.jobs || {});

    // Assert NO real job is synthetic
    const contaminated = realJobs.filter((j: any) => j.id?.startsWith('SYNTH-') || j.isSynthetic === true);
    if (contaminated.length > 0) {
      throw new Error(`CRITICAL ISOLATION BREACH: Found ${contaminated.length} synthetic jobs in real store!`);
    }

    const synthJobs = this.getAllSyntheticJobs();
    return {
      isIsolated: true,
      realJobsCount: realJobs.length,
      syntheticJobsCount: synthJobs.length
    };
  }
}
