import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { serverDB } from '../../db';
import { PersonalizedRecommender } from '../../matching/recommender';
import { DeadlineAlertsEngine } from '../../deadlines/alerts';
import { JobCircular } from '../../types';
import fs from 'fs';
import path from 'path';

export async function runScenario46(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-46-DUPLICATE-PREVENTION-AND-IDEMPOTENCY-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  try {
    const candidateId = 'SYNTH-USR-DHAKA-003';
    const testJobId = 'JOB-DEDUPE-AUDIT-999';
    const dedupeKey = `MATCH_${candidateId}_${testJobId}_in_app_2026-11-01`;

    // 1. Delivery Queue Deduplication Safeguard
    actionsPerformed.push('Testing deduplication key enforcement in delivery queue');
    const item1 = serverDB.enqueueNotificationDelivery({
      id: `del_test_1_${Date.now()}`,
      candidateId,
      jobId: testJobId,
      jobTitle: 'সহকারী পরিচালক প্রশাসন',
      organization: 'ডাক ও টেলিযোগাযোগ অধিদপ্তর ঢাকা',
      type: 'deadline_reminder',
      channel: 'in_app',
      title: 'সংশোধিত নিয়োগ বিজ্ঞপ্তি ২০২৬',
      message: 'প্রথম প্রকাশ ১',
      status: 'QUEUED',
      attemptCount: 0,
      dedupeKey,
      read: false,
      createdAt: new Date().toISOString()
    });

    // Enqueue identical item 4 more times with identical dedupeKey but different item IDs
    const item2 = serverDB.enqueueNotificationDelivery({
      id: `del_test_2_${Date.now()}`,
      candidateId,
      jobId: testJobId,
      jobTitle: 'সহকারী পরিচালক প্রশাসন',
      organization: 'ডাক ও টেলিযোগাযোগ অধিদপ্তর ঢাকা',
      type: 'deadline_reminder',
      channel: 'in_app',
      title: 'সংশোধিত নিয়োগ বিজ্ঞপ্তি ২০২৬',
      message: 'প্রথম প্রকাশ ১ (হালনাগাদ)',
      status: 'QUEUED',
      attemptCount: 0,
      dedupeKey,
      read: false,
      createdAt: new Date().toISOString()
    });

    const item3 = serverDB.enqueueNotificationDelivery({
      id: `del_test_3_${Date.now()}`,
      candidateId,
      jobId: testJobId,
      jobTitle: 'সহকারী পরিচালক প্রশাসন',
      organization: 'ডাক ও টেলিযোগাযোগ অধিদপ্তর ঢাকা',
      type: 'deadline_reminder',
      channel: 'in_app',
      title: 'সংশোধিত নিয়োগ বিজ্ঞপ্তি ২০২৬',
      message: 'প্রথম প্রকাশ ১ (হালনাগাদ)',
      status: 'QUEUED',
      attemptCount: 0,
      dedupeKey,
      read: false,
      createdAt: new Date().toISOString()
    });

    assertions.push({
      assertion: 'Queue deduplication returns original item instance when dedupeKey matches',
      expected: item1.id,
      actual: item2.id,
      passed: item1.id === item2.id && item2.id === item3.id
    });

    // Check delivery count for this candidate and key
    const allDeliveries = serverDB.getNotificationDeliveries(candidateId);
    const matchingDeliveries = allDeliveries.filter(d => d.dedupeKey === dedupeKey);

    assertions.push({
      assertion: 'Exactly 1 delivery record exists in queue despite multiple enqueue calls',
      expected: '1',
      actual: String(matchingDeliveries.length),
      passed: matchingDeliveries.length === 1
    });

    // 2. Candidate In-App Notification Deduplication in Recommender
    actionsPerformed.push('Testing candidate in-app notification deduplication across matching re-evaluations');
    const initialNotifs = serverDB.getCandidateNotifications(candidateId);
    const initialCount = initialNotifs.length;

    // Run notifyCandidateOnTopMatches 3 times consecutively
    const run1 = PersonalizedRecommender.notifyCandidateOnTopMatches(candidateId);
    const run2 = PersonalizedRecommender.notifyCandidateOnTopMatches(candidateId);
    const run3 = PersonalizedRecommender.notifyCandidateOnTopMatches(candidateId);

    const afterNotifs = serverDB.getCandidateNotifications(candidateId);

    assertions.push({
      assertion: 'Subsequent matching notification dispatches return 0 newly sent items',
      expected: 'run2=0, run3=0',
      actual: `run2=${run2}, run3=${run3}`,
      passed: run2 === 0 && run3 === 0
    });

    // 3. Deadline Alerts Idempotency & Deduplication
    actionsPerformed.push('Testing deadline reminder evaluation idempotency across repeated scheduler executions');
    const testDeadlineJob: Partial<JobCircular> = {
      id: 'JOB-DEADLINE-DEDUPE-777',
      title: 'সহকারী প্রকৌশলী',
      organization: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড',
      deadline: '2026-11-04', // 3 days remaining from 2026-11-01
      publishedDate: '2026-10-01'
    };

    // Candidate subscribes to 3-day reminder
    DeadlineAlertsEngine.subscribeReminder(candidateId, testDeadlineJob.id!, [3], ['in_app']);

    const refDate = new Date('2026-11-01T12:00:00+06:00');
    const batch1 = DeadlineAlertsEngine.evaluateRemindersForJob(testDeadlineJob as any, refDate);
    const batch2 = DeadlineAlertsEngine.evaluateRemindersForJob(testDeadlineJob as any, refDate);
    const batch3 = DeadlineAlertsEngine.evaluateRemindersForJob(testDeadlineJob as any, refDate);

    assertions.push({
      assertion: 'First deadline evaluation generates reminder item for subscriber',
      expected: '1',
      actual: String(batch1.length),
      passed: batch1.length === 1
    });

    assertions.push({
      assertion: 'Repeated deadline evaluations generate 0 duplicate reminders',
      expected: 'batch2=0, batch3=0',
      actual: `batch2=${batch2.length}, batch3=${batch3.length}`,
      passed: batch2.length === 0 && batch3.length === 0
    });

    // Clean up test reminder
    DeadlineAlertsEngine.unsubscribeReminder(candidateId, testDeadlineJob.id!);

    // 4. Verify zero database pollution
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
      name: 'Duplicate Notification Prevention, Deduplication Keys & Idempotency Audit',
      category: 'api',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors,
      evidenceNotes: 'Queue deduplication keys, in-app notification deduplication, and scheduler idempotency verified.'
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
      name: 'Duplicate Notification Prevention, Deduplication Keys & Idempotency Audit',
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
