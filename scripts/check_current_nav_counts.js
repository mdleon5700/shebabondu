const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const width of [1280, 1366, 1440, 1536, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('cs_admin_auth', 'verified');
      localStorage.setItem('cs_admin_pin', '1234');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const check = await page.evaluate(() => {
      const header = document.querySelector('header');
      const nav = document.querySelector('header nav');
      const right = document.querySelector('header [data-testid="right-area"]') || document.querySelector('header .ml-auto');
      const navLinks = Array.from(document.querySelectorAll('header nav a')).map(a => a.textContent.trim().replace(/\s+/g, ' '));
      return {
        headerWidth: header ? header.getBoundingClientRect().width : 0,
        navLinks,
        itemsCount: navLinks.length
      };
    });
    console.log(`Viewport ${width}: ${check.itemsCount} items -> [${check.navLinks.join(', ')}]`);
    await page.close();
  }
  await browser.close();
})();

