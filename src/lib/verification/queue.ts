/**
 * Verification Background Queue & Automation Engine
 * Supports idempotent task enqueuing, priority execution, content-hash deduplication,
 * and rate-limited non-blocking processing.
 */
import { serverDB } from '@/lib/db';
import { VerificationQueueItem, VerificationResult } from './types';
import { verifyCircularDraft } from './orchestrator';

export function enqueueVerificationTask(params: {
  draftId: string;
  trigger?: VerificationQueueItem['trigger'];
  priority?: number;
  contentHash?: string;
}): VerificationQueueItem {
  const trigger = params.trigger || 'NEW_DRAFT';
  const priority = params.priority || 3;
  const queueId = `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const queueItem: VerificationQueueItem = {
    id: queueId,
    draftId: params.draftId,
    trigger,
    status: 'QUEUED',
    priority,
    contentHash: params.contentHash,
    createdAt: new Date().toISOString(),
    attempts: 0,
    maxAttempts: 3
  };

  serverDB.enqueueVerificationItem(queueItem);
  return queueItem;
}

export function getVerificationQueueItems(): VerificationQueueItem[] {
  return serverDB.getVerificationQueue();
}

/**
 * Processes pending items in the verification queue
 */
export async function processVerificationQueue(options: {
  maxItems?: number;
  skipAi?: boolean;
} = {}): Promise<{
  processed: number;
  completed: number;
  failed: number;
  results: Array<{ queueId: string; draftId: string; status: string; error?: string }>;
}> {
  const maxItems = options.maxItems || 5;
  const queue = serverDB.getVerificationQueue();
  const pending = queue
    .filter(q => q.status === 'QUEUED')
    .sort((a, b) => a.priority - b.priority || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, maxItems);

  let completed = 0;
  let failed = 0;
  const results: Array<{ queueId: string; draftId: string; status: string; error?: string }> = [];

  for (const item of pending) {
    serverDB.updateVerificationQueueItem(item.id, {
      status: 'PROCESSING',
      startedAt: new Date().toISOString(),
      attempts: item.attempts + 1
    });

    try {
      // Check content-hash deduplication: if draft already has verifiedResult with same hash, reuse
      const draft = serverDB.getCircularDraft(item.draftId);
      if (draft && draft.evidenceHash && item.contentHash && draft.evidenceHash === item.contentHash && draft.verificationResult) {
        serverDB.updateVerificationQueueItem(item.id, {
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          resultStatus: draft.verificationResult.status
        });
        completed++;
        results.push({ queueId: item.id, draftId: item.draftId, status: 'REUSED_PREVIOUS' });
        continue;
      }

      const vr = await verifyCircularDraft(item.draftId, {
        skipAi: options.skipAi,
        adminId: 'system_queue_runner'
      });

      serverDB.updateVerificationQueueItem(item.id, {
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        resultStatus: vr.status
      });

      completed++;
      results.push({ queueId: item.id, draftId: item.draftId, status: vr.status });
    } catch (err: any) {
      failed++;
      serverDB.updateVerificationQueueItem(item.id, {
        status: item.attempts + 1 >= item.maxAttempts ? 'FAILED' : 'QUEUED',
        error: err.message
      });
      results.push({ queueId: item.id, draftId: item.draftId, status: 'FAILED', error: err.message });
    }
  }

  return {
    processed: pending.length,
    completed,
    failed,
    results
  };
}
