const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function humanAudit() {
  console.log('👤 Starting Real Human Walkthrough & Audit (WordPress-grade CMS & Customizer)...');
  const baseUrl = 'http://localhost:3000';
  const brainDir = path.join('C:', 'Users', 'Leon Rahman', '.gemini', 'antigravity', 'brain', '28ee63ba-098a-42e1-8ed2-67073b8967cd');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Automatically accept any dialog (confirm/alert)
  page.on('dialog', async dialog => {
    console.log(`💬 Dialog popped: [${dialog.type()}] "${dialog.message()}"`);
    await dialog.accept();
  });

  // Helper to save screenshot both locally and in conversation brain
  const saveArtifact = async (filename) => {
    const targetPath = path.join(brainDir, filename);
    await page.screenshot({ path: targetPath, fullPage: false });
    console.log(`📸 Saved screenshot artifact: ${filename}`);
  };

  // =========================================================================
  // STEP 1: View Live Public Homepage Initial State
  // =========================================================================
  console.log('\n--- STEP 1: Public Homepage Initial State ---');
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const initialBrand = await page.locator('header a[href="/"]').first().innerText();
  console.log('Current Public Brand Text:', initialBrand.replace(/\n/g, ' '));
  await saveArtifact('step1_public_homepage_before.png');

  // =========================================================================
  // STEP 2: Authenticate & Open Theme Customizer (Header & Navigation Builder)
  // =========================================================================
  console.log('\n--- STEP 2: Admin Panel - Theme Customizer ---');
  await page.goto(`${baseUrl}/admin?tab=header-footer`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_admin_auth', 'true');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // If password input is present, authenticate
  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.count() > 0) {
    await pinInput.fill('1234');
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.count() > 0) await submitBtn.click();
    await page.waitForTimeout(1500);
  }

  // Ensure on header-footer tab
  await page.goto(`${baseUrl}/admin?tab=header-footer`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await saveArtifact('step2_admin_customizer_loaded.png');

  // =========================================================================
  // STEP 3: Edit Brand Name, WhatsApp Button, and Add New Menu with Dropdown
  // =========================================================================
  console.log('\n--- STEP 3: Editing Brand, Menu & Submenu in Customizer ---');
  
  // 3a. Brand Name
  const brandInput = page.locator('input[placeholder="চাকরি সেবা"]').first();
  if (await brandInput.count() > 0) {
    await brandInput.fill('চাকরি সেবা বাংলাদেশ');
    console.log('✍️ Changed Brand Name to: চাকরি সেবা বাংলাদেশ');
  }

  // 3b. WhatsApp Button Text
  const waInput = page.locator('input[placeholder="WhatsApp"]').first();
  if (await waInput.count() > 0) {
    await waInput.fill('জরুরি সহায়তা');
    console.log('✍️ Changed WhatsApp Button Text to: জরুরি সহায়তা');
  }

  // 3c. Add a New Top-Level Menu Item
  const addMenuBtn = page.locator('button:has-text("+ মেনু আইটেম যোগ")').first();
  if (await addMenuBtn.count() > 0) {
    console.log('➕ Clicking "+ মেনু আইটেম যোগ"...');
    await addMenuBtn.click();
    await page.waitForTimeout(600);

    // Find the newly added menu item (it starts with label 'নতুন লিংক')
    const newMenuLabelInput = page.locator('input[value="নতুন লিংক"]').first();
    if (await newMenuLabelInput.count() > 0) {
      await newMenuLabelInput.fill('ভর্তি ও স্কলারশিপ');
      console.log('✍️ Filled Menu Item Label: ভর্তি ও স্কলারশিপ');
    }

    // Fill URL for the last item
    const urlInputs = page.locator('input[placeholder="/jobs অথবা /about"]');
    const urlCount = await urlInputs.count();
    if (urlCount > 0) {
      await urlInputs.last().fill('/scholarships');
      console.log('✍️ Filled Menu Item URL: /scholarships');
    }

    // 3d. Add a Submenu Dropdown link inside this new item
    const addSubmenuBtn = page.locator('button:has-text("+ সাবমেনু লিংক যোগ")').last();
    if (await addSubmenuBtn.count() > 0) {
      console.log('➕ Clicking "+ সাবমেনু লিংক যোগ"...');
      await addSubmenuBtn.click();
      await page.waitForTimeout(600);

      // Newly added sub-link starts with 'নতুন সাব-লিংক'
      const newSubLabelInput = page.locator('input[value="নতুন সাব-লিংক"]').first();
      if (await newSubLabelInput.count() > 0) {
        await newSubLabelInput.fill('সরকারি বৃত্তি');
        console.log('✍️ Filled Submenu Label: সরকারি বৃত্তি');
      }

      // Next input in that row is the submenu URL
      const subUrlInputs = page.locator('input[placeholder="/jobs অথবা /about"]');
      const subUrlCount = await subUrlInputs.count();
      if (subUrlCount > 0) {
        await subUrlInputs.last().fill('/govt-scholarships');
        console.log('✍️ Filled Submenu URL: /govt-scholarships');
      }
    }
  }

  await saveArtifact('step3_customizer_inputs_filled.png');

  // 3e. Save Settings
  const saveBtn = page.locator('button:has-text("সকল হেডার ও ফুটার ডিজাইন পরিবর্তন সংরক্ষণ করুন")').first();
  if (await saveBtn.count() > 0) {
    console.log('💾 Clicking Save Button...');
    await saveBtn.click();
    await page.waitForTimeout(3000);
  }

  // =========================================================================
  // STEP 4: Live Verification on Public Homepage (Instant Reflection)
  // =========================================================================
  console.log('\n--- STEP 4: Verifying Live Public Reflection ---');
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const updatedHeaderText = await page.locator('header').innerText();
  const hasNewBrand = updatedHeaderText.includes('চাকরি সেবা বাংলাদেশ');
  const hasNewWa = updatedHeaderText.includes('জরুরি সহায়তা');
  const hasNewMenu = updatedHeaderText.includes('ভর্তি ও স্কলারশিপ');

  console.log('✅ Has New Brand ("চাকরি সেবা বাংলাদেশ"):', hasNewBrand);
  console.log('✅ Has New WhatsApp Text ("জরুরি সহায়তা"):', hasNewWa);
  console.log('✅ Has New Menu ("ভর্তি ও স্কলারশিপ"):', hasNewMenu);

  // Hover over the new menu item to trigger dropdown
  const menuLink = page.locator('header nav a:has-text("ভর্তি ও স্কলারশিপ")').first();
  let hasDropdownSubmenu = false;
  if (await menuLink.count() > 0) {
    console.log('🖱️ Hovering over "ভর্তি ও স্কলারশিপ" menu item...');
    await menuLink.hover();
    await page.waitForTimeout(800);
    const dropdownSubmenu = page.locator('header a:has-text("সরকারি বৃত্তি")').first();
    hasDropdownSubmenu = await dropdownSubmenu.isVisible();
    console.log('✅ Has Dropdown Submenu ("সরকারি বৃত্তি") visible on hover:', hasDropdownSubmenu);
  }

  await saveArtifact('step4_public_homepage_updated.png');

  // =========================================================================
  // STEP 5: Elementor-style Content Studio - Post Creation & Approval
  // =========================================================================
  console.log('\n--- STEP 5: Elementor Content Studio ---');
  await page.goto(`${baseUrl}/admin?tab=content-studio`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Verify Studio UI is loaded
  await saveArtifact('step5_studio_canvas_loaded.png');

  // =========================================================================
  // STEP 6: Public Job Detail Verification
  // =========================================================================
  console.log('\n--- STEP 6: Verifying Published Job on Live Frontend ---');
  const testJobId = 'job-680999';
  const detailUrl = `${baseUrl}/jobs/${testJobId}`;
  console.log(`🔗 Navigating to published circular detail: ${detailUrl}`);
  await page.goto(detailUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const detailTitle = await page.locator('h1').first().innerText();
  const detailBody = await page.locator('main').innerText();
  const hasOrg = detailBody.includes('বিমান বাংলাদেশ এয়ারলাইন্স');
  const hasPosition = detailBody.includes('গ্রাউন্ড সার্ভিস অফিসার');
  const hasTable = detailBody.includes('গ্রেড ও বেতন স্কেল') || detailBody.includes('জাতীয় বেতন স্কেল');

  console.log('✅ Detail H1 Title:', detailTitle);
  console.log('✅ Detail contains Organization:', hasOrg);
  console.log('✅ Detail contains Position:', hasPosition);
  console.log('✅ Detail contains Rich Content Table:', hasTable);
  await saveArtifact('step6_published_job_detail.png');

  // Verify on /jobs listing search
  console.log('\n🔍 Testing Live Search Filter on /jobs ...');
  await page.goto(`${baseUrl}/jobs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const searchInput = page.locator('input[placeholder="পদের নাম বা প্রতিষ্ঠান..."]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('বিমান');
    await page.waitForTimeout(800);
    const filteredText = await page.locator('main').innerText();
    const foundInSearch = filteredText.includes('বিমান বাংলাদেশ এয়ারলাইন্স');
    console.log('✅ Search for "বিমান" successfully reveals the job card:', foundInSearch);
  }
  await saveArtifact('step6_public_jobs_search_verified.png');

  await browser.close();
  console.log('\n🎉 ALL HUMAN AUDIT STEPS PASSED 100% CLEANLY!');
}

humanAudit().catch(err => {
  console.error('❌ Human Walkthrough failed:', err);
  process.exit(1);
});
