const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  // Test viewports: 1280, 1366, 1440, 1536, 1920
  for (const width of [1280, 1366, 1440, 1536, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 768 } });
    await page.goto('http://localhost:3000');
    // Login as candidate
    await page.evaluate(() => {
      localStorage.setItem('cs_auth', JSON.stringify({
        isLoggedIn: true,
        role: 'candidate',
        name: 'তাহমিদ ইকবাল',
        phone: '01788990011',
        userId: 'usr_candidate_demo'
      }));
      window.dispatchEvent(new Event('cs_auth_changed'));
    });
    await page.waitForTimeout(500);

    const info = await page.evaluate(() => {
      const header = document.querySelector('header');
      const nav = document.querySelector('header nav');
      const logo = document.querySelector('header a[href="/"]');
      const rightArea = document.querySelector('header div.ml-auto');
      const items = Array.from(nav?.children || []).map(el => ({
        text: el.innerText.trim().replace(/\s+/g, ' '),
        w: el.offsetWidth,
        rect: el.getBoundingClientRect()
      }));
      return {
        windowW: window.innerWidth,
        headerW: header?.clientWidth,
        logoW: logo?.offsetWidth,
        rightW: rightArea?.offsetWidth,
        rightRect: rightArea?.getBoundingClientRect(),
        navW: nav?.offsetWidth,
        navScrollW: nav?.scrollWidth,
        items
      };
    });

    console.log(`\n=== Viewport ${width}px ===`);
    console.log(`Header: ${info.headerW}px, Logo: ${info.logoW}px, RightArea: ${info.rightW}px`);
    console.log(`Nav clientWidth: ${info.navW}px, Nav scrollWidth: ${info.navScrollW}px`);
    console.log(`RightArea left edge: ${info.rightRect?.left}px, right edge: ${info.rightRect?.right}px`);
    console.log(`Items count: ${info.items.length}`);
    info.items.forEach(it => {
      console.log(`  - ${it.text}: width=${it.w}px, left=${it.rect.left}, right=${it.rect.right}`);
    });
    
    // Check if right area is pushed off screen
    if (info.rightRect && info.rightRect.right > info.windowW) {
      console.log(`  >>> WARNING: Right area overflows viewport by ${info.rightRect.right - info.windowW}px!`);
    }

    await page.screenshot({ path: `scripts/candidate_${width}.png` });
    await page.close();
  }

  await browser.close();
})();

