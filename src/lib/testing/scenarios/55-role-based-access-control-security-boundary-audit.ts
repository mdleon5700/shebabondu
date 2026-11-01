import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { AdminGovernanceRbac, ROLE_PERMISSIONS } from '../../governance/rbac';

export async function runScenario55(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-55-ROLE-BASED-ACCESS-CONTROL-SECURITY-BOUNDARY-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    actionsPerformed.push('Testing RBAC security boundaries across Guest, Candidate, Staff, and Super Admin');

    // 1. Unauthenticated / Guest request to protected Admin API
    actionsPerformed.push('Verifying Guest request to /api/admin/analytics/overview is rejected');
    const guestRes = await apiVerifier.checkEndpoint('/api/admin/analytics/overview', {});
    assertions.push({
      assertion: 'Guest/unauthenticated request to Admin Analytics is blocked (HTTP 401 or 403)',
      expected: 'true',
      actual: String(guestRes.status === 401 || guestRes.status === 403),
      passed: guestRes.status === 401 || guestRes.status === 403
    });

    // 2. Candidate role request to protected Admin API
    actionsPerformed.push('Verifying Candidate request to /api/admin/analytics/overview is blocked');
    const candidateId = 'SYNTH-USR-DHAKA-001';
    const candRes = await apiVerifier.checkEndpoint('/api/admin/analytics/overview', {
      headers: {
        'Cookie': `session_token=${candidateId}`,
        'x-candidate-id': candidateId
      }
    });
    assertions.push({
      assertion: 'Candidate role attempting Admin Analytics is blocked with HTTP 403 Forbidden',
      expected: '403',
      actual: String(candRes.status),
      passed: candRes.status === 403
    });

    // 3. Candidate attempting to access Admin Candidates API
    actionsPerformed.push('Verifying Candidate request to /api/admin/candidates is blocked');
    const candUsersRes = await apiVerifier.checkEndpoint('/api/admin/candidates', {
      headers: {
        'Cookie': `session_token=${candidateId}`,
        'x-candidate-id': candidateId
      }
    });
    assertions.push({
      assertion: 'Candidate role attempting /api/admin/candidates is blocked with HTTP 403/401',
      expected: 'true',
      actual: String(candUsersRes.status === 403 || candUsersRes.status === 401),
      passed: candUsersRes.status === 403 || candUsersRes.status === 401
    });

    // 4. Authorized Super Admin request
    actionsPerformed.push('Verifying Super Admin request with valid secret succeeds');
    const adminRes = await apiVerifier.checkEndpoint('/api/admin/analytics/overview', {
      headers: {
        'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
      }
    });
    assertions.push({
      assertion: 'Super Admin request to Admin Analytics succeeds with HTTP 200',
      expected: '200',
      actual: String(adminRes.status),
      passed: adminRes.status === 200
    });

    // 5. RBAC Permission Matrix Validation
    actionsPerformed.push('Auditing internal RBAC role permission matrix');
    const superAdminHasAll = AdminGovernanceRbac.hasPermission('super_admin', 'system.settings.manage');
    const supportStaffRestricted = AdminGovernanceRbac.hasPermission('support_staff', 'system.settings.manage');

    assertions.push({
      assertion: 'Super Admin has full system management permissions',
      expected: 'true',
      actual: String(superAdminHasAll),
      passed: superAdminHasAll
    });

    assertions.push({
      assertion: 'Support staff is restricted from system settings management',
      expected: 'false',
      actual: String(supportStaffRestricted),
      passed: !supportStaffRestricted
    });

    const endTime = new Date().toISOString();
    return {
      scenarioId,
      startTime,
      name: 'Role-Based Access Control & Security Boundary Audit',
      category: 'security',
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
      name: 'Role-Based Access Control & Security Boundary Audit',
      category: 'security',
      status: 'FAIL',
      durationMs: 0,
      actionsPerformed,
      assertions,
      errors
    };
  }
}
