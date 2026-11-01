/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 07: JOB FEEDS & DISCOVERY TEST SUITE
 * Comprehensive Unit, Integration, Timezone & Security Verification
 */

import { serverDB } from '../src/lib/db';
import { JobFeedEngine } from '../src/lib/feeds/engine';
import { BangladeshDateHelper, BST_OFFSET_MS } from '../src/lib/feeds/timezone';
import { FeaturedManager } from '../src/lib/feeds/featured';
import { DEFAULT_FEED_CONFIG } from '../src/lib/feeds/config';
import { FeaturedPlacement } from '../src/lib/feeds/types';
import { JobCircular } from '../src/lib/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] Test ${passed + failed + 1}: ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] Test ${passed + failed + 1}: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('   CHAKRI SHEBA — STEP 07: JOB FEEDS & DISCOVERY TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Vector 1: Asia/Dhaka Timezone & Date Normalization
  // -------------------------------------------------------------
  console.log('>>> [Vector 1] Asia/Dhaka Timezone & Date Normalization');
  const slashDate = BangladeshDateHelper.parseToIsoDate('৩০/১০/২০২৬');
  assert(slashDate === '2026-10-30', 'Bengali slash date parsed to 2026-10-30');

  const textDate = BangladeshDateHelper.parseToIsoDate('২৮ অক্টোবর ২০২৬');
  assert(textDate === '2026-10-28', 'Bengali text month date parsed to 2026-10-28');

  // UTC midnight test: 2026-10-29T18:30:00Z + 6h = 2026-10-30T00:30:00 BST
  const utcLate = BangladeshDateHelper.parseToIsoDate('2026-10-29T18:30:00.000Z');
  assert(utcLate === '2026-10-30', 'UTC 6:30 PM converts to Asia/Dhaka next calendar date 2026-10-30');

  const boundaries = BangladeshDateHelper.getBangladeshDateBoundaries('2026-10-30');
  const startUtc = boundaries.startOfDayUtc.toISOString();
  const endUtc = boundaries.endOfDayUtc.toISOString();
  assert(startUtc === '2026-10-29T18:00:00.000Z', 'Midnight BST starts at 18:00:00 UTC previous day');
  assert(endUtc.startsWith('2026-10-30T17:59:59'), 'End of BST day corresponds to 17:59:59.999 UTC');

  const bnDigits = BangladeshDateHelper.toBnDigits('2026');
  assert(bnDigits === '২০২৬', 'English digits converted to Bengali digits');

  const enDigits = BangladeshDateHelper.toEnDigits('২০২৬');
  assert(enDigits === '2026', 'Bengali digits converted to English digits');

  // Relative dates
  const todayRef = new Date('2026-10-30T12:00:00Z');
  const relToday = BangladeshDateHelper.formatRelativeBengaliDate('2026-10-30', todayRef);
  assert(relToday === 'আজ প্রকাশিত', 'Relative date evaluated as আজ প্রকাশিত');

  const relYesterday = BangladeshDateHelper.formatRelativeBengaliDate('2026-10-29', todayRef);
  assert(relYesterday === 'গতকাল প্রকাশিত', 'Relative date evaluated as গতকাল প্রকাশিত');

  const rel2Days = BangladeshDateHelper.formatRelativeBengaliDate('2026-10-28', todayRef);
  assert(rel2Days === '২ দিন আগে', 'Relative date evaluated as ২ দিন আগে');

  // -------------------------------------------------------------
  // Vector 2: Latest Jobs Selection & Ordering
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 2] Latest Jobs Selection & Ordering');
  const allJobs = serverDB.getJobs();
  const placements = serverDB.getFeaturedPlacements();

  const latestFeed = JobFeedEngine.getFeed(allJobs, { feedType: 'latest', limit: 10 }, placements, todayRef);
  assert(latestFeed.success, 'Latest jobs feed returned success');
  assert(latestFeed.total >= 200, `Latest jobs feed returned full published total (${latestFeed.total})`);
  assert(latestFeed.jobs.length <= 10, 'Latest jobs feed obeys limit parameter');

  // Newest first check
  const firstJobDate = BangladeshDateHelper.parseToIsoDate(latestFeed.jobs[0].publishedDate || latestFeed.jobs[0].createdAt);
  const secondJobDate = BangladeshDateHelper.parseToIsoDate(latestFeed.jobs[1].publishedDate || latestFeed.jobs[1].createdAt);
  assert(firstJobDate! >= secondJobDate!, 'Newest published job appears before older published job');

  // -------------------------------------------------------------
  // Vector 3: Today's Jobs Calendar Day Boundary
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 3] Today\'s Jobs Calendar Day Boundary');
  const todayFeed = JobFeedEngine.getFeed(allJobs, { feedType: 'today', limit: 50 }, placements, todayRef);
  assert(todayFeed.success, 'Today feed returned success');
  assert(todayFeed.date === '2026-10-30', 'Today feed date matches 2026-10-30');
  assert(todayFeed.total > 0, `Today feed returned active jobs (${todayFeed.total})`);
  assert(todayFeed.jobs.every(j => {
    const d = BangladeshDateHelper.parseToIsoDate(j.publishedDate || j.createdAt);
    return d === '2026-10-30';
  }), 'All jobs in Today feed belong strictly to today (2026-10-30)');

  // -------------------------------------------------------------
  // Vector 4: Daily Archive Feeds & Navigation
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 4] Daily Archive Feeds & Navigation');
  const dailyFeedOct28 = JobFeedEngine.getFeed(allJobs, { feedType: 'daily', date: '2026-10-28', limit: 50 }, placements, todayRef);
  assert(dailyFeedOct28.total >= 180, `Historical date 2026-10-28 matches expected circular count (${dailyFeedOct28.total})`);
  assert(Boolean(dailyFeedOct28.date_bn?.includes('২৮ অক্টোবর')), 'Daily archive formatted Bengali full date');

  const emptyDailyFeed = JobFeedEngine.getFeed(allJobs, { feedType: 'daily', date: '2024-01-01' }, placements, todayRef);
  assert(emptyDailyFeed.total === 0, 'Empty historical date returns 0 jobs without fabricated content');
  assert(emptyDailyFeed.jobs.length === 0, 'Empty jobs array on non-active date');

  const archiveSummaries = JobFeedEngine.getDailyArchiveDates(allJobs, 30, todayRef);
  assert(archiveSummaries.length >= 30, 'Daily archive summary returned 30+ dates');
  assert(archiveSummaries[0].date >= archiveSummaries[1].date, 'Daily archive dates sorted descending');
  assert(archiveSummaries.some(a => a.date === '2026-10-30' && a.hasJobs), 'Today date recorded in archive with hasJobs: true');
  assert(archiveSummaries.some(a => a.date === '2026-10-28' && a.jobCount >= 180), 'Oct 28 recorded with 180+ jobs');

  // -------------------------------------------------------------
  // Vector 5: Featured Jobs Management & Lifecycle
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 5] Featured Jobs Management & Lifecycle');
  const sampleTargetJob = allJobs[0];
  const testPlacement: FeaturedPlacement = {
    id: 'feat-test-lifecycle-1',
    jobId: sampleTargetJob.id,
    placement: 'homepage',
    priority: 95,
    startAt: '2026-10-29T00:00:00.000Z',
    endAt: '2026-11-15T23:59:59.999Z',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const statusActive = FeaturedManager.evaluatePlacementStatus(testPlacement, todayRef);
  assert(statusActive === 'ACTIVE', 'Placement between start and end evaluated as ACTIVE');

  const futurePlacement: FeaturedPlacement = {
    ...testPlacement,
    startAt: '2026-11-01T00:00:00.000Z',
    endAt: '2026-11-20T23:59:59.999Z'
  };
  const statusScheduled = FeaturedManager.evaluatePlacementStatus(futurePlacement, todayRef);
  assert(statusScheduled === 'SCHEDULED', 'Future placement evaluated as SCHEDULED');

  const expiredPlacement: FeaturedPlacement = {
    ...testPlacement,
    startAt: '2026-10-01T00:00:00.000Z',
    endAt: '2026-10-15T23:59:59.999Z'
  };
  const statusExpired = FeaturedManager.evaluatePlacementStatus(expiredPlacement, todayRef);
  assert(statusExpired === 'EXPIRED', 'Past placement evaluated as EXPIRED');

  // Priority sorting in feed
  const featFeed = JobFeedEngine.getFeed(allJobs, { feedType: 'featured' }, [testPlacement], todayRef);
  assert(featFeed.total > 0, `Featured feed returned active items (${featFeed.total})`);
  assert(featFeed.jobs[0].id === sampleTargetJob.id, 'Priority 95 job appears first in featured feed');

  // Validation
  const validCheck = FeaturedManager.validatePlacement(sampleTargetJob, {
    startAt: '2026-10-30T00:00:00Z',
    endAt: '2026-11-10T00:00:00Z',
    priority: 80
  });
  assert(validCheck.isValid, 'Valid featured placement passed validation');

  const invalidTimeCheck = FeaturedManager.validatePlacement(sampleTargetJob, {
    startAt: '2026-11-10T00:00:00Z',
    endAt: '2026-10-30T00:00:00Z'
  });
  assert(!invalidTimeCheck.isValid, 'End time before start time correctly rejected');

  // -------------------------------------------------------------
  // Vector 6: Closing Soon Job Feed Integration
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 6] Closing Soon Job Feed Integration');
  const closingSoonFeed = JobFeedEngine.getFeed(allJobs, { feedType: 'closing_soon' }, placements, todayRef);
  assert(closingSoonFeed.success, 'Closing soon feed returned success');
  assert(closingSoonFeed.jobs.every(j => j.daysRemaining >= 0 && j.daysRemaining <= 3), 'All closing soon jobs have daysRemaining between 0 and 3');

  if (closingSoonFeed.jobs.length >= 2) {
    assert(closingSoonFeed.jobs[0].daysRemaining <= closingSoonFeed.jobs[1].daysRemaining, 'Closing soon jobs sorted by daysRemaining ascending (urgency first)');
  } else {
    assert(true, 'Closing soon jobs sorted by daysRemaining');
  }

  // -------------------------------------------------------------
  // Vector 7: Public Zero-Leakage Guarantee
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 7] Public Zero-Leakage Guarantee');
  const draftJob: any = {
    id: 'draft-fake-circular',
    title: 'খসড়া সহকারী শিক্ষক নিয়োগ',
    organization: 'শিক্ষা অধিদপ্তর',
    publishedDate: '2026-10-30',
    status: 'DRAFT',
    daysRemaining: 15
  };
  const unpublishedJob: any = {
    id: 'job-unpub-1',
    title: 'অপ্রকাশিত সার্কুলার',
    organization: 'মন্ত্রণালয়',
    publishedDate: '2026-10-30',
    status: 'UNPUBLISHED',
    daysRemaining: 15
  };
  const cancelledJob: any = {
    id: 'job-cancelled-1',
    title: 'বাতিলকৃত সার্কুলার',
    organization: 'রেলওয়ে',
    publishedDate: '2026-10-30',
    status: 'CANCELLED',
    daysRemaining: 15
  };

  const leakageTestPool: JobCircular[] = [sampleTargetJob, draftJob, unpublishedJob, cancelledJob];
  const leakedLatest = JobFeedEngine.getFeed(leakageTestPool, { feedType: 'latest' }, placements, todayRef);
  assert(leakedLatest.total === 1, 'Zero public leakage: Only valid published job returned');
  assert(leakedLatest.jobs[0].id === sampleTargetJob.id, 'Target published job resolved, draft/unpub/cancelled strictly excluded');

  const leakedToday = JobFeedEngine.getFeed(leakageTestPool, { feedType: 'today' }, placements, todayRef);
  assert(!leakedToday.jobs.some(j => j.id.startsWith('draft-')), 'Drafts strictly absent from Today feed');
  assert(!leakedToday.jobs.some(j => (j as any).status === 'CANCELLED'), 'Cancelled jobs strictly absent from Today feed');

  // -------------------------------------------------------------
  // Vector 8: Category & Organization Feeds
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 8] Category & Organization Feeds');
  const govtFeed = JobFeedEngine.getFeed(allJobs, { feedType: 'category', category: 'cat-govt' }, placements, todayRef);
  assert(govtFeed.total >= 60, `Government category feed returned jobs (${govtFeed.total})`);
  assert(govtFeed.jobs.every(j => ['govt', 'railway', 'defense', 'teacher'].includes((j.category || '').replace('cat-', ''))), 'Category filter matched government sectors');

  const bankFeed = JobFeedEngine.getFeed(allJobs, { feedType: 'category', category: 'bank' }, placements, todayRef);
  assert(bankFeed.total >= 20, `Bank category feed returned jobs (${bankFeed.total})`);

  // -------------------------------------------------------------
  // Vector 9: Feed Configuration & Defaults
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 9] Feed Configuration & Customization');
  const activeFeedConfig = serverDB.getFeedConfig();
  assert(Boolean(activeFeedConfig.sections.latest_jobs), 'Latest jobs section configured');
  assert(Boolean(activeFeedConfig.sections.todays_jobs), 'Todays jobs section configured');
  assert(Boolean(activeFeedConfig.sections.featured_jobs), 'Featured jobs section configured');
  assert(activeFeedConfig.newJobBadgeDurationDays === 3, 'Default new job badge duration is 3 days');
  assert(activeFeedConfig.closingSoonThresholdDays === 3, 'Default closing soon threshold is 3 days');

  // -------------------------------------------------------------
  // Vector 10: Feed Metrics & Operational Diagnostics
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 10] Feed Metrics & Operational Diagnostics');
  const metricsReport = JobFeedEngine.getFeedMetrics(allJobs, placements, todayRef);
  assert(metricsReport.totalEligibleJobs >= 200, `Metrics calculated total eligible jobs (${metricsReport.totalEligibleJobs})`);
  assert(metricsReport.jobsToday > 0, `Metrics calculated jobs published today (${metricsReport.jobsToday})`);
  assert(metricsReport.jobsLast7Days >= metricsReport.jobsToday, '7 days job count is >= today count');
  assert(metricsReport.missingTimestampCount === 0, 'Zero missing timestamps across database');

  // -------------------------------------------------------------
  // Vector 11: Dynamic Sitemap Inclusion
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 11] Dynamic Sitemap Inclusion');
  const { default: sitemapFn } = await import('../src/app/sitemap');
  const sitemapUrls = sitemapFn().map(s => s.url);
  assert(sitemapUrls.includes('https://chakrisheba.com/latest-jobs'), 'Latest jobs included in sitemap');
  assert(sitemapUrls.includes('https://chakrisheba.com/todays-jobs'), 'Todays jobs included in sitemap');
  assert(sitemapUrls.includes('https://chakrisheba.com/daily-jobs'), 'Daily jobs directory included in sitemap');
  assert(sitemapUrls.includes('https://chakrisheba.com/featured-jobs'), 'Featured jobs included in sitemap');
  assert(sitemapUrls.includes('https://chakrisheba.com/closing-soon'), 'Closing soon included in sitemap');
  assert(sitemapUrls.some(u => u.includes('/daily-jobs/2026-10-30')), 'Active daily archive date included in sitemap');

  // -------------------------------------------------------------
  // Vector 12: Admin Audit Trail Verification
  // -------------------------------------------------------------
  console.log('\n>>> [Vector 12] Admin Audit Trail Verification');
  const testAudit = serverDB.addAuditLog({
    action: 'TEST_STEP07_VERIFY',
    adminId: 'ADMIN-TESTER',
    targetId: 'feed-test',
    targetType: 'SYSTEM_SETTINGS',
    notes: 'Step 07 automated audit log validation',
    changes: {
      test: { new: 'verified' }
    }
  });
  assert(Boolean(testAudit.id), 'Audit log entry created with unique ID');
  assert(testAudit.action === 'TEST_STEP07_VERIFY', 'Audit action recorded accurately');

  console.log('\n================================================================');
  console.log(`   TEST EXECUTION COMPLETE: ${passed} / ${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}% SUCCESS)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

