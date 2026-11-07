const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  
  // Set candidate cookie for Tahmid Iqbal (CS-USR-26-99C011)
  await context.addCookies([
    {
      name: 'cs_session_token',
      value: 'SYNTH-CANDIDATE-01',
      domain: 'localhost',
      path: '/'
    }
  ]);

  const page = await context.newPage();
  await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'networkidle' });
  
  await page.screenshot({
    path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/38_responsive_navbar_profile_fixed.png',
    fullPage: false
  });
  console.log('Screenshot saved to 38_responsive_navbar_profile_fixed.png');

  // Also test hovering on 'আরও' dropdown
  const moreBtn = page.locator('nav button:has-text("আরও")');
  if (await moreBtn.isVisible()) {
    console.log('"আরও" button is visible on 1366px!');
    await moreBtn.hover();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/39_responsive_navbar_more_dropdown_open.png',
      fullPage: false
    });
    console.log('Dropdown screenshot saved to 39_responsive_navbar_more_dropdown_open.png');
  } else {
    console.log('"আরও" button not visible, checking nav items width...');
  }

  await browser.close();
})();

