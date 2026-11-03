const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.goto('https://shebabondu.onrender.com/admin', { waitUntil: 'networkidle' });

  // Handle confirm dialog
  page.on('dialog', async dialog => {
    console.log('Dialog opened:', dialog.message());
    await dialog.accept();
  });

  const logoutBtn = await page.$('button:has-text("লগআউট")');
  if (logoutBtn) {
    console.log('Clicking logout button on admin page...');
    await logoutBtn.click();
    await page.waitForTimeout(2000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Body after logout:\n', bodyText.substring(0, 300));
    const pinInput = await page.$('input[type="password"]');
    console.log('Is PIN input visible now?:', Boolean(pinInput));
  }

  await browser.close();
})();

