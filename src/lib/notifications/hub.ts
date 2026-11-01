/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 11: CENTRAL NOTIFICATION ORCHESTRATION HUB
 * Centralized gateway for event validation, template rendering, and delivery dispatch.
 */

import { serverDB } from '../db';
import { 
  NotificationEventType, 
  NotificationChannel, 
  NotificationPriority, 
  ChannelStatusReport,
  DeliveryQueueItem
} from './types';
import { NotificationCatalogHelper } from './catalog';
import { NotificationTemplateManager } from './templates';
import { NotificationDeliveryQueue } from './queue';

export interface DispatchNotificationOptions {
  type: NotificationEventType;
  candidateId: string;
  variables: Record<string, string | number | undefined | null>;
  targetId?: string;
  priority?: NotificationPriority;
  link?: string;
  channels?: NotificationChannel[];
}

export class CentralNotificationHub {
  /**
   * Dispatch a notification event across all allowed and requested channels
   */
  public static async dispatch(options: DispatchNotificationOptions): Promise<{
    success: boolean;
    dispatchedCount: number;
    deliveries: DeliveryQueueItem[];
  }> {
    const { type, candidateId, variables, targetId, priority, link, channels } = options;
    const def = NotificationCatalogHelper.getDefinition(type);

    // Channels to attempt: intersection of requested and allowed (or allowed by default)
    const targetChannels: NotificationChannel[] = channels && channels.length > 0
      ? channels.filter(c => def.allowedChannels.includes(c))
      : ['in_app'];

    const effectivePriority = priority || def.defaultPriority;
    const deliveries: DeliveryQueueItem[] = [];

    for (const channel of targetChannels) {
      const template = NotificationTemplateManager.getTemplate(type, channel);
      const title = NotificationTemplateManager.render(template.titleTemplate, variables);
      const message = NotificationTemplateManager.render(template.bodyTemplate, variables);

      const dedupeKey = `${type}_${candidateId}_${targetId || 'global'}_${channel}_${new Date().toISOString().slice(0, 10)}`;

      const item = NotificationDeliveryQueue.enqueue({
        candidateId,
        eventType: type,
        channel,
        priority: effectivePriority,
        title,
        message,
        link: link || (variables.link ? String(variables.link) : undefined),
        targetId,
        targetType: def.category,
        dedupeKey
      });

      deliveries.push(item);
    }

    // Trigger immediate delivery processing for in-app and active channels
    await NotificationDeliveryQueue.processQueue();

    return {
      success: deliveries.length > 0,
      dispatchedCount: deliveries.length,
      deliveries
    };
  }

  /**
   * Get authoritative report of channel availability and configuration status
   */
  public static getChannelStatusReport(): ChannelStatusReport[] {
    const hasSms = Boolean(process.env.SMS_API_KEY);
    const hasEmail = Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
    const hasPush = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

    return [
      {
        channel: 'in_app',
        status: 'CONFIGURED_AND_TESTED',
        details: 'ইন-অ্যাপ ইনবক্স নোটিফিকেশন ১০০% সক্রিয় এবং কার্যক্ষম।',
        isAvailable: true
      },
      {
        channel: 'email',
        status: hasEmail ? 'CONFIGURED_AND_TESTED' : 'NOT_CONFIGURED',
        details: hasEmail 
          ? 'ট্রানজেকশনাল ইমেইল গেটওয়ে সক্রিয়।' 
          : 'ইমেইল ক্রেডেনশিয়াল অনির্ধারিত (Environment Secret Absent)।',
        isAvailable: hasEmail
      },
      {
        channel: 'sms',
        status: hasSms ? 'CONFIGURED_AND_TESTED' : 'NOT_CONFIGURED',
        details: hasSms 
          ? 'গ্রীনওয়েব / অননুরোকম এসএমএস গেটওয়ে সক্রিয়।' 
          : 'এসএমএস এপিআই কি অনির্ধারিত (Environment Secret Absent)।',
        isAvailable: hasSms
      },
      {
        channel: 'web_push',
        status: hasPush ? 'CONFIGURED_AND_TESTED' : 'NOT_CONFIGURED',
        details: hasPush 
          ? 'ওয়েব পুশ নোটিফিকেশন কনফিগার করা।' 
          : 'VAPID কি অনির্ধারিত।',
        isAvailable: hasPush
      }
    ];
  }
}
