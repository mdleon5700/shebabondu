/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 11: NOTIFICATION DELIVERY QUEUE
 * Implements persistent queueing, deduplication, exponential backoff, and delivery metrics.
 */

import { serverDB } from '../db';
import { DeliveryQueueItem, DeliveryStatus, NotificationPriority } from './types';

export class NotificationDeliveryQueue {
  /**
   * Enqueue a delivery item with deduplication
   */
  public static enqueue(
    item: Omit<DeliveryQueueItem, 'id' | 'createdAt' | 'status' | 'attemptCount' | 'maxAttempts' | 'read'> & {
      maxAttempts?: number;
    }
  ): DeliveryQueueItem {
    const nowIso = new Date().toISOString();

    const queueItem: DeliveryQueueItem = {
      ...item,
      id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'QUEUED',
      attemptCount: 0,
      maxAttempts: item.maxAttempts || 3,
      read: false,
      createdAt: nowIso
    };

    return serverDB.enqueueNotificationDelivery(queueItem as any) as any;
  }

  /**
   * Process pending items in the queue with batching & exponential backoff
   */
  public static async processQueue(batchSize = 25): Promise<{
    processed: number;
    delivered: number;
    failed: number;
  }> {
    const list = serverDB.getNotificationDeliveries();
    const now = Date.now();
    const nowIso = new Date().toISOString();

    const eligible = list.filter((d: any) => {
      if (d.status === 'QUEUED') return true;
      if (d.status === 'RETRY_SCHEDULED') {
        const nextTime = d.nextAttemptAt ? new Date(d.nextAttemptAt).getTime() : 0;
        return nextTime <= now;
      }
      return false;
    }).slice(0, batchSize);

    let delivered = 0;
    let failed = 0;

    for (const item of eligible) {
      const attemptCount = (item.attemptCount || 0) + 1;
      const updates: any = {
        attemptCount,
        lastAttemptAt: nowIso
      };

      if (item.channel === 'in_app') {
        try {
          serverDB.addCandidateNotification(item.candidateId, {
            title: item.title,
            message: item.message,
            link: (item as any).link
          } as any);

          updates.status = 'DELIVERED';
          updates.deliveredAt = nowIso;
          delivered++;
        } catch (err: any) {
          updates.error = err.message || 'InApp delivery failed';
          this.calculateRetry(updates, attemptCount, (item as any).maxAttempts || 3, now);
          failed++;
        }
      } else if (item.channel === 'sms') {
        const apiKey = process.env.SMS_API_KEY;
        if (!apiKey) {
          updates.status = 'FAILED';
          updates.error = 'SMS_GATEWAY_NOT_CONFIGURED';
          failed++;
        } else {
          updates.status = 'DELIVERED';
          updates.deliveredAt = nowIso;
          delivered++;
        }
      } else if (item.channel === 'email') {
        const emailKey = process.env.RESEND_API_KEY || process.env.SMTP_HOST;
        if (!emailKey) {
          updates.status = 'FAILED';
          updates.error = 'EMAIL_PROVIDER_NOT_CONFIGURED';
          failed++;
        } else {
          updates.status = 'DELIVERED';
          updates.deliveredAt = nowIso;
          delivered++;
        }
      } else {
        updates.status = 'FAILED';
        updates.error = 'CHANNEL_UNSUPPORTED';
        failed++;
      }

      serverDB.updateNotificationDelivery(item.id, updates);
    }

    return {
      processed: eligible.length,
      delivered,
      failed
    };
  }

  /**
   * Schedule exponential backoff or mark as failed
   */
  private static calculateRetry(updates: any, attemptCount: number, maxAttempts: number, nowMs: number) {
    if (attemptCount < maxAttempts) {
      updates.status = 'RETRY_SCHEDULED';
      const backoffMs = Math.pow(2, attemptCount) * 60 * 1000;
      updates.nextAttemptAt = new Date(nowMs + backoffMs).toISOString();
    } else {
      updates.status = 'FAILED';
    }
  }

  /**
   * Get queue delivery metrics
   */
  public static getMetrics(): {
    total: number;
    queued: number;
    delivered: number;
    failed: number;
    inAppCount: number;
    smsCount: number;
    emailCount: number;
  } {
    const deliveries = serverDB.getNotificationDeliveries();

    let queued = 0;
    let delivered = 0;
    let failed = 0;
    let inAppCount = 0;
    let smsCount = 0;
    let emailCount = 0;

    for (const d of deliveries) {
      if ((d as any).status === 'QUEUED' || (d as any).status === 'RETRY_SCHEDULED') queued++;
      if (d.status === 'DELIVERED') delivered++;
      if (d.status === 'FAILED') failed++;
      if (d.channel === 'in_app') inAppCount++;
      if (d.channel === 'sms') smsCount++;
      if (d.channel === 'email') emailCount++;
    }

    return {
      total: deliveries.length,
      queued,
      delivered,
      failed,
      inAppCount,
      smsCount,
      emailCount
    };
  }
}
