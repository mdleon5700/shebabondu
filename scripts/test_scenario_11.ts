import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario11 } from '../src/lib/testing/scenarios/11-nationwide-synthetic-personas';
import { TestRunConfig } from '../src/lib/testing/types';

console.log('=== RUNNING PRE-TEST 5: REAL BROWSER SIMULATION (SCENARIO 11) ===');

async function main() {
  const config: TestRunConfig = {
    id: `RUN-SC11-${Date.now().toString().slice(-4)}`,
    name: 'Scenario 11 Standalone Test',
    environment: 'development',
    baseUrl: 'http://localhost:3000',
    headless: true,
    browser: 'chrome',
    viewport: { width: 1280, height: 800 },
    maxRetries: 1,
    timeoutMs: 15000,
    syntheticTag: {
      isSynthetic: true,
      testRunId: 'RUN-SC11',
      testDataVersion: '2.0',
      createdAt: new Date().toISOString()
    }
  };

  const ctrl = new BrowserController(config);
  await ctrl.initialize();
  const { page } = await ctrl.createContext();

  const result = await runScenario11(page, config.baseUrl, ctrl);
  await ctrl.cleanup();

  console.log('Scenario 11 Result:');
  console.log(`- Status: ${result.status} (${result.durationMs}ms)`);
  console.log(`- Actions: ${result.actionsPerformed.length}`);
  console.log('- Assertions:');
  result.assertions.forEach(a => {
    console.log(`  [${a.passed ? 'PASS' : 'FAIL'}] ${a.assertion} -> Expected: ${a.expected}, Actual: ${a.actual}`);
  });

  if (result.screenshotRef) {
    console.log(`- Screenshot Saved: ${result.screenshotRef}`);
  }

  if (result.status !== 'PASS') {
    throw new Error(`FAIL: Scenario 11 did not pass! Errors: ${JSON.stringify(result.errors)}`);
  }

  console.log('✅ PRE-TEST 5 PASSED: Real Browser Simulation verified with candidate login, profile rendering, screenshot evidence, and 100% data isolation!');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});