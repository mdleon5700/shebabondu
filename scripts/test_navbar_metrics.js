const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  const sizes = [
    { name: '1280x800', w: 1280, h: 800 },
    { name: '1366x768', w: 1366, h: 768 },
    { name: '1440x900', w: 1440, h: 900 },
    { name: '1536x864', w: 1536, h: 864 },
    { name: '1920x1080', w: 1920, h: 1080 },
    { name: '2560x1440', w: 2560, h: 1440 }
  ];

  for (const s of sizes) {
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    
    const navMetrics = await page.evaluate(() => {
      const header = document.querySelector('header');
      const container = header?.querySelector('div > .flex.items-center.justify-between')?.parentElement;
      const logo = header?.querySelector('a[href="/"]');
      const navLinks = header?.querySelector('nav');
      const rightArea = header?.querySelector('.sm\\:flex.items-center.gap-2');
      
      const logoRect = logo?.getBoundingClientRect();
      const containerRect = container?.getBoundingClientRect();
      const linksRect = navLinks?.getBoundingClientRect();
      const rightRect = rightArea?.getBoundingClientRect();
      
      // Also get all visible links in nav
      const visibleLinks = Array.from(navLinks?.querySelectorAll('a') || [])
        .filter(el => window.getComputedStyle(el.closest('div') || el).display !== 'none')
        .map(el => el.textContent.trim());

      return {
        windowWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        containerLeft: containerRect?.left,
        containerRight: containerRect?.right,
        containerWidth: containerRect?.width,
        logoLeft: logoRect?.left,
        rightAreaRight: rightRect?.right,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        visibleLinks
      };
    });
    
    console.log('JOBS ' + s.name + ':', JSON.stringify(navMetrics, null, 2));
    
    // Now test /dashboard/profile
    await page.evaluate(() => {
      localStorage.setItem('cs_auth', JSON.stringify({ isLoggedIn: true, role: 'candidate', name: 'তাহমিদ ইকবাল', userId: 'user-candidate-1' }));
      localStorage.setItem('cs_user', JSON.stringify({ id: 'user-candidate-1', name: 'তাহমিদ ইকবাল', role: 'candidate', walletBalance: 650, profileCompletion: 85 }));
    });
    await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'networkidle' });
    
    const profileMetrics = await page.evaluate(() => {
      const header = document.querySelector('header');
      const container = header?.querySelector('div > .flex.items-center.justify-between')?.parentElement;
      const logo = header?.querySelector('a[href="/"]');
      const navLinks = header?.querySelector('nav');
      const rightArea = header?.querySelector('.sm\\:flex.items-center.gap-2');
      
      const logoRect = logo?.getBoundingClientRect();
      const containerRect = container?.getBoundingClientRect();
      const linksRect = navLinks?.getBoundingClientRect();
      const rightRect = rightArea?.getBoundingClientRect();

      const visibleLinks = Array.from(navLinks?.querySelectorAll('a') || [])
        .filter(el => window.getComputedStyle(el.closest('div') || el).display !== 'none')
        .map(el => el.textContent.trim());

      return {
        windowWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        containerLeft: containerRect?.left,
        containerRight: containerRect?.right,
        containerWidth: containerRect?.width,
        logoLeft: logoRect?.left,
        rightAreaRight: rightRect?.right,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        visibleLinks
      };
    });
    console.log('PROFILE ' + s.name + ':', JSON.stringify(profileMetrics, null, 2));

    await page.close();
  }
  
  await browser.close();
})();

