import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { serverDB } from '../../db';

export async function runScenario58(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-58-USER-PANEL-COMPREHENSIVE-PROFILE-SETTINGS-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    const candidateId = 'SYNTH-USR-DHAKA-006';
    actionsPerformed.push(`Testing User Panel profile and settings for candidate ${candidateId}`);

    // Ensure candidate has saved jobs and alert preferences
    serverDB.toggleSavedJob(candidateId, 'job-demo-101', 'save');
    serverDB.toggleSavedJob(candidateId, 'job-demo-102', 'save');

    // 1. Browser Navigation to /dashboard
    actionsPerformed.push('Navigating to /dashboard in browser with authenticated session');
    await page.context().addCookies([
      {
        name: 'session_token',
        value: candidateId,
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'cs_session_token',
        value: candidateId,
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    const hasDashboardContent = (await page.locator('h1, h2, nav, .grid').count()) > 0;
    assertions.push({
      assertion: 'User Panel /dashboard renders successfully for authenticated candidate',
      expected: 'true',
      actual: String(hasDashboardContent),
      passed: hasDashboardContent
    });

    // 2. Saved jobs verification
    actionsPerformed.push('Auditing saved jobs persistence in candidate store');
    const savedJobs = serverDB.getSavedJobs(candidateId);
    assertions.push({
      assertion: 'Candidate saved jobs persist properly in store',
      expected: '>= 2',
      actual: String(savedJobs.length),
      passed: savedJobs.length >= 2
    });

    // 3. Candidate Alert Preferences Query
    actionsPerformed.push('Auditing candidate alert preferences API endpoint');
    const alertRes = await apiVerifier.checkEndpoint('/api/candidate/alerts', {
      headers: {
        'Cookie': `session_token=${candidateId}`,
        'x-candidate-id': candidateId
      }
    });

    assertions.push({
      assertion: 'Candidate can retrieve personalized alert settings',
      expected: '200',
      actual: String(alertRes.status),
      passed: alertRes.status === 200
    });

    const endTime = new Date().toISOString();
    return {
      scenarioId,
      startTime,
      name: 'User Panel Comprehensive Profile & Settings Audit',
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
      name: 'User Panel Comprehensive Profile & Settings Audit',
      category: 'user',
      status: 'FAIL',
      durationMs: 0,
      actionsPerformed,
      assertions,
      errors
    };
  }
}
