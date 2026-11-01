/**
 * CHAKRI SHEBA — STEP 05: SCHEDULED PUBLISHING ENGINE
 * Accurate Bangladesh Standard Time (BST: UTC+6) handling and due job scheduling.
 */

import { PublishingQueueItem } from './types';
import { serverDB } from '@/lib/db';

/**
 * Converts a Bangladesh local datetime string (e.g. "2026-11-01T10:00:00" or "2026-11-01 10:00")
 * into a standard UTC ISO string.
 */
export function bstToUtcIso(bstStr: string): string {
  if (!bstStr) return new Date().toISOString();
  
  const clean = bstStr.replace(' ', 'T').trim();

  // If already contains timezone (e.g. Z or +06:00), respect it
  if (clean.includes('Z') || clean.includes('+') || clean.match(/-\d{2}:\d{2}$/)) {
    return new Date(clean).toISOString();
  }

  // Explicitly append +06:00 for Bangladesh Standard Time (UTC+6)
  const withBstOffset = clean.includes(':') 
    ? (clean.split(':').length === 2 ? `${clean}:00+06:00` : `${clean}+06:00`)
    : `${clean}T00:00:00+06:00`;

  const parsed = new Date(withBstOffset);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return new Date().toISOString();
}

/**
 * Converts UTC ISO string into readable Bangladesh Standard Time format
 * e.g. "০১ নভেম্বর ২০২৬, সকাল ১০:০০ টা (BST)"
 */
export function utcToBstFormatted(utcIso: string): string {
  if (!utcIso) return 'তারিখ পাওয়া যায়নি';
  try {
    const date = new Date(utcIso);
    if (isNaN(date.getTime())) return utcIso;

    return date.toLocaleString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' (BST)';
  } catch {
    return utcIso;
  }
}

/**
 * Checks if a target publish time in UTC has arrived or passed
 */
export function isDueForPublication(targetUtcIso: string): boolean {
  if (!targetUtcIso) return true;
  const targetTime = new Date(targetUtcIso).getTime();
  const now = Date.now();
  return now >= targetTime;
}

/**
 * Retrieves all pending or retryable queue items that are due now
 */
export function getDuePublishingQueueItems(): PublishingQueueItem[] {
  const queue = serverDB.getPublishingQueue ? serverDB.getPublishingQueue() : {};
  const items = Object.values(queue);

  return items
    .filter(item => (item.status === 'PENDING' || item.status === 'RETRY_PENDING') && isDueForPublication(item.targetPublishTimeUtc))
    .sort((a, b) => (a.priority || 5) - (b.priority || 5) || new Date(a.targetPublishTimeUtc).getTime() - new Date(b.targetPublishTimeUtc).getTime());
}

/**
 * Executes all currently due scheduled publications
 */
export function processDueScheduledPublications(): {
  processedCount: number;
  results: Array<{ queueId: string; jobId: string; success: boolean; error?: string }>;
} {
  const dueItems = getDuePublishingQueueItems();
  const results: Array<{ queueId: string; jobId: string; success: boolean; error?: string }> = [];

  for (const item of dueItems) {
    try {
      const { publishJobNow } = require('./orchestrator');
      const res = publishJobNow({
        jobId: item.jobId,
        draftId: item.draftId,
        revisionId: item.revisionId,
        adminId: item.createdBy || 'SYSTEM_SCHEDULER',
        note: `স্বয়ংক্রিয় শিডিউল প্রকাশনা (${item.id})`
      }, item.id);

      results.push({
        queueId: item.id,
        jobId: item.jobId,
        success: res.success,
        error: res.error
      });
    } catch (err: any) {
      results.push({
        queueId: item.id,
        jobId: item.jobId,
        success: false,
        error: err?.message || 'Scheduler execution error'
      });
    }
  }

  return {
    processedCount: results.filter(r => r.success).length,
    results
  };
}
