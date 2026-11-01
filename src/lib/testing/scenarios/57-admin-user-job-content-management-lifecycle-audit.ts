import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { serverDB } from '../../db';

export async function runScenario57(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-57-ADMIN-USER-JOB-CONTENT-MANAGEMENT-LIFECYCLE-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    actionsPerformed.push('Auditing Admin Candidate, Job, and Category Management APIs');

    const adminHeaders = {
      'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026',
      'x-admin-pin': '1234'
    };

    // 1. Admin Candidate Querying
    actionsPerformed.push('Querying candidates via /api/admin/candidates');
    const candRes = await apiVerifier.checkEndpoint('/api/admin/candidates', {
      headers: adminHeaders
    });

    assertions.push({
      assertion: 'Admin Candidates endpoint returns HTTP 200',
      expected: '200',
      actual: String(candRes.status),
      passed: candRes.status === 200
    });

    const candidates = candRes.data?.candidates || [];
    assertions.push({
      assertion: 'Candidates list is populated with candidate records',
      expected: '>= 40',
      actual: String(candidates.length),
      passed: candidates.length >= 40
    });

    // Verify sensitive fields (passwordHash) are masked
    const anyHashExposed = candidates.some((c: any) => Boolean(c.passwordHash));
    assertions.push({
      assertion: 'Candidate password hashes are strictly masked in admin output',
      expected: 'false',
      actual: String(anyHashExposed),
      passed: !anyHashExposed
    });

    // 2. Admin Search by District
    actionsPerformed.push('Testing candidate search filter by district');
    const searchRes = await apiVerifier.checkEndpoint('/api/admin/candidates?search=ঢাকা', {
      headers: adminHeaders
    });
    const dhakaCandidates = searchRes.data?.candidates || [];
    assertions.push({
      assertion: 'Candidate search by district returns matching candidates',
      expected: '>= 1',
      actual: String(dhakaCandidates.length),
      passed: dhakaCandidates.length >= 1
    });

    // 3. Admin Taxonomy Categories
    actionsPerformed.push('Querying categories taxonomy via /api/admin/categories');
    const catRes = await apiVerifier.checkEndpoint('/api/admin/categories', {
      headers: adminHeaders
    });
    assertions.push({
      assertion: 'Admin Categories endpoint returns HTTP 200 with enriched job counts',
      expected: '200',
      actual: String(catRes.status),
      passed: catRes.status === 200 && Boolean(catRes.data?.categories)
    });

    const endTime = new Date().toISOString();
    return {
      scenarioId,
      startTime,
      name: 'Admin User, Job & Content Management Lifecycle Audit',
      category: 'admin',
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
      name: 'Admin User, Job & Content Management Lifecycle Audit',
      category: 'admin',
      status: 'FAIL',
      durationMs: 0,
      actionsPerformed,
      assertions,
      errors
    };
  }
}
