const { chromium } = require('playwright');

async function testGov() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('response', resp => {
    if (resp.status() === 404) {
      console.log('404 URL:', resp.url(), 'type:', resp.request().resourceType());
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console:', msg.text(), JSON.stringify(msg.location()));
    }
  });

  await page.goto('http://localhost:3000/categories/government-jobs', { waitUntil: 'networkidle' });
  await browser.close();
}

testGov();
