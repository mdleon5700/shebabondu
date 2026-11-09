import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('=== 1. AUDITING /categories ===');
  await page.goto('http://localhost:3000/categories', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot49 = path.join(ARTIFACTS_DIR, 'audit_49_categories_directory_full.png');
  await page.screenshot({ path: screenshot49, fullPage: true });
  console.log('Saved audit_49_categories_directory_full.png');

  const content1 = await page.content();
  if (
    content1.includes('সকল চাকরির ক্যাটাগরি ও নিয়োগ সেক্টরসমূহ') &&
    content1.includes('৭টি বিশেষায়িত সাব-ক্যাটাগরি') &&
    content1.includes('২০টি মূল নিয়োগ সেক্টর')
  ) {
    console.log('SUCCESS: /categories rendered with 20 root categories + 7 sub-categories!');
  } else {
    throw new Error('FAILED: /categories missing root or subcategory sections.');
  }

  console.log('=== 2. TESTING SEARCH ON /categories ===');
  const searchInput = page.locator('input[placeholder*="ক্যাটাগরি বা পেশা খুঁজুন"]').first();
  await searchInput.fill('ব্যাংক');
  await page.waitForTimeout(500);

  const screenshot50 = path.join(ARTIFACTS_DIR, 'audit_50_categories_search_filter.png');
  await page.screenshot({ path: screenshot50, fullPage: true });
  console.log('Saved audit_50_categories_search_filter.png');

  const content2 = await page.content();
  if (content2.includes('ব্যাংক চাকরি') && content2.includes('বাংলাদেশ ব্যাংক নিয়োগ')) {
    console.log('SUCCESS: Search filter on /categories successfully filtered bank categories!');
  } else {
    throw new Error('FAILED: Search filter failed on /categories.');
  }

  // Clear search
  await searchInput.fill('');
  await page.waitForTimeout(400);

  console.log('=== 3. TESTING TABS ON /categories ===');
  const subsTab = page.locator('button', { hasText: 'বিশেষায়িত সাব-ক্যাটাগরি' }).first();
  await subsTab.click();
  await page.waitForTimeout(500);

  const screenshot51 = path.join(ARTIFACTS_DIR, 'audit_51_categories_subcategories_tab.png');
  await page.screenshot({ path: screenshot51, fullPage: true });
  console.log('Saved audit_51_categories_subcategories_tab.png');

  console.log('=== 4. AUDITING /job-categories ===');
  await page.goto('http://localhost:3000/job-categories', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot52 = path.join(ARTIFACTS_DIR, 'audit_52_job_categories_page.png');
  await page.screenshot({ path: screenshot52, fullPage: true });
  console.log('Saved audit_52_job_categories_page.png');

  const content3 = await page.content();
  if (
    content3.includes('সকল চাকরির ক্যাটাগরি ও নিয়োগ সেক্টরসমূহ') &&
    content3.includes('৭টি বিশেষায়িত সাব-ক্যাটাগরি') &&
    content3.includes('২০টি মূল নিয়োগ সেক্টর')
  ) {
    console.log('SUCCESS: /job-categories synchronized with 20 root + 7 sub-categories!');
  } else {
    throw new Error('FAILED: /job-categories missing expected elements.');
  }

  console.log('=== 5. AUDITING SUBCATEGORY LANDING PAGE /categories/autonomous-jobs ===');
  await page.goto('http://localhost:3000/categories/autonomous-jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot53 = path.join(ARTIFACTS_DIR, 'audit_53_subcategory_jobs_landing.png');
  await page.screenshot({ path: screenshot53, fullPage: true });
  console.log('Saved audit_53_subcategory_jobs_landing.png');

  const content4 = await page.content();
  if (content4.includes('স্বায়ত্তশাসিত ও রাষ্ট্রীয় প্রতিষ্ঠান') && content4.includes('আবেদন করুন')) {
    console.log('SUCCESS: Subcategory landing page /categories/autonomous-jobs rendered matching jobs with apply buttons!');
  } else {
    throw new Error('FAILED: Subcategory landing page /categories/autonomous-jobs did not render jobs.');
  }

  await browser.close();
  console.log('=== ALL AUDIT CHECKS PASSED FOR CLUSTER 4 SECTION 1! ===');
}

main().catch(err => {
  console.error('CLUSTER 4 AUDIT ERROR:', err);
  process.exit(1);
});
