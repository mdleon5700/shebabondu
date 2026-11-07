const { chromium } = require('playwright');

async function checkBody() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'networkidle' });
  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.count() > 0) {
    await pinInput.fill('1234');
    await page.locator('button:has-text("কনসোলে প্রবেশ করুন")').click();
    await page.waitForTimeout(2000);
  }
  const fullText = await page.evaluate(() => document.body.innerText);
  console.log('FULL TEXT:\n', fullText);
  await browser.close();
}

checkBody();

