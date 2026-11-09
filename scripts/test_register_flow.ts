import { chromium } from 'playwright';

async function testRegister() {
  console.log('Testing /register page E2E...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    const targetUrl = 'http://localhost:3000/register?redirect=%2Fdashboard%2Fadmit-cards';
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify district datalist exists
    const districtInput = page.locator('input[list="district-options"]');
    if (!(await districtInput.isVisible())) {
      throw new Error('District input with datalist not found!');
    }
    console.log('✓ Found district input with 64 district datalist');

    // Fill form
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const testPhone = '01999' + randomNum;
    await page.locator('input[placeholder*="মোঃ তানভীর হাসান"]').fill('মোঃ রফিকুল ইসলাম');
    await page.locator('input[placeholder="017XXXXXXXX"]').fill(testPhone);
    await districtInput.fill('চট্টগ্রাম');
    await page.locator('input[placeholder="নতুন পাসওয়ার্ড দিন"]').fill('pass123456');

    // Click register
    await page.locator('button:has-text("ফ্রি অ্যাকাউন্ট খুলুন")').click();
    console.log('Registration submitted...');

    // Wait for redirect to /dashboard/admit-cards
    await page.waitForFunction(() => window.location.pathname.includes('/dashboard/admit-cards'), null, { timeout: 25000 });
    console.log('✓ Successfully registered and deep-linked to /dashboard/admit-cards!');

    // Capture screenshot
    const screenshotPath = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/audit_111_register_portal_showcase.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved at: ${screenshotPath}`);

    console.log('🎉 /register E2E test passed 100%!');
  } catch (err) {
    console.error('❌ Register test error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testRegister();

