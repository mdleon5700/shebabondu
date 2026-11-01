import { 
  TeletalkCollectorAdapter, 
  BbCollectorAdapter, 
  BpscCollectorAdapter 
} from './index';
import { ingestDiscoveredCandidates } from './ingestion';
import { JobSource, SpiderRun, SpiderRunStatus, SpiderTriggerType, SpiderFailedRecord } from '@/lib/types';
import { serverDB } from '@/lib/db';

export interface SourceScrapeResult {
  runId?: string;
  sourceId: string;
  sourceName: string;
  success: boolean;
  discoveredCount: number;
  newDraftsCreated: number;
  updatesDetected: number;
  duplicatesIgnored: number;
  error?: string;
  durationMs: number;
}

export interface MultiSourceScrapeReport {
  success: boolean;
  timestamp: string;
  totalSourcesScanned: number;
  totalDiscovered: number;
  totalNewDrafts: number;
  totalUpdatesDetected: number;
  totalDuplicatesIgnored: number;
  results: SourceScrapeResult[];
  lockStatus?: {
    isLocked: boolean;
    owner: string | null;
  };
}

// -------------------------------------------------------------
// Concurrency Mutex Lock Management
// -------------------------------------------------------------
interface ScrapeLockState {
  isLocked: boolean;
  owner: string | null;
  acquiredAt: number | null;
  timeoutMs: number;
}

const globalLock: ScrapeLockState = {
  isLocked: false,
  owner: null,
  acquiredAt: null,
  timeoutMs: 10 * 60 * 1000 // 10 minutes max lock duration to prevent deadlocks
};

export function isScrapingActive(): boolean {
  if (!globalLock.isLocked) return false;
  // Auto-expire lock if timed out
  if (globalLock.acquiredAt && Date.now() - globalLock.acquiredAt > globalLock.timeoutMs) {
    globalLock.isLocked = false;
    globalLock.owner = null;
    globalLock.acquiredAt = null;
    return false;
  }
  return true;
}

export function getScrapeLockStatus() {
  const active = isScrapingActive();
  return {
    isLocked: active,
    owner: active ? globalLock.owner : null,
    acquiredAt: active && globalLock.acquiredAt ? new Date(globalLock.acquiredAt).toISOString() : null
  };
}

export function acquireScrapeLock(owner: string): boolean {
  if (isScrapingActive()) {
    return false;
  }
  globalLock.isLocked = true;
  globalLock.owner = owner;
  globalLock.acquiredAt = Date.now();
  return true;
}

export function releaseScrapeLock(owner: string): void {
  if (globalLock.owner === owner || Date.now() - (globalLock.acquiredAt || 0) > globalLock.timeoutMs) {
    globalLock.isLocked = false;
    globalLock.owner = null;
    globalLock.acquiredAt = null;
  }
}

// -------------------------------------------------------------
// Source Adapter Resolver
// -------------------------------------------------------------
export function getAdapterForSource(source: JobSource) {
  const url = (source.sourceUrl || '').toLowerCase();
  const id = (source.id || '').toLowerCase();

  if (id.includes('bb-') || url.includes('erecruitment.bb.org.bd') || url.includes('bb.org.bd')) {
    return new BbCollectorAdapter();
  }
  if (id.includes('bpsc') || url.includes('bpsc.teletalk.com.bd') || url.includes('bpsc.gov.bd')) {
    return new BpscCollectorAdapter();
  }
  return new TeletalkCollectorAdapter();
}

/**
 * Executes scraping and ingestion for a single registered source
 */
export async function scrapeSingleSource(
  sourceId: string, 
  adminId = 'SYSTEM_COLLECTOR',
  triggerType: SpiderTriggerType = 'manual'
): Promise<SourceScrapeResult> {
  const startTime = Date.now();
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const source = serverDB.getJobSourceById(sourceId);

  // Initialize SpiderRun record
  const spiderRun: SpiderRun = {
    id: runId,
    sourceId,
    sourceName: source?.name || sourceId,
    triggerType,
    startedAt: new Date().toISOString(),
    durationMs: 0,
    status: 'running',
    pagesVisited: source?.scanDepthPages || 1,
    jobsDiscovered: 0,
    jobsExtracted: 0,
    pdfsDiscovered: 0,
    pdfsDownloaded: 0,
    newDraftsCreated: 0,
    duplicatesDetected: 0,
    updatesDetected: 0,
    conflictsDetected: 0,
    failedRecords: []
  };

  if (!source) {
    spiderRun.status = 'failed';
    spiderRun.finishedAt = new Date().toISOString();
    spiderRun.durationMs = Date.now() - startTime;
    spiderRun.errorSummary = `সোর্স ID "${sourceId}" ডাটাবেজে পাওয়া যায়নি`;
    serverDB.recordSpiderRun(spiderRun);

    return {
      runId,
      sourceId,
      sourceName: 'Unknown Source',
      success: false,
      discoveredCount: 0,
      newDraftsCreated: 0,
      updatesDetected: 0,
      duplicatesIgnored: 0,
      error: `সোর্স ID "${sourceId}" ডাটাবেজে পাওয়া যায়নি`,
      durationMs: Date.now() - startTime
    };
  }

  if (source.enabled === false) {
    spiderRun.status = 'failed';
    spiderRun.finishedAt = new Date().toISOString();
    spiderRun.durationMs = Date.now() - startTime;
    spiderRun.errorSummary = `সোর্স "${source.name}" বর্তমানে স্থগিত (paused) রয়েছে`;
    serverDB.recordSpiderRun(spiderRun);

    return {
      runId,
      sourceId,
      sourceName: source.name,
      success: false,
      discoveredCount: 0,
      newDraftsCreated: 0,
      updatesDetected: 0,
      duplicatesIgnored: 0,
      error: `সোর্স "${source.name}" বর্তমানে স্থগিত (paused) রয়েছে`,
      durationMs: Date.now() - startTime
    };
  }

  try {
    const adapter = getAdapterForSource(source);
    const timeout = source.timeoutMs || 8000;
    const collectResult = await adapter.collect(source, {
      enableLiveFetch: true,
      timeoutMs: timeout
    });

    const candidates = collectResult.candidates || [];
    const ingestionReport = ingestDiscoveredCandidates(candidates, adminId);

    // Extract PDF count
    const pdfDiscovered = candidates.filter(c => Boolean(c.pdfEvidence || c.evidenceUrl?.toLowerCase().includes('.pdf'))).length;
    const pdfDownloaded = candidates.filter(c => Boolean(c.pdfEvidence)).length;

    // Track conflicts
    const conflicts = candidates.filter(c => Boolean(c.htmlPdfComparison && c.htmlPdfComparison.hasConflicts)).length;

    // Track failed records if any ingestion errors or candidate warnings
    const failedRecords: SpiderFailedRecord[] = [];
    if (ingestionReport.errors && ingestionReport.errors.length > 0) {
      for (const errStr of ingestionReport.errors) {
        failedRecords.push({
          url: source.sourceUrl,
          title: source.name,
          reason: errStr,
          retryCount: 0,
          lastAttemptAt: new Date().toISOString()
        });
      }
    }

    // Determine Run Status
    let runStatus: SpiderRunStatus = 'completed';
    if (!collectResult.success && candidates.length === 0) {
      runStatus = 'failed';
    } else if (!collectResult.success || failedRecords.length > 0 || conflicts > 0) {
      runStatus = 'completed_with_warnings';
    }

    // Finalize SpiderRun telemetry
    spiderRun.status = runStatus;
    spiderRun.finishedAt = new Date().toISOString();
    spiderRun.durationMs = Date.now() - startTime;
    spiderRun.jobsDiscovered = collectResult.discoveredCount;
    spiderRun.jobsExtracted = candidates.length;
    spiderRun.pdfsDiscovered = pdfDiscovered;
    spiderRun.pdfsDownloaded = pdfDownloaded;
    spiderRun.newDraftsCreated = ingestionReport.newDraftsCreated;
    spiderRun.duplicatesDetected = ingestionReport.duplicatesIgnored;
    spiderRun.updatesDetected = ingestionReport.updatesDetected;
    spiderRun.conflictsDetected = conflicts;
    spiderRun.failedRecords = failedRecords;
    if (collectResult.error) {
      spiderRun.errorSummary = collectResult.error.message;
    }

    serverDB.recordSpiderRun(spiderRun);

    // Update Source Health & Metrics in Server DB
    const currentMetrics = source.metrics || { discovered: 0, collected: 0, failed: 0, deduplicated: 0 };
    serverDB.updateJobSource(source.id, {
      healthStatus: runStatus === 'failed' ? 'degraded' : 'healthy',
      lastFetchedAt: new Date().toISOString(),
      lastSuccessfulScanAt: runStatus !== 'failed' ? new Date().toISOString() : source.lastSuccessfulScanAt,
      updatedAt: new Date().toISOString(),
      metrics: {
        discovered: currentMetrics.discovered + collectResult.discoveredCount,
        collected: currentMetrics.collected + ingestionReport.newDraftsCreated,
        failed: currentMetrics.failed + (runStatus === 'failed' ? 1 : 0),
        deduplicated: currentMetrics.deduplicated + ingestionReport.duplicatesIgnored
      }
    }, adminId);

    // Record Admin Audit Log
    serverDB.recordAdminAudit({
      adminId,
      action: 'source_create' as any,
      targetId: source.id,
      targetType: 'source',
      changes: {
        newDrafts: { new: ingestionReport.newDraftsCreated },
        updates: { new: ingestionReport.updatesDetected },
        duplicates: { new: ingestionReport.duplicatesIgnored }
      },
      notes: `Automated scrape completed for "${source.name}" [${triggerType}]: +${ingestionReport.newDraftsCreated} drafts created.`
    });

    return {
      runId,
      sourceId: source.id,
      sourceName: source.name,
      success: runStatus !== 'failed',
      discoveredCount: collectResult.discoveredCount,
      newDraftsCreated: ingestionReport.newDraftsCreated,
      updatesDetected: ingestionReport.updatesDetected,
      duplicatesIgnored: ingestionReport.duplicatesIgnored,
      durationMs: Date.now() - startTime
    };
  } catch (err: any) {
    const errorMsg = err.message || 'কালেকশন এক্সিকিউশন ব্যর্থ হয়েছে';
    spiderRun.status = 'failed';
    spiderRun.finishedAt = new Date().toISOString();
    spiderRun.durationMs = Date.now() - startTime;
    spiderRun.errorSummary = errorMsg;
    spiderRun.failedRecords = [{
      url: source.sourceUrl,
      title: source.name,
      reason: errorMsg,
      retryCount: 0,
      lastAttemptAt: new Date().toISOString()
    }];

    serverDB.recordSpiderRun(spiderRun);

    const currentMetrics = source.metrics || { discovered: 0, collected: 0, failed: 0, deduplicated: 0 };
    serverDB.updateJobSource(source.id, {
      healthStatus: 'degraded',
      lastFetchedAt: new Date().toISOString(),
      metrics: {
        ...currentMetrics,
        failed: currentMetrics.failed + 1
      }
    }, adminId);

    return {
      runId,
      sourceId: source.id,
      sourceName: source.name,
      success: false,
      discoveredCount: 0,
      newDraftsCreated: 0,
      updatesDetected: 0,
      duplicatesIgnored: 0,
      error: errorMsg,
      durationMs: Date.now() - startTime
    };
  }
}

/**
 * Executes automated scraping across all active enabled sources with concurrency locking
 */
export async function scrapeAllSources(
  adminId = 'SYSTEM_CRON',
  triggerType: SpiderTriggerType = 'cron'
): Promise<MultiSourceScrapeReport> {
  const lockAcquired = acquireScrapeLock(adminId);
  if (!lockAcquired) {
    const lockInfo = getScrapeLockStatus();
    throw new Error(`কনকারেন্ট কালেকশন লক ইতিমধ্যে সক্রিয় রয়েছে (${lockInfo.owner || "অন্যান্য"}), অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন`);
  }

  try {
    const allSources = serverDB.getJobSources();
    const activeSources = allSources.filter(s => s.enabled !== false);

    const results: SourceScrapeResult[] = [];
    let totalDiscovered = 0;
    let totalNewDrafts = 0;
    let totalUpdatesDetected = 0;
    let totalDuplicatesIgnored = 0;

    for (const source of activeSources) {
      const res = await scrapeSingleSource(source.id, adminId, triggerType);
      results.push(res);
      totalDiscovered += res.discoveredCount;
      totalNewDrafts += res.newDraftsCreated;
      totalUpdatesDetected += res.updatesDetected;
      totalDuplicatesIgnored += res.duplicatesIgnored;
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      totalSourcesScanned: activeSources.length,
      totalDiscovered,
      totalNewDrafts,
      totalUpdatesDetected,
      totalDuplicatesIgnored,
      results
    };
  } finally {
    releaseScrapeLock(adminId);
  }
}

/**
 * Retries a previously completed or failed Spider Run
 */
export async function retrySpiderRun(runId: string, adminId = 'SYSTEM_ADMIN'): Promise<SourceScrapeResult> {
  const pastRun = serverDB.getSpiderRunById(runId);
  if (!pastRun) {
    throw new Error(`Spider Run "${runId}" খুঁজে পাওয়া যায়নি`);
  }

  return scrapeSingleSource(pastRun.sourceId, adminId, 'admin');
}
