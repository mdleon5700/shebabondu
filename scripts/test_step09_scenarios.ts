import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario43 } from '../src/lib/testing/scenarios/43-notification-catalog-event-lifecycle-audit';
import { runScenario44 } from '../src/lib/testing/scenarios/44-64-district-personalized-job-alerts-eligibility-audit';
import { runScenario45 } from '../src/lib/testing/scenarios/45-notification-preferences-channel-control-audit';
import { runScenario46 } from '../src/lib/testing/scenarios/46-duplicate-prevention-and-idempotency-audit';
import { runScenario47 } from '../src/lib/testing/scenarios/47-deadline-alerts-and-automated-reminders-audit';
import { runScenario48 } from '../src/lib/testing/scenarios/48-user-panel-notification-experience-security-isolation-audit';

async function main() {
  console.log('=== CHAKRI SHEBA STEP 09 SCENARIOS VERIFICATION RUN ===\n');
  const baseUrl = 'http://localhost:3000';
  const browserCtrl = new BrowserController({
    id: `VERIFY-STEP09-${Date.now().toString().slice(-4)}`,
    name: 'Step 09 Standalone Verifier',
    environment: 'development',
    browser: 'chrome',
    headless: true,
    baseUrl,
    maxRetries: 1,
    syntheticTag: { isSynthetic: true, testRunId: 'STEP09', testDataVersion: '2.0', createdAt: new Date().toISOString() },
    viewport: { width: 1280, height: 720 },
    timeoutMs: 15000
  });

  await browserCtrl.initialize();
  const { page } = await browserCtrl.createContext();

  const scenarios = [
    { id: '43', fn: runScenario43 },
    { id: '44', fn: runScenario44 },
    { id: '45', fn: runScenario45 },
    { id: '46', fn: runScenario46 },
    { id: '47', fn: runScenario47 },
    { id: '48', fn: runScenario48 }
  ];

  let passedCount = 0;
  for (const s of scenarios) {
    console.log(`[TESTING] Executing SCENARIO-${s.id}...`);
    const res = await s.fn(page, baseUrl, browserCtrl);
    if (res.status === 'PASS') {
      console.log(`[TESTING] ? ${res.scenarioId}: PASS (${res.durationMs}ms)`);
      passedCount++;
    } else {
      console.error(`[TESTING] ? ${res.scenarioId}: FAIL (${res.durationMs}ms)`);
      res.assertions.forEach(a => {
        if (!a.passed) console.error(`  - Failed assertion: "${a.assertion}" | Expected: "${a.expected}" | Actual: "${a.actual}"`);
      });
      res.errors.forEach(e => console.error(`  - Error: ${e.message}`));
    }
  }

  await browserCtrl.cleanup();
  console.log(`\n======================================================`);
  console.log(`STEP 09 VERIFICATION RESULT: ${passedCount} / ${scenarios.length} PASSED (${((passedCount / scenarios.length) * 100).toFixed(1)}%)`);
  console.log(`======================================================\n`);

  if (passedCount !== scenarios.length) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
