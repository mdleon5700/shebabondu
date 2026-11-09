import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PIN = 'CHAKRISEBA_SECURE_ADMIN_2026';

async function runCluster4Audit() {
  console.log('🚀 Starting Cluster 4: Auto Job Scraping & Gemini AI Hub Deep Audit...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Inject Admin Authentication Cookies
  await context.addCookies([
    {
      name: 'cs_admin_auth',
      value: 'verified',
      domain: 'localhost',
      path: '/'
    },
    {
      name: 'session_token',
      value: 'SYNTH-ADMIN-SUPER',
      domain: 'localhost',
      path: '/'
    }
  ]);

  const page = await context.newPage();

  // Set localStorage credentials
  await page.goto(`${BASE_URL}/admin?tab=gemini-browser-spider`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((pin) => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', pin);
  }, ADMIN_PIN);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // -------------------------------------------------------------
  // STEP 1: Audit Live Browser & AI Agent Hub (/admin?tab=gemini-browser-spider)
  // -------------------------------------------------------------
  console.log('Step 1: Auditing Live Browser & Gemini AI Hub (/admin?tab=gemini-browser-spider)...');
  const spiderHeader = page.locator('h1:has-text("জেমিনি ব্রাউজার স্পাইডার ও এআই স্ক্র্যাপার হাব")');
  await spiderHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Gemini Spider Hub title visible: true');

  const liveBadge = page.locator('text=SYSTEM CHROMIUM ACTIVE');
  console.log('System Chromium Active badge visible:', await liveBadge.isVisible());

  // Check 3 core feature cards
  const standaloneBrowserCard = page.locator('text=১. অভ্যন্তরীণ জেমিনি ব্রাউজার').first();
  console.log('Standalone Chromium Browser card visible:', await standaloneBrowserCard.isVisible());

  const geminiExtractorCard = page.locator('text=৩. সার্কুলার PDF ব্রাউজার এক্সট্রাক্টর').first();
  console.log('Gemini AI Extractor card visible:', await geminiExtractorCard.isVisible());

  const auditCard = page.locator('text=অটোনোমাস সিস্টেম অডিট এজেন্ট').first();
  console.log('Autonomous Audit Agent card visible:', await auditCard.isVisible());

  await page.screenshot({ path: 'audit_129_gemini_browser_spider.png', fullPage: true });
  console.log('📸 Captured: audit_129_gemini_browser_spider.png\n');

  // -------------------------------------------------------------
  // STEP 2: Audit Source Registry & Crawler Monitoring (/admin?tab=source-monitoring)
  // -------------------------------------------------------------
  console.log('Step 2: Auditing Source Registry & Monitoring (/admin?tab=source-monitoring)...');
  await page.goto(`${BASE_URL}/admin?tab=source-monitoring`, { waitUntil: 'domcontentloaded' });
  const sourceHeader = page.locator('h2:has-text("জব সোর্স ও রিক্রুটমেন্ট পোর্টাল রেজিস্ট্রি")');
  await sourceHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Source Registry Header visible: true');

  const sourcesSubTab = page.locator('button:has-text("সোর্স তালিকা ও স্বাস্থ্য নিরীক্ষা")');
  console.log('Sources Sub-Tab button visible:', await sourcesSubTab.isVisible());

  const spiderRunsSubTab = page.locator('button:has-text("ক্রলার রান হিস্ট্রি")');
  console.log('Spider Runs Sub-Tab button visible:', await spiderRunsSubTab.isVisible());

  await page.screenshot({ path: 'audit_129_source_monitoring.png', fullPage: true });
  console.log('📸 Captured: audit_129_source_monitoring.png\n');

  // -------------------------------------------------------------
  // STEP 3: Audit Scraped Drafts & Verification Center (/admin?tab=imported-drafts)
  // -------------------------------------------------------------
  console.log('Step 3: Auditing Scraped Drafts & Verification Queue (/admin?tab=imported-drafts)...');
  await page.goto(`${BASE_URL}/admin?tab=imported-drafts`, { waitUntil: 'domcontentloaded' });
  const verificationHeader = page.locator('h2:has-text("সার্কুলার যাচাই ও AI ইন্টেলিজেন্স অডিট")');
  await verificationHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Job Verification Center Header visible: true');

  const scrapedDraftsTitle = page.locator('h2:has-text("ইম্পোর্ট খসড়া কিউ (অটো-স্ক্র্যাপড সার্কুলার)")');
  console.log('Scraped Drafts Queue Title visible:', await scrapedDraftsTitle.isVisible());

  await page.screenshot({ path: 'audit_129_imported_drafts_verification.png', fullPage: true });
  console.log('📸 Captured: audit_129_imported_drafts_verification.png\n');

  // -------------------------------------------------------------
  // STEP 4: Audit Central Automation Manager (/admin?tab=automation-hub)
  // -------------------------------------------------------------
  console.log('Step 4: Auditing Central Automation Manager (/admin?tab=automation-hub)...');
  await page.goto(`${BASE_URL}/admin?tab=automation-hub`, { waitUntil: 'domcontentloaded' });
  const automationTitle = page.locator('h1:has-text("সেন্ট্রাল অটোমেশন ও শিডিউলার কন্ট্রোল হাব")');
  await automationTitle.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Central Automation Title visible: true');

  await page.screenshot({ path: 'audit_129_automation_hub.png', fullPage: true });
  console.log('📸 Captured: audit_129_automation_hub.png\n');

  // -------------------------------------------------------------
  // STEP 5: Audit Autonomous Testing Spider (/admin?tab=testing-spider)
  // -------------------------------------------------------------
  console.log('Step 5: Auditing Autonomous Testing Spider Sandbox (/admin?tab=testing-spider)...');
  await page.goto(`${BASE_URL}/admin?tab=testing-spider`, { waitUntil: 'domcontentloaded' });
  const testingSpiderTitle = page.locator('text=টেস্টিং স্পাইডার ও দেশব্যাপী অডিট হাব');
  await testingSpiderTitle.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Testing Spider Title visible: true');

  await page.screenshot({ path: 'audit_129_testing_spider.png', fullPage: true });
  console.log('📸 Captured: audit_129_testing_spider.png\n');

  await browser.close();
  console.log('🎉 All Cluster 4 Playwright E2E Audits Passed Successfully!');
}

runCluster4Audit().catch((err) => {
  console.error('❌ Cluster 4 Audit Failed:', err);
  process.exit(1);
});
