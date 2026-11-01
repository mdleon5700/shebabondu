import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { AuthTestModule } from '../auth-test-module';

export async function runScenario03(page: Page, baseUrl: string, browserCtrl: BrowserController): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-03-REGISTRATION-PAGE';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const authModule = new AuthTestModule(page, baseUrl);

  try {
    actionsPerformed.push('Navigating to candidate registration: ' + baseUrl + '/register');
    const response = await page.goto(`${baseUrl}/register`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const status = response ? response.status() : 0;
    assertions.push({
      assertion: 'Registration page responds with HTTP 200',
      expected: '200',
      actual: String(status),
      passed: status === 200
    });

    actionsPerformed.push('Inspecting registration form fields and validation hooks');
    const inspection = await authModule.inspectRegistrationForm();

    assertions.push({
      assertion: 'Registration form contains required Name input',
      expected: 'true',
      actual: String(inspection.hasNameField),
      passed: inspection.hasNameField
    });

    assertions.push({
      assertion: 'Registration form contains required Phone input',
      expected: 'true',
      actual: String(inspection.hasPhoneField),
      passed: inspection.hasPhoneField
    });

    assertions.push({
      assertion: 'Registration form contains required Password input',
      expected: 'true',
      actual: String(inspection.hasPasswordField),
      passed: inspection.hasPasswordField
    });

    assertions.push({
      assertion: 'Registration form has interactive submit button',
      expected: 'true',
      actual: String(inspection.hasSubmitButton),
      passed: inspection.hasSubmitButton
    });

    assertions.push({
      assertion: 'Empty form submission properly blocked by client validation',
      expected: 'true',
      actual: String(inspection.validationTriggered),
      passed: inspection.validationTriggered
    });

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'registration_form');

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Registration Form Inspection & Validation',
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
      evidenceNotes: 'Registration form fields and client-side validation barriers verified.'
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
      name: 'Registration Form Inspection & Validation',
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