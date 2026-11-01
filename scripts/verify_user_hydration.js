const { chromium } = require('playwright');

async function testUserRoutes() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const userContext = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  await userContext.addCookies([
    { name: 'session_token', value: 'SYNTH-USR-DHAKA-001', domain: 'localhost', path: '/' },
    { name: 'cs_session_token', value: 'SYNTH-USR-DHAKA-001', domain: 'localhost', path: '/' }
  ]);
  const page = await userContext.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ page: page.url(), text: msg.text(), loc: msg.location() });
    }
  });

  const routes = [
    '/dashboard/wallet',
    '/dashboard/vault',
    '/dashboard/applications',
    '/dashboard/transactions',
    '/dashboard/application-check'
  ];

  for (const r of routes) {
    console.log(`Checking ${r}...`);
    await page.goto(`http://localhost:3000${r}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
  }

  console.log('Result Errors:', JSON.stringify(errors, null, 2));
  await browser.close();
}

testUserRoutes();
