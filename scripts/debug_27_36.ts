import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario27 } from '../src/lib/testing/scenarios/27-job-categories-subcategories-hierarchy-audit';
import { runScenario36 } from '../src/lib/testing/scenarios/36-freshness-user-panel-sync-alerts-audit';

async function main() {
  const baseUrl = 'http://localhost:3000';
  const browserCtrl = new BrowserController({
    id: 'DEBUG-27-36',
    name: 'Debug 27 & 36',
    environment: 'development',
    browser: 'chrome',
    headless: true,
    baseUrl,
    maxRetries: 1,
    syntheticTag: { isSynthetic: true, testRunId: 'DEBUG', testDataVersion: '2.0', createdAt: new Date().toISOString() },
    viewport: { width: 1280, height: 720 },
    timeoutMs: 15000
  });

  await browserCtrl.initialize();
  const { page } = await browserCtrl.createContext();

  console.log('--- RUNNING SCENARIO 27 ---');
  const res27 = await runScenario27(page, baseUrl, browserCtrl);
  console.log('Status 27:', res27.status);
  res27.assertions.forEach(a => {
    if (!a.passed) console.log('Assertion failed:', a.assertion, '| Expected:', a.expected, '| Actual:', a.actual);
  });
  res27.errors.forEach(e => console.log('Error 27:', e.message));

  console.log('\n--- RUNNING SCENARIO 36 ---');
  const res36 = await runScenario36(page, baseUrl, browserCtrl);
  console.log('Status 36:', res36.status);
  res36.assertions.forEach(a => {
    if (!a.passed) console.log('Assertion failed:', a.assertion, '| Expected:', a.expected, '| Actual:', a.actual);
  });
  res36.errors.forEach(e => console.log('Error 36:', e.message));

  await browserCtrl.cleanup();
}

main().catch(console.error);
