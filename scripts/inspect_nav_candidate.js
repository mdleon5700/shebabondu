const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  // Set candidate auth
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    localStorage.setItem('cs_auth', JSON.stringify({
      isLoggedIn: true,
      role: 'candidate',
      name: 'তাহমিদ ইকবাল',
      phone: '01788990011',
      userId: 'usr_candidate_demo'
    }));
  });

  await page.goto('http://localhost:3000/dashboard/profile');
  await page.waitForTimeout(1000);

  const navInfo = await page.evaluate(() => {
    const nav = document.querySelector('header nav');
    const navLinks = Array.from(nav ? nav.querySelectorAll(':scope > div') : []).map(el => el.textContent.trim().replace(/\s+/g, ' '));
    const header = document.querySelector('header');
    const logo = document.querySelector('header a[href="/"]');
    const rightArea = document.querySelector('header div.ml-auto');
    return {
      windowWidth: window.innerWidth,
      headerWidth: header?.clientWidth,
      headerScrollWidth: header?.scrollWidth,
      logoWidth: logo?.offsetWidth,
      navWidth: nav?.offsetWidth,
      navScrollWidth: nav?.scrollWidth,
      rightAreaWidth: rightArea?.offsetWidth,
      navItemsCount: navLinks.length,
      navLinks
    };
  });

  console.log('Nav Info at 1366px:', JSON.stringify(navInfo, null, 2));

  await page.screenshot({ path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/test_candidate_1366.png' });
  await browser.close();
})();

