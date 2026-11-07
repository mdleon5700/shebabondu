const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function runLiveReflectionTest() {
  const artifactDir = 'C:\\Users\\Leon Rahman\\.gemini\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  console.log('🚀 Starting Admin Menu & Section Customization & Public Reflection Test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  // Set admin session cookies and local storage
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

  // Step 1: Open Admin Panel in Builder View
  console.log('1️⃣ Navigating to Admin Panel Website Builder...');
  await page.goto('http://localhost:3000/admin?tab=builder', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Step 2: Open Header & Footer Settings Modal
  console.log('2️⃣ Opening Header & Footer Settings modal...');
  const headerFooterBtn = page.locator('button:has-text("হেডার ও ফুটার সেটিংস")');
  await headerFooterBtn.waitFor({ state: 'visible', timeout: 10000 });
  await headerFooterBtn.click();
  await page.waitForTimeout(600);

  // Step 3: Go to "মেনু বার লিংকসমূহ" Tab
  console.log('3️⃣ Switching to Menu Bar Links tab...');
  const menuTabBtn = page.locator('button:has-text("মেনু বার লিংকসমূহ")');
  await menuTabBtn.click();
  await page.waitForTimeout(400);

  // Edit first menu item label
  const firstMenuInput = page.locator('input[value="হোম"], input[value*="হোম"]').first();
  if (await firstMenuInput.isVisible()) {
    console.log('✏️ Changing "হোম" to "মূল পাতা (লাইভ টেস্ট)"...');
    await firstMenuInput.fill('মূল পাতা (লাইভ টেস্ট)');
  }

  // Add new menu item
  console.log('➕ Adding a new menu item...');
  const addMenuBtn = page.locator('button:has-text("+ মেনু আইটেম যোগ")');
  await addMenuBtn.click();
  await page.waitForTimeout(400);

  // Fill in the new menu item fields
  const newMenuInput = page.locator('input[value="নতুন মেনু"]').first();
  if (await newMenuInput.isVisible()) {
    await newMenuInput.fill('জরুরি সার্কুলার');
  }

  // Step 4: Switch to "সাধারণ ও নোটিশ বার" Tab and update Announcement & WhatsApp
  console.log('4️⃣ Updating Announcement Banner & WhatsApp button text...');
  const generalTabBtn = page.locator('button:has-text("সাধারণ ও নোটিশ বার")');
  await generalTabBtn.click();
  await page.waitForTimeout(400);

  // Announcement Input
  const announcementInput = page.locator('input[value*="সরকারি ও ব্যাংক চাকরির"], label:has-text("নোটিশ বার্তা টেক্সট") + input').first();
  if (await announcementInput.isVisible()) {
    await announcementInput.fill('⚡ [লাইভ টেস্ট] নতুন সরকারি ও ব্যাংক চাকরির আবেদন প্রক্রিয়া শুরু হয়েছে!');
  }

  // WhatsApp Button Text
  const whatsappButtonInput = page.locator('input[value="WhatsApp"], label:has-text("হোয়াটসঅ্যাপ বাটন টেক্সট") + input').first();
  if (await whatsappButtonInput.isVisible()) {
    await whatsappButtonInput.fill('লাইভ সাপোর্ট');
  }

  // Step 5: Save Header & Footer Settings
  console.log('💾 Saving Header & Footer settings...');
  const saveChromeBtn = page.locator('button:has-text("হেডার ও ফুটার পরিবর্তন সংরক্ষণ করুন")');
  await saveChromeBtn.click();
  await page.waitForTimeout(2000);

  // Close modal
  const closeModalBtn = page.locator('button:has-text("✕")').last();
  if (await closeModalBtn.isVisible()) {
    await closeModalBtn.click();
    await page.waitForTimeout(500);
  }

  // Step 6: Select & Edit How It Works Section in the Page Builder Canvas
  console.log('5️⃣ Customizing How-It-Works section (Title, Color) in Builder...');
  const howItWorksSection = page.locator('div[data-section-id="sec-home-how-it-works"]').first();
  await howItWorksSection.waitFor({ state: 'visible', timeout: 5000 });
  await howItWorksSection.click();
  await page.waitForTimeout(800);

  // Title input in inspector
  const titleInput = page.locator('label:has-text("মূল শিরোনাম") + input').first();
  if (await titleInput.isVisible()) {
    await titleInput.fill('সহজ ৩টি ধাপে সরাসরি চাকরি আবেদন সম্পন্ন করুন (লাইভ টেস্ট)');
    console.log('✏️ Updated section title in inspector');
  }

  // Pick Navy color (#0f172a) in palette
  const navyColorBtn = page.locator('button[style*="background-color: rgb(15, 23, 42)"], button[style*="#0f172a"]').first();
  if (await navyColorBtn.isVisible()) {
    await navyColorBtn.click();
    console.log('🎨 Selected Navy (#0f172a) background color in inspector');
  }

  // Step 7: Publish Page in Builder
  console.log('🚀 Publishing page in Builder...');
  const publishPageBtn = page.locator('button:has-text("পাবলিশ")').first();
  await publishPageBtn.waitFor({ state: 'visible', timeout: 5000 });
  await publishPageBtn.click();
  await page.waitForTimeout(2000);

  // Capture Admin Builder Screenshot
  const adminScreenshotPath = path.join(artifactDir, '09_admin_builder_menu_and_section_edited.png');
  await page.screenshot({ path: adminScreenshotPath });
  console.log(`📸 Admin builder screenshot saved to: ${adminScreenshotPath}`);

  // Step 8: Open the PUBLIC live website in a fresh context
  console.log('🌐 Opening Public Website http://localhost:3000/ to verify live reflection...');
  const publicContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const publicPage = await publicContext.newPage();
  await publicPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await publicPage.waitForTimeout(1500);

  // Assertions on Public Page
  console.log('🔍 Running assertions on Public Website...');

  // 1. Menu bar reflection
  const updatedMenuLink = publicPage.locator('text=মূল পাতা (লাইভ টেস্ট)').first();
  const isMenuUpdated = await updatedMenuLink.isVisible();
  console.log(`👉 Menu item "মূল পাতা (লাইভ টেস্ট)" visible: ${isMenuUpdated}`);

  const newMenuItem = publicPage.locator('text=জরুরি সার্কুলার').first();
  const isNewMenuVisible = await newMenuItem.isVisible();
  console.log(`👉 New menu item "জরুরি সার্কুলার" visible: ${isNewMenuVisible}`);

  // 2. Announcement banner reflection
  const announcementText = publicPage.locator('text=⚡ [লাইভ টেস্ট] নতুন সরকারি ও ব্যাংক চাকরির আবেদন প্রক্রিয়া শুরু হয়েছে!').first();
  const isAnnouncementUpdated = await announcementText.isVisible();
  console.log(`👉 Announcement text updated: ${isAnnouncementUpdated}`);

  // 3. WhatsApp button text reflection
  const whatsappButton = publicPage.locator('text=লাইভ সাপোর্ট').first();
  const isWhatsappUpdated = await whatsappButton.isVisible();
  console.log(`👉 WhatsApp button text "লাইভ সাপোর্ট" updated: ${isWhatsappUpdated}`);

  // 4. Section title reflection
  const howItWorksHeading = publicPage.locator('text=সহজ ৩টি ধাপে সরাসরি চাকরি আবেদন সম্পন্ন করুন (লাইভ টেস্ট)').first();
  const isHowItWorksUpdated = await howItWorksHeading.isVisible();
  console.log(`👉 How-It-Works section title updated: ${isHowItWorksUpdated}`);

  // Capture Full Page Screenshot of Public Website
  const publicScreenshotPath = path.join(artifactDir, '10_public_live_page_reflecting_admin_changes.png');
  await publicPage.screenshot({ path: publicScreenshotPath, fullPage: true });
  console.log(`📸 Public live page screenshot saved to: ${publicScreenshotPath}`);

  // Step 9: Verify Mobile Menu Drawer Reflection at 375px
  console.log('📱 Verifying Mobile (375px) Menu Reflection...');
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  // Open mobile menu
  const mobileMenuToggle = mobilePage.locator('button[aria-label="Toggle Menu"]');
  if (await mobileMenuToggle.isVisible()) {
    await mobileMenuToggle.click();
    await mobilePage.waitForTimeout(800);
  }

  const mobileUpdatedMenu = mobilePage.locator('nav a:has-text("মূল পাতা (লাইভ টেস্ট)"):visible').first();
  const isMobileMenuUpdated = await mobileUpdatedMenu.isVisible();
  console.log(`👉 Mobile drawer menu item "মূল পাতা (লাইভ টেস্ট)" visible: ${isMobileMenuUpdated}`);

  const mobileScreenshotPath = path.join(artifactDir, '11_public_mobile_menu_reflecting_changes.png');
  await mobilePage.screenshot({ path: mobileScreenshotPath });
  console.log(`📸 Mobile menu screenshot saved to: ${mobileScreenshotPath}`);

  await browser.close();

  const allPassed = isMenuUpdated && isNewMenuVisible && isAnnouncementUpdated && isWhatsappUpdated && isHowItWorksUpdated && isMobileMenuUpdated;
  console.log(`\n========================================`);
  console.log(`🎉 ALL LIVE REFLECTION VERIFICATIONS PASSED: ${allPassed}`);
  console.log(`========================================\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

runLiveReflectionTest().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
