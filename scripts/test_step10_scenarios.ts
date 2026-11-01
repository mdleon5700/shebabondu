import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario49 } from '../src/lib/testing/scenarios/49-public-job-details-application-entry-eligibility-audit';
import { runScenario50 } from '../src/lib/testing/scenarios/50-application-form-validation-cv-document-attachment-audit';
import { runScenario51 } from '../src/lib/testing/scenarios/51-application-submission-persistence-duplicate-prevention-audit';
import { runScenario52 } from '../src/lib/testing/scenarios/52-user-panel-applications-dashboard-tracking-audit';
import { runScenario53 } from '../src/lib/testing/scenarios/53-admin-application-review-status-transition-audit';
import { runScenario54 } from '../src/lib/testing/scenarios/54-application-status-notification-synchronization-audit';

async function main() {
  console.log('=== CHAKRI SHEBA STEP 10 SCENARIOS VERIFICATION RUN ===\n');
  const baseUrl = 'http://localhost:3000';
  const browserCtrl = new BrowserController({
    id: `VERIFY-STEP10-${Date.now().toString().slice(-4)}`,
    name: 'Step 10 Standalone Verifier',
    environment: 'development',
    browser: 'chrome',
    headless: true,
    baseUrl,
    maxRetries: 1,
    syntheticTag: { isSynthetic: true, testRunId: 'STEP10', testDataVersion: '2.0', createdAt: new Date().toISOString() },
    viewport: { width: 1280, height: 720 },
    timeoutMs: 15000
  });

  await browserCtrl.initialize();
  const { page } = await browserCtrl.createContext();

  const scenarios = [
    { id: '49', fn: runScenario49 },
    { id: '50', fn: runScenario50 },
    { id: '51', fn: runScenario51 },
    { id: '52', fn: runScenario52 },
    { id: '53', fn: runScenario53 },
    { id: '54', fn: runScenario54 }
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
  console.log(`STEP 10 VERIFICATION RESULT: ${passedCount} / ${scenarios.length} PASSED (${((passedCount / scenarios.length) * 100).toFixed(1)}%)`);
  console.log(`======================================================\n`);

  if (passedCount !== scenarios.length) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
