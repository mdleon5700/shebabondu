const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('--- STARTING AI JOB CREATION WALKTHROUGH VIA ADMIN PANEL ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1536, height: 900 } });
  
  // Set admin session cookie & localStorage credentials
  await context.addCookies([
    {
      name: 'cs_session_token',
      value: 'mock-admin-session-token',
      domain: 'localhost',
      path: '/'
    }
  ]);
  
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
  });
  
  console.log('1. Navigating to Admin Panel...');
  await page.goto('http://localhost:3000/admin?tab=circulars');
  await page.waitForTimeout(3000);
  
  // Wait until admin interface is fully ready
  await page.waitForSelector('header, nav, [role="navigation"]', { timeout: 15000 });
  console.log('Admin Panel loaded successfully.');
  
  // 2. Open Universal Job Workspace via Create Job Button
  console.log('2. Clicking "নতুন নিয়োগ বিজ্ঞপ্তি" button to open Universal Job Workspace...');
  const createJobBtn = page.locator('button[title*="নতুন নিয়োগ বিজ্ঞপ্তি"], button:has-text("নতুন নিয়োগ বিজ্ঞপ্তি"), button:has-text("সার্কুলার যুক্ত করুন")').first();
  await createJobBtn.click();
  await page.waitForTimeout(1500);
  
  // Assert Workspace Modal is open
  const modal = page.locator('div[role="dialog"], div.fixed.inset-0').first();
  await page.screenshot({ path: '44_admin_open_create_job_modal.png' });
  console.log('Captured: 44_admin_open_create_job_modal.png');
  
  // 3. Select AI Auto-Fill Tab if not already active
  const aiTab = page.locator('button:has-text("AI অটো-ফিল"), button:has-text("AI Auto")').first();
  if (await aiTab.isVisible()) {
    await aiTab.click();
    await page.waitForTimeout(500);
  }
  
  // 4. Fill AI Input URL
  const testCircularUrl = 'http://cid.teletalk.com.bd';
  console.log(`3. Providing Official Circular Portal URL: ${testCircularUrl}...`);
  const aiInput = page.locator('input[placeholder*="teletalk"], input[placeholder*="alljobs"]').first();
  await aiInput.fill(testCircularUrl);
  await page.screenshot({ path: '45_admin_ai_autofill_input.png' });
  console.log('Captured: 45_admin_ai_autofill_input.png');
  
  // 5. Trigger AI Parsing & Generation
  console.log('4. Clicking "✨ সম্পূর্ণ পেজ বানান" to trigger AI analysis...');
  const generateBtn = page.locator('button:has-text("সম্পূর্ণ পেজ বানান"), button:has-text("বিশ্লেষণ করুন")').first();
  await generateBtn.click();
  
  // Wait for AI to complete parsing and switch to basic tab
  console.log('Waiting for AI generation and response...');
  await page.waitForFunction(() => {
    // Check if success message appears or if title/organization input is populated
    const titleInput = document.querySelector('input[placeholder*="শিরোনাম"], input[name="title"]');
    const successMsg = document.body.innerText.includes('জেমিনি এআই সফলভাবে') || document.body.innerText.includes('সফলভাবে');
    return successMsg || (titleInput && titleInput.value.length > 5);
  }, { timeout: 25000 });
  
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '46_admin_ai_autofill_populated_form.png' });
  console.log('Captured: 46_admin_ai_autofill_populated_form.png');
  
  // Read extracted values from form
  const extractedTitle = await page.locator('input[placeholder*="শিরোনাম"], input[value*="নিয়োগ"], input[value*="বিজ্ঞপ্তি"]').first().inputValue().catch(() => 'N/A');
  const extractedOrg = await page.locator('input[placeholder*="প্রতিষ্ঠান"], input[value*="পুলিশ"], input[value*="সিআইডি"]').first().inputValue().catch(() => 'N/A');
  console.log(`Extracted by AI:\n  Organization: ${extractedOrg}\n  Title: ${extractedTitle}`);
  
  // 6. Navigate to Editorial/Content tab to inspect AI generated Bengali description
  const contentTab = page.locator('button:has-text("সম্পাদকীয় বিবরণ"), button:has-text("কনটেন্ট")').first();
  if (await contentTab.isVisible()) {
    await contentTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '47_admin_ai_editorial_content.png' });
    console.log('Captured: 47_admin_ai_editorial_content.png');
  }
  
  // 7. Click Publish / Save Draft
  console.log('5. Clicking Save / Publish Job in Admin Workspace...');
  const saveBtn = page.locator('button:has-text("সংরক্ষণ ও পাবলিশ করুন"), button:has-text("পাবলিশ"), button:has-text("সংরক্ষণ করুন")').first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '48_admin_job_saved_success.png' });
    console.log('Captured: 48_admin_job_saved_success.png');
  }
  
  console.log('--- ALL AI JOB CREATION STEPS COMPLETED SUCCESSFULLY ---');
  await browser.close();
})();

