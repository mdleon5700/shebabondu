import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import { BD_64_DISTRICTS } from '../synthetic/bangladesh-geography';

export async function runScenario61(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-61-NATIONWIDE-64-DISTRICT-FULL-USER-JOURNEY-SIMULATION';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  try {
    actionsPerformed.push('Auditing nationwide 64-district synthetic user distribution');

    // 1. Demographic & District Coverage Verification
    const demoSummary = SyntheticUserManager.getDemographicSummary();
    const allSyntheticUsers = SyntheticUserManager.getAllSyntheticUsers();

    assertions.push({
      assertion: 'Nationwide synthetic user registry contains at least 1,280 accounts',
      expected: '>= 1280',
      actual: String(allSyntheticUsers.length),
      passed: allSyntheticUsers.length >= 1280
    });

    assertions.push({
      assertion: 'All 64 Bangladesh districts are represented in the user base',
      expected: '>= 64',
      actual: String(demoSummary.districtsCovered),
      passed: demoSummary.districtsCovered >= 64
    });

    assertions.push({
      assertion: 'All 8 administrative divisions of Bangladesh are represented',
      expected: '>= 8',
      actual: String(demoSummary.divisionsCovered),
      passed: demoSummary.divisionsCovered >= 8
    });

    // 2. Sample 8 divisions representative accounts for real browser user journey
    actionsPerformed.push('Selecting representative candidate from each of the 8 divisions');
    const representativeDistricts = [
      { div: 'Dhaka', dist: 'ঢাকা', candId: 'SYNTH-USR-DHAKA-001' },
      { div: 'Chittagong', dist: 'চট্টগ্রাম', candId: 'SYNTH-USR-CHATTOGRAM-001' },
      { div: 'Rajshahi', dist: 'রাজশাহী', candId: 'SYNTH-USR-RAJSHAHI-001' },
      { div: 'Khulna', dist: 'খুলনা', candId: 'SYNTH-USR-KHULNA-001' },
      { div: 'Barishal', dist: 'বরিশাল', candId: 'SYNTH-USR-BARISHAL-001' },
      { div: 'Sylhet', dist: 'সিলেট', candId: 'SYNTH-USR-SYLHET-001' },
      { div: 'Rangpur', dist: 'রংপুর', candId: 'SYNTH-USR-RANGPUR-001' },
      { div: 'Mymensingh', dist: 'ময়মনসিংহ', candId: 'SYNTH-USR-MYMENSINGH-001' }
    ];

    for (const rep of representativeDistricts) {
      const user = SyntheticUserManager.getSyntheticUserById(rep.candId);
      assertions.push({
        assertion: `Representative candidate for ${rep.div} division (${rep.dist}) exists`,
        expected: 'true',
        actual: String(Boolean(user)),
        passed: Boolean(user)
      });
    }

    // 3. Complete browser-based user journey simulation for a representative user
    const testCandidateId = 'SYNTH-USR-DHAKA-001';
    actionsPerformed.push(`Executing full browser user journey for candidate ${testCandidateId}`);

    await page.context().addCookies([
      { name: 'session_token', value: testCandidateId, domain: 'localhost', path: '/' },
      { name: 'cs_session_token', value: testCandidateId, domain: 'localhost', path: '/' }
    ]);

    // Journey Step A: User Panel Dashboard
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const hasDashboard = (await page.locator('h1, h2, nav').count()) > 0;
    assertions.push({
      assertion: 'Candidate successfully opens User Panel Dashboard',
      expected: 'true',
      actual: String(hasDashboard),
      passed: hasDashboard
    });

    // Journey Step B: Explore Public Jobs
    await page.goto(`${baseUrl}/jobs`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const hasJobs = (await page.locator('article, .border, a[href*="/jobs/"]').count()) > 0;
    assertions.push({
      assertion: 'Candidate browses active jobs on Public Jobs page',
      expected: 'true',
      actual: String(hasJobs),
      passed: hasJobs
    });

    // Journey Step C: Application History
    await page.goto(`${baseUrl}/dashboard/applications`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const hasApps = (await page.locator('h1, h2, table, .space-y-4').count()) > 0;
    assertions.push({
      assertion: 'Candidate tracks application history on /dashboard/applications',
      expected: 'true',
      actual: String(hasApps),
      passed: hasApps
    });

    const endTime = new Date().toISOString();
    return {
      scenarioId,
      startTime,
      name: 'Nationwide 64-District Representative Full User Journey Simulation',
      category: 'user',
      status: assertions.every(a => a.passed) ? 'PASS' : 'FAIL',
      durationMs: new Date(endTime).getTime() - new Date(startTime).getTime(),
      actionsPerformed,
      assertions,
      errors
    };
  } catch (err: any) {
    errors.push({ type: 'interaction_failure', message: err.message, stack: err.stack, timestamp: new Date().toISOString() });
    return {
      scenarioId,
      startTime,
      name: 'Nationwide 64-District Representative Full User Journey Simulation',
      category: 'user',
      status: 'FAIL',
      durationMs: 0,
      actionsPerformed,
      assertions,
      errors
    };
  }
}
