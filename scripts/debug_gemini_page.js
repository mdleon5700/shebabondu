const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(process.cwd(), '.browser_profile', 'gemini_session');

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const editor = page.locator('div[contenteditable="true"]').first();
  await editor.click();
  await editor.fill('Write a short 1-line poem about rain.');
  await page.keyboard.press('Enter');
  
  // Wait 6 seconds
  await page.waitForTimeout(6000);

  const screenshotPath = path.join(process.cwd(), 'gemini_debug.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved debug screenshot:', screenshotPath);

  const allText = await page.innerText('body');
  console.log('Text length:', allText.length);
  console.log('Sample text:', allText.slice(0, 400));

  await context.close();
})();

