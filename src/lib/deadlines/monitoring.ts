/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 08: DEADLINE MONITORING & RECONCILIATION ENGINE
 * Automated Periodic Reconciliation, Expiration Management & Reminder Dispatch
 */

import { MonitoringRunRecord } from './types';
import { CentralDeadlineEngine } from './engine';
import { DeadlineAlertsEngine } from './alerts';
import { NotificationDeliveryEngine } from './delivery';
import { serverDB } from '../db';
import { JobCircular } from '../types';

export class DeadlineMonitoringEngine {
  private static isRunning = false;
  private static lastRunTime: number = 0;

  /**
   * Execute complete deadline reconciliation, expiration check, and alert generation
   */
  public static async runReconciliation(
    options: {
      adminId?: string;
      force?: boolean;
      refDate?: Date;
    } = {}
  ): Promise<MonitoringRunRecord> {
    const now = Date.now();
    // Concurrency Lock: Prevent parallel overlapping runs unless forced
    if (this.isRunning && !options.force) {
      const lockAgeSeconds = Math.round((now - this.lastRunTime) / 1000);
      if (lockAgeSeconds < 120) {
        throw new Error(`MONITORING_IN_PROGRESS: Another monitoring reconciliation is active (${lockAgeSeconds}s ago)`);
      }
    }

    this.isRunning = true;
    this.lastRunTime = now;
    const refDate = options.refDate || new Date();
    const runId = 'mon-run-' + Date.now();
    const startTimeIso = new Date().toISOString();

    const record: MonitoringRunRecord = {
      id: runId,
      startedAt: startTimeIso,
      jobsChecked: 0,
      closingTodayCount: 0,
      closingSoonCount: 0,
      expiredCount: 0,
      alertsGenerated: 0,
      proposalsCreated: 0,
      status: 'RUNNING'
    };

    try {
      const allJobs = serverDB.getJobs();
      record.jobsChecked = allJobs.length;

      let todayCount = 0;
      let soonCount = 0;
      let expCount = 0;
      let totalAlerts = 0;

      for (const job of allJobs) {
        // Skip unapproved drafts or unpublished jobs
        if (job.id.startsWith('draft-') || (job as any).publicationStatus === 'UNPUBLISHED') {
          continue;
        }

        const deadlineData = serverDB.getDeadlineData(job.id);
        const evalResult = CentralDeadlineEngine.evaluateDeadline(job, deadlineData || undefined, refDate);

        // Update remaining days on canonical record
        job.daysRemaining = evalResult.daysRemaining;

        // If deadline is expired and job is not cancelled/suspended, mark as expired
        if (evalResult.isClosed) {
          expCount++;
          if ((job as any).lifecycleStatus !== 'CANCELLED' && (job as any).lifecycleStatus !== 'SUSPENDED') {
            (job as any).lifecycleStatus = 'DEADLINE_EXPIRED';
          }
        } else if (evalResult.isClosingToday) {
          todayCount++;
          (job as any).lifecycleStatus = 'ACTIVE';
        } else if (evalResult.isClosingSoon) {
          soonCount++;
          (job as any).lifecycleStatus = 'ACTIVE';
        } else if (evalResult.status === 'OPEN' || evalResult.status === 'EXTENDED') {
          (job as any).lifecycleStatus = 'ACTIVE';
        }

        if (job.id?.startsWith('SYNTH-') || (job as any).isSynthetic || process.env.NODE_ENV === 'production') {
          serverDB.saveJob(job);
        }

        // Evaluate user reminders for this job
        const alerts = DeadlineAlertsEngine.evaluateRemindersForJob(job, refDate);
        totalAlerts += alerts.length;
      }

      record.closingTodayCount = todayCount;
      record.closingSoonCount = soonCount;
      record.expiredCount = expCount;
      record.alertsGenerated = totalAlerts;

      // Process queued deliveries
      await NotificationDeliveryEngine.processDeliveryQueue(50);

      record.status = 'SUCCESS';
      record.completedAt = new Date().toISOString();
      serverDB.saveMonitoringRun(record);

      // Record admin audit log
      serverDB.addAuditLog({
        adminId: options.adminId || 'SYSTEM_MONITOR',
        action: 'RUN_DEADLINE_MONITORING',
        targetType: 'DEADLINE_MONITOR',
        targetId: runId,
        notes: `Reconciliation checked ${record.jobsChecked} jobs: Today=${todayCount}, Soon=${soonCount}, Expired=${expCount}, Alerts=${totalAlerts}`,
        changes: { metrics: { new: record } }
      });

      return record;
    } catch (err: any) {
      record.status = 'FAILED';
      record.error = err.message || 'Unknown monitoring error';
      record.completedAt = new Date().toISOString();
      serverDB.saveMonitoringRun(record);
      throw err;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get monitoring health and last run statistics
   */
  public static getMonitoringStats() {
    const runs = serverDB.getMonitoringRuns(10);
    const lastRun = runs[0] || null;
    const allJobs = serverDB.getJobs();
    const activeJobs = allJobs.filter(j => !j.id.startsWith('draft-') && (j as any).publicationStatus !== 'UNPUBLISHED');

    let closingToday = 0;
    let closingSoon = 0;
    let expired = 0;
    let suspended = 0;
    let cancelled = 0;

    for (const job of activeJobs) {
      const evalResult = CentralDeadlineEngine.evaluateDeadline(job);
      if (evalResult.status === 'CANCELLED') cancelled++;
      else if (evalResult.status === 'SUSPENDED') suspended++;
      else if (evalResult.status === 'CLOSED') expired++;
      else if (evalResult.status === 'CLOSING_TODAY') closingToday++;
      else if (evalResult.status === 'CLOSING_SOON') closingSoon++;
    }

    return {
      totalActiveJobs: activeJobs.length,
      closingToday,
      closingSoon,
      expired,
      suspended,
      cancelled,
      lastRun
    };
  }
}
