const { chromium } = require('playwright');

async function testTabs() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const adminContext = await browser.newContext({
    extraHTTPHeaders: { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' },
    viewport: { width: 1280, height: 720 },
  });
  const page = await adminContext.newPage();

  const failedReqs = [];
  const consoleErrors = [];

  page.on('response', resp => {
    if (resp.status() >= 400) {
      failedReqs.push({
        status: resp.status(),
        url: resp.url(),
        method: resp.request().method(),
      });
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const tabs = ['notifications', 'analytics', 'audit-center'];
  for (const tab of tabs) {
    console.log(`Auditing tab: ${tab}...`);
    await page.goto(`http://localhost:3000/admin?tab=${tab}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  }

  console.log('Failed Requests:', JSON.stringify(failedReqs, null, 2));
  console.log('Console Errors:', JSON.stringify(consoleErrors, null, 2));
  await browser.close();
}

testTabs();
