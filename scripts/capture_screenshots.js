const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  // Desktop
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('Capturing desktop homepage...');
  await page.goto('https://shebabondu.onrender.com/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: 'desktop_home.png', fullPage: false });

  console.log('Capturing desktop /jobs...');
  await page.goto('https://shebabondu.onrender.com/jobs', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: 'desktop_jobs.png', fullPage: false });

  // Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  const mobilePage = await mobileContext.newPage();

  console.log('Capturing mobile homepage...');
  await mobilePage.goto('https://shebabondu.onrender.com/', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.screenshot({ path: 'mobile_home.png', fullPage: false });

  console.log('Capturing mobile /admin...');
  await mobilePage.goto('https://shebabondu.onrender.com/admin', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.screenshot({ path: 'mobile_admin.png', fullPage: false });

  await browser.close();
  console.log('Screenshots taken successfully!');
})();

