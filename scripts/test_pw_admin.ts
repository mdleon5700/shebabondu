import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const pwInput = page.locator('input[type="password"]');
  const count = await pwInput.count();
  console.log('Password input count:', count);

  if (count > 0) {
    await pwInput.first().fill('CHAKRISEBA_SECURE_ADMIN_2026');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);
    const bodyText = await page.innerText('body');
    console.log('Unlocked text contains ড্যাশবোর্ড:', bodyText.includes('ড্যাশবোর্ড'));
  }

  await browser.close();
})();