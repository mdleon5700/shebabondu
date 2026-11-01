import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  console.log('Filling credentials...');
  await page.locator('input[placeholder*="017XXXXXXXX"], form input[type="text"]').first().fill('01889100001');
  await page.locator('input[type="password"]').first().fill('SynthPass2026!');
  await page.locator('button[type="submit"]:has-text("লগইন করুন")').first().click();
  await page.waitForTimeout(2000);

  console.log('Post-login URL:', page.url());

  console.log('Navigating to /dashboard/profile...');
  await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const text = await page.innerText('body');
  console.log('Text snippet:', text.slice(0, 300).replace(/\n/g, ' '));
  console.log('Has Ashiqur?', text.includes('Ashiqur') || text.includes('আশিকুর'));
  console.log('Has Dhaka?', text.includes('Dhaka') || text.includes('ঢাকা') || text.includes('DHAKA'));

  const inputValues = await page.locator('input').evaluateAll(els => els.map((e: any) => e.value).filter(v => v && v.length > 0));
  console.log('Non-empty input values found on profile:', inputValues);

  await browser.close();
})();