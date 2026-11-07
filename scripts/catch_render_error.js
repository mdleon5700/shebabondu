const { chromium } = require('playwright');

async function catchError() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1536, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_is_admin', 'true');
  });

  const page = await context.newPage();
  page.on('pageerror', err => {
    console.error('=== PAGE ERROR CAUGHT ===');
    console.error(err.message);
    console.error(err.stack);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
    }
  });

  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const editBtn = page.locator('button:has-text("সম্পাদনা")').first();
  await editBtn.click();
  await page.waitForTimeout(3000);

  await browser.close();
}

catchError();

