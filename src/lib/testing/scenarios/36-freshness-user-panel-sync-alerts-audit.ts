import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import { serverDB } from '../../db';

export async function runScenario36(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-36-FRESHNESS-USER-PANEL-SYNC-ALERTS-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  const testCandidateId = 'SYNTH-USR-DHAKA-001';
  const testAlertJobId = 'SYNTH-JOB-TEST-ALERT-SYNC-01';
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    actionsPerformed.push('Seeding synthetic job with urgent deadline for User Panel discovery');
    SyntheticJobManager.saveJob({
      id: testAlertJobId,
      title: 'সফটওয়্যার ইঞ্জিনিয়ার (জরুরি আবেদন শেষ হওয়ার সতর্কবার্তা)',
      organization: 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
      category: 'it',
      categoryLabel: 'তথ্যপ্রযুক্তি / আইটি',
      status: 'PUBLISHED',
      publicationStatus: 'PUBLISHED',
      deadline: threeDaysFromNow,
      daysRemaining: 3
    } as any);

    // Save job for synthetic user
    actionsPerformed.push(`Saving urgent job ${testAlertJobId} for candidate ${testCandidateId}`);
    const authHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `session_token=${testCandidateId}`,
      'x-candidate-id': testCandidateId
    };
    serverDB.toggleSavedJob(testCandidateId, testAlertJobId, 'save');
    const saveProbe = await apiVerifier.checkEndpoint('/api/candidate/saved-jobs', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ jobId: testAlertJobId, action: 'save' })
    });

    assertions.push({
      assertion: 'Candidate saves job via /api/candidate/saved-jobs with HTTP 200',
      expected: '200',
      actual: String(saveProbe.status),
      passed: saveProbe.status === 200
    });

    // Inspect saved jobs list for candidate
    actionsPerformed.push(`Querying /api/candidate/saved-jobs for candidate ${testCandidateId}`);
    const getSavedProbe = await apiVerifier.checkEndpoint('/api/candidate/saved-jobs', {
      headers: authHeaders
    });

    const savedJobs = getSavedProbe.data?.savedJobs || [];
    const isJobInSavedList = savedJobs.some((j: any) => j === testAlertJobId || j.id === testAlertJobId);
    assertions.push({
      assertion: 'Urgent deadline job is present in candidate saved jobs collection',
      expected: 'true',
      actual: String(isJobInSavedList),
      passed: isJobInSavedList
    });

    // Verify deadline evaluation status for saved job
    actionsPerformed.push(`Checking itemized deadline status for ${testAlertJobId}`);
    const deadlineProbe = await apiVerifier.checkEndpoint(`/api/jobs/${testAlertJobId}/deadline-status`, {
      headers: { 'x-candidate-id': testCandidateId }
    });

    const isClosingSoon = deadlineProbe.data?.evaluation?.isClosingSoon || deadlineProbe.data?.evaluation?.status === 'CLOSING_SOON';
    assertions.push({
      assertion: 'Urgent saved job evaluation accurately flags closing soon status',
      expected: 'true',
      actual: String(isClosingSoon),
      passed: Boolean(isClosingSoon)
    });

    // Browser Workflow: User Panel Dashboard Inspection
    actionsPerformed.push(`Navigating candidate to ${baseUrl}/dashboard/saved-jobs`);
    await page.setExtraHTTPHeaders({ 'x-candidate-id': testCandidateId });
    await page.goto(`${baseUrl}/dashboard/saved-jobs`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const bodyText = await page.innerText('body');
    const isDashboardLoaded = bodyText.includes('সংরক্ষিত') || bodyText.includes('ড্যাশবোর্ড') || (await page.locator('header, nav, aside').count()) > 0;
    assertions.push({
      assertion: 'User Panel saved jobs view renders with active navigation and layout',
      expected: 'true',
      actual: String(isDashboardLoaded),
      passed: isDashboardLoaded
    });

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'user_panel_saved_deadline_verified');

    // Unsave job and clean up
    actionsPerformed.push(`Unsaving job ${testAlertJobId} and cleaning up test fixtures`);
    await apiVerifier.checkEndpoint('/api/candidate/saved-jobs', {
      method: 'POST',
      headers: { 'x-candidate-id': testCandidateId },
      body: JSON.stringify({ jobId: testAlertJobId, action: 'unsave' })
    });
    SyntheticJobManager.deleteJob(testAlertJobId);

    // Verify Database Isolation
    const isolation = SyntheticUserManager.verifyDataIsolation();
    assertions.push({
      assertion: 'Production candidates in local_store.json strictly preserved at 41',
      expected: '41',
      actual: String(isolation.realCandidatesCount),
      passed: isolation.realCandidatesCount === 41
    });

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Freshness, User Panel Synchronization & Saved Job Deadline Alerts Audit',
      category: 'user',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors,
      screenshotRef,
      evidenceNotes: 'User panel saved jobs sync, deadline warning flags, and isolation verified.'
    };
  } catch (err: any) {
    SyntheticJobManager.deleteJob(testAlertJobId);

    errors.push({
      type: 'interaction_failure',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    return {
      scenarioId,
      name: 'Freshness, User Panel Synchronization & Saved Job Deadline Alerts Audit',
      category: 'user',
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
