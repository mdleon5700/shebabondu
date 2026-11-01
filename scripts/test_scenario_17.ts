import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario17 } from '../src/lib/testing/scenarios/17-academic-hierarchy-validation';
import { TestRunConfig } from '../src/lib/testing/types';

async function main() {
  console.log('=== RUNNING PRE-TEST: SCENARIO 17 (ACADEMIC HIERARCHY, SCALES & MATCHING) ===');

  const config: TestRunConfig = {
    id: `RUN-SC17-${Date.now().toString().slice(-4)}`,
    name: 'Scenario 17 Standalone Pre-Test',
    environment: 'development',
    baseUrl: 'http://localhost:3000',
    headless: true,
    browser: 'chrome',
    viewport: { width: 1280, height: 800 },
    maxRetries: 1,
    timeoutMs: 25000,
    syntheticTag: {
      isSynthetic: true,
      testRunId: 'RUN-SC17',
      testDataVersion: '2.0',
      createdAt: new Date().toISOString()
    }
  };

  const ctrl = new BrowserController(config);
  await ctrl.initialize();
  const { page } = await ctrl.createContext();

  try {
    const result = await runScenario17(page, config.baseUrl, ctrl);
    console.log('\nScenario 17 Result:');
    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${result.durationMs}ms`);
    console.log('Assertions:');
    for (const a of result.assertions) {
      console.log(`  [${a.passed ? 'PASS' : 'FAIL'}] ${a.assertion} -> Expected: ${a.expected}, Actual: ${a.actual}`);
    }
    if (result.errors.length > 0) {
      console.log('Errors:');
      for (const e of result.errors) {
        console.log(`  - [${e.type}] ${e.message}`);
      }
    }
    await ctrl.cleanup();
    process.exit(result.status === 'PASS' ? 0 : 1);
  } catch (err) {
    console.error('Fatal error running Scenario 17:', err);
    await ctrl.cleanup();
    process.exit(1);
  }
}

main();
