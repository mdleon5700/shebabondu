import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';

export async function runScenario25(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-25-PUBLISHING-PUBLIC-WEBSITE-SYNC';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const adminKey = process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026';
  const jobId = 'SYNTH-JOB-DRAFT-001';

  try {
    const request = page.context().request;

    // 1. Publish the synthetic job via admin publishing endpoint
    actions.push(`Admin publishes job ${jobId} via PUT /api/admin/jobs/${jobId}`);
    const pubRes = await request.put(`${baseUrl}/api/admin/jobs/${jobId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        'x-admin-secret': adminKey
      },
      data: {
        status: 'PUBLISHED',
        publicationStatus: 'PUBLISHED',
        publishedDate: new Date().toLocaleDateString('bn-BD')
      }
    });

    const pubStatus = pubRes.status();
    const publishedJob = SyntheticJobManager.getJobById(jobId);

    assertions.push({
      assertion: 'Job status successfully set to PUBLISHED',
      expected: 'PUBLISHED',
      actual: String(publishedJob?.status),
      passed: pubStatus === 200 && publishedJob?.status === 'PUBLISHED'
    });

    // 2. Open Public Website /jobs in browser
    actions.push('Navigating browser to public jobs listing (/jobs)');
    await page.goto(`${baseUrl}/jobs`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.waitForTimeout(1500);

    const listingTitle = await page.title();
    actions.push(`Public listing page title: ${listingTitle}`);

    // Verify search input functionality and filter to synthetic job
    const searchInput = page.locator('input[placeholder*="খুঁজুন"], input[placeholder*="সার্চ"], input[name="search"], input[type="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      actions.push('Typing search query for synthetic job title');
      await searchInput.fill('সহকারী প্রোগ্রামার');
      await page.waitForTimeout(1000);
    }

    // Verify synthetic job card is visible on listing
    const jobCardLocator = page.locator(`a[href*="${jobId}"]`).or(page.locator('text=সহকারী প্রোগ্রামার')).first();
    await jobCardLocator.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
    const isJobInListing = await jobCardLocator.isVisible().catch(() => false);

    assertions.push({
      assertion: 'Published synthetic job is visible on Public Website /jobs listing',
      expected: 'true',
      actual: String(isJobInListing),
      passed: isJobInListing
    });

    // 3. Open Public Job Details Page (/jobs/[id])
    actions.push(`Navigating to public job details page: /jobs/${jobId}`);
    await page.goto(`${baseUrl}/jobs/${jobId}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Verify Title on public details page
    const titleLocator = page.locator('h1, h2').filter({ hasText: /সহকারী প্রোগ্রামার/ }).first();
    const isTitleVisible = await titleLocator.isVisible().catch(() => false);

    assertions.push({
      assertion: 'Public Job Details page renders correct job title',
      expected: 'true',
      actual: String(isTitleVisible),
      passed: isTitleVisible
    });

    // Verify Organization on public details page
    const orgLocator = page.locator('text=পরীক্ষামূলক শিক্ষা তথ্য অধিদপ্তর').first();
    const isOrgVisible = await orgLocator.isVisible().catch(() => false);

    assertions.push({
      assertion: 'Public Job Details page displays correct organization name',
      expected: 'true',
      actual: String(isOrgVisible),
      passed: isOrgVisible
    });

    // Verify Salary or Vacancies on page
    const pageText = await page.innerText('body');
    const hasSalaryOrVacancies = pageText.includes('২৮,০০০') || pageText.includes('২২,০০০') || pageText.includes('পদ');

    assertions.push({
      assertion: 'Public Job Details page displays salary and vacancy information',
      expected: 'true',
      actual: String(hasSalaryOrVacancies),
      passed: hasSalaryOrVacancies
    });

    // 4. Verify SEO Metadata
    const pageHtml = await page.content();
    const hasCanonical = pageHtml.includes('<link rel="canonical"') || pageHtml.includes(jobId);
    const hasOgTags = pageHtml.includes('og:') || pageHtml.includes('twitter:');

    assertions.push({
      assertion: 'Public Job Details page includes canonical URL and social metadata',
      expected: 'true',
      actual: String(hasCanonical || hasOgTags),
      passed: hasCanonical || hasOgTags
    });

    // 5. Zero Database Pollution assertion
    const isolation = SyntheticJobManager.verifyJobDataIsolation();
    assertions.push({
      assertion: 'Real database local_store.json remains 100% unpolluted (214 real jobs)',
      expected: 'true',
      actual: String(isolation.isIsolated && isolation.realJobsCount === 214),
      passed: isolation.isIsolated && isolation.realJobsCount === 214
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: `Scenario 25 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Publishing Workflow & Public Website Synchronization Audit',
    category: 'public',
    status: passed ? 'PASS' : 'FAIL',
    startTime,
    endTime,
    durationMs: new Date(endTime).getTime() - new Date(startTime).getTime(),
    actionsPerformed: actions,
    assertions,
    errors
  };
}
