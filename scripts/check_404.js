const { chromium } = require('playwright');

async function check404() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const failedUrls = [];

  page.on('response', resp => {
    if (resp.status() >= 400) {
      failedUrls.push({ url: resp.url(), status: resp.status() });
    }
  });

  console.log('Testing / ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  console.log('Testing /categories/government-jobs ...');
  await page.goto('http://localhost:3000/categories/government-jobs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  console.log('Failed Requests:', JSON.stringify(failedUrls, null, 2));
  await browser.close();
}

check404();
