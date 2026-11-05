const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(process.cwd(), '.browser_profile', 'gemini_session');

(async () => {
  console.log('Launching browser with profile:', PROFILE_DIR);
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  console.log('Navigating to https://gemini.google.com/app...');
  await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const url = page.url();
  const title = await page.title();
  console.log('Current URL:', url);
  console.log('Page Title:', title);

  const screenshotPath = path.join(process.cwd(), 'gemini_current_screen.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  // Check if contenteditable editor is visible
  const editorCount = await page.locator('div[contenteditable="true"]').count();
  console.log('Editor elements found:', editorCount);

  // Check if sign-in button is visible
  const signInBtn = await page.locator('a[href*="accounts.google.com"], button:has-text("Sign in"), a:has-text("Sign in")').count();
  console.log('Sign in buttons found:', signInBtn);

  await context.close();
  console.log('Done.');
})().catch(err => {
  console.error('Error inspecting gemini:', err);
  process.exit(1);
});

