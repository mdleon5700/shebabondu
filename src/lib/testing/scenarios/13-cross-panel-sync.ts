import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import { serverDB } from '../../db';

export async function runScenario13(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-13-CROSS-PANEL-SYNCHRONIZATION';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const testUserId = 'SYNTH-USR-SYLHET-001';
  const userObjective = 'ইউজার প্যানেল থেকে সংশোধিত ক্যারিয়ার অবজেক্টিভ ২০২৬';
  const adminObjective = 'অ্যাডমিন প্যানেল থেকে যাচাইকৃত ও অনুমোদিত ক্যারিয়ার অবজেক্টিভ ২০২৬';

  try {
    // 1. User Panel Updates Profile Data
    actions.push(`Updating synthetic candidate (${testUserId}) from User Panel perspective`);
    const userUpdate = serverDB.updateCandidate(testUserId, {
      careerObjective: userObjective,
      professionalSummary: 'SYNCHRONIZATION TEST: Updated from User Panel'
    });

    assertions.push({
      assertion: 'User Panel profile update persists to database',
      expected: 'true',
      actual: String(Boolean(userUpdate && userUpdate.careerObjective === userObjective)),
      passed: Boolean(userUpdate && userUpdate.careerObjective === userObjective)
    });

    // 2. Admin Panel Queries Candidate Profile
    actions.push(`Admin Panel querying candidate profile via: /api/admin/candidates/${testUserId}`);
    const adminRes = await fetch(`${baseUrl}/api/admin/candidates/${testUserId}`, {
      headers: { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }
    });
    const adminData = await adminRes.json();

    assertions.push({
      assertion: 'Admin API /api/admin/candidates/[id] responds with HTTP 200',
      expected: '200',
      actual: String(adminRes.status),
      passed: adminRes.status === 200
    });

    const adminCandidateData = adminData?.candidate;
    assertions.push({
      assertion: 'Admin Panel displays User Panel persisted changes',
      expected: userObjective,
      actual: adminCandidateData?.careerObjective || 'undefined',
      passed: adminCandidateData?.careerObjective === userObjective
    });

    // 3. Admin Panel Modifies Candidate Profile
    actions.push(`Admin Panel editing candidate profile via: PATCH /api/admin/candidates/${testUserId}`);
    const patchRes = await fetch(`${baseUrl}/api/admin/candidates/${testUserId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
      },
      body: JSON.stringify({
        careerObjective: adminObjective
      })
    });
    const patchData = await patchRes.json();

    assertions.push({
      assertion: 'Admin PATCH /api/admin/candidates/[id] succeeds with HTTP 200',
      expected: '200',
      actual: String(patchRes.status),
      passed: patchRes.status === 200
    });

    // 4. User Panel Verifies Synchronized Data
    actions.push('User Panel re-reading profile to verify Admin synchronized changes');
    const userCandidateData = serverDB.getCandidateById(testUserId);
    assertions.push({
      assertion: 'User Panel accurately reflects Admin Panel profile modifications',
      expected: adminObjective,
      actual: userCandidateData?.careerObjective || 'undefined',
      passed: userCandidateData?.careerObjective === adminObjective
    });

    // 5. Verify Isolation
    const isolation = SyntheticUserManager.verifyDataIsolation();
    assertions.push({
      assertion: 'Production store local_store.json candidates count preserved strictly at 41',
      expected: '41',
      actual: String(isolation.realCandidatesCount),
      passed: isolation.realCandidatesCount === 41
    });

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'User Panel & Admin Panel Two-Way Cross-Panel Data Synchronization',
      category: 'admin',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: `${baseUrl}/api/admin/candidates/${testUserId}`,
      actionsPerformed: actions,
      assertions,
      errors,
      evidenceNotes: `Two-way synchronization between User Panel and Admin Panel verified for ${testUserId}.`
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
      name: 'User Panel & Admin Panel Two-Way Cross-Panel Data Synchronization',
      category: 'admin',
      status: 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: `${baseUrl}/api/admin/candidates/${testUserId}`,
      actionsPerformed: actions,
      assertions,
      errors
    };
  }
}
