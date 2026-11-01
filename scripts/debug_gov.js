const { chromium } = require('playwright');

async function testGov() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log('HTTP', resp.status(), resp.url());
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text(), 'at', JSON.stringify(msg.location()));
    }
  });

  await page.goto('http://localhost:3000/categories/government-jobs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await browser.close();
}

testGov();
