import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { HumanInteractionEngine } from '../human-interaction';

export async function runScenario06(page: Page, baseUrl: string, browserCtrl: BrowserController): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-06-ADMIN-PANEL-PROTECTION';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);
  const human = new HumanInteractionEngine(page);

  try {
    actionsPerformed.push('Probing protected admin API /api/admin/candidates without authorization');
    const apiProbe = await apiVerifier.checkEndpoint('/api/admin/candidates');
    const rejected = apiProbe.status === 401 || apiProbe.status === 403;
    assertions.push({
      assertion: 'Unauthorized admin API probe is rejected with HTTP 401/403',
      expected: '401 or 403',
      actual: String(apiProbe.status),
      passed: rejected
    });

    actionsPerformed.push('Probing protected admin API /api/admin/candidates with valid admin secret key');
    const authorizedProbe = await apiVerifier.checkEndpoint('/api/admin/candidates', {
      headers: { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }
    });
    assertions.push({
      assertion: 'Authorized admin API request succeeds with HTTP 200',
      expected: '200',
      actual: String(authorizedProbe.status),
      passed: authorizedProbe.status === 200
    });

    actionsPerformed.push('Navigating to /admin in browser to inspect authentication barrier');
    await page.context().clearCookies();
    await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      try {
        localStorage.removeItem('cs_admin_auth');
        sessionStorage.clear();
      } catch (e) {}
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const pwInput = page.locator('input[type="password"]');
    const hasAuthBarrier = (await pwInput.count()) > 0;
    assertions.push({
      assertion: 'Unauthenticated /admin view displays secure PIN entry barrier',
      expected: 'true',
      actual: String(hasAuthBarrier),
      passed: hasAuthBarrier
    });

    actionsPerformed.push('Entering authorized admin PIN to unlock workspace');
    if (hasAuthBarrier) {
      await human.typeText(pwInput.first(), 'CHAKRISEBA_SECURE_ADMIN_2026');
      await human.clickElement(page.locator('button[type="submit"]').first());
      await page.waitForSelector('header, nav, aside', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
    }

    const bodyText = await page.innerText('body');
    const hasWorkspaceLoaded = bodyText.includes('ড্যাশবোর্ড') || bodyText.includes('সার্ভার') || (await page.locator('header, nav').count()) > 0;
    assertions.push({
      assertion: 'Authorized admin successfully unlocks Admin Workspace',
      expected: 'true',
      actual: String(hasWorkspaceLoaded),
      passed: hasWorkspaceLoaded
    });

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'admin_panel_unlocked');

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Admin Panel Route & API Authorization Guard',
      category: 'admin',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors,
      screenshotRef,
      evidenceNotes: 'Admin API RBAC isolation and authorized admin workspace rendering confirmed.'
    };
  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    return {
      scenarioId,
      name: 'Admin Panel Route & API Authorization Guard',
      category: 'admin',
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