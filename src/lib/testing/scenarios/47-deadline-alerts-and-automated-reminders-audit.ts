import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { DeadlineAlertsEngine } from '../../deadlines/alerts';
import { CentralDeadlineEngine } from '../../deadlines/engine';
import { serverDB } from '../../db';
import { JobCircular } from '../../types';
import fs from 'fs';
import path from 'path';

export async function runScenario47(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-47-DEADLINE-ALERTS-AND-AUTOMATED-REMINDERS-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  try {
    const candidateId = 'SYNTH-USR-DHAKA-004';
    
    // 1. Audit Default Alert Rules
    actionsPerformed.push('Auditing standard system deadline alert rules');
    const rules = DeadlineAlertsEngine.getAlertRules();
    const leadDays = rules.map(r => r.leadDays);

    assertions.push({
      assertion: 'Standard alert rules configure 7-day, 3-day, 1-day, and 0-day lead intervals',
      expected: 'true',
      actual: JSON.stringify(leadDays),
      passed: leadDays.includes(7) && leadDays.includes(3) && leadDays.includes(1) && leadDays.includes(0)
    });

    // 2. User Job Reminder Subscription Lifecycle
    actionsPerformed.push('Testing candidate reminder subscription lifecycle');
    const testJobActive: Partial<JobCircular> = {
      id: 'JOB-ALERT-ACTIVE-101',
      title: 'উপ-সহকারী প্রকৌশলী (সিভিল)',
      organization: 'স্থানীয় সরকার প্রকৌশল অধিদপ্তর (এলজিইডি)',
      deadline: '2026-11-04',
      publishedDate: '2026-10-01'
    };

    const reminder = DeadlineAlertsEngine.subscribeReminder(
      candidateId,
      testJobActive.id!,
      [7, 3, 1, 0],
      ['in_app']
    );

    assertions.push({
      assertion: 'Candidate successfully subscribes to deadline reminder for target job',
      expected: 'true',
      actual: String(Boolean(reminder?.id)),
      passed: Boolean(reminder?.id) && reminder.candidateId === candidateId
    });

    assertions.push({
      assertion: 'isReminderSubscribed accurately returns true for active subscription',
      expected: 'true',
      actual: String(DeadlineAlertsEngine.isReminderSubscribed(candidateId, testJobActive.id!)),
      passed: DeadlineAlertsEngine.isReminderSubscribed(candidateId, testJobActive.id!) === true
    });

    // 3. Time Boundary Evaluation: 0-day (Today), 1-day (Tomorrow), 3-day
    actionsPerformed.push('Evaluating deadline reminder messages across time boundaries');
    
    // Test boundary: Deadline today (0-days remaining)
    const refDateToday = new Date('2026-11-04T10:00:00+06:00');
    const itemsToday = DeadlineAlertsEngine.evaluateRemindersForJob(testJobActive as any, refDateToday);

    assertions.push({
      assertion: 'Deadline today (0-day) generates urgent Bengali alert title',
      expected: 'true',
      actual: itemsToday[0]?.title || 'none',
      passed: Boolean(itemsToday[0]?.title?.includes('আবেদনের শেষ তারিখ আজ'))
    });

    // Test boundary: Deadline tomorrow (1-day remaining)
    const refDateTomorrow = new Date('2026-11-03T10:00:00+06:00');
    const itemsTomorrow = DeadlineAlertsEngine.evaluateRemindersForJob(testJobActive as any, refDateTomorrow);

    assertions.push({
      assertion: 'Deadline tomorrow (1-day) generates 1-day remaining alert title',
      expected: 'true',
      actual: itemsTomorrow[0]?.title || 'none',
      passed: Boolean(itemsTomorrow[0]?.title?.includes('১ দিন'))
    });

    // 4. In-App Notification Delivery Synchronization
    actionsPerformed.push('Verifying in-app candidate notification synchronization');
    const candidateNotifs = serverDB.getCandidateNotifications(candidateId);
    const hasDeadlineNotif = candidateNotifs.some(n => n.type === 'deadline');

    assertions.push({
      assertion: 'Deadline reminder delivery automatically synchronizes to candidate in-app inbox',
      expected: 'true',
      actual: String(hasDeadlineNotif),
      passed: hasDeadlineNotif === true
    });

    // 5. Expired / Cancelled Job Suppression
    actionsPerformed.push('Verifying cancelled or expired jobs suppress reminder notifications');
    const testJobCancelled: Partial<JobCircular> = {
      id: 'JOB-ALERT-CANCELLED-102',
      title: 'কম্পিউটার অপারেটর',
      organization: 'ডাক অধিদপ্তর',
      deadline: '2026-11-04',
      status: 'CANCELLED'
    };

    DeadlineAlertsEngine.subscribeReminder(candidateId, testJobCancelled.id!, [3, 0], ['in_app']);
    const itemsCancelled = DeadlineAlertsEngine.evaluateRemindersForJob(testJobCancelled as any, refDateToday);

    assertions.push({
      assertion: 'Cancelled job strictly generates ZERO deadline notifications for subscribers',
      expected: '0',
      actual: String(itemsCancelled.length),
      passed: itemsCancelled.length === 0
    });

    // 6. Unsubscribe Lifecycle
    actionsPerformed.push('Unsubscribing candidate from reminders');
    DeadlineAlertsEngine.unsubscribeReminder(candidateId, testJobActive.id!);
    DeadlineAlertsEngine.unsubscribeReminder(candidateId, testJobCancelled.id!);

    assertions.push({
      assertion: 'isReminderSubscribed returns false after successful unsubscription',
      expected: 'false',
      actual: String(DeadlineAlertsEngine.isReminderSubscribed(candidateId, testJobActive.id!)),
      passed: DeadlineAlertsEngine.isReminderSubscribed(candidateId, testJobActive.id!) === false
    });

    // Verify zero database pollution
    const dbPath = path.join(process.cwd(), 'src', 'db', 'local_store.json');
    const rawDB = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const candidatesCount = Object.keys(rawDB.candidates || {}).length;
    const jobsCount = Object.keys(rawDB.jobs || {}).length;

    assertions.push({
      assertion: 'Production store local_store.json strictly preserved at 41 candidates and 214 jobs',
      expected: '41 candidates, 214 jobs',
      actual: `${candidatesCount} candidates, ${jobsCount} jobs`,
      passed: candidatesCount === 41 && jobsCount === 214
    });

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Deadline Alerts, User Subscriptions & Automated Reminder Engine Audit',
      category: 'api',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors,
      evidenceNotes: 'Rules, subscription lifecycle, time boundary calculation, and cancellation suppression verified.'
    };
  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    return {
      scenarioId,
      name: 'Deadline Alerts, User Subscriptions & Automated Reminder Engine Audit',
      category: 'api',
      status: 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors
    };
  }
}
