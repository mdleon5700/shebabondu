const { chromium } = require('@playwright/test');

(async () => {
  const artifactDir = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000/admin?tab=builder', { waitUntil: 'networkidle' });
  
  // Fill admin password if locked
  const pass = await page.$('input[type="password"]');
  if (pass) {
    await pass.fill('1234');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    else await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: artifactDir + '/05_live_admin_builder_workspace.png' });
  console.log('5. Admin Builder captured successfully!');
  await browser.close();
})();
