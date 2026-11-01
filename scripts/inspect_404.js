const { chromium } = require('playwright');

async function test404() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    extraHTTPHeaders: { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Error text:', msg.text());
      console.log('Location:', JSON.stringify(msg.location()));
    }
  });

  page.on('requestfailed', req => {
    console.log('Request failed:', req.url(), req.failure());
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log('Status >= 400:', resp.status(), resp.url());
    }
  });

  await page.goto('http://localhost:3000/admin?tab=notifications', { waitUntil: 'networkidle' });
  await page.goto('http://localhost:3000/admin?tab=analytics', { waitUntil: 'networkidle' });
  await page.goto('http://localhost:3000/admin?tab=audit-center', { waitUntil: 'networkidle' });

  await browser.close();
}

test404();
