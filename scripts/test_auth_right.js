const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
  
  // Set auth cookie
  await page.context().addCookies([{
    name: 'cs_session_token',
    value: 'test-admin',
    domain: 'localhost',
    path: '/'
  }]);

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('cs_auth', JSON.stringify({ isLoggedIn: true, role: 'admin', name: 'Super Admin' }));
    window.dispatchEvent(new Event('cs_auth_changed'));
  });
  await page.waitForTimeout(500);

  const right = await page.evaluate(() => {
    const r = document.querySelector('header [data-testid="right-area"]') || document.querySelector('header .ml-auto');
    return {
      text: r ? r.innerText.replace(/\n/g, ' ') : null,
      width: r ? r.offsetWidth : null
    };
  });
  console.log('Right area:', right);
  await browser.close();
})();

