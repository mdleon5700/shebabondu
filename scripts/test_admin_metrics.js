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
    await page.waitForTimeout(600);

    const metrics = await page.evaluate(() => {
      const header = document.querySelector('header');
      const logo = document.querySelector('header a[href="/"]');
      const nav = document.querySelector('header nav');
      const navLinks = Array.from(document.querySelectorAll('header nav a')).map(a => ({
        text: a.textContent.trim().replace(/\s+/g, ' '),
        width: Math.round(a.getBoundingClientRect().width)
      }));
      const rightArea = document.querySelector('header [data-testid="right-area"]') || 
        document.querySelector('header .flex-shrink-0.flex') ||
        document.querySelectorAll('header .flex.items-center.justify-between > *')[2];
      
      const totalBar = document.querySelector('header .flex.items-center.justify-between');
      const totalBarWidth = totalBar ? totalBar.getBoundingClientRect().width : 0;
      const logoW = logo ? logo.getBoundingClientRect().width : 0;
      const navW = nav ? nav.getBoundingClientRect().width : 0;
      const rightW = rightArea ? rightArea.getBoundingClientRect().width : 0;
      const gapRemaining = totalBarWidth - logoW - navW - rightW;

      return {
        viewport: window.innerWidth,
        totalBarWidth: Math.round(totalBarWidth),
        logoW: Math.round(logoW),
        navW: Math.round(navW),
        rightW: Math.round(rightW),
        gapRemaining: Math.round(gapRemaining),
        itemsCount: navLinks.length,
        navLinks
      };
    });
    console.log(JSON.stringify(metrics));
    await page.close();
  }
  await browser.close();
})();

