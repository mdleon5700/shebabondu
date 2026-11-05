const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  // Set admin cookie
  await context.addCookies([
    {
      name: 'cs_session_token',
      value: 'admin_audit_session',
      domain: 'localhost',
      path: '/'
    }
  ]);

  const page = await context.newPage();
  console.log('Navigating to spider hub...');
  await page.goto('http://localhost:3000/admin?tab=gemini-browser-spider', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Take screenshot of Gemini Browser Spider Hub with Audit Agent
  const hubScreenshotPath = path.join(process.cwd(), 'spider_audit_hub_verified.png');
  await page.screenshot({ path: hubScreenshotPath, fullPage: true });
  console.log('Saved spider hub screenshot:', hubScreenshotPath);

  // Test Smart Circular Builder AI auto-fill
  console.log('Navigating to circulars tab...');
  await page.goto('http://localhost:3000/admin?tab=circulars', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click '+ নতুন সার্কুলার যোগ করুন' button
  console.log('Clicking create new circular button...');
  const createBtn = page.locator('button:has-text("সার্কুলার যোগ করুন"), button:has-text("নতুন সার্কুলার")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Fill in the input URL
  const inputSelector = 'input[placeholder*="alljobs.teletalk.com.bd"]';
  await page.waitForSelector(inputSelector, { timeout: 10000 });
  await page.fill(inputSelector, 'https://alljobs.teletalk.com.bd/jobs/government/459?jobId=15127');
  console.log('Filled URL in builder.');

  // Click 'সম্পূর্ণ পেজ বানান'
  const buildBtnSelector = 'button:has-text("সম্পূর্ণ পেজ বানান")';
  await page.click(buildBtnSelector);
  console.log('Clicked সম্পূর্ণ পেজ বানান, waiting 8s for completion...');

  await page.waitForTimeout(8000);

  const builderScreenshotPath = path.join(process.cwd(), 'builder_autofill_verified.png');
  await page.screenshot({ path: builderScreenshotPath, fullPage: true });
  console.log('Saved builder screenshot:', builderScreenshotPath);

  // Check if any error text is on the page
  const pageText = await page.innerText('body');
  const hasError = pageText.includes('এআই অটো-ফিল ব্যর্থ');
  console.log('Has AI fail error banner:', hasError);
  const hasSuccess = pageText.includes('DGMS') || pageText.includes('কম্পিউটার মুদ্রাক্ষরিক');
  console.log('Has parsed content:', hasSuccess);

  await browser.close();
  console.log('Done!');
})().catch(e => { console.error('Playwright error:', e); process.exit(1); });
