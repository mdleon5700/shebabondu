const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  for (const width of [1920, 1536, 1366, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    
    // Seed authenticated candidate session
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => {
      localStorage.setItem('cs_auth_data', JSON.stringify({
        isLoggedIn: true,
        role: 'candidate',
        userId: 'cand-test',
        name: 'তাহমিদ ইকবাল',
        phone: '0188990011'
      }));
      localStorage.setItem('cs_auth_token', 'mock-cand-token');
      localStorage.setItem('cs_session_token', 'mock-cand-token');
    });
    
    await page.goto('http://localhost:3000/dashboard/profile');
    await page.waitForTimeout(1000);
    
    const navBox = await page.locator('header nav').boundingBox();
    const rightBox = await page.locator('header .hidden.sm\\:flex.items-center.gap-2.flex-shrink-0').boundingBox();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    
    console.log(`\n=== Logged-in Candidate: Viewport ${width}px ===`);
    console.log(`Nav: right=${(navBox?.x || 0) + (navBox?.width || 0)}`);
    console.log(`Right actions box: left=${rightBox?.x}, right=${(rightBox?.x || 0) + (rightBox?.width || 0)}`);
    console.log(`ScrollWidth: ${scrollWidth} vs WindowWidth: ${width} (Overflow: ${overflow})`);
    
    await page.screenshot({ path: `candidate_navbar_${width}.png` });
    await page.close();
  }
  
  await browser.close();
})();

