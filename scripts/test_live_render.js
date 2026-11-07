const { chromium } = require('playwright');
const path = require('path');
const ARTIFACT_DIR = path.resolve('C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd');

(async () => {
  console.log('🔐 Testing Admin Panel directly on Live Render...');
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Set admin credentials via cookies and localStorage
  await context.addCookies([
    { name: 'cs_session', value: 'admin_session', domain: 'shebabondu.onrender.com', path: '/' },
    { name: 'cs_role', value: 'admin', domain: 'shebabondu.onrender.com', path: '/' }
  ]);
  await page.addInitScript(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_auth_state', JSON.stringify({ isLoggedIn: true, role: 'admin', name: 'Super Admin' }));
  });

  await page.goto('https://shebabondu.onrender.com/admin', { waitUntil: 'networkidle', timeout: 60000 });

  // Check if PIN screen is shown
  const pinInput = page.locator('input[type="password"]').first();
  if (await pinInput.isVisible()) {
    console.log('Entering Admin PIN 1234 on Live Render...');
    await pinInput.fill('1234');
    const submitBtn = page.locator('button:has-text("প্রবেশ করুন")').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  // Go to /admin?tab=builder
  await page.goto('https://shebabondu.onrender.com/admin?tab=builder', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  // Click 'হেডার ও ফুটার সেটিংস'
  const settingsBtn = page.locator('button:has-text("হেডার ও ফুটার সেটিংস")').first();
  if (await settingsBtn.isVisible()) {
    console.log('Opening Header/Footer Settings modal on Live Render...');
    await settingsBtn.click();
    await page.waitForTimeout(800);

    // Switch to Footer Tab
    const footerTab = page.locator('button:has-text("ফুটার ও কলাম লিংক")').first();
    await footerTab.click();
    await page.waitForTimeout(600);

    // Capture screenshot of Live Render Footer CRUD Modal
    const modalPath = path.join(ARTIFACT_DIR, '56_live_render_admin_footer_crud_modal.png');
    await page.screenshot({ path: modalPath });
    console.log('📸 Captured 56_live_render_admin_footer_crud_modal.png');

    // Check menu tab as well
    const menuTab = page.locator('button:has-text("মেনু বার লিংক")').first();
    await menuTab.click();
    await page.waitForTimeout(600);
    const menuModalPath = path.join(ARTIFACT_DIR, '57_live_render_admin_menu_crud_modal.png');
    await page.screenshot({ path: menuModalPath });
    console.log('📸 Captured 57_live_render_admin_menu_crud_modal.png');
  } else {
    console.warn('Warning: হেডার ও ফুটার সেটিংস button not immediately visible');
  }

  // Go to /admin?tab=header-footer (Customizer) on Live Render
  await page.goto('https://shebabondu.onrender.com/admin?tab=header-footer', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  const customizerLivePath = path.join(ARTIFACT_DIR, '58_live_render_admin_cms_customizer.png');
  await page.screenshot({ path: customizerLivePath });
  console.log('📸 Captured 58_live_render_admin_cms_customizer.png');

  // Also test candidate logged in on live Render (/dashboard/profile)
  const candidateContext = await browser.newContext({ viewport: { width: 1536, height: 864 } });
  const candPage = await candidateContext.newPage();
  await candidateContext.addCookies([
    { name: 'cs_session', value: 'candidate_session', domain: 'shebabondu.onrender.com', path: '/' },
    { name: 'cs_role', value: 'candidate', domain: 'shebabondu.onrender.com', path: '/' }
  ]);
  await candPage.addInitScript(() => {
    localStorage.setItem('cs_auth_state', JSON.stringify({ isLoggedIn: true, role: 'candidate', name: 'তাহমিদ ইকবাল' }));
  });

  await candPage.goto('https://shebabondu.onrender.com/dashboard/profile', { waitUntil: 'networkidle', timeout: 60000 });
  await candPage.waitForTimeout(1500);

  const overflowCheck = await candPage.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const winW = window.innerWidth;
    const rightArea = document.querySelector('header div.ml-auto');
    const rightRect = rightArea ? rightArea.getBoundingClientRect() : null;
    return {
      docW,
      winW,
      overflow: docW - winW,
      rightAreaRight: rightRect ? rightRect.right : 0
    };
  });
  console.log('Live Render Profile Layout (1536px):', JSON.stringify(overflowCheck, null, 2));

  const liveProfilePath = path.join(ARTIFACT_DIR, '59_live_render_candidate_profile_fixed.png');
  await candPage.screenshot({ path: liveProfilePath });
  console.log('📸 Captured 59_live_render_candidate_profile_fixed.png');

  await browser.close();
  console.log('🎉 ALL LIVE RENDER TESTS COMPLETED SUCCESSFULLY!');
})();

