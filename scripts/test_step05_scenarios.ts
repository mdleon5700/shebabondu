import { TestRunManager } from '../src/lib/testing/test-run-manager';
import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario22 } from '../src/lib/testing/scenarios/22-admin-job-creation-draft-persistence';
import { runScenario23 } from '../src/lib/testing/scenarios/23-job-editing-content-studio-sync';
import { runScenario24 } from '../src/lib/testing/scenarios/24-job-validation-approval-workflow';
import { runScenario25 } from '../src/lib/testing/scenarios/25-publishing-public-website-sync';
import { runScenario26 } from '../src/lib/testing/scenarios/26-job-lifecycle-user-panel-sync';

async function main() {
  console.log('--- STARTING STEP 05 STANDALONE PRE-TESTS ---');
  const runRecord = TestRunManager.createRun({
    baseUrl: 'http://localhost:3000',
    headless: true
  });

  const browserCtrl = new BrowserController(runRecord.config);
  await browserCtrl.initialize();
  const { page } = await browserCtrl.createContext();
  const baseUrl = runRecord.config.baseUrl;

  const scenarios = [
    { num: 22, fn: runScenario22 },
    { num: 23, fn: runScenario23 },
    { num: 24, fn: runScenario24 },
    { num: 25, fn: runScenario25 },
    { num: 26, fn: runScenario26 }
  ];

  let allPass = true;

  for (const s of scenarios) {
    console.log(`\n[TESTING SCENARIO ${s.num}]...`);
    const result = await s.fn(page, baseUrl, browserCtrl);
    console.log(`Result: ${result.status} (${result.durationMs}ms)`);
    for (const a of result.assertions) {
      console.log(`  ${a.passed ? '✓ PASS' : '✗ FAIL'}: ${a.assertion} (Expected: ${a.expected}, Actual: ${a.actual})`);
    }
    if (result.errors.length > 0) {
      console.log('  Errors:', result.errors);
      allPass = false;
    }
    if (result.status !== 'PASS') {
      allPass = false;
    }
  }

  await browserCtrl.cleanup();
  console.log(`\nStep 05 Standalone Execution Status: ${allPass ? 'ALL PASSED (100%)' : 'SOME FAILED'}`);
  if (!allPass) process.exit(1);
}

main().catch(err => {
  console.error('Fatal in test_step05_scenarios:', err);
  process.exit(1);
});
