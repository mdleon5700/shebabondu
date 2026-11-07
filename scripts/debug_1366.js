const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const debug = await page.evaluate(() => {
    const nav = document.querySelector('header nav');
    const links = Array.from(document.querySelectorAll('header nav a')).map(a => ({
      text: a.textContent.trim().replace(/\s+/g, ' '),
      width: a.getBoundingClientRect().width
    }));
    const moreBtn = document.querySelector('header nav div[role="button"]');
    return {
      navWidth: nav ? nav.getBoundingClientRect().width : 0,
      links,
      moreText: moreBtn ? moreBtn.textContent.trim() : null
    };
  });
  console.log('1366 Debug:', JSON.stringify(debug, null, 2));
  await page.screenshot({ path: 'scripts/debug_1366_navbar.png' });
  await browser.close();
})();

