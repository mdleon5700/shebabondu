const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 864 } });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('cs_auth', JSON.stringify({ isLoggedIn: true, role: 'candidate', name: 'তাহমিদ ইকবাল', userId: 'user-candidate-1' }));
    localStorage.setItem('cs_user', JSON.stringify({ id: 'user-candidate-1', name: 'তাহমিদ ইকবাল', role: 'candidate', walletBalance: 650, profileCompletion: 85 }));
  });
  await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'networkidle' });
  
  const moreBtn = page.locator('text=আরও').first();
  if (await moreBtn.isVisible()) {
    await moreBtn.hover();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/64_navbar_profile_more_dropdown_open.png' });
    console.log('More dropdown screenshot saved successfully!');
  } else {
    console.log('More button not visible because all items fit.');
  }

  await browser.close();
})();
