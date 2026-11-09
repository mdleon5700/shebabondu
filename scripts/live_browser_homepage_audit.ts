import { chromium } from 'playwright';
import path from 'path';

async function runHomepageAudit() {
  console.log('Launching Chromium for Deep Live Homepage Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const artifactDir = path.resolve('C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd');

  console.log('1. Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 1. Initial Homepage Screenshot
  console.log('2. Verifying Hero Section & Top Bar...');
  await page.screenshot({ path: path.join(artifactDir, 'audit_01_homepage_hero.png'), fullPage: false });

  // 2. Test Advanced Filter Toggle in Search Section
  console.log('3. Testing Advanced Filter Toggle...');
  const advToggleBtn = page.locator('button:has-text("উন্নত ফিল্টার")');
  await advToggleBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'audit_02_advanced_filters_open.png'), fullPage: false });

  // 3. Test Status Metric Cards
  console.log('4. Testing Status Metric Cards (আবেদন চলছে)...');
  const ongoingCard = page.locator('button:has-text("আবেদন চলছে")').first();
  await ongoingCard.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, 'audit_03_status_card_filtered.png'), fullPage: false });

  // 4. Test Eligibility Matcher Tool
  console.log('5. Testing Eligibility Matcher Tool...');
  const matcherBtn = page.locator('button:has-text("যোগ্যতা ফিল্টার চালু করুন")').first();
  if (await matcherBtn.isVisible()) {
    await matcherBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'audit_04_eligibility_matcher_active.png'), fullPage: false });
  }

  // 5. Test Category Carousel Pill (রেলওয়ে / ব্যাংক)
  console.log('6. Testing Category Carousel Pills...');
  const railwayCatBtn = page.locator('button:has-text("রেলওয়ে")').first();
  if (await railwayCatBtn.isVisible()) {
    await railwayCatBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, 'audit_05_category_railway_jobs.png'), fullPage: false });
  }

  // 6. Test Position Accordion on Job Card
  console.log('7. Testing Multi-Position Accordion Drawer...');
  // Click reset to show all jobs
  const allCatBtn = page.locator('button:has-text("সকল চাকরি")').first();
  await allCatBtn.click();
  await page.waitForTimeout(600);

  const positionAccordionBtn = page.locator('button:has-text("পদসমূহের তালিকা")').first();
  if (await positionAccordionBtn.isVisible()) {
    await positionAccordionBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, 'audit_06_positions_drawer_expanded.png'), fullPage: false });
  }

  // 7. Test Pagination (Next Page / Page 2)
  console.log('8. Testing Pagination Controls...');
  const nextBtn = page.locator('button:has-text("পরবর্তী")').first();
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, 'audit_07_pagination_page_2.png'), fullPage: false });
  }

  // 8. Test FAQ Accordion
  console.log('9. Testing FAQ Accordion Toggle...');
  const faqHeader = page.locator('#faq-section button').nth(1);
  if (await faqHeader.isVisible()) {
    await faqHeader.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, 'audit_08_faq_accordion_open.png'), fullPage: false });
  }

  console.log('\n================================================================');
  console.log('LIVE BROWSER AUDIT COMPLETED SUCCESSFULLY!');
  console.log('Total Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors);
  }
  console.log('================================================================');

  await browser.close();
}

runHomepageAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});

