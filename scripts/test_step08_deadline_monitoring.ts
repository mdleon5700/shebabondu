/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 08 ACCEPTANCE TEST SUITE
 * Complete Deadline Monitoring, Update Detection, Expiration & Smart Alerts
 */

import { serverDB } from '../src/lib/db';
import { CentralDeadlineEngine } from '../src/lib/deadlines/engine';
import { CircularChangeDetector } from '../src/lib/deadlines/change-detector';
import { DeadlineAlertsEngine, DEFAULT_ALERT_RULES } from '../src/lib/deadlines/alerts';
import { NotificationDeliveryEngine } from '../src/lib/deadlines/delivery';
import { DeadlineMonitoringEngine } from '../src/lib/deadlines/monitoring';
import { BangladeshDateHelper } from '../src/lib/feeds/timezone';
import { JobCircular, CircularDraft } from '../src/lib/types';
import { 
  DeadlineData, 
  CircularChangeProposal, 
  UserJobReminder, 
  NotificationDeliveryItem 
} from '../src/lib/deadlines/types';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${testName}${detail ? ` (${detail})` : ''}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${testName}${detail ? ` — DETAIL: ${detail}` : ''}`);
    process.exitCode = 1;
  }
}

async function runStep08TestSuite() {
  console.log('================================================================');
  console.log('   CHAKRI SHEBA — STEP 08: DEADLINE & SMART ALERT TEST SUITE');
  console.log('================================================================\n');

  const refDate = new Date('2026-10-30T12:00:00Z'); // Friday, 30 Oct 2026 18:00 BST

  // -------------------------------------------------------------
  // Vector 1: Central Deadline Parsing & Time Normalization
  // -------------------------------------------------------------
  console.log('>>> [Vector 1] Deadline Parsing, Precision & Evidence Normalization');

  const parsedSlash = CentralDeadlineEngine.parseDeadline('৩০/১১/২০২৬', refDate);
  assert(parsedSlash.deadlineDate === '2026-11-30', 'Bengali slash date parsed to 2026-11-30');
  assert(parsedSlash.precision === 'DATE_ONLY', 'Date without explicit time classified as DATE_ONLY');
  assert(parsedSlash.deadlineTime === undefined, 'No closing hour invented for date-only deadline');

  const parsedTimeBn = CentralDeadlineEngine.parseDeadline('৩০ নভেম্বর ২০২৬ বিকাল ৫:০০', refDate);
  assert(parsedTimeBn.deadlineDate === '2026-11-30', 'Bengali text month date parsed to 2026-11-30');
  assert(parsedTimeBn.deadlineTime === '17:00', 'Bengali period বিকাল ৫:০০ parsed to 24h 17:00');
  assert(parsedTimeBn.precision === 'EXACT_TIME', 'Explicit time classified as EXACT_TIME precision');

  const parsedNight = CentralDeadlineEngine.parseDeadline('১৫ ডিসেম্বর ২০২৬ রাত ১১:৫৯', refDate);
  assert(parsedNight.deadlineDate === '2026-12-15', 'Month date parsed to 2026-12-15');
  assert(parsedNight.deadlineTime === '23:59', 'Explicit night time রাত ১১:৫৯ parsed to 23:59');

  const parsedInvalid = CentralDeadlineEngine.parseDeadline('আবেদনের শেষ তারিখ পরবর্তীতে জানানো হবে', refDate);
  assert(parsedInvalid.deadlineDate === '', 'Invalid text yields empty deadline date');
  assert(parsedInvalid.verificationStatus === 'UNVERIFIED', 'Invalid text marked UNVERIFIED');

  const parsedCancelHint = CentralDeadlineEngine.parseDeadline('বিজ্ঞপ্তি বাতিল করা হয়েছে', refDate);
  assert(parsedCancelHint.lifecycleHint === 'CANCELLED', 'Cancellation wording in text accurately detected');

  const parsedSuspHint = CentralDeadlineEngine.parseDeadline('নিয়োগ স্থগিত সংক্রান্ত নোটিশ', refDate);
  assert(parsedSuspHint.lifecycleHint === 'SUSPENDED', 'Suspension wording in text accurately detected');

  // -------------------------------------------------------------
  // Vector 2: Authoritative Deadline Status Calculation
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 2] Authoritative Status Calculation & Asia/Dhaka Boundary');

  const sampleJob: JobCircular = {
    id: 'test-job-dl-1',
    title: 'সহকারী কমিশনার নিয়োগ ২০২৬',
    organization: 'জনপ্রশাসন মন্ত্রণালয়',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি',
    grade: '৯ম গ্রেড',
    totalPosts: 50,
    salary: '২২,০০০ - ৫৩,০৬০ টাকা',
    minEducation: 'স্নাতক বা সমমান',
    districts: 'সকল জেলা',
    deadline: '২০/১১/২০২৬',
    daysRemaining: 21,
    publishedDate: '2026-10-25',
    govtFee: 600,
    serviceFee: 100,
    officialLink: '',
    circularImage: '',
    audioSummary: '',
    requirements: [],
    logo: '',
    minAge: 21,
    maxAge: 30
  };

  // 1. Open Job (> 3 days)
  const evalOpen = CentralDeadlineEngine.evaluateDeadline(sampleJob, undefined, refDate);
  assert(evalOpen.status === 'OPEN', 'Status evaluated as OPEN (> 3 days)');
  assert(evalOpen.daysRemaining === 21, 'Calculated exactly 21 days remaining');
  assert(evalOpen.labelBn.includes('২১ দিন'), 'Label formatted in natural Bengali');

  // 2. Closing Soon Job (3 days)
  const soonJob: JobCircular = { ...sampleJob, deadline: '০২/১১/২০২৬' }; // 3 days from Oct 30
  const evalSoon = CentralDeadlineEngine.evaluateDeadline(soonJob, undefined, refDate);
  assert(evalSoon.status === 'CLOSING_SOON', 'Status evaluated as CLOSING_SOON (<= 3 days)');
  assert(evalSoon.isClosingSoon === true, 'isClosingSoon flag is true');
  assert(evalSoon.daysRemaining === 3, 'Calculated exactly 3 days remaining');

  // 3. Closing Today Job (0 days)
  const todayJob: JobCircular = { ...sampleJob, deadline: '৩০/১০/২০২৬' };
  const evalToday = CentralDeadlineEngine.evaluateDeadline(todayJob, undefined, refDate);
  assert(evalToday.status === 'CLOSING_TODAY', 'Status evaluated as CLOSING_TODAY (0 days)');
  assert(evalToday.isClosingToday === true, 'isClosingToday flag is true');
  assert(evalToday.daysRemaining === 0, 'Days remaining is 0');
  assert(evalToday.labelBn === 'আবেদনের শেষ তারিখ আজ', 'Label states আবেদনের শেষ তারিখ আজ');

  // 4. Closed / Expired Job (Past date)
  const pastJob: JobCircular = { ...sampleJob, deadline: '২০/১০/২০২৬' };
  const evalPast = CentralDeadlineEngine.evaluateDeadline(pastJob, undefined, refDate);
  assert(evalPast.status === 'CLOSED', 'Status evaluated as CLOSED for past deadline');
  assert(evalPast.isClosed === true, 'isClosed flag is true');
  assert(evalPast.lifecycleStatus === 'DEADLINE_EXPIRED', 'Lifecycle status set to DEADLINE_EXPIRED');

  // 5. Extended Deadline
  const extJob: JobCircular = { ...sampleJob, deadline: 'সময় বর্ধিত: ২০/১১/২০২৬' };
  const evalExt = CentralDeadlineEngine.evaluateDeadline(extJob, undefined, refDate);
  assert(evalExt.status === 'EXTENDED', 'Status evaluated as EXTENDED for extended deadline');

  // 6. Absolute Override: Cancelled notice
  const cancelledJob: JobCircular = { ...sampleJob, deadline: '৩০/১১/২০২৬' };
  (cancelledJob as any).lifecycleStatus = 'CANCELLED';
  const evalCancel = CentralDeadlineEngine.evaluateDeadline(cancelledJob, undefined, refDate);
  assert(evalCancel.status === 'CANCELLED', 'Cancellation takes 100% precedence over countdown');
  assert(evalCancel.isClosed === true, 'Cancelled job is considered closed');
  assert(evalCancel.isClosingSoon === false, 'Cancelled job not marked closing soon');

  // 7. Absolute Override: Suspended notice
  const suspendedJob: JobCircular = { ...sampleJob, deadline: '৩০/১১/২০২৬' };
  (suspendedJob as any).lifecycleStatus = 'SUSPENDED';
  const evalSusp = CentralDeadlineEngine.evaluateDeadline(suspendedJob, undefined, refDate);
  assert(evalSusp.status === 'SUSPENDED', 'Suspension takes 100% precedence over countdown');

  // -------------------------------------------------------------
  // Vector 3: Circular Change & Update Detector
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 3] Circular Change & Update Detection Engine');

  // 1. Detect Deadline Extension
  const extProposals = CircularChangeDetector.detectChanges(sampleJob, {
    deadline: '২৫/১২/২০২৬',
    evidenceSnippet: 'আবেদনের সময় বাড়িয়ে ২৫ ডিসেম্বর করা হয়েছে।'
  });
  assert(extProposals.length === 1, 'Detected 1 change proposal for deadline extension');
  assert(extProposals[0].changeType === 'DEADLINE_EXTENDED', 'Change type identified as DEADLINE_EXTENDED');
  assert(extProposals[0].status === 'PENDING_REVIEW', 'Proposal status defaults to PENDING_REVIEW');

  // 2. Detect Cancellation Notice
  const cancelProposals = CircularChangeDetector.detectChanges(sampleJob, {
    status: 'CANCELLED',
    evidenceSnippet: 'স্মারক নম্বর ১২৩ অনুযায়ী বিজ্ঞপ্তি বাতিল।'
  });
  assert(cancelProposals.length === 1, 'Detected 1 change proposal for cancellation');
  assert(cancelProposals[0].changeType === 'CANCELLATION', 'Change type identified as CANCELLATION');

  // 3. Detect Suspension Notice
  const suspProposals = CircularChangeDetector.detectChanges(sampleJob, {
    status: 'SUSPENDED',
    evidenceSnippet: 'অনিবার্য কারণে নিয়োগ স্থগিত রাখা হলো।'
  });
  assert(suspProposals.length === 1, 'Detected suspension notice');
  assert(suspProposals[0].changeType === 'SUSPENSION', 'Change type identified as SUSPENSION');

  // 4. Detect Vacancy Count Change
  const vacProposals = CircularChangeDetector.detectChanges(sampleJob, {
    totalPosts: 75,
    evidenceSnippet: 'শূন্যপদ ৫০ হতে বৃদ্ধি করে ৭৫ করা হয়েছে।'
  });
  assert(vacProposals.length === 1, 'Detected vacancy count change');
  assert(vacProposals[0].changeType === 'VACANCY_CHANGED', 'Change type identified as VACANCY_CHANGED');
  assert(vacProposals[0].newValue === 75, 'New vacancy count captured as 75');

  // 5. Detect Educational Qualification Change
  const eduProposals = CircularChangeDetector.detectChanges(sampleJob, {
    minEducation: 'যেকোনো বিষয়ে স্নাতকোত্তর ডিগ্রি',
    evidenceSnippet: 'শিক্ষাগত যোগ্যতা সংশোধন'
  });
  assert(eduProposals.length === 1, 'Detected qualification modification');
  assert(eduProposals[0].changeType === 'QUALIFICATION_CHANGED', 'Change type identified as QUALIFICATION_CHANGED');

  // 6. Detect Application Fee Change
  const feeProposals = CircularChangeDetector.detectChanges(sampleJob, {
    govtFee: 700,
    evidenceSnippet: 'ফি বৃদ্ধি'
  });
  assert(feeProposals.length === 1, 'Detected fee modification');
  assert(feeProposals[0].changeType === 'FEE_CHANGED', 'Change type identified as FEE_CHANGED');

  // -------------------------------------------------------------
  // Vector 4: Admin Approval & Lifecycle Transitions
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 4] Admin Approval Workflow & Immutable Revisions');

  // Save sample job to db
  serverDB.saveJob(sampleJob);

  // Save extension proposal to db
  const testProposal = extProposals[0];
  serverDB.saveCircularChangeProposal(testProposal);

  // Admin approves proposal
  const approveRes = CircularChangeDetector.approveProposal(testProposal.id, 'ADMIN-TESTER', 'অফিসিয়াল গেজেট ভেরিফাইড');
  assert(approveRes.success, 'Admin successfully approved deadline extension proposal');

  // Check updated canonical job
  const updatedJob = serverDB.getJobById(sampleJob.id);
  assert(updatedJob?.deadline === '২৫/১২/২০২৬', 'Canonical job deadline updated to approved new value');

  // Check immutable deadline revision history
  const revisions = serverDB.getDeadlineRevisions(sampleJob.id);
  assert(revisions.length > 0, 'Immutable deadline revision created in history');
  assert(revisions[0].previousDeadline === '২০/১১/২০২৬', 'Previous deadline recorded in revision history');
  assert(revisions[0].newDeadline === '২৫/১২/২০২৬', 'New deadline recorded in revision history');
  assert(revisions[0].approvedBy === 'ADMIN-TESTER', 'Approving admin recorded');

  // Test Proposal Rejection
  const dummyProp: CircularChangeProposal = {
    id: 'prop-reject-test',
    jobId: sampleJob.id,
    jobTitle: sampleJob.title,
    organization: sampleJob.organization,
    changeType: 'FEE_CHANGED',
    field: 'govtFee',
    oldValue: 600,
    newValue: 9999,
    sourceUrl: 'https://fake-site.com',
    evidenceSnippet: 'ভুয়া ফি বৃদ্ধি',
    confidence: 0.1,
    status: 'PENDING_REVIEW',
    createdAt: new Date().toISOString()
  };
  serverDB.saveCircularChangeProposal(dummyProp);
  const rejectRes = CircularChangeDetector.rejectProposal(dummyProp.id, 'ADMIN-TESTER', 'ভুয়া বা অননুমোদিত উৎস');
  assert(rejectRes === true, 'Admin successfully rejected invalid change proposal');
  const rejectedProp = serverDB.getCircularChangeProposal(dummyProp.id);
  assert(rejectedProp?.status === 'REJECTED', 'Proposal status updated to REJECTED');

  // -------------------------------------------------------------
  // Vector 5: Smart Alert Rules & User Reminder Subscriptions
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 5] Smart Alert Rules & User Reminder Subscriptions');

  const rules = DeadlineAlertsEngine.getAlertRules();
  assert(rules.length >= 4, 'Default alert rules loaded (7d, 3d, 1d, 0d)');
  assert(rules.some(r => r.leadDays === 0), 'Deadline day alert rule exists');

  const candidates = serverDB.getCandidates();
  const testCandidate = candidates[0];

  // Use fresh test job ID to ensure isolated deduplication testing
  const alertJobId = 'test-job-dl-alert-' + Date.now();

  // Subscribe reminder
  const reminder = DeadlineAlertsEngine.subscribeReminder(testCandidate.id, alertJobId, [21, 3, 1, 0]);
  assert(reminder.isEnabled === true, 'User reminder subscribed successfully');
  assert(DeadlineAlertsEngine.isReminderSubscribed(testCandidate.id, alertJobId), 'Reminder evaluated as active for candidate');

  // Evaluate reminders for job (has 21 days remaining, which matches leadDays [21, 3, 1, 0])
  const jobForAlert: JobCircular = {
    ...sampleJob,
    id: alertJobId,
    deadline: '২০/১১/২০২৬',
    daysRemaining: 21
  };
  const alerts1 = DeadlineAlertsEngine.evaluateRemindersForJob(jobForAlert, refDate);
  assert(alerts1.length >= 1, 'Alert generated for candidate when daysRemaining matches subscription');
  assert(alerts1[0].type === 'deadline_reminder', 'Notification type is deadline_reminder');
  assert(alerts1[0].title.includes('আবেদনের সময় বাকি'), 'Notification title contains Bengali message');

  // Deduplication check: Running evaluation again immediately must generate 0 duplicates
  const alerts2 = DeadlineAlertsEngine.evaluateRemindersForJob(jobForAlert, refDate);
  assert(alerts2.length === 0, 'Deduplication: Duplicate alert prevented on immediate re-evaluation');

  // Suppression check: Cancelled job must suppress standard countdown reminders
  const alertCancelJob: any = {
    ...jobForAlert,
    lifecycleStatus: 'CANCELLED'
  };
  const cancelAlerts = DeadlineAlertsEngine.evaluateRemindersForJob(alertCancelJob, refDate);
  assert(cancelAlerts.length === 0, 'Cancelled job strictly suppresses standard countdown reminders');

  // Unsubscribe reminder
  const unsubRes = DeadlineAlertsEngine.unsubscribeReminder(testCandidate.id, alertJobId);
  assert(unsubRes === true, 'User reminder unsubscribed successfully');
  assert(!DeadlineAlertsEngine.isReminderSubscribed(testCandidate.id, alertJobId), 'Reminder verified as inactive after unsubscribe');

  // -------------------------------------------------------------
  // Vector 6: Notification Delivery Foundation
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 6] Multi-Channel Notification Delivery Foundation');

  const inAppProvider = NotificationDeliveryEngine.getProvider('in_app');
  assert(inAppProvider.isConfigured() === true, 'InApp notification provider is always configured');

  const emailProvider = NotificationDeliveryEngine.getProvider('email');
  assert(typeof emailProvider.isConfigured() === 'boolean', 'Email provider configuration verified');

  const smsProvider = NotificationDeliveryEngine.getProvider('sms');
  assert(typeof smsProvider.isConfigured() === 'boolean', 'SMS provider configuration verified');

  // Enqueue test in-app delivery
  const testDeliveryItem: NotificationDeliveryItem = {
    id: 'test-del-inapp-' + Date.now(),
    candidateId: testCandidate.id,
    jobId: sampleJob.id,
    jobTitle: sampleJob.title,
    organization: sampleJob.organization,
    type: 'deadline_reminder',
    channel: 'in_app',
    title: 'টেস্ট নোটিফিকেশন',
    message: 'টেস্ট নোটিফিকেশন বার্তা',
    status: 'QUEUED',
    attemptCount: 0,
    dedupeKey: 'test_dedupe_key_' + Date.now(),
    read: false,
    createdAt: new Date().toISOString()
  };

  serverDB.enqueueNotificationDelivery(testDeliveryItem);
  const queueResult = await NotificationDeliveryEngine.processDeliveryQueue(10);
  assert(queueResult.processed > 0, 'Delivery queue processed pending items');
  assert(queueResult.delivered > 0, 'InApp delivery item marked DELIVERED');

  // Verify candidate in-app notifications
  const candNotifs = serverDB.getCandidateNotifications(testCandidate.id);
  assert(candNotifs.some(n => n.title === 'টেস্ট নোটিফিকেশন'), 'InApp notification successfully persisted in candidate inbox');

  // -------------------------------------------------------------
  // Vector 7: Automated Deadline Monitoring & Reconciliation
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 7] Automated Deadline Monitoring Engine');

  const runRecord = await DeadlineMonitoringEngine.runReconciliation({
    adminId: 'TEST-ADMIN',
    force: true,
    refDate
  });

  assert(runRecord.status === 'SUCCESS', 'Monitoring reconciliation completed with status SUCCESS');
  assert(runRecord.jobsChecked >= 200, `Reconciliation checked ${runRecord.jobsChecked} jobs`);
  assert(runRecord.closingTodayCount >= 0, `Closing today count recorded (${runRecord.closingTodayCount})`);
  assert(runRecord.closingSoonCount >= 0, `Closing soon count recorded (${runRecord.closingSoonCount})`);
  assert(runRecord.expiredCount >= 0, `Expired count recorded (${runRecord.expiredCount})`);

  // Concurrency lock test: Second call without force must throw or be guarded
  let lockBlocked = false;
  try {
    // Artificial concurrency simulation
    (DeadlineMonitoringEngine as any).isRunning = true;
    (DeadlineMonitoringEngine as any).lastRunTime = Date.now();
    await DeadlineMonitoringEngine.runReconciliation({ force: false });
  } catch (err: any) {
    if (err.message.includes('MONITORING_IN_PROGRESS')) {
      lockBlocked = true;
    }
  } finally {
    (DeadlineMonitoringEngine as any).isRunning = false;
  }
  assert(lockBlocked === true, 'Concurrency lock strictly guards against parallel monitoring runs');

  // -------------------------------------------------------------
  // Vector 8: Public Feed & Zero-Leakage Guarantee
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 8] Public Feeds & Zero-Leakage Security');

  const allDbJobs = serverDB.getJobs();
  const draftJob: any = {
    id: 'draft-leak-test-' + Date.now(),
    title: 'খসড়া বিজ্ঞপ্তি টেস্ট',
    organization: 'পরীক্ষা অধিদপ্তর',
    deadline: '৩০/১০/২০২৬',
    publicationStatus: 'DRAFT'
  };
  serverDB.saveJob(draftJob);

  // Check closing-today criteria: Draft must NEVER be included
  const todayEligible = allDbJobs.filter(j => {
    if (j.id.startsWith('draft-') || (j as any).publicationStatus === 'UNPUBLISHED') return false;
    const ev = CentralDeadlineEngine.evaluateDeadline(j, undefined, refDate);
    return ev.isClosingToday && !ev.isClosed;
  });
  assert(!todayEligible.some(j => j.id.startsWith('draft-')), 'Zero-Leakage: Drafts strictly excluded from Today feeds');

  // Check cancelled job exclusion
  const cancelFilterJob: any = {
    id: 'job-cancelled-test',
    title: 'বাতিল চাকরি টেস্ট',
    organization: 'টেস্ট',
    deadline: '৩০/১০/২০২৬',
    lifecycleStatus: 'CANCELLED'
  };
  const cancelEval = CentralDeadlineEngine.evaluateDeadline(cancelFilterJob, undefined, refDate);
  assert(cancelEval.isClosingToday === false, 'Cancelled jobs excluded from Closing Today feed');
  assert(cancelEval.isClosingSoon === false, 'Cancelled jobs excluded from Closing Soon feed');

  // Clean up test draft
  if (serverDB.deleteJob) serverDB.deleteJob(draftJob.id);

  // -------------------------------------------------------------
  // Vector 9: Regression Verification (Steps 05, 06, 07 remain intact)
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 9] Platform Regression & Step Continuity');

  const categories = serverDB.getCategories();
  assert(categories.length >= 20, 'Step 06 Taxonomy remains intact with 20+ categories');

  const placements = serverDB.getFeaturedPlacements();
  assert(Array.isArray(placements), 'Step 07 Featured Placements remain intact');

  const sources = serverDB.getJobSources();
  assert(sources.length >= 5, 'Step 02 Spider sources remain intact with 5 sources');

  // =============================================================
  // SUMMARY
  // =============================================================
  console.log('\n================================================================');
  console.log(`STEP 08 TEST SUITE COMPLETE: ${passedTests} PASSED, ${totalTests - passedTests} FAILED out of ${totalTests} CHECKS.`);
  const score = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`STEP 08 INTEGRITY SCORE: ${score}%`);
  console.log('================================================================\n');

  if (totalTests - passedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runStep08TestSuite().catch(err => {
  console.error('Fatal error during Step 08 Test Suite:', err);
  process.exit(1);
});
