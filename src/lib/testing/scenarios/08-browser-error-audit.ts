import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ErrorDetector } from '../error-detector';

export async function runScenario08(page: Page, baseUrl: string, browserCtrl: BrowserController): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-08-BROWSER-ERROR-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const errorDetector = new ErrorDetector();
  errorDetector.attachToPage(page);

  try {
    const probeRoutes = ['/', '/jobs', '/login', '/register'];
    for (const route of probeRoutes) {
      actionsPerformed.push(`Navigating to ${route} while monitoring browser errors`);
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
    }

    const fatalErrors = errorDetector.getFatalErrors();
    const allErrors = errorDetector.getErrors();

    assertions.push({
      assertion: 'Zero uncaught JavaScript exceptions across probed routes',
      expected: '0',
      actual: String(fatalErrors.length),
      passed: fatalErrors.length === 0
    });

    assertions.push({
      assertion: 'Zero server 5xx network failures during browser navigation',
      expected: '0',
      actual: String(allErrors.filter(e => e.type === 'network_5xx').length),
      passed: allErrors.filter(e => e.type === 'network_5xx').length === 0
    });

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'error_audit_complete');

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Browser Console & Network Error Telemetry Audit',
      category: 'public',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors: allErrors.map(e => ({
        type: 'js_error',
        message: `${e.type}: ${e.message}`,
        timestamp: e.timestamp,
        url: e.url
      })),
      screenshotRef,
      evidenceNotes: `Audited ${probeRoutes.length} core routes; fatal JS errors: ${fatalErrors.length}.`
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
      name: 'Browser Console & Network Error Telemetry Audit',
      category: 'public',
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