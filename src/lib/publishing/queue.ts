/**
 * CHAKRI SHEBA — STEP 05: PUBLISHING QUEUE MANAGER
 * Idempotent, persistent publishing queue handling immediate and scheduled jobs.
 */

import { PublishingQueueItem, PublicationQueueStatus, PublicationAction } from './types';
import { serverDB } from '@/lib/db';

export function createPublishingQueueItem(params: {
  jobId: string;
  draftId?: string;
  revisionId: string;
  action: PublicationAction;
  targetPublishTimeUtc: string;
  targetPublishTimeBst: string;
  createdBy: string;
  priority?: number;
  maxRetries?: number;
}): PublishingQueueItem {
  const queueId = 'pubq-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  const idempotencyKey = `${params.jobId}:${params.revisionId}:${params.action}:${params.targetPublishTimeUtc}`;

  const item: PublishingQueueItem = {
    id: queueId,
    jobId: params.jobId,
    draftId: params.draftId,
    revisionId: params.revisionId,
    action: params.action,
    targetPublishTimeUtc: params.targetPublishTimeUtc,
    targetPublishTimeBst: params.targetPublishTimeBst,
    status: 'PENDING',
    priority: params.priority || 5,
    createdBy: params.createdBy || 'ADMIN',
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: params.maxRetries ?? 3,
    idempotencyKey
  };

  return item;
}

export function enqueuePublishingItem(item: PublishingQueueItem): {
  success: boolean;
  item: PublishingQueueItem;
  isDuplicate: boolean;
} {
  const existingQueue = serverDB.getPublishingQueue ? serverDB.getPublishingQueue() : {};
  
  // Idempotency check: see if identical pending/processing task already exists
  const duplicate = Object.values(existingQueue).find(
    q => q.idempotencyKey === item.idempotencyKey && (q.status === 'PENDING' || q.status === 'PROCESSING')
  );

  if (duplicate) {
    return {
      success: true,
      item: duplicate,
      isDuplicate: true
    };
  }

  if (serverDB.savePublishingQueueItem) {
    serverDB.savePublishingQueueItem(item);
  }

  return {
    success: true,
    item,
    isDuplicate: false
  };
}

export function updateQueueItemStatus(
  queueId: string,
  status: PublicationQueueStatus,
  errorSummary?: string
): PublishingQueueItem | null {
  const existingQueue = serverDB.getPublishingQueue ? serverDB.getPublishingQueue() : {};
  const item = existingQueue[queueId];
  if (!item) return null;

  item.status = status;
  if (status === 'PROCESSING') {
    item.lastAttemptAt = new Date().toISOString();
  } else if (status === 'COMPLETED') {
    item.completedAt = new Date().toISOString();
    item.errorSummary = undefined;
  } else if (status === 'FAILED') {
    item.retryCount = (item.retryCount || 0) + 1;
    item.errorSummary = errorSummary || 'Unknown publishing error';
    if (item.retryCount < item.maxRetries) {
      item.status = 'RETRY_PENDING';
    }
  }

  if (serverDB.savePublishingQueueItem) {
    serverDB.savePublishingQueueItem(item);
  }

  return item;
}

export function cancelQueueItem(queueId: string, cancelledBy: string): PublishingQueueItem | null {
  const existingQueue = serverDB.getPublishingQueue ? serverDB.getPublishingQueue() : {};
  const item = existingQueue[queueId];
  if (!item) return null;

  if (item.status === 'COMPLETED') {
    throw new Error('ইতিমধ্যে প্রকাশিত আইটেম বাতিল করা সম্ভব নয়। অপ্রকাশ (Unpublish) করতে পারেন।');
  }

  item.status = 'CANCELLED';
  item.errorSummary = `Cancelled by ${cancelledBy} at ${new Date().toISOString()}`;

  if (serverDB.savePublishingQueueItem) {
    serverDB.savePublishingQueueItem(item);
  }

  return item;
}
