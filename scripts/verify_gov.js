const { chromium } = require('playwright');

async function testGovAudit() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const loc = msg.location()?.url || '';
      if (!text.includes('favicon.ico') && !loc.includes('favicon.ico')) {
        consoleErrors.push({ text, loc });
      }
    }
  });

  await page.goto('http://localhost:3000/categories/government-jobs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  console.log('Gov console errors:', JSON.stringify(consoleErrors, null, 2));
  await browser.close();
}

testGovAudit();
