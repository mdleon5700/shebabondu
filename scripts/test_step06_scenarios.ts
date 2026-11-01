import { TestRunManager } from '../src/lib/testing/test-run-manager';
import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario27 } from '../src/lib/testing/scenarios/27-job-categories-subcategories-hierarchy-audit';
import { runScenario28 } from '../src/lib/testing/scenarios/28-bilingual-search-normalization-scoring-audit';
import { runScenario29 } from '../src/lib/testing/scenarios/29-bangladesh-location-filter-audit';
import { runScenario30 } from '../src/lib/testing/scenarios/30-advanced-filter-combinations-audit';
import { runScenario31 } from '../src/lib/testing/scenarios/31-sorting-pagination-user-panel-discovery-audit';

async function main() {
  console.log('--- STARTING STEP 06 STANDALONE PRE-TESTS ---');
  const runRecord = TestRunManager.createRun({
    baseUrl: 'http://localhost:3000',
    headless: true
  });

  const browserCtrl = new BrowserController(runRecord.config);
  await browserCtrl.initialize();
  const { page } = await browserCtrl.createContext();
  const baseUrl = runRecord.config.baseUrl;

  const scenarios = [
    { name: 'SCENARIO 27', fn: runScenario27 },
    { name: 'SCENARIO 28', fn: runScenario28 },
    { name: 'SCENARIO 29', fn: runScenario29 },
    { name: 'SCENARIO 30', fn: runScenario30 },
    { name: 'SCENARIO 31', fn: runScenario31 },
  ];

  let anyFailed = false;

  for (const s of scenarios) {
    console.log(`\n[TESTING ${s.name}]...`);
    const res = await s.fn(page, baseUrl, browserCtrl);
    console.log(`Result: ${res.status} (${res.durationMs}ms)`);
    for (const a of res.assertions) {
      const mark = a.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`  ${mark}: ${a.assertion} (Expected: ${a.expected}, Actual: ${a.actual})`);
    }
    if (res.errors.length > 0) {
      console.log('  Errors:', res.errors);
      anyFailed = true;
    }
    if (res.status !== 'PASS') {
      anyFailed = true;
    }
  }

  await browserCtrl.cleanup();

  if (anyFailed) {
    console.error('\nStep 06 Standalone Execution Status: SOME FAILED');
    process.exit(1);
  } else {
    console.log('\nStep 06 Standalone Execution Status: ALL PASSED (100%)');
    process.exit(0);
  }
}

main();
