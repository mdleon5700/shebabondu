const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Perform real admin login via API to get real session cookie
  const loginRes = await context.request.post('http://localhost:3000/api/auth/login', {
    data: {
      role: 'admin',
      adminPin: '1234'
    }
  });
  console.log('Login status:', loginRes.status());
  const body = await loginRes.json();
  console.log('Login response:', body);

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate((b) => {
    localStorage.setItem('cs_auth', JSON.stringify({
      isLoggedIn: true,
      role: 'admin',
      name: 'সুপার অ্যাডমিন'
    }));
    localStorage.setItem('cs_admin_pin', '1234');
    window.dispatchEvent(new Event('cs_auth_changed'));
  }, body);

  for (const w of [1920, 1600, 1536, 1440, 1366, 1280]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(150);

    const metrics = await page.evaluate(() => {
      const header = document.querySelector('header');
      const logo = document.querySelector('header a[href="/"]');
      const nav = document.querySelector('header nav');
      const rightArea = header ? header.querySelector('.ml-auto') : null;
      const navLinks = Array.from(nav?.children || []).map(el => ({
        text: el.innerText.trim().replace(/\n/g, ' '),
        width: el.getBoundingClientRect().width
      }));
      
      return {
        headerWidth: header?.clientWidth || 0,
        logoWidth: logo?.getBoundingClientRect().width || 0,
        navWidth: nav?.getBoundingClientRect().width || 0,
        rightAreaWidth: rightArea?.getBoundingClientRect().width || 0,
        navLinks
      };
    });
    
    console.log(`\n=== Viewport ${w} (REAL LOGGED-IN ADMIN) ===`);
    console.log(`Header: ${metrics.headerWidth}, Logo: ${Math.round(metrics.logoWidth)}, Right: ${Math.round(metrics.rightAreaWidth)}`);
    console.log(`Nav links (${metrics.navLinks.length}): ${metrics.navLinks.map(l => `${l.text} [${Math.round(l.width)}px]`).join(', ')}`);
    const totalNavW = metrics.navLinks.reduce((a, b) => a + b.width, 0);
    console.log(`Total nav elements width: ${Math.round(totalNavW)}px`);
    const gap = Math.round(metrics.headerWidth - metrics.logoWidth - metrics.rightAreaWidth - totalNavW - 64);
    console.log(`Empty gap: ${gap}px`);
  }

  // Save screenshot of 1536 and 1366
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.screenshot({ path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/verified_admin_1536_balanced.png' });
  console.log('Saved screenshot: verified_admin_1536_balanced.png');

  await page.setViewportSize({ width: 1366, height: 900 });
  await page.screenshot({ path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/verified_admin_1366_balanced.png' });
  console.log('Saved screenshot: verified_admin_1366_balanced.png');

  await browser.close();
})();
