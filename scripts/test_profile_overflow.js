const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
  const candidate = Object.values(store.candidates || {})[0];
  const token = 'test_session_' + Date.now();
  if (!store.sessions) store.sessions = {};
  store.sessions[token] = { token, candidateId: candidate.id, role: 'candidate', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString() };
  fs.writeFileSync('src/db/local_store.json', JSON.stringify(store, null, 2));

  const viewports = [
    { name: 'Mobile (375px)', width: 375, height: 667 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Laptop (1280px)', width: 1280, height: 800 },
    { name: 'Desktop (1440px)', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await context.addCookies([{ name: 'cs_session_token', value: token, domain: 'localhost', path: '/' }]);
    const page = await context.newPage();
    await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`Profile ${vp.name.padEnd(18)}: scrollWidth = ${scrollWidth}, innerWidth = ${vp.width} -> Overflow: ${isOverflowing ? '❌ YES' : '✅ NO'}`);
    await context.close();
  }
  await browser.close();
})();

