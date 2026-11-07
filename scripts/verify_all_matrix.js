const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  for (const role of ['candidate', 'admin', 'guest']) {
    console.log(`\n=================== TESTING ROLE: ${role.toUpperCase()} ===================`);
    for (const width of [1280, 1366, 1440, 1536, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 768 } });
      await page.goto('http://localhost:3000');
      
      if (role === 'candidate') {
        await page.evaluate(() => {
          localStorage.setItem('cs_auth_data', JSON.stringify({
            isLoggedIn: true,
            role: 'candidate',
            name: 'তাহমিদ ইকবাল',
            phone: '01788990011',
            userId: 'usr_candidate_demo'
          }));
        });
      } else if (role === 'admin') {
        await page.evaluate(() => {
          localStorage.setItem('cs_auth_data', JSON.stringify({
            isLoggedIn: true,
            role: 'admin',
            name: 'Super Admin',
            userId: 'adm_demo'
          }));
          localStorage.setItem('cs_admin_auth', 'verified');
        });
      } else {
        await page.evaluate(() => {
          localStorage.removeItem('cs_auth_data');
          localStorage.removeItem('cs_admin_auth');
        });
      }

      await page.reload();
      await page.waitForTimeout(600);

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

      const lastItem = info.items[info.items.length - 1];
      const navEnd = lastItem ? lastItem.rect.right : 0;
      const rightStart = info.rightRect?.left || 0;
      const gapBetween = rightStart - navEnd;
      const overflow = info.rightRect?.right ? Math.max(0, info.rightRect.right - info.windowW) : 0;

      console.log(`[${role.toUpperCase()} @ ${width}px] Items: ${info.items.length} | NavEnd: ${Math.round(navEnd)}px | RightStart: ${Math.round(rightStart)}px | BreathingGap: ${Math.round(gapBetween)}px | RightOverflow: ${Math.round(overflow)}px`);
      console.log(`   Items shown: ${info.items.map(i => i.text).join(' | ')}`);
      if (gapBetween < 0) {
        console.error(`   >>> ERROR: OVERLAP DETECTED! Nav overlaps RightArea by ${Math.abs(gapBetween)}px!`);
      }
      if (overflow > 0) {
        console.error(`   >>> ERROR: RIGHT OVERFLOW! RightArea cut off by ${overflow}px!`);
      }

      await page.screenshot({ path: `C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/verified_${role}_${width}.png` });
      await page.close();
    }
  }

  await browser.close();
  console.log('\nAll tests completed successfully!');
})();

