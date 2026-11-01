import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';

export async function runScenario26(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-26-JOB-LIFECYCLE-USER-PANEL-SYNC';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const candidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-001') ||
                    SyntheticUserManager.getAllSyntheticUsers()[0];
  const candidateId = candidate?.id || 'SYNTH-USR-DHAKA-001';

  const adminKey = process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026';
  const jobId = 'SYNTH-JOB-DRAFT-001';

  try {
    const request = page.context().request;

    // 1. Ensure job is published
    SyntheticJobManager.updateJobStatus(jobId, 'PUBLISHED', 'PUBLISHED');

    // 2. Candidate saves the published synthetic job via POST /api/candidate/saved-jobs
    actions.push(`Candidate ${candidateId} saves job ${jobId}`);
    const saveRes = await request.post(`${baseUrl}/api/candidate/saved-jobs`, {
      headers: {
        'Content-Type': 'application/json',
        cookie: `cs_session_token=${candidateId}; session_token=${candidateId}`,
        'x-candidate-id': candidateId
      },
      data: {
        jobId,
        action: 'save'
      }
    });

    const saveStatus = saveRes.status();
    const saveBody = await saveRes.json().catch(() => ({}));

    assertions.push({
      assertion: 'Candidate successfully saves job to User Panel saved list (HTTP 200)',
      expected: '200',
      actual: String(saveStatus),
      passed: saveStatus === 200 && Array.isArray(saveBody.savedJobs) && saveBody.savedJobs.includes(jobId)
    });

    // 3. Admin unpublishes the synthetic job
    actions.push(`Admin unpublishes job ${jobId}`);
    const unpubRes = await request.post(`${baseUrl}/api/admin/publishing/unpublish`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': '1234',
        'x-admin-key': adminKey,
        'x-admin-secret': adminKey
      },
      data: {
        jobId,
        reason: 'পরীক্ষামূলক চক্র সম্পন্ন হওয়ায় সাময়িক প্রত্যাহার',
        adminId: 'ADMIN-SUPER'
      }
    });

    const unpubStatus = unpubRes.status();
    const unpubBody = await unpubRes.json().catch(() => ({}));
    const jobAfterUnpublish = SyntheticJobManager.getJobById(jobId);

    assertions.push({
      assertion: 'Admin unpublish API succeeds with HTTP 200 and status UNPUBLISHED',
      expected: 'true',
      actual: String(Boolean(
        unpubStatus === 200 &&
        (unpubBody.newStatus === 'UNPUBLISHED' || (jobAfterUnpublish as any)?.publicationStatus === 'UNPUBLISHED')
      )),
      passed: Boolean(
        unpubStatus === 200 &&
        (unpubBody.newStatus === 'UNPUBLISHED' || (jobAfterUnpublish as any)?.publicationStatus === 'UNPUBLISHED')
      )
    });

    // 4. Verify Public Details page now returns 404 for the unpublished job
    actions.push(`Verifying that public /jobs/${jobId} blocks access to unpublished job`);
    const checkPublicRes = await page.goto(`${baseUrl}/jobs/${jobId}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const publicStatus = checkPublicRes?.status();
    const pageText = await page.innerText('body');
    const isBlocked = publicStatus === 404 || pageText.includes('বিজ্ঞপ্তি পাওয়া যায়নি') || pageText.includes('খুঁজে পাওয়া যায়নি');

    assertions.push({
      assertion: 'Unpublished job is inaccessible on public job details page',
      expected: 'true',
      actual: String(isBlocked),
      passed: isBlocked
    });

    // 5. Candidate removes/unsaves the job from User Panel
    actions.push(`Candidate removes job ${jobId} from saved list`);
    const unsaveRes = await request.post(`${baseUrl}/api/candidate/saved-jobs`, {
      headers: {
        'Content-Type': 'application/json',
        cookie: `cs_session_token=${candidateId}; session_token=${candidateId}`,
        'x-candidate-id': candidateId
      },
      data: {
        jobId,
        action: 'unsave'
      }
    });

    const unsaveBody = await unsaveRes.json().catch(() => ({}));
    const stillSaved = Array.isArray(unsaveBody.savedJobs) && unsaveBody.savedJobs.includes(jobId);

    assertions.push({
      assertion: 'Candidate successfully removes job from saved list',
      expected: 'false',
      actual: String(stillSaved),
      passed: !stillSaved
    });

    // 6. Zero Database Pollution in real local_store.json
    const isolation = SyntheticJobManager.verifyJobDataIsolation();
    assertions.push({
      assertion: 'Real database local_store.json remains 100% unpolluted (214 real jobs)',
      expected: 'true',
      actual: String(isolation.isIsolated && isolation.realJobsCount === 214),
      passed: isolation.isIsolated && isolation.realJobsCount === 214
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: `Scenario 26 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Job Lifecycle (Unpublish & Expiry) & User Panel Synchronization Audit',
    category: 'user',
    status: passed ? 'PASS' : 'FAIL',
    startTime,
    endTime,
    durationMs: new Date(endTime).getTime() - new Date(startTime).getTime(),
    actionsPerformed: actions,
    assertions,
    errors
  };
}
