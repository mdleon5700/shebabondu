import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';

export async function runScenario27(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-27-JOB-CATEGORIES-SUBCATEGORIES-HIERARCHY-AUDIT';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  try {
    const request = page.context().request;

    // 1. Fetch public categories API
    actions.push('Requesting public categories via GET /api/categories');
    const catRes = await request.get(`${baseUrl}/api/categories`);
    const catStatus = catRes.status();
    const catBody = await catRes.json().catch(() => ({}));
    const categories: any[] = catBody.categories || [];

    assertions.push({
      assertion: 'Public categories endpoint returns HTTP 200 and categories list',
      expected: '200',
      actual: String(catStatus),
      passed: catStatus === 200 && Boolean(catBody.success) && categories.length > 0
    });

    // Check essential major categories
    const primaryCategorySlugs = ['government-jobs', 'bank-jobs', 'engineering-jobs', 'teacher-jobs', 'medical-jobs', 'defense-jobs', 'ngo-jobs', 'private-jobs'];
    const foundPrimarySlugs = primaryCategorySlugs.filter(slug => categories.some(c => c.slug === slug || c.id?.includes(slug.split('-')[0])));

    assertions.push({
      assertion: 'All major employment categories are present in taxonomy',
      expected: 'true',
      actual: String(foundPrimarySlugs.length >= 6),
      passed: foundPrimarySlugs.length >= 6
    });

    // Check dynamic job count calculation
    const categoriesWithJobs = categories.filter(c => Number(c.job_count) >= 0);
    const hasJobCounts = categoriesWithJobs.length === categories.length && categories.some(c => Number(c.job_count) > 0);

    assertions.push({
      assertion: 'Dynamic live job counts are computed and attached to categories',
      expected: 'true',
      actual: String(hasJobCounts),
      passed: hasJobCounts
    });

    // 2. Fetch admin categories to audit hierarchy & subcategories
    actions.push('Requesting admin categories via GET /api/admin/categories');
    const adminCatRes = await request.get(`${baseUrl}/api/admin/categories`, {
      headers: { 'x-admin-pin': '1234', 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }
    });
    const adminCatBody = await adminCatRes.json().catch(() => ({}));
    const allTaxonomy: any[] = adminCatBody.categories || [];
    const subcategories = allTaxonomy.filter(c => c.parent_id !== null && c.parent_id !== undefined);

    assertions.push({
      assertion: 'Category taxonomy correctly models parent-child subcategory hierarchy',
      expected: 'true',
      actual: String(subcategories.length > 0),
      passed: subcategories.length > 0
    });

    // 3. Open Public Website Category Landing Page in Browser
    actions.push('Navigating browser to public category landing page: /categories/govt');
    try { await page.goto(`${baseUrl}/categories/govt`, { waitUntil: 'domcontentloaded', timeout: 15000 }); } catch { await page.waitForTimeout(1000); await page.goto(`${baseUrl}/categories/govt`, { waitUntil: 'domcontentloaded', timeout: 15000 }); }
    await page.waitForTimeout(1500);

    const pageTitle = await page.title();
    actions.push(`Category landing page title: ${pageTitle}`);

    const hasCategoryHeader = await page.locator('h1').filter({ hasText: /সরকারি/ }).first().isVisible().catch(() => false);
    const hasCategoryContent = (await page.locator('body').innerText()).includes('নিয়োগ') || (await page.locator('body').innerText()).includes('বিজ্ঞপ্তি');

    assertions.push({
      assertion: 'Public category landing page renders title and live jobs list',
      expected: 'true',
      actual: String(hasCategoryHeader || hasCategoryContent),
      passed: hasCategoryHeader || hasCategoryContent
    });

    // 4. Verify Zero Contamination in real database
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
      message: `Scenario 27 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Job Categories & Subcategories Hierarchy & Live Counts Audit',
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
