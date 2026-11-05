const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to job-breb...');
  await page.goto('http://localhost:3000/jobs/job-breb', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Check speakable classes
  const hasHeadline = await page.locator('.job-hero-headline').count();
  const hasSummary = await page.locator('.job-summary-facts').count();
  const hasEditorial = await page.locator('.job-editorial-lead').count();
  console.log('Speakable selectors:', { hasHeadline, hasSummary, hasEditorial });

  // Check Related Jobs section
  const relatedSection = await page.locator('text=সেমান্টিক টপিক ক্লাস্টার').count();
  console.log('Semantic Topic Clusters section found:', relatedSection > 0);

  const screenshotPath = path.join(process.cwd(), 'semantic_job_page_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Saved full page screenshot:', screenshotPath);

  await browser.close();
  console.log('Verification completed!');
})().catch(e => { console.error('Playwright verification error:', e); process.exit(1); });
