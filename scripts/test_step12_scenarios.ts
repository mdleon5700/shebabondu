import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario61 } from '../src/lib/testing/scenarios/61-nationwide-64-district-full-user-journey-simulation';
import { runScenario62 } from '../src/lib/testing/scenarios/62-comprehensive-security-vulnerability-hardening-audit';
import { runScenario63 } from '../src/lib/testing/scenarios/63-high-concurrency-performance-scalability-audit';
import { runScenario64 } from '../src/lib/testing/scenarios/64-gemini-independence-operational-resilience-regression-audit';

async function main() {
  console.log('=== CHAKRI SHEBA STEP 12 SCENARIOS VERIFICATION RUN ===\n');
  const baseUrl = 'http://localhost:3000';
  const browserCtrl = new BrowserController({
    id: `VERIFY-STEP12-${Date.now().toString().slice(-4)}`,
    name: 'Step 12 Standalone Verifier',
    environment: 'development',
    browser: 'chrome',
    headless: true,
    baseUrl,
    maxRetries: 1,
    syntheticTag: { isSynthetic: true, testRunId: 'STEP12', testDataVersion: '2.0', createdAt: new Date().toISOString() },
    viewport: { width: 1280, height: 720 },
    timeoutMs: 15000
  });

  await browserCtrl.initialize();
  const { page } = await browserCtrl.createContext();

  const scenarios = [
    { id: '61', fn: runScenario61 },
    { id: '62', fn: runScenario62 },
    { id: '63', fn: runScenario63 },
    { id: '64', fn: runScenario64 }
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
  console.log(`STEP 12 VERIFICATION RESULT: ${passedCount} / ${scenarios.length} PASSED (${((passedCount / scenarios.length) * 100).toFixed(1)}%)`);
  console.log(`======================================================\n`);

  if (passedCount !== scenarios.length) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
