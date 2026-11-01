import { BrowserController } from '../src/lib/testing/browser-controller';
import { runScenario37 } from '../src/lib/testing/scenarios/37-mandatory-eligibility-vs-recommendation-separation-audit';
import { runScenario38 } from '../src/lib/testing/scenarios/38-complete-education-matrix-subject-match-audit';
import { runScenario39 } from '../src/lib/testing/scenarios/39-age-boundaries-reference-date-quota-audit';
import { runScenario40 } from '../src/lib/testing/scenarios/40-experience-skills-64-district-matching-audit';
import { runScenario41 } from '../src/lib/testing/scenarios/41-new-job-publishing-matching-profile-refresh-simulation';
import { runScenario42 } from '../src/lib/testing/scenarios/42-matching-transparency-explainability-notifications-audit';

async function main() {
  console.log('================================================================');
  console.log('CHAKRI SHEBA STEP 08 STANDALONE SCENARIO SUITE (37 - 42)');
  console.log('================================================================\n');

  const config = {
    headless: true,
    baseUrl: 'http://localhost:3000',
    environment: 'development' as const,
    slowMo: 0,
    viewport: { width: 1280, height: 800 },
    screenshotOnFailure: true,
    storageStatePath: ''
  };

  const browserCtrl = new BrowserController(config as any);
  await browserCtrl.initialize();
  const { page } = await browserCtrl.createContext();

  const scenarios = [
    { id: 'SCENARIO-37', fn: runScenario37 },
    { id: 'SCENARIO-38', fn: runScenario38 },
    { id: 'SCENARIO-39', fn: runScenario39 },
    { id: 'SCENARIO-40', fn: runScenario40 },
    { id: 'SCENARIO-41', fn: runScenario41 },
    { id: 'SCENARIO-42', fn: runScenario42 },
  ];

  let passedCount = 0;
  for (const s of scenarios) {
    console.log(`\n[TEST] Running ${s.id}...`);
    const start = Date.now();
    try {
      const res = await s.fn(page, config.baseUrl, browserCtrl);
      const icon = res.status === 'PASS' ? '✅' : '❌';
      console.log(`[TEST] ${icon} ${s.id} -> ${res.status} (${Date.now() - start}ms)`);
      if (res.status === 'PASS') {
        passedCount++;
      } else {
        console.error('Failed assertions:', res.assertions.filter(a => !a.passed));
        console.error('Errors:', res.errors);
      }
    } catch (e: any) {
      console.error(`[TEST] ❌ ${s.id} EXCEPTION:`, e.message);
    }
  }

  await browserCtrl.cleanup();
  console.log(`\n================================================================`);
  console.log(`RESULTS: ${passedCount}/${scenarios.length} PASSED (${((passedCount/scenarios.length)*100).toFixed(1)}%)`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
