const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  for (const w of [1366, 1440, 1536, 1600, 1920]) {
    const page = await browser.newPage({ viewport: { width: w, height: 864 } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Set admin auth as in user's screenshot
    await page.evaluate(() => {
      localStorage.setItem('cs_admin_auth', 'verified');
      localStorage.setItem('cs_auth', JSON.stringify({ isLoggedIn: true, role: 'admin', name: 'Super Admin' }));
    });
    await page.reload({ waitUntil: 'networkidle' });

    const info = await page.evaluate(() => {
      const header = document.querySelector('header');
      const logo = header?.querySelector('a[href="/"]');
      const nav = header?.querySelector('nav');
      const rightArea = header?.querySelector('.ml-auto');
      
      const headerW = header?.clientWidth;
      const logoW = logo?.offsetWidth;
      const rightW = rightArea?.offsetWidth;
      const navW = nav?.offsetWidth;
      const navItems = Array.from(nav?.children || []).map(c => ({
        text: c.textContent.trim().replace(/\s+/g, ' '),
        w: c.offsetWidth
      }));
      
      const emptySpace = rightArea && nav 
        ? rightArea.getBoundingClientRect().left - nav.getBoundingClientRect().right 
        : null;

      return {
        windowW: window.innerWidth,
        headerW,
        logoW,
        rightW,
        navW,
        emptySpace,
        itemsCount: navItems.length,
        navItems
      };
    });
    console.log('ADMIN Viewport ' + w + ':', JSON.stringify(info, null, 2));
    await page.screenshot({ path: `C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/72_navbar_admin_${w}_fixed.png` });
    await page.close();
  }
  await browser.close();
})();
