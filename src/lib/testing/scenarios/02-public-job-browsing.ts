import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { HumanInteractionEngine } from '../human-interaction';

export async function runScenario02(page: Page, baseUrl: string, browserCtrl: BrowserController): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-02-PUBLIC-JOB-BROWSING';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const human = new HumanInteractionEngine(page);

  try {
    actionsPerformed.push('Navigating to job listings: ' + baseUrl + '/jobs');
    const response = await page.goto(`${baseUrl}/jobs`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const status = response ? response.status() : 0;
    assertions.push({
      assertion: 'Job listings responds with HTTP 200',
      expected: '200',
      actual: String(status),
      passed: status === 200
    });

    actionsPerformed.push('Waiting for client-side job circular cards to hydrate');
    const jobCards = page.locator('a:has-text("সার্কুলার দেখুন")');
    await jobCards.first().waitFor({ state: 'visible', timeout: 16000 }).catch(() => {});
    const cardCount = await jobCards.count();
    assertions.push({
      assertion: 'Job listings displays available circular cards',
      expected: '> 0',
      actual: String(cardCount),
      passed: cardCount > 0
    });

    actionsPerformed.push('Simulating human click to view first circular detail');
    if (cardCount > 0) {
      const firstCard = jobCards.first();
      await firstCard.scrollIntoViewIfNeeded();
      const href = await firstCard.getAttribute('href');

      try {
        await human.clickElement(firstCard);
        await page.waitForURL((url) => url.pathname.startsWith('/jobs/') && url.pathname !== '/jobs', { timeout: 12000 });
      } catch {
        if (href) {
          await page.goto(`${baseUrl}${href}`, { waitUntil: 'domcontentloaded' });
        }
      }
      await page.waitForTimeout(1500);

      const detailUrl = page.url();
      assertions.push({
        assertion: 'Successfully navigated to Job Detail page',
        expected: '/jobs/',
        actual: detailUrl,
        passed: detailUrl.includes('/jobs/') && detailUrl !== `${baseUrl}/jobs`
      });

      actionsPerformed.push('Inspecting job detail contents: title, organization, save button');
      const hasSaveBtn = await page.locator('button:has-text("সেভ"), button:has-text("সংরক্ষিত")').first().isVisible().catch(() => false);
      assertions.push({
        assertion: 'Job Detail page displays interactive Save/Bookmark button',
        expected: 'true',
        actual: String(hasSaveBtn),
        passed: hasSaveBtn
      });
    }

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'job_detail_view');

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Public Job Browsing & Detail Exploration',
      category: 'public',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors,
      screenshotRef,
      evidenceNotes: 'Public job listings and full circular detail inspection completed.'
    };
  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    return {
      scenarioId,
      name: 'Public Job Browsing & Detail Exploration',
      category: 'public',
      status: 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors
    };
  }
}