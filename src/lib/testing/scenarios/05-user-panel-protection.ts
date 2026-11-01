import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { AuthTestModule } from '../auth-test-module';

export async function runScenario05(page: Page, baseUrl: string, browserCtrl: BrowserController): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-05-USER-PANEL-PROTECTION';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const authModule = new AuthTestModule(page, baseUrl);

  try {
    actionsPerformed.push('Probing protected user dashboard without authentication: /dashboard');
    const dashCheck = await authModule.testProtectedAccess('/dashboard', '/login');
    assertions.push({
      assertion: 'Unauthenticated /dashboard access redirects to /login',
      expected: 'true',
      actual: String(dashCheck.redirected),
      passed: dashCheck.redirected
    });

    actionsPerformed.push('Probing protected profile route without authentication: /dashboard/profile');
    const profCheck = await authModule.testProtectedAccess('/dashboard/profile', '/login');
    assertions.push({
      assertion: 'Unauthenticated /dashboard/profile access redirects to /login',
      expected: 'true',
      actual: String(profCheck.redirected),
      passed: profCheck.redirected
    });

    actionsPerformed.push('Probing protected applications route without authentication: /dashboard/applications');
    const appsCheck = await authModule.testProtectedAccess('/dashboard/applications', '/login');
    assertions.push({
      assertion: 'Unauthenticated /dashboard/applications access redirects to /login',
      expected: 'true',
      actual: String(appsCheck.redirected),
      passed: appsCheck.redirected
    });

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'user_protection_redirect');

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'User Panel Protected Routes Guard',
      category: 'security',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors,
      screenshotRef,
      evidenceNotes: 'All tested candidate dashboard routes successfully block unauthenticated access.'
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
      name: 'User Panel Protected Routes Guard',
      category: 'security',
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