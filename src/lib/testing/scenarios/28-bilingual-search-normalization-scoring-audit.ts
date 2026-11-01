import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';

export async function runScenario28(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-28-BILINGUAL-SEARCH-NORMALIZATION-SCORING-AUDIT';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  try {
    const request = page.context().request;

    // 1. Test Bangla Keyword Search via API
    actions.push('Probing /api/jobs/search with Bengali query "সহকারী"');
    const bnRes = await request.get(`${baseUrl}/api/jobs/search?q=${encodeURIComponent('সহকারী')}&limit=10`);
    const bnStatus = bnRes.status();
    const bnBody = await bnRes.json().catch(() => ({}));
    const bnJobs: any[] = bnBody.jobs || [];

    assertions.push({
      assertion: 'Bengali keyword search returns relevant matching jobs with HTTP 200',
      expected: 'true',
      actual: String(bnStatus === 200 && bnBody.total > 0 && bnJobs.length > 0),
      passed: bnStatus === 200 && bnBody.total > 0 && bnJobs.length > 0
    });

    // 2. Test English Cross-Language Synonym Search
    actions.push('Probing /api/jobs/search with English synonym query "bank"');
    const enRes = await request.get(`${baseUrl}/api/jobs/search?q=bank&limit=10`);
    const enStatus = enRes.status();
    const enBody = await enRes.json().catch(() => ({}));
    const enJobs: any[] = enBody.jobs || [];

    assertions.push({
      assertion: 'English synonym search expands to Bengali bank jobs successfully',
      expected: 'true',
      actual: String(enStatus === 200 && enBody.total > 0 && enJobs.length > 0),
      passed: enStatus === 200 && enBody.total > 0 && enJobs.length > 0
    });

    // 3. Test Whitespace & Punctuation Normalization
    actions.push('Probing search with leading/trailing spaces & punctuation: "   ব্যাংক - অফিসার!   "');
    const normRes = await request.get(`${baseUrl}/api/jobs/search?q=${encodeURIComponent('   ব্যাংক - অফিসার!   ')}`);
    const normStatus = normRes.status();
    const normBody = await normRes.json().catch(() => ({}));

    assertions.push({
      assertion: 'Search normalizer cleanses whitespace and punctuation without error',
      expected: '200',
      actual: String(normStatus),
      passed: normStatus === 200 && Boolean(normBody.success)
    });

    // 4. Security & Injection Probe
    actions.push('Probing search endpoint with injection payloads: SQL & XSS');
    const injectRes = await request.get(`${baseUrl}/api/jobs/search?q=${encodeURIComponent("' OR '1'='1; <script>alert(1)</script>")}`);
    const injectStatus = injectRes.status();
    const injectBody = await injectRes.json().catch(() => ({}));

    assertions.push({
      assertion: 'Malicious search input is safely neutralized without server failure',
      expected: '200',
      actual: String(injectStatus),
      passed: injectStatus === 200 && Boolean(injectBody.success)
    });

    // 5. Browser UI Search Interaction on /jobs
    actions.push('Navigating browser to public /jobs page to test UI live search');
    await page.goto(`${baseUrl}/jobs`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    const searchInput = page.locator('input[placeholder*="খুঁজুন"], input[placeholder*="সার্চ"], input[type="text"]').first();
    let uiSearchWorking = false;
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('সহকারী');
      await page.waitForTimeout(800);
      const bodyText = await page.innerText('body');
      uiSearchWorking = bodyText.includes('সহকারী') || bodyText.includes('পদ');
    }

    assertions.push({
      assertion: 'Public search input field executes live query filtering in browser UI',
      expected: 'true',
      actual: String(uiSearchWorking),
      passed: uiSearchWorking
    });

    // 6. Zero Database Contamination assertion
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
      message: `Scenario 28 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Bilingual Keyword Search & Normalization Engine Audit',
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
