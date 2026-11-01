import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario02 } from '../src/lib/testing/scenarios/02-public-job-browsing';
import { runScenario11 } from '../src/lib/testing/scenarios/11-nationwide-synthetic-personas';
import { runScenario12 } from '../src/lib/testing/scenarios/12-browser-registration-lifecycle';
import { TestRunConfig } from '../src/lib/testing/types';

async function verify() {
  const config: TestRunConfig = {
    id: `VERIFY-${Date.now().toString().slice(-4)}`,
    name: 'Verify Patched Scenarios',
    environment: 'development',
    baseUrl: 'http://localhost:3000',
    headless: true,
    browser: 'chrome',
    viewport: { width: 1280, height: 800 },
    maxRetries: 1,
    timeoutMs: 25000,
    syntheticTag: {
      isSynthetic: true,
      testRunId: 'VERIFY',
      testDataVersion: '2.0',
      createdAt: new Date().toISOString()
    }
  };

  const ctrl = new BrowserController(config);
  await ctrl.initialize();
  const { page } = await ctrl.createContext();

  console.log('\n--- 1. Testing SCENARIO 02 ---');
  const res2 = await runScenario02(page, config.baseUrl, ctrl);
  console.log(`SCENARIO 02 Result: ${res2.status} (${res2.durationMs}ms)`);
  res2.assertions.forEach(a => console.log(`  [${a.passed ? 'PASS' : 'FAIL'}] ${a.assertion} -> Expected: ${a.expected}, Actual: ${a.actual}`));
  if (res2.status !== 'PASS') throw new Error('SCENARIO 02 FAILED');

  console.log('\n--- 2. Testing SCENARIO 11 ---');
  const res11 = await runScenario11(page, config.baseUrl, ctrl);
  console.log(`SCENARIO 11 Result: ${res11.status} (${res11.durationMs}ms)`);
  res11.assertions.forEach(a => console.log(`  [${a.passed ? 'PASS' : 'FAIL'}] ${a.assertion} -> Expected: ${a.expected}, Actual: ${a.actual}`));
  if (res11.status !== 'PASS') throw new Error('SCENARIO 11 FAILED');

  console.log('\n--- 3. Testing SCENARIO 12 ---');
  const res12 = await runScenario12(page, config.baseUrl, ctrl);
  console.log(`SCENARIO 12 Result: ${res12.status} (${res12.durationMs}ms)`);
  res12.assertions.forEach(a => console.log(`  [${a.passed ? 'PASS' : 'FAIL'}] ${a.assertion} -> Expected: ${a.expected}, Actual: ${a.actual}`));
  if (res12.status !== 'PASS') throw new Error('SCENARIO 12 FAILED');

  await ctrl.cleanup();
  console.log('\n🎉 ALL 3 FIXED SCENARIOS (02, 11, 12) PASSED 100%!');
}

verify().catch(err => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});