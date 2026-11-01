const { chromium } = require('playwright');

async function testAdmin() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const adminContext = await browser.newContext({
    extraHTTPHeaders: { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' },
    viewport: { width: 1280, height: 720 },
  });
  const page = await adminContext.newPage();

  const failedReqs = [];
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
      console.log('Browser Console Error:', msg.text());
    }
  });

  const tabs = ['dashboard', 'notifications', 'analytics', 'audit-center', 'settings'];
  for (const tab of tabs) {
    console.log(`Navigating to /admin?tab=${tab}...`);
    await page.goto(`http://localhost:3000/admin?tab=${tab}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  }

  console.log('Failed Requests:', JSON.stringify(failedReqs, null, 2));
  await browser.close();
}

testAdmin();
