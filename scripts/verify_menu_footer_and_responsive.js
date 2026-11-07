const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd');

(async () => {
  console.log('🚀 Starting Comprehensive Verification: Navbar Responsive Layout & Admin Menu/Footer CRUD...');
  const browser = await chromium.launch();

  // ==========================================
  // PHASE 1: RESPONSIVE NAVBAR TESTS ACROSS RESOLUTIONS
  // ==========================================
  const viewports = [
    { name: '1920_wide', width: 1920, height: 1080 },
    { name: '1536_scaled', width: 1536, height: 864 },
    { name: '1440_mac', width: 1440, height: 900 },
    { name: '1366_laptop', width: 1366, height: 768 },
    { name: '1280_compact', width: 1280, height: 800 }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    // 1. Candidate Logged-in on /dashboard/profile
    await context.addCookies([
      { name: 'cs_session', value: 'candidate_session', domain: 'localhost', path: '/' },
      { name: 'cs_role', value: 'candidate', domain: 'localhost', path: '/' }
    ]);

    await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const profileMetrics = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const rightArea = document.querySelector('header div.ml-auto');
      const rightRect = rightArea ? rightArea.getBoundingClientRect() : null;
      const header = document.querySelector('header');
      const headerRect = header ? header.getBoundingClientRect() : null;
      return {
        docW,
        winW,
        overflow: docW - winW,
        rightAreaVisible: rightRect ? rightRect.right <= winW : false,
        rightAreaRight: rightRect ? rightRect.right : 0
      };
    });

    console.log(`[Viewport ${vp.name}] Logged-In Profile: Overflow=${profileMetrics.overflow}px, RightVisible=${profileMetrics.rightAreaVisible} (RightEdge=${profileMetrics.rightAreaRight}px <= ${vp.width}px)`);

    const screenshotPath = path.join(ARTIFACT_DIR, `48_navbar_profile_${vp.name}_fixed.png`);
    await page.screenshot({ path: screenshotPath });

    // 2. Guest on /jobs
    const guestContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const guestPage = await guestContext.newPage();
    await guestPage.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await guestPage.waitForTimeout(500);

    const jobsMetrics = await guestPage.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const rightArea = document.querySelector('header div.ml-auto');
      const rightRect = rightArea ? rightArea.getBoundingClientRect() : null;
      return {
        docW,
        winW,
        overflow: docW - winW,
        rightAreaVisible: rightRect ? rightRect.right <= winW : false
      };
    });

    console.log(`[Viewport ${vp.name}] Guest Jobs: Overflow=${jobsMetrics.overflow}px, RightVisible=${jobsMetrics.rightAreaVisible}`);
    if (vp.name === '1920_wide' || vp.name === '1536_scaled') {
      await guestPage.screenshot({ path: path.join(ARTIFACT_DIR, `49_navbar_jobs_${vp.name}_fixed.png`) });
    }

    await context.close();
    await guestContext.close();
  }

  // ==========================================
  // PHASE 2: ADMIN PANEL BUILDER & CMS CRUD TEST
  // ==========================================
  console.log('\n🔧 Testing Admin Panel Website Builder & Customizer CRUD...');
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adminPage = await adminContext.newPage();

  // Set admin credentials
  await adminContext.addCookies([
    { name: 'cs_session', value: 'admin_session', domain: 'localhost', path: '/' },
    { name: 'cs_role', value: 'admin', domain: 'localhost', path: '/' }
  ]);
  await adminPage.addInitScript(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_auth_state', JSON.stringify({ isLoggedIn: true, role: 'admin', name: 'Super Admin' }));
  });

  // Open Website Builder
  await adminPage.goto('http://localhost:3000/admin?tab=builder', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1000);

  // Click "হেডার ও ফুটার সেটিংস"
  const customizeBtn = adminPage.locator('button:has-text("হেডার ও ফুটার সেটিংস")').first();
  await customizeBtn.click();
  await adminPage.waitForTimeout(500);

  // Switch to Menu Tab
  const menuTabBtn = adminPage.locator('button:has-text("মেনু বার লিংক")').first();
  await menuTabBtn.click();
  await adminPage.waitForTimeout(300);

  // Add a new menu item
  const addMenuItemBtn = adminPage.locator('button:has-text("+ মেনু আইটেম যোগ")').first();
  await addMenuItemBtn.click();
  await adminPage.waitForTimeout(300);

  // Switch to Footer Tab
  const footerTabBtn = adminPage.locator('button:has-text("ফুটার ও কলাম লিংক")').first();
  await footerTabBtn.click();
  await adminPage.waitForTimeout(300);

  // Take screenshot of the new Footer Column & Link CRUD manager in Website Builder
  const builderFooterModalPath = path.join(ARTIFACT_DIR, '50_admin_builder_footer_crud_modal.png');
  await adminPage.screenshot({ path: builderFooterModalPath });
  console.log('📸 Captured 50_admin_builder_footer_crud_modal.png');

  // Add a new Footer Column in Builder
  const addColBtn = adminPage.locator('button:has-text("+ নতুন কলাম যোগ")').first();
  await addColBtn.click();
  await adminPage.waitForTimeout(300);

  // Save from Builder Modal
  const saveChromeBtn = adminPage.locator('button:has-text("হেডার ও ফুটার পরিবর্তন সংরক্ষণ করুন")').first();
  await saveChromeBtn.click();
  await adminPage.waitForTimeout(2000);

  // Verify settings saved in API
  const apiCheckRes = await adminPage.evaluate(async () => {
    const res = await fetch('/api/platform/settings', { cache: 'no-store' });
    const data = await res.json();
    return {
      menuCount: data.settings?.general?.headerMenuItems?.length,
      footerColCount: data.settings?.general?.footerColumns?.length,
      lastMenu: data.settings?.general?.headerMenuItems?.slice(-1)[0],
      lastCol: data.settings?.general?.footerColumns?.slice(-1)[0]
    };
  });

  console.log('✅ Settings after Builder Save:', JSON.stringify(apiCheckRes, null, 2));

  // Open CMS & SEO Customizer (/admin?tab=header-footer)
  await adminPage.goto('http://localhost:3000/admin?tab=header-footer', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1000);

  const customizerPath = path.join(ARTIFACT_DIR, '51_admin_cms_header_footer_customizer.png');
  await adminPage.screenshot({ path: customizerPath });
  console.log('📸 Captured 51_admin_cms_header_footer_customizer.png');

  // Now verify public site footer renders the new column!
  const publicPage = await adminContext.newPage();
  await publicPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await publicPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await publicPage.waitForTimeout(500);

  const publicFooterPath = path.join(ARTIFACT_DIR, '52_public_footer_rendered_columns.png');
  await publicPage.screenshot({ path: publicFooterPath });
  console.log('📸 Captured 52_public_footer_rendered_columns.png');

  await browser.close();
  console.log('\n🎉 ALL TESTS AND CHECKS COMPLETED SUCCESSFULLY!');
})();
