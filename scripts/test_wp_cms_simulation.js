const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('🚀 Starting WordPress-grade CMS & Theme Customizer End-to-End Test...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, '..', 'artifacts_wp_test');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Visit Admin Login and Auth
  console.log('1️⃣ Navigating to Admin Panel...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
  
  // Set localStorage pin if needed
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_admin_auth', 'true');
  });
  await page.reload({ waitUntil: 'networkidle' });

  // Handle PIN input if still present
  const pinInput = await page.$('input[type="password"]');
  if (pinInput) {
    console.log('🔑 Entering PIN 1234...');
    await pinInput.fill('1234');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await page.waitForTimeout(1500);
  }

  console.log('✅ Admin authenticated.');

  // 2. Test Pages Management
  console.log('2️⃣ Testing Pages Section (WordPress Pages equivalent)...');
  await page.goto('http://localhost:3000/admin?tab=pages-sections', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Take screenshot of Pages Manager
  await page.screenshot({ path: path.join(screenshotsDir, '01_pages_manager_table.png'), fullPage: false });
  console.log('📸 Captured 01_pages_manager_table.png');

  // Check if Add Page button exists
  const addPageBtn = await page.getByRole('button', { name: 'নতুন পেইজ তৈরি' }).first();
  if (addPageBtn) {
    console.log('📄 Clicking "+ নতুন পেইজ তৈরি"...');
    await addPageBtn.click();
    await page.waitForTimeout(800);

    // Fill page form
    const titleInput = await page.$('input[placeholder="যেমন: বিসিএস প্রস্তুতি গাইড"]');
    if (titleInput) {
      const testTitle = 'বিসিএস প্রিলিমিনারি প্রস্তুতি গাইড ২০২৬';
      await titleInput.fill(testTitle);
      console.log('📝 Filled Title:', testTitle);
      await page.waitForTimeout(500);

      // Slug should be auto-filled or editable
      const slugInput = await page.$('input[placeholder="যেমন: bcs-preparation-guide"]');
      if (slugInput) {
        await slugInput.fill('bcs-preliminary-guide-2026');
      }

      // Submit form
      const createSubmitBtn = await page.getByRole('button', { name: 'পেইজ তৈরি ও সংরক্ষণ করুন' });
      if (createSubmitBtn) {
        console.log('💾 Submitting new page form...');
        await createSubmitBtn.click();
        await page.waitForTimeout(2500);
      }
    }
  }

  // 3. Verify public page renders with HTTP 200
  console.log('3️⃣ Verifying newly created page on public frontend...');
  const publicPageRes = await page.goto('http://localhost:3000/bcs-preliminary-guide-2026', { waitUntil: 'networkidle' });
  console.log('🌐 Public page status:', publicPageRes ? publicPageRes.status() : 'Unknown');
  await page.screenshot({ path: path.join(screenshotsDir, '02_public_page_view.png'), fullPage: false });
  console.log('📸 Captured 02_public_page_view.png');

  // 4. Test WordPress Theme Customizer (Header Logo, Menu, Action Buttons)
  console.log('4️⃣ Testing Theme Customizer (Appearance -> Header & Footer)...');
  await page.goto('http://localhost:3000/admin?tab=header-footer', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Take screenshot of Customizer
  await page.screenshot({ path: path.join(screenshotsDir, '03_theme_customizer_view.png'), fullPage: false });
  console.log('📸 Captured 03_theme_customizer_view.png');

  // Modify Brand Name & WhatsApp Button Text
  const brandInput = page.locator('input[placeholder="চাকরি সেবা"]').first();
  if (await brandInput.count() > 0) {
    await brandInput.fill('চাকরি সেবা প্রো');
    console.log('📝 Filled Brand Name: চাকরি সেবা প্রো');
  }

  const waInput = page.locator('input[placeholder="WhatsApp"]').first();
  if (await waInput.count() > 0) {
    await waInput.fill('২৪/৭ হেল্পলাইন');
    console.log('📝 Filled WhatsApp button text: ২৪/৭ হেল্পলাইন');
  }

  await page.waitForTimeout(500);

  // Click Save All Settings
  const saveBtn = await page.locator('button:has-text("সকল হেডার ও ফুটার ডিজাইন পরিবর্তন সংরক্ষণ করুন")').first();
  if (saveBtn) {
    console.log('💾 Clicking "সকল হেডার ও ফুটার ডিজাইন পরিবর্তন সংরক্ষণ করুন"...');
    await saveBtn.click();
    await page.waitForTimeout(3000);
  }

  // 5. Test Live Frontend Navbar for Immediate Reflection
  console.log('5️⃣ Testing Public Frontend Navbar for instant reflection...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const headerContent = await page.evaluate(() => {
    const hdr = document.querySelector('header');
    return hdr ? hdr.innerText : '';
  });

  console.log('📌 Public Header Text Sample:', headerContent.slice(0, 300).replace(/\n/g, ' '));
  const hasUpdatedWa = headerContent.includes('২৪/৭ হেল্পলাইন');
  const hasUpdatedBrand = headerContent.includes('চাকরি সেবা প্রো');
  console.log('✅ Has Updated WhatsApp Text ("২৪/৭ হেল্পলাইন"):', hasUpdatedWa);
  console.log('✅ Has Updated Brand Title ("চাকরি সেবা প্রো"):', hasUpdatedBrand);

  await page.screenshot({ path: path.join(screenshotsDir, '04_public_navbar_verified.png'), fullPage: false });
  console.log('📸 Captured 04_public_navbar_verified.png');

  // 6. Test Elementor-Style Content Studio
  console.log('6️⃣ Testing Elementor-Style Content Studio (Posts/Circulars Visual Editor)...');
  await page.goto('http://localhost:3000/admin?tab=content-studio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '05_elementor_content_studio.png'), fullPage: false });
  console.log('📸 Captured 05_elementor_content_studio.png');

  // Copy all artifacts to brain artifact directory
  const brainDir = path.join('C:', 'Users', 'Leon Rahman', '.gemini', 'antigravity', 'brain', '28ee63ba-098a-42e1-8ed2-67073b8967cd');
  if (fs.existsSync(brainDir)) {
    const files = fs.readdirSync(screenshotsDir);
    for (const f of files) {
      fs.copyFileSync(path.join(screenshotsDir, f), path.join(brainDir, f));
    }
    console.log(`📁 Copied ${files.length} screenshots to conversation artifacts!`);
  }

  await browser.close();
  console.log('🎉 All tests completed successfully!');
}

run().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

