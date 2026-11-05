const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/admin...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Take screenshot of Admin with Live Studio
  const studioScreenshotPath = path.join(process.cwd(), 'admin_live_studio_verified.png');
  await page.screenshot({ path: studioScreenshotPath, fullPage: false });
  console.log('Saved studio screenshot:', studioScreenshotPath);

  // Navigate to Job Detail page to verify PDF Overview and embedded PDF viewer
  console.log('Navigating to http://localhost:3000/jobs/job-breb-demo-2026...');
  await page.goto('http://localhost:3000/jobs/job-breb-demo-2026', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const jobDetailScreenshotPath = path.join(process.cwd(), 'job_detail_pdf_overview_verified.png');
  await page.screenshot({ path: jobDetailScreenshotPath, fullPage: false });
  console.log('Saved job detail screenshot:', jobDetailScreenshotPath);

  await browser.close();
  console.log('✅ Visual verification complete!');
})();

