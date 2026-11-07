const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(process.cwd(), '.browser_profile', 'gemini_session');

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = await context.newPage();
  await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const uploadBtn = page.locator('button[aria-label="Upload & tools"]').first();
  await uploadBtn.click();
  await page.waitForTimeout(1000);

  const menuItems = await page.$$eval('[role="menuitem"], button, input[type="file"]', els => els.map(e => ({
    tag: e.tagName,
    type: e.getAttribute('type'),
    text: e.innerText,
    ariaLabel: e.getAttribute('aria-label')
  })).filter(x => x.text || x.ariaLabel || x.type === 'file'));
  console.log('Menu items after clicking Upload & tools:', menuItems);

  const fileInputAfter = await page.$$eval('input[type="file"]', els => els.map(e => ({
    name: e.name,
    id: e.id,
    accept: e.accept
  })));
  console.log('File input after click:', fileInputAfter);

  await context.close();
})();
