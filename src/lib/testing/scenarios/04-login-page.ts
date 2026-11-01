import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { AuthTestModule } from '../auth-test-module';

export async function runScenario04(page: Page, baseUrl: string, browserCtrl: BrowserController): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-04-LOGIN-PAGE';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const authModule = new AuthTestModule(page, baseUrl);

  try {
    actionsPerformed.push('Navigating to candidate login: ' + baseUrl + '/login');
    const response = await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const status = response ? response.status() : 0;
    assertions.push({
      assertion: 'Login page responds with HTTP 200',
      expected: '200',
      actual: String(status),
      passed: status === 200
    });

    actionsPerformed.push('Inspecting login form and testing invalid credential rejection');
    const inspection = await authModule.inspectLoginForm();

    assertions.push({
      assertion: 'Login form contains Phone/Email input',
      expected: 'true',
      actual: String(inspection.hasPhoneOrEmail),
      passed: inspection.hasPhoneOrEmail
    });

    assertions.push({
      assertion: 'Login form contains Password input',
      expected: 'true',
      actual: String(inspection.hasPassword),
      passed: inspection.hasPassword
    });

    assertions.push({
      assertion: 'Login form contains interactive submit button',
      expected: 'true',
      actual: String(inspection.hasLoginButton),
      passed: inspection.hasLoginButton
    });

    assertions.push({
      assertion: 'Invalid credentials safely rejected without uncaught crash',
      expected: 'true',
      actual: String(inspection.rejectsInvalidAuth),
      passed: inspection.rejectsInvalidAuth
    });

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'login_form');

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Login Form Inspection & Invalid Auth Defense',
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
      evidenceNotes: 'Login form controls and credential rejection defense verified.'
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
      name: 'Login Form Inspection & Invalid Auth Defense',
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