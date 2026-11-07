const { chromium } = require('playwright');
const path = require('path');
const ARTIFACT_DIR = path.resolve('C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Authenticate Admin via storage
  await page.goto('https://shebabondu.onrender.com/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_auth_state', JSON.stringify({ isLoggedIn: true, role: 'admin', name: 'Super Admin' }));
  });

  // Navigate to Builder directly
  await page.goto('https://shebabondu.onrender.com/admin?tab=builder', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Find 'হেডার ও ফুটার সেটিংস'
  const settingsBtn = page.locator('button:has-text("হেডার ও ফুটার সেটিংস")').first();
  await settingsBtn.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Found হেডার ও ফুটার সেটিংস button, clicking...');
  await settingsBtn.click();
  await page.waitForTimeout(1000);

  // Switch to Footer Tab
  const footerTab = page.locator('button:has-text("ফুটার ও কলাম লিংক")').first();
  await footerTab.click();
  await page.waitForTimeout(800);

  const modalPath = path.join(ARTIFACT_DIR, '56_live_render_admin_footer_crud_modal.png');
  await page.screenshot({ path: modalPath });
  console.log('📸 Captured 56_live_render_admin_footer_crud_modal.png');

  // Switch to Menu Tab
  const menuTab = page.locator('button:has-text("মেনু বার লিংক")').first();
  await menuTab.click();
  await page.waitForTimeout(800);
  const menuModalPath = path.join(ARTIFACT_DIR, '57_live_render_admin_menu_crud_modal.png');
  await page.screenshot({ path: menuModalPath });
  console.log('📸 Captured 57_live_render_admin_menu_crud_modal.png');

  await browser.close();
  console.log('✅ Live Render Builder Modal verified and captured!');
})();
