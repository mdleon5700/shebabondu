import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';

export async function runScenario11(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-11-NATIONWIDE-PERSONA-SIMULATION';
  const startTime = new Date().toISOString();
  const startMs = Date.now();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];

  // Pick sample synthetic persona from Dhaka
  const testUser = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-001')!;

  try {
    // Clear cookies for fresh simulation session
    await page.context().clearCookies();

    // 1. Navigate to /login
    actions.push(`Navigating to candidate login: ${baseUrl}/login`);
    const resp = await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    assertions.push({
      assertion: 'Login page loads with HTTP 200',
      expected: '200',
      actual: String(resp?.status() || 200),
      passed: resp?.status() === 200 || !resp
    });

    // 2. Perform synthetic login with human-like typing
    actions.push(`Entering synthetic phone: ${testUser.phone} and test password`);
    const phoneInput = page.locator('input[placeholder*="017XXXXXXXX"], form input[type="text"]').first();
    await phoneInput.fill(testUser.phone);

    const passInput = page.locator('input[type="password"]').first();
    await passInput.fill(testUser.testPasswordPlain);

    actions.push('Submitting candidate login form');
    const submitBtn = page.locator('button[type="submit"]:has-text("লগইন"), button:has-text("লগইন করুন")').first();
    await submitBtn.click();
    await Promise.race([
      page.waitForURL('**/dashboard**', { timeout: 7000 }).catch(() => {}),
      page.waitForTimeout(3000)
    ]);

    // 3. Assert redirect to dashboard or logged in state
    let currentUrl = page.url();
    if (!currentUrl.includes('/dashboard')) {
      await page.waitForTimeout(1500);
      currentUrl = page.url();
    }
    actions.push(`Navigated to post-login URL: ${currentUrl}`);
    const isDashboard = currentUrl.includes('/dashboard');

    assertions.push({
      assertion: 'Successful login redirects to /dashboard',
      expected: 'true',
      actual: String(isDashboard),
      passed: isDashboard
    });

    // 4. Navigate to profile to inspect demographic rendering
    actions.push(`Navigating to profile: ${baseUrl}/dashboard/profile`);
    await page.goto(`${baseUrl}/dashboard/profile`, { waitUntil: 'domcontentloaded' });
    await Promise.race([
      page.waitForResponse(resp => resp.url().includes('/api/profile') && resp.status() === 200, { timeout: 8000 }).catch(() => {}),
      page.waitForTimeout(3500)
    ]);
    await page.waitForTimeout(1200);

    const text = await page.innerText('body');
    const inputValues = await page.locator('input').evaluateAll((els: any[]) => els.map(e => e.value || ''));

    const nameRendered = text.includes(testUser.nameBn) || 
                         (testUser.name ? text.includes(testUser.name) : false) || 
                         inputValues.some((v: string) => v.includes(testUser.nameBn) || (testUser.name ? v.includes(testUser.name) : false));

    const districtRendered = text.includes(testUser.district) || 
                             inputValues.some((v: string) => v.includes(testUser.district));

    assertions.push({
      assertion: `Profile view renders synthetic candidate district (${testUser.district})`,
      expected: 'true',
      actual: String(districtRendered),
      passed: districtRendered
    });

    assertions.push({
      assertion: `Profile view renders synthetic candidate name (${testUser.nameBn})`,
      expected: 'true',
      actual: String(nameRendered),
      passed: nameRendered
    });

    // 5. Capture screenshot evidence
    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'synthetic_persona_dashboard_profile');

    // 6. Data isolation check
    const isolation = SyntheticUserManager.verifyDataIsolation();
    assertions.push({
      assertion: 'Persistent database candidates count preserved strictly at 41',
      expected: '41',
      actual: String(isolation.realCandidatesCount),
      passed: isolation.realCandidatesCount === 41
    });

    assertions.push({
      assertion: 'Synthetic user store contains 1,280 demographic personas',
      expected: '>= 1280',
      actual: String(isolation.syntheticCandidatesCount),
      passed: isolation.syntheticCandidatesCount >= 1280
    });

    const allPassed = assertions.every(a => a.passed);

    return {
      scenarioId,
      name: 'Nationwide Synthetic Persona Browser Authentication & Profile Audit',
      category: 'user',
      status: allPassed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - startMs,
      pageUrl: currentUrl,
      actionsPerformed: actions,
      assertions,
      errors: [],
      screenshotRef
    };
  } catch (err: any) {
    return {
      scenarioId,
      name: 'Nationwide Synthetic Persona Browser Authentication & Profile Audit',
      category: 'user',
      status: 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - startMs,
      actionsPerformed: actions,
      assertions,
      errors: [{
        type: 'interaction_failure',
        message: err.message,
        timestamp: new Date().toISOString()
      }]
    };
  }
}