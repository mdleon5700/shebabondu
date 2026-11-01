import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario14 } from '../src/lib/testing/scenarios/14-education-crud-lifecycle';
import { TestRunConfig } from '../src/lib/testing/types';

async function main() {
  console.log('=== RUNNING PRE-TEST: SCENARIO 14 (EDUCATION CRUD & PERSISTENCE LIFECYCLE) ===');

  const config: TestRunConfig = {
    id: `RUN-SC14-${Date.now().toString().slice(-4)}`,
    name: 'Scenario 14 Standalone Pre-Test',
    environment: 'development',
    baseUrl: 'http://localhost:3000',
    headless: true,
    browser: 'chrome',
    viewport: { width: 1280, height: 800 },
    maxRetries: 1,
    timeoutMs: 25000,
    syntheticTag: {
      isSynthetic: true,
      testRunId: 'RUN-SC14',
      testDataVersion: '2.0',
      createdAt: new Date().toISOString()
    }
  };

  const ctrl = new BrowserController(config);
  await ctrl.initialize();
  const { page } = await ctrl.createContext();

  const result = await runScenario14(page, config.baseUrl, ctrl);
  await ctrl.cleanup();

  console.log('\nScenario 14 Result:');
  console.log(`- Status: ${result.status} (${result.durationMs}ms)`);
  console.log('- Assertions:');
  result.assertions.forEach(a => {
    console.log(`  [${a.passed ? 'PASS' : 'FAIL'}] ${a.assertion} -> Expected: ${a.expected}, Actual: ${a.actual}`);
  });

  if (result.status !== 'PASS') {
    throw new Error(`FAIL: Scenario 14 did not pass! Errors: ${JSON.stringify(result.errors)}`);
  }

  console.log('\n✅ PRE-TEST PASSED: Education Record CRUD & Persistence verified through real browser UI!');
}

main().catch(err => {
  console.error('\n❌ Execution error:', err);
  process.exit(1);
});