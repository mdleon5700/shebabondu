import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { serverDB } from '../../db';

export async function runScenario52(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-52-USER-PANEL-APPLICATIONS-DASHBOARD-TRACKING-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    const candAId = 'SYNTH-USR-RAJSHAHI-001';
    const candBId = 'SYNTH-USR-SYLHET-001';

    actionsPerformed.push(`Seeding synthetic application for candidate A: ${candAId}`);
    const appA = {
      id: 'SYNTH-APP-RAJSHAHI-101',
      jobId: 'JOB-RAJSHAHI-ENG-01',
      jobTitle: 'সহকারী প্রকৌশলী (সিভিল)',
      organization: 'রাজশাহী সিটি কর্পোরেশন',
      postName: 'সহকারী প্রকৌশলী',
      candidateName: 'মো: আব্দুল্লাহ',
      candidatePhone: '01889400001',
      candidateDistrict: 'রাজশাহী',
      candidateId: candAId,
      date: new Date().toLocaleDateString('bn-BD'),
      totalAmount: 300,
      paymentMethod: 'Wallet' as const,
      status: 'processing' as const,
      statusHistory: [
        {
          status: 'processing' as const,
          date: new Date().toISOString(),
          notes: 'আবেদনটি সফলভাবে দাখিল হয়েছে এবং প্রাথমিক যাচাইকরণে রয়েছে।'
        }
      ]
    };
    serverDB.addApplication(candAId, appA);

    actionsPerformed.push('Navigating to /dashboard/applications in browser for candidate A');
    await page.context().addCookies([
      {
        name: 'session_token',
        value: candAId,
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'cs_session_token',
        value: candAId,
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto(`${baseUrl}/dashboard/applications`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    const hasAppContent = (await page.locator('h1, h2, table, .space-y-4').count()) > 0;
    assertions.push({
      assertion: 'User Panel /dashboard/applications renders successfully',
      expected: 'true',
      actual: String(hasAppContent),
      passed: hasAppContent
    });

    actionsPerformed.push('Verifying Candidate B cannot see Candidate A application');
    const candBHeaders = {
      'Cookie': `session_token=${candBId}`,
      'x-candidate-id': candBId
    };
    const candBRes = await apiVerifier.checkEndpoint('/api/applications', {
      headers: candBHeaders
    });
    const candBApps = candBRes.data?.applications || [];
    const leakedAppA = candBApps.find((a: any) => a.id === appA.id || a.candidateId === candAId);

    assertions.push({
      assertion: 'Zero cross-user application leakage (Candidate B sees 0 records belonging to Candidate A)',
      expected: 'true',
      actual: String(!leakedAppA),
      passed: !leakedAppA
    });

    actionsPerformed.push('Verifying unauthenticated request to /api/applications is rejected');
    const unauthRes = await apiVerifier.checkEndpoint('/api/applications', {});
    assertions.push({
      assertion: 'Unauthenticated GET /api/applications returns HTTP 401',
      expected: '401',
      actual: String(unauthRes.status),
      passed: unauthRes.status === 401
    });

    const endTime = new Date().toISOString();
    return {
      scenarioId,
      startTime,
      name: 'User Panel Applications Dashboard & Security Isolation Audit',
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
      name: 'User Panel Applications Dashboard & Security Isolation Audit',
      category: 'user',
      status: 'FAIL',
      durationMs: 0,
      actionsPerformed,
      assertions,
      errors
    };
  }
}
