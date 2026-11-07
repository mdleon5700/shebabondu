const { chromium } = require('playwright');
const path = require('path');
const profileDir = path.join(process.cwd(), '.browser_profile', 'gemini_session');

(async () => {
  try {
    const context = await chromium.launchPersistentContext(profileDir, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
    const page = await context.newPage();
    console.log('Navigating to gemini.google.com/app...');
    await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3000);
    const screenshotPath = 'gemini_live_check.png';
    await page.screenshot({ path: screenshotPath });
    console.log('Screenshot saved to:', screenshotPath);
    console.log('Page Title:', await page.title());
    console.log('Page URL:', page.url());

    const hasSignInBtn = await page.locator('text=Sign in').count();
    const hasEditor = await page.locator('div[contenteditable="true"]').count();
    console.log('Has Sign In button count:', hasSignInBtn);
    console.log('Has Chat Editor count:', hasEditor);
    await context.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();

