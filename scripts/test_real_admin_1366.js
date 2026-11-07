const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('cs_auth_data', JSON.stringify({ isLoggedIn: true, role: 'admin', name: 'Super Admin' }));
    window.dispatchEvent(new Event('cs_auth_changed'));
  });
  await page.waitForTimeout(600);

  const debug = await page.evaluate(() => {
    const r = document.querySelector('header .hidden.sm\\:flex.items-center.gap-2.flex-shrink-0.ml-auto');
    const nav = document.querySelector('header nav');
    const links = Array.from(document.querySelectorAll('header nav a')).map(a => ({
      text: a.textContent.trim().replace(/\s+/g, ' '),
      width: a.getBoundingClientRect().width
    }));
    return {
      rightWidth: r ? r.offsetWidth : null,
      rightText: r ? r.innerText.replace(/\n/g, ' ') : null,
      linksCount: links.length,
      links
    };
  });
  console.log('Real Admin at 1366:', JSON.stringify(debug, null, 2));
  await page.screenshot({ path: 'scripts/real_admin_1366_calibrated.png' });
  await browser.close();
})();
