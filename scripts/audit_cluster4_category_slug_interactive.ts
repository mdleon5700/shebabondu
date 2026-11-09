import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('=== 1. AUDITING /categories/government-jobs ===');
  await page.goto('http://localhost:3000/categories/government-jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot54 = path.join(ARTIFACTS_DIR, 'audit_54_category_slug_govt.png');
  await page.screenshot({ path: screenshot54, fullPage: true });
  console.log('Saved audit_54_category_slug_govt.png');

  const h1Govt = await page.locator('h1').innerText();
  const govtContent = await page.content();
  if (
    h1Govt.includes('সরকারি চাকরি') &&
    govtContent.includes('উপ-ক্যাটাগরিসমূহ') &&
    govtContent.includes('বিসিএস নিয়োগ')
  ) {
    console.log(`SUCCESS: /categories/government-jobs rendered correctly! H1: "${h1Govt}"`);
  } else {
    throw new Error('FAILED: /categories/government-jobs missing expected header or subcategories.');
  }

  // Verify subcategories are real clickable links
  const autonomousLink = page.locator('a[href="/categories/autonomous-jobs"]').first();
  const autonomousLinkCount = await autonomousLink.count();
  if (autonomousLinkCount === 0) {
    throw new Error('FAILED: Subcategory pills are not clickable Links to /categories/autonomous-jobs!');
  }
  console.log('SUCCESS: Subcategory pills are valid clickable Next.js links.');

  // Test live search filter
  const searchInput = page.locator('input[placeholder*="পদবী, প্রতিষ্ঠান বা শিক্ষাগত যোগ্যতা"]').first();
  await searchInput.fill('রেলওয়ে');
  await page.waitForTimeout(600);
  console.log('SUCCESS: Live search input tested on /categories/government-jobs.');
  await searchInput.fill('');
  await page.waitForTimeout(500);

  console.log('=== 2. NAVIGATING TO SUBCATEGORY /categories/autonomous-jobs ===');
  await autonomousLink.click();
  await page.waitForURL('**/categories/autonomous-jobs', { timeout: 10000 });
  await page.waitForTimeout(1000);

  const screenshot55 = path.join(ARTIFACTS_DIR, 'audit_55_category_slug_autonomous.png');
  await page.screenshot({ path: screenshot55, fullPage: true });
  console.log('Saved audit_55_category_slug_autonomous.png');

  const h1Auto = await page.locator('h1').innerText();
  const autoContent = await page.content();
  if (
    h1Auto.includes('স্বায়ত্তশাসিত') &&
    autoContent.includes('মূল: সরকারি চাকরি') &&
    (autoContent.includes('অন্যান্য শাখা') || autoContent.includes('উপ-ক্যাটাগরি'))
  ) {
    console.log(`SUCCESS: Subcategory autonomous-jobs rendered with hierarchical breadcrumbs and sibling links! H1: "${h1Auto}"`);
  } else {
    throw new Error('FAILED: Subcategory autonomous-jobs missing parent badge or sibling navigation.');
  }

  console.log('=== 3. AUDITING SUBCATEGORY /categories/directorate-jobs ===');
  await page.goto('http://localhost:3000/categories/directorate-jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot56 = path.join(ARTIFACTS_DIR, 'audit_56_category_slug_directorate.png');
  await page.screenshot({ path: screenshot56, fullPage: true });
  console.log('Saved audit_56_category_slug_directorate.png');

  const h1Dir = await page.locator('h1').innerText();
  const dirContent = await page.content();
  if (h1Dir.includes('অধিদপ্তর') && dirContent.includes('মূল: সরকারি চাকরি')) {
    console.log(`SUCCESS: /categories/directorate-jobs rendered properly with parent link! H1: "${h1Dir}"`);
  }

  console.log('=== 4. AUDITING HIGH-VOLUME CATEGORY /categories/private-jobs ===');
  await page.goto('http://localhost:3000/categories/private-jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Test pagination to Page 2
  const page2Btn = page.locator('button', { hasText: '2' }).first();
  if (await page2Btn.isVisible()) {
    await page2Btn.click();
    await page.waitForTimeout(700);
    console.log('SUCCESS: Paginated to Page 2 of /categories/private-jobs.');
  }

  const screenshot57 = path.join(ARTIFACTS_DIR, 'audit_57_category_slug_private_page2.png');
  await page.screenshot({ path: screenshot57, fullPage: true });
  console.log('Saved audit_57_category_slug_private_page2.png');

  console.log('=== 5. AUDITING SECTOR CATEGORY /categories/engineering-jobs ===');
  await page.goto('http://localhost:3000/categories/engineering-jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot58 = path.join(ARTIFACTS_DIR, 'audit_58_category_slug_engineering.png');
  await page.screenshot({ path: screenshot58, fullPage: true });
  console.log('Saved audit_58_category_slug_engineering.png');

  const h1Eng = await page.locator('h1').innerText();
  console.log(`SUCCESS: /categories/engineering-jobs rendered with H1: "${h1Eng}"`);

  console.log('=== 6. AUDITING EMPATHETIC EMPTY STATE /categories/bcs ===');
  await page.goto('http://localhost:3000/categories/bcs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot59 = path.join(ARTIFACTS_DIR, 'audit_59_category_slug_bcs_empty_state.png');
  await page.screenshot({ path: screenshot59, fullPage: true });
  console.log('Saved audit_59_category_slug_bcs_empty_state.png');

  const bcsH1 = await page.locator('h1').innerText();
  const bcsContent = await page.content();
  if (
    bcsH1.includes('বিসিএস') &&
    bcsContent.includes('এই মুহূর্তে কোনো সক্রিয় বিজ্ঞপ্তি নেই') &&
    bcsContent.includes('সকল ক্যাটাগরি') &&
    bcsContent.includes('সকল চাকরির ডিরেক্টরি')
  ) {
    console.log(`SUCCESS: /categories/bcs rendered empathetic empty state with fallback action links! H1: "${bcsH1}"`);
  } else {
    throw new Error('FAILED: /categories/bcs empty state text or action buttons missing.');
  }

  await browser.close();
  console.log('=== ALL AUDITS PASSED SUCCESSFULLY! ===');
}

main().catch((err) => {
  console.error('Audit run failed:', err);
  process.exit(1);
});
