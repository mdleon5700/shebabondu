const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const width of [1280, 1366, 1440, 1536, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const metrics = await page.evaluate(() => {
      const header = document.querySelector('header');
      const logo = document.querySelector('header a[href="/"]');
      const nav = document.querySelector('header nav');
      const right = document.querySelector('header .flex.items-center.justify-between > .flex-shrink-0:last-child');
      const navLinks = Array.from(document.querySelectorAll('header nav a')).map(a => ({
        text: a.textContent.trim().replace(/\s+/g, ' '),
        width: a.getBoundingClientRect().width
      }));
      const moreBtn = document.querySelector('header nav + div button, header nav button');
      return {
        headerWidth: header ? header.getBoundingClientRect().width : 0,
        logoWidth: logo ? logo.getBoundingClientRect().width : 0,
        navWidth: nav ? nav.getBoundingClientRect().width : 0,
        rightWidth: right ? right.getBoundingClientRect().width : 0,
        navLinks,
        moreWidth: moreBtn ? moreBtn.getBoundingClientRect().width : 0
      };
    });
    console.log('--- WIDTH ' + width + ' ---');
    console.log(JSON.stringify(metrics, null, 2));
    await page.close();
  }
  await browser.close();
})();

