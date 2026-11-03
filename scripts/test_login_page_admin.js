const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.goto('https://shebabondu.onrender.com/login', { waitUntil: 'networkidle' });

  console.log('Testing login page with "admin" username...');
  const idInput = await page.$('input[placeholder*="01"], input[type="text"]');
  const passInput = await page.$('input[type="password"]');
  if (idInput && passInput) {
    await idInput.fill('admin');
    await passInput.fill('1234');
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(2000);
    const body = await page.evaluate(() => document.body.innerText);
    console.log('Login result on /login with "admin" and "1234":');
    const err = await page.$eval('.bg-rose-50, .text-rose-600, .text-rose-700', el => el.innerText).catch(() => 'none');
    console.log('Error found:', err);
  }

  await browser.close();
})();

