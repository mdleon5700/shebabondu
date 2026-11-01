import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario12 } from '../src/lib/testing/scenarios/12-browser-registration-lifecycle';
import { TestRunConfig } from '../src/lib/testing/types';

console.log('=== RUNNING PRE-TEST: SCENARIO 12 (BROWSER REGISTRATION & LIFECYCLE) ===');

async function main() {
  const config: TestRunConfig = {
    id: `RUN-SC12-${Date.now().toString().slice(-4)}`,
    name: 'Scenario 12 Standalone Test',
    environment: 'development',
    baseUrl: 'http://localhost:3000',
    headless: true,
    browser: 'chrome',
    viewport: { width: 1280, height: 800 },
    maxRetries: 1,
    timeoutMs: 25000,
    syntheticTag: {
      isSynthetic: true,
      testRunId: 'RUN-SC12',
      testDataVersion: '2.0',
      createdAt: new Date().toISOString()
    }
  };

  const ctrl = new BrowserController(config);
  await ctrl.initialize();
  const { page } = await ctrl.createContext();

  const result = await runScenario12(page, config.baseUrl, ctrl);
  await ctrl.cleanup();

  console.log('Scenario 12 Result:');
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
    throw new Error(`FAIL: Scenario 12 did not pass! Errors: ${JSON.stringify(result.errors)}`);
  }

  console.log('✅ PRE-TEST PASSED: Browser Registration & Lifecycle verified through actual UI!');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
