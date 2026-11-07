const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3000/register');
  const phone = '01799' + Math.floor(100000 + Math.random() * 900000);
  await page.fill('input[placeholder*="তানভীর"]', 'তানভীর আহমেদ');
  await page.fill('input[placeholder*="017"]', phone);
  await page.fill('input[placeholder*="ঢাকা"]', 'ঢাকা');
  await page.fill('input[type="password"]', 'Pass@2026Secure');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('URL after register:', page.url());
  const authData = await page.evaluate(() => localStorage.getItem('cs_auth_data'));
  console.log('localStorage cs_auth_data:', authData);

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const headerText = await page.locator('header').innerText();
  console.log('Header innerText:\n', headerText);

  await browser.close();
})();

