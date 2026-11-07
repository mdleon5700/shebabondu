const { chromium } = require('@playwright/test');

(async () => {
  const artifactDir = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/admin?tab=builder', { waitUntil: 'networkidle' });
  const pass = await page.$('input[type="password"]');
  if (pass) {
    await pass.fill('1234');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  // 1. Capture Header & Footer modal opened
  const chromeBtn = page.locator('button:has-text("হেডার ও ফুটার সেটিংস")').first();
  if (await chromeBtn.isVisible()) {
    await chromeBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: artifactDir + '/07_admin_chrome_settings_modal.png' });
    const closeBtn = page.locator('button:has-text("বাতিল"), button:has-text("✕")').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // 2. Capture Real Live View iframe
  const liveBtn = page.locator('button:has-text("রিয়েল লাইভ ভিউ")').first();
  if (await liveBtn.isVisible()) {
    await liveBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: artifactDir + '/08_admin_real_live_view.png' });
  }

  await browser.close();
  console.log('Screenshots captured successfully!');
})();

