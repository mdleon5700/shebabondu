const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  // Read store and create valid session
  const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
  const candidate = Object.values(store.candidates || {})[0];
  const token = 'test_session_' + Date.now();
  if (!store.sessions) store.sessions = {};
  store.sessions[token] = {
    token,
    candidateId: candidate.id,
    role: 'candidate',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString()
  };
  fs.writeFileSync('src/db/local_store.json', JSON.stringify(store, null, 2));

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });

  await context.addCookies([
    {
      name: 'cs_session_token',
      value: token,
      domain: 'localhost',
      path: '/'
    }
  ]);

  const page = await context.newPage();
  await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/40_logged_in_candidate_profile_fixed.png',
    fullPage: false
  });
  console.log('Saved 40_logged_in_candidate_profile_fixed.png');

  await browser.close();
})();
