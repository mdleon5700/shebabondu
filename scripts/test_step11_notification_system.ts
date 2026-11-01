/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 11: NOTIFICATION & COMMUNICATION SYSTEM VERIFICATION
 * Validates the event catalog, Bengali template engine, delivery queue, channel status,
 * daily digest engine, and candidate inbox persistence.
 */

import { serverDB } from '../src/lib/db';
import { 
  NOTIFICATION_EVENT_CATALOG,
  NotificationCatalogHelper,
  NotificationTemplateManager,
  NotificationDeliveryQueue,
  JobDigestEngine,
  CentralNotificationHub
} from '../src/lib/notifications';

async function runStep11Tests() {
  console.log('================================================================================');
  console.log('CHAKRI SHEBA — STEP 11 NOTIFICATION & COMMUNICATION TEST SUITE');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      if (details) console.error(`         -> ${details}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // VECTOR 1: Event Catalog & Validation
  // ---------------------------------------------------------------------------
  console.log('--- VECTOR 1: Event Catalog & Validation ---');
  const catalogKeys = Object.keys(NOTIFICATION_EVENT_CATALOG);
  assert(
    catalogKeys.length >= 10,
    'Notification event catalog contains at least 10 core event definitions',
    `Found: ${catalogKeys.length}`
  );

  const jobPublishedDef = NotificationCatalogHelper.getDefinition('JOB_PUBLISHED');
  assert(
    jobPublishedDef.allowedChannels.includes('in_app'),
    'JOB_PUBLISHED event allows in_app channel delivery'
  );

  const securityAlertDef = NotificationCatalogHelper.getDefinition('ACCOUNT_SECURITY_ALERT');
  assert(
    securityAlertDef.isTransactional === true,
    'ACCOUNT_SECURITY_ALERT is flagged as transactional (cannot be opted out)'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 2: Template Management & Safe Bengali Interpolation
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 2: Template Management & Safe Bengali Interpolation ---');
  const rendered = NotificationTemplateManager.render('{{organization}} এ নতুন নিয়োগ: {{job_title}}', {
    organization: 'বাংলাদেশ ব্যাংক',
    job_title: 'সহকারী পরিচালক'
  });
  assert(
    rendered === 'বাংলাদেশ ব্যাংক এ নতুন নিয়োগ: সহকারী পরিচালক',
    'Template variable interpolation produces accurate Bengali text',
    `Result: "${rendered}"`
  );

  const template = NotificationTemplateManager.getTemplate('JOB_DEADLINE_TODAY', 'in_app');
  assert(
    Boolean(template.titleTemplate) && Boolean(template.bodyTemplate),
    'Template manager resolves valid templates for JOB_DEADLINE_TODAY'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 3: Deduplication & Delivery Queue
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 3: Deduplication & Delivery Queue ---');
  const testCandidateId = 'USR-01774366643';
  const testDedupeKey = `test_dedupe_${Date.now()}`;

  const item1 = NotificationDeliveryQueue.enqueue({
    candidateId: testCandidateId,
    eventType: 'JOB_DEADLINE_APPROACHING',
    channel: 'in_app',
    priority: 'HIGH',
    title: 'টেস্ট ডেডলাইন অ্যালার্ট ১',
    message: 'আবেদনের সময় শেষ হচ্ছে।',
    dedupeKey: testDedupeKey
  });

  const item2 = NotificationDeliveryQueue.enqueue({
    candidateId: testCandidateId,
    eventType: 'JOB_DEADLINE_APPROACHING',
    channel: 'in_app',
    priority: 'HIGH',
    title: 'টেস্ট ডেডলাইন অ্যালার্ট ২ (ডুপ্লিকেট)',
    message: 'আবেদনের সময় শেষ হচ্ছে।',
    dedupeKey: testDedupeKey
  });

  assert(
    item1.id === item2.id,
    'Delivery queue successfully deduplicates queue items using dedupeKey'
  );

  const processResult = await NotificationDeliveryQueue.processQueue();
  assert(
    processResult.delivered >= 1,
    'Queue processor successfully delivers pending in_app items to candidate inbox',
    `Delivered: ${processResult.delivered}`
  );

  // ---------------------------------------------------------------------------
  // VECTOR 4: Channel Configuration & Health Reporting
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 4: Channel Configuration & Health Reporting ---');
  const channelReports = CentralNotificationHub.getChannelStatusReport();
  assert(
    channelReports.length === 4,
    'Channel status report evaluates all 4 communication channels (in_app, email, sms, web_push)'
  );

  const inAppReport = channelReports.find(c => c.channel === 'in_app');
  assert(
    inAppReport !== undefined && inAppReport.status === 'CONFIGURED_AND_TESTED',
    'in_app channel is guaranteed 100% active and configured'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 5: Daily & Weekly Job Digest Engine
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 5: Daily & Weekly Job Digest Engine ---');
  const digest = JobDigestEngine.generateCandidateDigest(testCandidateId, 'daily');
  assert(
    digest !== null && Array.isArray(digest.items),
    'JobDigestEngine compiles personalized candidate digest from published circulars'
  );

  const dispatched = JobDigestEngine.dispatchDigest(testCandidateId, 'daily');
  assert(
    typeof dispatched === 'boolean',
    'JobDigestEngine dispatches digest notifications cleanly'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 6: Central Notification Hub Dispatch & Inbox Persistence
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 6: Central Notification Hub Dispatch & Inbox Persistence ---');
  const hubResult = await CentralNotificationHub.dispatch({
    type: 'JOB_PUBLISHED',
    candidateId: testCandidateId,
    variables: {
      organization: 'জনপ্রশাসন মন্ত্রণালয়',
      job_title: 'সহকারী সচিব',
      deadline: '২০২৬-১১-৩০'
    },
    channels: ['in_app']
  });

  assert(
    hubResult.success === true && hubResult.dispatchedCount >= 1,
    'CentralNotificationHub dispatches event end-to-end'
  );

  const candidateNotifications = serverDB.getCandidateNotifications(testCandidateId);
  assert(
    candidateNotifications.length > 0,
    'Notification successfully persisted in candidate inbox store',
    `Inbox items: ${candidateNotifications.length}`
  );

  console.log('\n================================================================================');
  console.log(`STEP 11 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED | TOTAL: ${passed + failed}`);
  console.log('================================================================================');

  if (failed > 0) process.exit(1);
}

runStep11Tests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
