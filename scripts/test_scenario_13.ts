import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario13 } from '../src/lib/testing/scenarios/13-cross-panel-sync';
import { TestRunConfig } from '../src/lib/testing/types';

console.log('=== RUNNING PRE-TEST: SCENARIO 13 (CROSS-PANEL SYNCHRONIZATION) ===');

async function main() {
  const config: TestRunConfig = {
    id: `RUN-SC13-${Date.now().toString().slice(-4)}`,
    name: 'Scenario 13 Standalone Test',
    environment: 'development',
    baseUrl: 'http://localhost:3000',
    headless: true,
    browser: 'chrome',
    viewport: { width: 1280, height: 800 },
    maxRetries: 1,
    timeoutMs: 15000,
    syntheticTag: {
      isSynthetic: true,
      testRunId: 'RUN-SC13',
      testDataVersion: '2.0',
      createdAt: new Date().toISOString()
    }
  };

  const ctrl = new BrowserController(config);
  await ctrl.initialize();
  const { page } = await ctrl.createContext();

  const result = await runScenario13(page, config.baseUrl, ctrl);
  await ctrl.cleanup();

  console.log('Scenario 13 Result:');
  console.log(`- Status: ${result.status} (${result.durationMs}ms)`);
  console.log(`- Actions: ${result.actionsPerformed.length}`);
  console.log('- Assertions:');
  result.assertions.forEach(a => {
    console.log(`  [${a.passed ? 'PASS' : 'FAIL'}] ${a.assertion} -> Expected: ${a.expected}, Actual: ${a.actual}`);
  });

  if (result.status !== 'PASS') {
    throw new Error(`FAIL: Scenario 13 did not pass! Errors: ${JSON.stringify(result.errors)}`);
  }

  console.log('✅ PRE-TEST PASSED: Two-Way Cross-Panel Data Synchronization verified!');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
