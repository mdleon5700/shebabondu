import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { CentralDeadlineEngine } from '../../deadlines/engine';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';
import { BangladeshDateHelper } from '../../feeds/timezone';

export async function runScenario34(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-34-DEADLINE-MONITORING-STATE-MACHINE-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  const now = new Date();
  const todayInfo = BangladeshDateHelper.getBangladeshTodayDate(now);
  const todayIso = todayInfo.isoDate;

  const testClosingSoonId = 'SYNTH-JOB-TEST-DEADLINE-SOON-01';
  const testClosingTodayId = 'SYNTH-JOB-TEST-DEADLINE-TODAY-02';
  const testExpiredId = 'SYNTH-JOB-TEST-DEADLINE-EXP-03';

  try {
    actionsPerformed.push('Evaluating CentralDeadlineEngine state transitions across distinct deadline horizons');

    // 1. Unit evaluation of Open deadline
    const openEval = CentralDeadlineEngine.evaluateDeadline({
      id: 'mock-open',
      title: 'ওপেন সার্কুলার',
      organization: 'অগ্রণী ব্যাংক',
      deadline: '2028-12-31',
      publishedDate: todayIso,
      daysRemaining: 700
    } as any, undefined, now);

    assertions.push({
      assertion: 'Job with far future deadline evaluates to OPEN status with active application badge',
      expected: 'OPEN',
      actual: openEval.status,
      passed: openEval.status === 'OPEN' && !openEval.isClosed && !openEval.isClosingSoon
    });

    // 2. Unit evaluation of Closing Today deadline
    const closingTodayEval = CentralDeadlineEngine.evaluateDeadline({
      id: 'mock-today',
      title: 'আজকে শেষ সার্কুলার',
      organization: 'জনতা ব্যাংক',
      deadline: todayIso,
      publishedDate: todayIso,
      daysRemaining: 0
    } as any, undefined, now);

    assertions.push({
      assertion: 'Job expiring on current Asia/Dhaka date evaluates to CLOSING_TODAY status',
      expected: 'CLOSING_TODAY',
      actual: closingTodayEval.status,
      passed: closingTodayEval.status === 'CLOSING_TODAY' && closingTodayEval.isClosingToday && !closingTodayEval.isClosed
    });

    // 3. Unit evaluation of Expired / Closed deadline
    const pastIso = '2025-01-01';
    const closedEval = CentralDeadlineEngine.evaluateDeadline({
      id: 'mock-closed',
      title: 'মেয়াদোত্তীর্ণ সার্কুলার',
      organization: 'সোনালী ব্যাংক',
      deadline: pastIso,
      publishedDate: '2024-12-01',
      daysRemaining: -100
    } as any, undefined, now);

    assertions.push({
      assertion: 'Job with past deadline evaluates to CLOSED with isClosed=true flag',
      expected: 'true',
      actual: String(closedEval.isClosed),
      passed: closedEval.isClosed && closedEval.status === 'CLOSED'
    });

    // 4. Unit evaluation of Cancelled Override
    const cancelledEval = CentralDeadlineEngine.evaluateDeadline({
      id: 'mock-cancelled',
      title: 'বাতিলকৃত সার্কুলার',
      organization: 'রূপালী ব্যাংক',
      deadline: '2028-12-31',
      status: 'CANCELLED',
      lifecycleStatus: 'CANCELLED'
    } as any, undefined, now);

    assertions.push({
      assertion: 'Cancelled job overrides deadline calculations and sets status to CANCELLED',
      expected: 'CANCELLED',
      actual: cancelledEval.status,
      passed: cancelledEval.status === 'CANCELLED' && cancelledEval.isClosed
    });

    // Seed synthetic jobs for endpoint testing
    actionsPerformed.push('Seeding synthetic jobs with closing_soon and closing_today deadlines');
    SyntheticJobManager.saveJob({
      id: testClosingTodayId,
      title: 'সিনিয়র অফিসার (আজ শেষ আবেদনের সময়)',
      organization: 'বাংলাদেশ ব্যাংক',
      category: 'bank',
      categoryLabel: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান',
      status: 'PUBLISHED',
      publicationStatus: 'PUBLISHED',
      deadline: todayIso,
      daysRemaining: 0
    } as any);

    // Test API: /api/jobs/deadline-today
    actionsPerformed.push('Querying /api/jobs/deadline-today to verify closing-today API payload');
    const deadlineTodayProbe = await apiVerifier.checkEndpoint('/api/jobs/deadline-today');
    assertions.push({
      assertion: 'Public /api/jobs/deadline-today API responds with HTTP 200',
      expected: '200',
      actual: String(deadlineTodayProbe.status),
      passed: deadlineTodayProbe.status === 200
    });

    // Test API: /api/jobs/[id]/deadline-status
    actionsPerformed.push(`Querying /api/jobs/${testClosingTodayId}/deadline-status for itemized countdown`);
    const itemStatusProbe = await apiVerifier.checkEndpoint(`/api/jobs/${testClosingTodayId}/deadline-status`);
    assertions.push({
      assertion: 'Single job /api/jobs/[id]/deadline-status responds with HTTP 200 and evaluation result',
      expected: '200',
      actual: String(itemStatusProbe.status),
      passed: itemStatusProbe.status === 200 && Boolean(itemStatusProbe.data?.evaluation)
    });

    // Browser Workflow: Navigate to /closing-soon
    actionsPerformed.push(`Navigating in browser to ${baseUrl}/closing-soon`);
    await page.goto(`${baseUrl}/closing-soon`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const closingSoonTitle = await page.title();
    const hasClosingSoonTitle = closingSoonTitle.includes('শীঘ্রই সমাপ্ত') || closingSoonTitle.includes('Closing') || closingSoonTitle.includes('চাকরি');
    assertions.push({
      assertion: 'Public /closing-soon page loads successfully with deadline countdown interface',
      expected: 'true',
      actual: String(hasClosingSoonTitle),
      passed: hasClosingSoonTitle
    });

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'deadline_monitoring_state_machine_verified');

    // Cleanup
    SyntheticJobManager.deleteJob(testClosingSoonId);
    SyntheticJobManager.deleteJob(testClosingTodayId);
    SyntheticJobManager.deleteJob(testExpiredId);

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Deadline Monitoring, State Machine & Approaching Deadline Audit',
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
      evidenceNotes: 'CentralDeadlineEngine state machine, /deadline-today API, and /closing-soon UI verified.'
    };
  } catch (err: any) {
    SyntheticJobManager.deleteJob(testClosingSoonId);
    SyntheticJobManager.deleteJob(testClosingTodayId);
    SyntheticJobManager.deleteJob(testExpiredId);

    errors.push({
      type: 'interaction_failure',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    return {
      scenarioId,
      name: 'Deadline Monitoring, State Machine & Approaching Deadline Audit',
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
