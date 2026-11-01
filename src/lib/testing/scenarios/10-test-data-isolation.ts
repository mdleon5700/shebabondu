import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { TestDataIsolation } from '../test-isolation';
import { DatabaseConsistencyChecker } from '../db-checker';

export async function runScenario10(page: Page, baseUrl: string, browserCtrl: BrowserController): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-10-TEST-DATA-ISOLATION';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const dbChecker = new DatabaseConsistencyChecker();

  try {
    actionsPerformed.push('Generating synthetic test identity for RUN-2026-BASELINE');
    const synthUser = TestDataIsolation.generateSyntheticIdentity('RUN-2026-BASELINE', 'CHATTOGRAM', 'CHATTOGRAM');

    assertions.push({
      assertion: 'Synthetic user ID begins with SYNTH- prefix',
      expected: 'true',
      actual: String(synthUser.id.startsWith('SYNTH-')),
      passed: synthUser.id.startsWith('SYNTH-')
    });

    assertions.push({
      assertion: 'Synthetic user carries isSynthetic: true flag',
      expected: 'true',
      actual: String(synthUser.isSynthetic),
      passed: synthUser.isSynthetic === true
    });

    actionsPerformed.push('Testing security boundary guard against real accounts');
    let blockedRealAccount = false;
    try {
      TestDataIsolation.assertSafeForTestOperation('USR-01711000001'); // real user id format
    } catch {
      blockedRealAccount = true;
    }

    assertions.push({
      assertion: 'Security guard strictly blocks test operations on real user accounts',
      expected: 'true',
      actual: String(blockedRealAccount),
      passed: blockedRealAccount
    });

    actionsPerformed.push('Inspecting server database snapshot to confirm existing data preservation');
    const snapshot = dbChecker.getSnapshot();

    assertions.push({
      assertion: 'Persistent database store is accessible and healthy',
      expected: 'true',
      actual: String(snapshot.isStoreAccessible),
      passed: snapshot.isStoreAccessible
    });

    assertions.push({
      assertion: 'Existing production candidates preserved intact (> 0)',
      expected: '> 0',
      actual: String(snapshot.candidatesCount),
      passed: snapshot.candidatesCount > 0
    });

    assertions.push({
      assertion: 'Existing circulars preserved intact (> 0)',
      expected: '> 0',
      actual: String(snapshot.jobsCount),
      passed: snapshot.jobsCount > 0
    });

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Test Data Tagging & Production Isolation Guard',
      category: 'security',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: 'internal://database/store',
      actionsPerformed,
      assertions,
      errors,
      evidenceNotes: `Isolated database verified. Candidates: ${snapshot.candidatesCount}, Jobs: ${snapshot.jobsCount}.`
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
      name: 'Test Data Tagging & Production Isolation Guard',
      category: 'security',
      status: 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: 'internal://database/store',
      actionsPerformed,
      assertions,
      errors
    };
  }
}