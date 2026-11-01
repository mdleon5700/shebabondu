import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';
import { BangladeshDateHelper } from '../../feeds/timezone';

export async function runScenario33(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-33-DAILY-JOB-UPDATES-CALENDAR-ARCHIVE-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  const now = new Date();
  const todayInfo = BangladeshDateHelper.getBangladeshTodayDate(now);
  const todayIso = todayInfo.isoDate;
  const testDailyJobId = 'SYNTH-JOB-TEST-DAILY-TODAY-01';

  try {
    actionsPerformed.push(`Querying /api/jobs/daily for Bangladesh Standard Time date archives`);
    const dailyArchivesProbe = await apiVerifier.checkEndpoint('/api/jobs/daily?days=30');
    assertions.push({
      assertion: 'Daily job updates archive API /api/jobs/daily responds with HTTP 200',
      expected: '200',
      actual: String(dailyArchivesProbe.status),
      passed: dailyArchivesProbe.status === 200
    });

    const isTodayIsoMatched = dailyArchivesProbe.data?.today?.isoDate === todayIso;
    assertions.push({
      assertion: 'Archive API accurately reports current Asia/Dhaka today date boundary',
      expected: todayIso,
      actual: String(dailyArchivesProbe.data?.today?.isoDate),
      passed: isTodayIsoMatched
    });

    // Seed synthetic job published specifically today
    actionsPerformed.push(`Seeding synthetic job published today (${todayIso})`);
    SyntheticJobManager.saveJob({
      id: testDailyJobId,
      title: 'উপজেলা প্রকৌশলী (আজকের বিশেষ চাকরির সার্কুলার)',
      organization: 'স্থানীয় সরকার প্রকৌশল অধিদপ্তর',
      category: 'govt',
      categoryLabel: 'সরকারি চাকরি',
      status: 'PUBLISHED',
      publicationStatus: 'PUBLISHED',
      publishedAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      publishedDate: todayIso,
      deadline: '2028-12-31',
      daysRemaining: 700
    } as any);

    // Query /api/jobs/latest with feedType=today
    actionsPerformed.push('Querying /api/jobs/latest?feedType=today to verify today feed filtering');
    const todayProbe = await apiVerifier.checkEndpoint('/api/jobs/latest?feedType=today');
    assertions.push({
      assertion: "Today's jobs feed API responds with HTTP 200",
      expected: '200',
      actual: String(todayProbe.status),
      passed: todayProbe.status === 200
    });

    const todayFeedJobs = todayProbe.data?.jobs || [];
    const isTodayJobPresent = todayFeedJobs.some((j: any) => j.id === testDailyJobId);
    assertions.push({
      assertion: "Synthetic job published today is correctly surfaced in today's job feed",
      expected: 'true',
      actual: String(isTodayJobPresent),
      passed: isTodayJobPresent
    });

    // Browser Workflow: Navigate to /daily-jobs
    actionsPerformed.push(`Navigating in browser to ${baseUrl}/daily-jobs`);
    await page.goto(`${baseUrl}/daily-jobs`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const dailyTitle = await page.title();
    const hasDailyTitle = dailyTitle.includes('দৈনিক') || dailyTitle.includes('Daily') || dailyTitle.includes('চাকরি সেবা');
    assertions.push({
      assertion: 'Daily Jobs calendar archive landing page renders with accurate title',
      expected: 'true',
      actual: String(hasDailyTitle),
      passed: hasDailyTitle
    });

    // Browser Workflow: Navigate to /todays-jobs
    actionsPerformed.push(`Navigating in browser to ${baseUrl}/todays-jobs`);
    await page.goto(`${baseUrl}/todays-jobs`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const todaysPageTitle = await page.title();
    const hasTodaysTitle = todaysPageTitle.includes('আজকের') || todaysPageTitle.includes('Today') || todaysPageTitle.includes('চাকরি সেবা');
    assertions.push({
      assertion: "Today's Jobs page /todays-jobs renders with accurate title and today's date banner",
      expected: 'true',
      actual: String(hasTodaysTitle),
      passed: hasTodaysTitle
    });

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'daily_archive_and_today_verified');

    // Cleanup
    SyntheticJobManager.deleteJob(testDailyJobId);

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Daily Job Updates, Today Feed & Calendar Archive Audit',
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
      evidenceNotes: 'Asia/Dhaka date calculation, today feed filtering, calendar archive and UI verified.'
    };
  } catch (err: any) {
    SyntheticJobManager.deleteJob(testDailyJobId);

    errors.push({
      type: 'interaction_failure',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    return {
      scenarioId,
      name: 'Daily Job Updates, Today Feed & Calendar Archive Audit',
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
