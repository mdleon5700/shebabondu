const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const width of [1280, 1366, 1440, 1536, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const debug = await page.evaluate(() => {
      const header = document.querySelector('header');
      const logo = document.querySelector('header a');
      const navLinks = Array.from(document.querySelectorAll('header nav a')).map(a => a.textContent.trim().replace(/\s+/g, ' '));
      const right = document.querySelector('header .flex-shrink-0.flex');
      return {
        headerWidth: header ? header.clientWidth : 0,
        logoWidth: logo ? logo.offsetWidth : 0,
        rightWidth: right ? right.offsetWidth : 0,
        navLinks
      };
    });
    console.log('Viewport ' + width + ':', JSON.stringify(debug));
    await page.close();
  }
  await browser.close();
})();

