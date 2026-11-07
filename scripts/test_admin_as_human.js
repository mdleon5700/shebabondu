const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🤖 Starting Human Simulation in Admin Panel...');
  const browser = await chromium.launch({
    headless: true,
    viewport: { width: 1366, height: 768 }
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Visit Admin Login
  console.log('1. Navigating to http://localhost:3000/admin ...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  // Take screenshot of login screen
  await page.screenshot({ path: 'admin_login_screen.png' });
  console.log('   Saved admin_login_screen.png');

  // Check if PIN input is visible
  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.count() > 0) {
    console.log('2. Admin PIN input found. Entering PIN: 1234 ...');
    await pinInput.fill('1234');
    const submitBtn = page.locator('button:has-text("লগইন"), button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'admin_after_login.png' });
    console.log('   Saved admin_after_login.png');
  }

  // 3. Open Smart Circular Builder / Workspace
  console.log('3. Navigating to Smart Circular Page Builder / Admin Workspace...');
  // Click on "নতুন সার্কুলার তৈরি" or open builder
  const newCircularBtn = page.locator('button:has-text("নতুন সার্কুলার"), button:has-text("সার্কুলার তৈরি"), button:has-text("পোস্ট তৈরি")').first();
  if (await newCircularBtn.count() > 0) {
    console.log('   Clicking New Circular button...');
    await newCircularBtn.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'admin_builder_opened.png' });
  console.log('   Saved admin_builder_opened.png');

  // 4. Test PDF URL input
  const testPdfUrl = 'https://alljobs.teletalk.com.bd/media/public/uploads/governments/jobs/advertisement-1793683909289.pdf';
  const urlInput = page.locator('input[placeholder*="PDF"], input[placeholder*="URL"]').first();
  
  if (await urlInput.count() > 0) {
    console.log('4. Entering PDF URL in input field:', testPdfUrl);
    await urlInput.fill(testPdfUrl);

    const makePageBtn = page.locator('button:has-text("সম্পূর্ণ পেজ বানান")').first();
    if (await makePageBtn.count() > 0) {
      console.log('5. Clicking "সম্পূর্ণ পেজ বানান" button...');
      await makePageBtn.click();
      
      // Wait for AI generation or error
      console.log('6. Waiting 15s for AI auto-generation...');
      await page.waitForTimeout(15000);
      
      await page.screenshot({ path: 'admin_after_autofill.png' });
      console.log('   Saved admin_after_autofill.png');

      // Check for error banner or populated fields
      const errorBanner = page.locator('div:has-text("এআই অটো-ফিল ব্যর্থ"), div:has-text("ব্যর্থ")').first();
      if (await errorBanner.count() > 0) {
        console.log('⚠️ Error banner detected:', await errorBanner.innerText());
      } else {
        console.log('✅ No error banner! Checking populated fields...');
        const titleVal = await page.locator('input[name="title"], input[placeholder*="শিরোনাম"]').first().inputValue().catch(() => '');
        console.log('   Populated Title:', titleVal);
      }
    }
  } else {
    console.log('⚠️ PDF URL input field not found on current page.');
  }

  await browser.close();
  console.log('🤖 Human Simulation completed.');
})();

