import { TestRunManager } from '../src/lib/testing/test-run-manager';
import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario32 } from '../src/lib/testing/scenarios/32-latest-jobs-and-publication-timestamps-audit';
import { runScenario33 } from '../src/lib/testing/scenarios/33-daily-job-updates-calendar-archive-audit';
import { runScenario34 } from '../src/lib/testing/scenarios/34-deadline-monitoring-state-machine-audit';
import { runScenario35 } from '../src/lib/testing/scenarios/35-deadline-scheduler-cron-automation-audit';
import { runScenario36 } from '../src/lib/testing/scenarios/36-freshness-user-panel-sync-alerts-audit';

async function main() {
  console.log('--- STARTING STEP 07 STANDALONE PRE-TESTS ---');
  const runRecord = TestRunManager.createRun({
    baseUrl: 'http://localhost:3000',
    headless: true
  });

  const browserCtrl = new BrowserController(runRecord.config);
  await browserCtrl.initialize();
  const { page } = await browserCtrl.createContext();
  const baseUrl = runRecord.config.baseUrl;

  const scenarios = [
    { name: 'SCENARIO 32', fn: runScenario32 },
    { name: 'SCENARIO 33', fn: runScenario33 },
    { name: 'SCENARIO 34', fn: runScenario34 },
    { name: 'SCENARIO 35', fn: runScenario35 },
    { name: 'SCENARIO 36', fn: runScenario36 },
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
    console.error('\nStep 07 Standalone Execution Status: SOME FAILED');
    process.exit(1);
  } else {
    console.log('\nStep 07 Standalone Execution Status: ALL PASSED (100%)');
    process.exit(0);
  }
}

main();
