import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PIN = 'CHAKRISEBA_SECURE_ADMIN_2026';

async function runCluster7Audit() {
  console.log('🚀 Starting Cluster 7: Website CMS, Visual Page Builder & Content Studio Deep Audit...\n');

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
  await page.goto(`${BASE_URL}/admin?tab=builder`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((pin) => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', pin);
  }, ADMIN_PIN);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // -------------------------------------------------------------
  // STEP 1: Audit Visual Drag-and-Drop Page Builder (/admin?tab=builder)
  // -------------------------------------------------------------
  console.log('Step 1: Auditing Visual Drag-and-Drop Page Builder (/admin?tab=builder)...');
  const desktopBtn = page.locator('button:has-text("ডেস্কটপ")').first();
  await desktopBtn.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Page Builder Desktop viewport control visible: true');

  const newPageBtn = page.locator('button:has-text("নতুন পৃষ্ঠা")').first();
  await newPageBtn.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Page Builder New Page button visible: true');

  await page.screenshot({ path: 'audit_131_visual_page_builder.png', fullPage: false });
  console.log('📸 Captured: audit_131_visual_page_builder.png\n');

  // -------------------------------------------------------------
  // STEP 2: Audit Content Studio (/admin?tab=content-studio)
  // -------------------------------------------------------------
  console.log('Step 2: Auditing Job Content Studio (/admin?tab=content-studio)...');
  await page.goto(`${BASE_URL}/admin?tab=content-studio`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const studioTitle = page.locator('text=কন্টেন্ট ও এসইও স্টুডিও').or(page.locator('text=এসইও অপটিমাইজেশন স্কোর')).first();
  await studioTitle.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Job Content Studio SEO score and workspace visible: true');

  await page.screenshot({ path: 'audit_131_job_content_studio.png', fullPage: false });
  console.log('📸 Captured: audit_131_job_content_studio.png\n');

  // -------------------------------------------------------------
  // STEP 3: Audit CMS Pages & Sections Management (/admin?tab=pages-sections)
  // -------------------------------------------------------------
  console.log('Step 3: Auditing CMS Pages & Sections Management (/admin?tab=pages-sections)...');
  await page.goto(`${BASE_URL}/admin?tab=pages-sections`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const pagesTableTitle = page.locator('text=পেইজ ও সেকশন ম্যানেজমেন্ট').or(page.locator('text=সব পেজের তালিকা')).first();
  await pagesTableTitle.waitFor({ state: 'visible', timeout: 15000 });
  console.log('CMS Pages & Sections table visible: true');

  const addPageBtn = page.locator('button:has-text("নতুন পেইজ তৈরি")');
  await addPageBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Add New Page button visible: true');

  await page.screenshot({ path: 'audit_131_cms_pages_and_sections.png', fullPage: true });
  console.log('📸 Captured: audit_131_cms_pages_and_sections.png\n');

  // -------------------------------------------------------------
  // STEP 4: Audit Header & Footer Theme Customizer (/admin?tab=header-footer)
  // -------------------------------------------------------------
  console.log('Step 4: Auditing Header & Footer Theme Customizer (/admin?tab=header-footer)...');
  await page.goto(`${BASE_URL}/admin?tab=header-footer`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const headerFooterTitle = page.locator('text=সাইট পরিচিতি ও হেডার লোগো').first();
  await headerFooterTitle.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Header & Footer Customizer visible: true');

  const hotlineTitle = page.locator('text=সরকারি জরুরি হটলাইন ও নাগরিক সেবা (৩৩৩, ৯৯৯)').first();
  await hotlineTitle.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Emergency Hotlines (333, 999) configuration visible: true');

  await page.screenshot({ path: 'audit_131_header_footer_customizer.png', fullPage: true });
  console.log('📸 Captured: audit_131_header_footer_customizer.png\n');

  // -------------------------------------------------------------
  // STEP 5: Audit Meta & Schema Markup Inspector (/admin?tab=seo-meta)
  // -------------------------------------------------------------
  console.log('Step 5: Auditing Meta & Schema Markup Inspector (/admin?tab=seo-meta)...');
  await page.goto(`${BASE_URL}/admin?tab=seo-meta`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const seoTitle = page.locator('text=গ্লোবাল মেটাডাটা ও সার্চ ইঞ্জিন অপটিমাইজেশন').first();
  await seoTitle.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Global SEO Meta Header visible: true');

  const schemaTitle = page.locator('text=Google JobPosting স্কিমা মার্কআপ (JSON-LD)').first();
  await schemaTitle.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Google JobPosting Schema Markup Inspector visible: true');

  await page.screenshot({ path: 'audit_131_seo_and_schema_markup.png', fullPage: true });
  console.log('📸 Captured: audit_131_seo_and_schema_markup.png\n');

  await browser.close();
  console.log('🎉 All Cluster 7 Playwright E2E Audits Passed Successfully!');
}

runCluster7Audit().catch((err) => {
  console.error('❌ Cluster 7 Audit Failed:', err);
  process.exit(1);
});
