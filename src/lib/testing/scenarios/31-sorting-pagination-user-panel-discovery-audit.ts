import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';

export async function runScenario31(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-31-SORTING-PAGINATION-USER-PANEL-DISCOVERY-AUDIT';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const candidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-001') ||
                    SyntheticUserManager.getAllSyntheticUsers()[0];

  try {
    const request = page.context().request;

    // 1. Audit Sorting by Deadline (Soonest first)
    actions.push('Probing search with sort=deadline_soon');
    const sortSoonRes = await request.get(`${baseUrl}/api/jobs/search?sort=deadline_soon&limit=10`);
    const sortSoonBody = await sortSoonRes.json().catch(() => ({}));
    const soonJobs: any[] = sortSoonBody.jobs || [];

    let isSortedByDeadline = true;
    for (let i = 0; i < soonJobs.length - 1; i++) {
      if (soonJobs[i].daysRemaining > soonJobs[i + 1].daysRemaining) {
        isSortedByDeadline = false;
        break;
      }
    }

    assertions.push({
      assertion: 'Search API correctly sorts jobs in ascending order of remaining deadline',
      expected: 'true',
      actual: String(isSortedByDeadline && soonJobs.length > 0),
      passed: isSortedByDeadline && soonJobs.length > 0
    });

    // 2. Audit Pagination: Page 1 vs Page 2 Disjoint Records
    actions.push('Probing pagination: comparing page 1 and page 2 (limit=5)');
    const p1Res = await request.get(`${baseUrl}/api/jobs/search?page=1&limit=5`);
    const p1Body = await p1Res.json().catch(() => ({}));
    const p1Ids: string[] = (p1Body.jobs || []).map((j: any) => j.id);

    const p2Res = await request.get(`${baseUrl}/api/jobs/search?page=2&limit=5`);
    const p2Body = await p2Res.json().catch(() => ({}));
    const p2Ids: string[] = (p2Body.jobs || []).map((j: any) => j.id);

    const hasDuplicateAcrossPages = p1Ids.some(id => p2Ids.includes(id));
    const paginationAccurate = p1Ids.length > 0 && p2Ids.length > 0 && !hasDuplicateAcrossPages;

    assertions.push({
      assertion: 'Pagination yields disjoint non-overlapping records between pages',
      expected: 'true',
      actual: String(paginationAccurate),
      passed: paginationAccurate
    });

    // 3. User Panel Job Discovery & Saved Jobs Cycle
    const targetJobId = p1Ids[0] || 'SYNTH-JOB-DRAFT-001';
    actions.push(`Candidate ${candidate.id} saves job ${targetJobId} via /api/candidate/saved-jobs`);

    const saveRes = await request.post(`${baseUrl}/api/candidate/saved-jobs`, {
      headers: {
        'Content-Type': 'application/json',
        'x-candidate-id': candidate.id || ''
      },
      data: { jobId: targetJobId }
    });

    assertions.push({
      assertion: 'Synthetic candidate successfully saves job in User Panel discovery',
      expected: '200',
      actual: String(saveRes.status()),
      passed: saveRes.status() === 200
    });

    // Verify job appears in saved jobs list
    const getSavedRes = await request.get(`${baseUrl}/api/candidate/saved-jobs`, {
      headers: { 'x-candidate-id': candidate.id || '' }
    });
    const savedBody = await getSavedRes.json().catch(() => ({}));
    const isJobInSaved = Array.isArray(savedBody.savedJobs) && savedBody.savedJobs.some((j: any) => j === targetJobId || j.id === targetJobId);

    assertions.push({
      assertion: 'Saved job is persisted and accessible in candidate saved jobs list',
      expected: 'true',
      actual: String(isJobInSaved),
      passed: isJobInSaved
    });

    // Clean up: unsave job
    actions.push(`Candidate unsaves job ${targetJobId}`);
    await request.post(`${baseUrl}/api/candidate/saved-jobs`, {
      headers: {
        'Content-Type': 'application/json',
        'x-candidate-id': candidate.id || ''
      },
      data: { jobId: targetJobId, action: 'unsave' }
    });

    // 4. Zero Database Contamination assertion
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
      message: `Scenario 31 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Sorting, Pagination & User Panel Discovery End-to-End Audit',
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
