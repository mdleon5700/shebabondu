import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';

export async function runScenario30(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-30-ADVANCED-FILTER-COMBINATIONS-AUDIT';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  try {
    const request = page.context().request;

    // 1. Audit Education Qualification Tiers
    actions.push('Probing search with education tier: bachelor');
    const bscRes = await request.get(`${baseUrl}/api/jobs/search?education=bachelor&limit=10`);
    const bscBody = await bscRes.json().catch(() => ({}));
    const bscTotal = Number(bscBody.total) || 0;

    assertions.push({
      assertion: 'Education filter for bachelor/honours returns positive match set',
      expected: 'true',
      actual: String(bscTotal > 0),
      passed: bscTotal > 0
    });

    // 2. Multi-tier Filter Combination: Govt + Dhaka + Bachelor
    actions.push('Probing multi-tier combo: category=govt & division=DHAKA & education=bachelor');
    const comboRes = await request.get(`${baseUrl}/api/jobs/search?category=govt&division=DHAKA&education=bachelor&limit=10`);
    const comboBody = await comboRes.json().catch(() => ({}));
    const comboTotal = Number(comboBody.total) || 0;

    assertions.push({
      assertion: 'Multi-filter intersection (Govt + Dhaka + Bachelor) resolves without error',
      expected: 'true',
      actual: String(comboRes.status() === 200 && comboTotal > 0),
      passed: comboRes.status() === 200 && comboTotal > 0
    });

    // 3. Multi-tier Filter Combination: Bank + Full-time
    actions.push('Probing multi-tier combo: category=bank & jobType=full_time');
    const bankComboRes = await request.get(`${baseUrl}/api/jobs/search?category=bank&jobType=full_time&limit=10`);
    const bankComboBody = await bankComboRes.json().catch(() => ({}));
    const bankTotal = Number(bankComboBody.total) || 0;

    assertions.push({
      assertion: 'Multi-filter intersection (Bank + Full-time) resolves correctly',
      expected: 'true',
      actual: String(bankComboRes.status() === 200 && bankTotal > 0),
      passed: bankComboRes.status() === 200 && bankTotal > 0
    });

    // 4. Conflicting / Impossible Combination Graceful Empty Handling
    actions.push('Probing conflicting impossible filter combination for graceful zero-result handling');
    const conflictRes = await request.get(`${baseUrl}/api/jobs/search?category=bank&division=BARISHAL&education=jsc&experience=5_plus`);
    const conflictStatus = conflictRes.status();
    const conflictBody = await conflictRes.json().catch(() => ({}));

    assertions.push({
      assertion: 'Conflicting filter combination gracefully returns HTTP 200 with 0 results',
      expected: 'true',
      actual: String(conflictStatus === 200 && conflictBody.total === 0 && Array.isArray(conflictBody.jobs)),
      passed: conflictStatus === 200 && conflictBody.total === 0 && Array.isArray(conflictBody.jobs)
    });

    // 5. Zero Database Contamination assertion
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
      message: `Scenario 30 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Academic Qualifications & Multi-Tier Advanced Filter Combinations Audit',
    category: 'public',
    status: passed ? 'PASS' : 'FAIL',
    startTime,
    endTime,
    durationMs: new Date(endTime).getTime() - new Date(startTime).getTime(),
    actionsPerformed: actions,
    assertions,
    errors
  };
}
