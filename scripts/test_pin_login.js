const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.goto('https://shebabondu.onrender.com/admin', { waitUntil: 'networkidle' });

  page.on('dialog', async dialog => await dialog.accept());
  const logoutBtn = await page.$('button:has-text("লগআউট")');
  if (logoutBtn) {
    await logoutBtn.click();
    await page.waitForTimeout(1000);
  }

  console.log('--- Testing PIN: 1234 ---');
  let pinInput = await page.$('input[type="password"]');
  await pinInput.fill('1234');
  let submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();
  await page.waitForTimeout(2000);

  let body = await page.evaluate(() => document.body.innerText);
  console.log('Result for 1234: has dashboard =', body.includes('মূল ড্যাশবোর্ড'), 'has error =', body.includes('ভুল'));

  // Test logout again
  const logoutBtn2 = await page.$('button:has-text("লগআউট")');
  if (logoutBtn2) {
    await logoutBtn2.click();
    await page.waitForTimeout(1000);
  }

  console.log('--- Testing PIN: admin ---');
  pinInput = await page.$('input[type="password"]');
  await pinInput.fill('admin');
  submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();
  await page.waitForTimeout(2000);

  body = await page.evaluate(() => document.body.innerText);
  console.log('Result for "admin": has dashboard =', body.includes('মূল ড্যাশবোর্ড'), 'has error =', body.includes('ভুল'));
  const errorText = await page.$eval('.bg-rose-50', el => el.innerText).catch(() => 'no rose error');
  console.log('Error message for "admin":', errorText);

  await browser.close();
})();

