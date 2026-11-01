/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 08: SMART ALERT RULES & USER REMINDER ENGINE
 * Configurable Alert Schedules, User Subscriptions & Deduplication Safeguards
 */

import { 
  DeadlineAlertRule, 
  UserJobReminder, 
  NotificationDeliveryItem,
  NotificationChannel 
} from './types';
import { CentralDeadlineEngine } from './engine';
import { serverDB } from '../db';
import { JobCircular } from '../types';

export const DEFAULT_ALERT_RULES: DeadlineAlertRule[] = [
  {
    id: 'rule-7d',
    name: '7 Days Before Deadline',
    nameBn: 'আবেদনের ৭ দিন আগে নোটিফিকেশন',
    leadDays: 7,
    channel: 'in_app',
    isEnabled: true
  },
  {
    id: 'rule-3d',
    name: '3 Days Before Deadline (Urgent)',
    nameBn: 'আবেদনের ৩ দিন আগে (জরুরি অ্যালার্ট)',
    leadDays: 3,
    channel: 'in_app',
    isEnabled: true
  },
  {
    id: 'rule-1d',
    name: '1 Day Before Deadline',
    nameBn: 'আবেদনের ১ দিন আগে নোটিফিকেশন',
    leadDays: 1,
    channel: 'in_app',
    isEnabled: true
  },
  {
    id: 'rule-0d',
    name: 'Deadline Day Notice',
    nameBn: 'আবেদনের শেষ তারিখ আজ',
    leadDays: 0,
    channel: 'in_app',
    isEnabled: true
  }
];

export class DeadlineAlertsEngine {
  /**
   * Get active system alert rules
   */
  public static getAlertRules(): DeadlineAlertRule[] {
    const rules = serverDB.getDeadlineAlertRules();
    return rules.length > 0 ? rules : DEFAULT_ALERT_RULES;
  }

  /**
   * Save / update alert rules
   */
  public static updateAlertRules(rules: DeadlineAlertRule[]): void {
    serverDB.saveDeadlineAlertRules(rules);
  }

  /**
   * Retrieve reminders for candidate
   */
  public static getUserReminders(candidateId: string): UserJobReminder[] {
    return serverDB.getUserJobReminders(candidateId);
  }

  /**
   * Subscribe or update deadline reminder for a job
   */
  public static subscribeReminder(
    candidateId: string,
    jobId: string,
    leadDays: number[] = [3, 1, 0],
    channels: NotificationChannel[] = ['in_app']
  ): UserJobReminder {
    const reminder: UserJobReminder = {
      id: `rem_${candidateId}_${jobId}`,
      candidateId,
      jobId,
      leadDays,
      channels,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return serverDB.saveUserJobReminder(reminder);
  }

  /**
   * Unsubscribe / delete deadline reminder
   */
  public static unsubscribeReminder(candidateId: string, jobId: string): boolean {
    return serverDB.deleteUserJobReminder(candidateId, jobId);
  }

  /**
   * Check if a candidate has an active reminder for a job
   */
  public static isReminderSubscribed(candidateId: string, jobId: string): boolean {
    const reminders = serverDB.getUserJobReminders(candidateId);
    return reminders.some(r => r.jobId === jobId && r.isEnabled);
  }

  /**
   * Evaluate and generate notifications for a specific job across all subscribers
   */
  public static evaluateRemindersForJob(
    job: JobCircular,
    refDate: Date = new Date()
  ): NotificationDeliveryItem[] {
    const generated: NotificationDeliveryItem[] = [];

    // Evaluate authoritative deadline status
    const evalResult = CentralDeadlineEngine.evaluateDeadline(job, undefined, refDate);

    // Suppress normal reminders if job is cancelled, suspended, closed, or unknown
    if (evalResult.isClosed || evalResult.status === 'CANCELLED' || evalResult.status === 'SUSPENDED' || evalResult.status === 'UNKNOWN') {
      return generated;
    }

    const allReminders = serverDB.getAllUserJobReminders();
    const jobReminders = allReminders.filter(r => r.jobId === job.id && r.isEnabled);

    for (const reminder of jobReminders) {
      // Check if current daysRemaining matches any of candidate's selected leadDays
      if (reminder.leadDays.includes(evalResult.daysRemaining)) {
        const leadDay = evalResult.daysRemaining;
        const dedupeKey = `${reminder.candidateId}_${job.id}_reminder_${leadDay}d_${evalResult.authoritativeDeadlineDate}`;

        // Title and message in Bengali
        let title = '';
        let message = '';
        const org = job.organization;
        const jobTitle = job.title;

        if (leadDay === 0) {
          title = `আবেদনের শেষ তারিখ আজ — ${org}`;
          message = `${org}-এ "${jobTitle}" পদের অনলাইনে আবেদনের সময় আজ শেষ হচ্ছে। সার্ভার জ্যাম এড়াতে দ্রুত আবেদন সম্পন্ন করুন।`;
        } else if (leadDay === 1) {
          title = `আবেদনের শেষ সময় আর মাত্র ১ দিন — ${org}`;
          message = `${org}-এর "${jobTitle}" পদে আবেদনের সময়সীমা আগামীকাল শেষ হবে।`;
        } else {
          const daysBn = CentralDeadlineEngine.toBn(leadDay);
          title = `আবেদনের সময় বাকি আর ${daysBn} দিন — ${org}`;
          message = `${org}-এর "${jobTitle}" পদে আবেদনের সময়সীমা আগামী ${job.deadline} তারিখে শেষ হবে।`;
        }

        for (const channel of reminder.channels) {
          const item: NotificationDeliveryItem = {
            id: `notif-del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            candidateId: reminder.candidateId,
            jobId: job.id,
            jobTitle: job.title,
            organization: job.organization,
            type: leadDay === 0 ? 'deadline_today' : 'deadline_reminder',
            channel,
            title,
            message,
            link: `/jobs/${job.slug || job.id}`,
            status: 'QUEUED',
            attemptCount: 0,
            dedupeKey: `${dedupeKey}_${channel}`,
            read: false,
            createdAt: new Date().toISOString()
          };

          const enqueued = serverDB.enqueueNotificationDelivery(item);
          if (enqueued.id === item.id) {
            generated.push(item);
            // If in_app, also sync to candidate in-app notifications
            if (channel === 'in_app') {
              serverDB.addCandidateNotification(reminder.candidateId, {
                title,
                message,
                type: 'deadline',
                link: `/jobs/${job.slug || job.id}`
              });
            }
          }
        }
      }
    }

    return generated;
  }
}
