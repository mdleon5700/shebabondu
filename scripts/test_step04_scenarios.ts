import { TestRunManager } from '../src/lib/testing/test-run-manager';
import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario18 } from '../src/lib/testing/scenarios/18-document-vault-browser-lifecycle';
import { runScenario19 } from '../src/lib/testing/scenarios/19-document-security-vault-guard';
import { runScenario20 } from '../src/lib/testing/scenarios/20-admin-document-review-sync';
import { runScenario21 } from '../src/lib/testing/scenarios/21-document-replacement-integrity';

async function main() {
  console.log('--- STARTING STEP 04 STANDALONE PRE-TESTS ---');
  const runRecord = TestRunManager.createRun({
    baseUrl: 'http://localhost:3000',
    headless: true
  });

  const browserCtrl = new BrowserController(runRecord.config);
  await browserCtrl.initialize();
  const { page } = await browserCtrl.createContext();
  const baseUrl = runRecord.config.baseUrl;

  const scenarios = [
    { num: 18, fn: runScenario18 },
    { num: 19, fn: runScenario19 },
    { num: 20, fn: runScenario20 },
    { num: 21, fn: runScenario21 }
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
  console.log(`\nStep 04 Standalone Execution Status: ${allPass ? 'ALL PASSED (100%)' : 'SOME FAILED'}`);
  if (!allPass) process.exit(1);
}

main().catch(err => {
  console.error('Fatal in test_step04_scenarios:', err);
  process.exit(1);
});
