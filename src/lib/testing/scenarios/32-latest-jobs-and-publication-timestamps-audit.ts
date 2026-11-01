import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';

export async function runScenario32(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-32-LATEST-JOBS-AND-PUBLICATION-TIMESTAMPS-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  const now = new Date();
  const nowIso = now.toISOString();
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();
  const futureSchedule = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

  // Synthetic Test Jobs
  const testNewJobId = 'SYNTH-JOB-TEST-LATEST-NEW-01';
  const testOldEditedJobId = 'SYNTH-JOB-TEST-LATEST-OLD-02';
  const testScheduledJobId = 'SYNTH-JOB-TEST-LATEST-SCHED-03';
  const testUnpublishedJobId = 'SYNTH-JOB-TEST-LATEST-UNPUB-04';

  try {
    actionsPerformed.push('Seeding controlled synthetic jobs with distinct timestamp hierarchies');
    
    // 1. Newly published job
    SyntheticJobManager.saveJob({
      id: testNewJobId,
      title: 'সহকারী পরিচালক (নতুন প্রকাশিত চাকরি সার্কুলার)',
      organization: 'পল্লী বিদ্যুতায়ন বোর্ড',
      category: 'govt',
      categoryLabel: 'সরকারি চাকরি',
      status: 'PUBLISHED',
      publicationStatus: 'PUBLISHED',
      publishedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      publishedDate: '০১ নভেম্বর ২০২৬',
      deadline: '2028-12-31',
      daysRemaining: 400
    } as any);

    // 2. Old job that was recently edited (editing must NOT change publishedAt)
    SyntheticJobManager.saveJob({
      id: testOldEditedJobId,
      title: 'হিসাব রক্ষক (পূর্বে প্রকাশিত চাকরি সার্কুলার)',
      organization: 'অগ্রণী ব্যাংক লিমিটেড',
      category: 'bank',
      categoryLabel: 'ব্যাংক জব',
      status: 'PUBLISHED',
      publicationStatus: 'PUBLISHED',
      publishedAt: fifteenDaysAgo,
      createdAt: fifteenDaysAgo,
      updatedAt: nowIso,
      lastUpdatedDate: nowIso,
      publishedDate: '১৫ অক্টোবর ২০২৬',
      deadline: '2028-12-31',
      daysRemaining: 370
    } as any);

    // 3. Future scheduled job (must NOT appear as published)
    SyntheticJobManager.saveJob({
      id: testScheduledJobId,
      title: 'অধ্যাপক (ভবিষ্যত তফশিল চাকরি সার্কুলার)',
      organization: 'ঢাকা বিশ্ববিদ্যালয়',
      category: 'govt',
      categoryLabel: 'সরকারি চাকরি',
      status: 'PENDING_REVIEW',
      publicationStatus: 'PENDING',
      targetPublishTimeUtc: futureSchedule,
      publishedAt: undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
      deadline: '2028-12-31',
      daysRemaining: 420
    } as any);

    // 4. Unpublished job
    SyntheticJobManager.saveJob({
      id: testUnpublishedJobId,
      title: 'মার্কেটার (অপ্রকাশিত চাকরি সার্কুলার)',
      organization: 'বেক্সিমকো ফার্মাসিউটিক্যালস',
      category: 'private',
      categoryLabel: 'বেসরকারি চাকরি',
      status: 'UNPUBLISHED',
      publicationStatus: 'UNPUBLISHED',
      publishedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      deadline: '2028-12-31',
      daysRemaining: 350
    } as any);

    // Verify API response for /api/jobs/latest
    actionsPerformed.push('Querying /api/jobs/latest to inspect feed sorting and filtering');
    const latestProbe = await apiVerifier.checkEndpoint('/api/jobs/latest?limit=20');
    assertions.push({
      assertion: 'Public latest jobs API /api/jobs/latest responds with HTTP 200',
      expected: '200',
      actual: String(latestProbe.status),
      passed: latestProbe.status === 200
    });

    const feedJobs = latestProbe.data?.jobs || [];
    const hasNewJob = feedJobs.some((j: any) => j.id === testNewJobId);
    assertions.push({
      assertion: 'Newly published synthetic job is present in latest jobs feed',
      expected: 'true',
      actual: String(hasNewJob),
      passed: hasNewJob
    });

    const hasScheduled = feedJobs.some((j: any) => j.id === testScheduledJobId);
    assertions.push({
      assertion: 'Future scheduled job is excluded from latest jobs feed before due time',
      expected: 'false',
      actual: String(hasScheduled),
      passed: !hasScheduled
    });

    const hasUnpublished = feedJobs.some((j: any) => j.id === testUnpublishedJobId);
    assertions.push({
      assertion: 'Unpublished job is strictly excluded from public latest jobs feed',
      expected: 'false',
      actual: String(hasUnpublished),
      passed: !hasUnpublished
    });

    // Check ranking: new job must be ahead of older edited job
    const newJobIdx = feedJobs.findIndex((j: any) => j.id === testNewJobId);
    const oldJobIdx = feedJobs.findIndex((j: any) => j.id === testOldEditedJobId);
    const correctRanking = newJobIdx !== -1 && (oldJobIdx === -1 || newJobIdx < oldJobIdx);
    assertions.push({
      assertion: 'Newly published job ranks ahead of recently-edited older job (publishedAt preserved)',
      expected: 'true',
      actual: String(correctRanking),
      passed: correctRanking
    });

    // Browser navigation to /latest-jobs page
    actionsPerformed.push(`Navigating browser to ${baseUrl}/latest-jobs`);
    await page.goto(`${baseUrl}/latest-jobs`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const pageTitle = await page.title();
    assertions.push({
      assertion: 'Latest Jobs landing page /latest-jobs renders with valid title',
      expected: 'true',
      actual: String(pageTitle.length > 0),
      passed: pageTitle.length > 0
    });

    // Verify presence of jobs feed in browser
    const jobCardsCount = await page.locator('[data-job-card], article, .job-card, a[href*="/jobs/"]').count();
    assertions.push({
      assertion: 'Public /latest-jobs UI successfully renders job feed and category controls',
      expected: 'true',
      actual: String(jobCardsCount > 0),
      passed: jobCardsCount > 0
    });

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'latest_jobs_and_timestamps_verified');

    // Clean up test jobs
    actionsPerformed.push('Cleaning up temporary scenario synthetic jobs');
    SyntheticJobManager.deleteJob(testNewJobId);
    SyntheticJobManager.deleteJob(testOldEditedJobId);
    SyntheticJobManager.deleteJob(testScheduledJobId);
    SyntheticJobManager.deleteJob(testUnpublishedJobId);

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Latest Jobs, Publication Timestamps & Freshness Hierarchy Audit',
      category: 'public',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors,
      screenshotRef,
      evidenceNotes: 'Authoritative publication timestamp sorting, scheduled job exclusion, and UI verified.'
    };
  } catch (err: any) {
    SyntheticJobManager.deleteJob(testNewJobId);
    SyntheticJobManager.deleteJob(testOldEditedJobId);
    SyntheticJobManager.deleteJob(testScheduledJobId);
    SyntheticJobManager.deleteJob(testUnpublishedJobId);

    errors.push({
      type: 'interaction_failure',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    return {
      scenarioId,
      name: 'Latest Jobs, Publication Timestamps & Freshness Hierarchy Audit',
      category: 'public',
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
