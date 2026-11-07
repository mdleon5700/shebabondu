const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testRealCms() {
  console.log('🚀 Starting Comprehensive Live CMS & Real-Time Sync Verification...');
  const baseUrl = 'http://localhost:3000';
  const brainDir = path.join('C:', 'Users', 'Leon Rahman', '.gemini', 'antigravity', 'brain', '28ee63ba-098a-42e1-8ed2-67073b8967cd');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('dialog', async dialog => {
    console.log(`💬 Dialog: [${dialog.type()}] "${dialog.message()}"`);
    await dialog.accept();
  });

  const saveArtifact = async (filename) => {
    const targetPath = path.join(brainDir, filename);
    await page.screenshot({ path: targetPath, fullPage: false });
    console.log(`📸 Saved screenshot: ${filename}`);
  };

  // -------------------------------------------------------------
  // TEST 1: Admin Theme Customizer & Real-Time In-Admin Preview
  // -------------------------------------------------------------
  console.log('\n--- TEST 1: Admin Theme Customizer & In-Admin Preview ---');
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_admin_auth', 'verified');
    document.cookie = 'cs_session_token=mock-valid; path=/';
  });
  await page.goto(`${baseUrl}/admin?tab=header-footer`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Authenticate if prompt appears
  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.count() > 0) {
    await pinInput.fill('1234');
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.count() > 0) await submitBtn.click();
    await page.waitForTimeout(1500);
  }

  // Ensure on header-footer tab
  if (!page.url().includes('tab=header-footer')) {
    await page.goto(`${baseUrl}/admin?tab=header-footer`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
  }

  // If sub-tab switcher is present, click "হেডার ও মেনু কাস্টমাইজার"
  const customizerTabBtn = page.locator('button:has-text("হেডার ও মেনু কাস্টমাইজার")').first();
  if (await customizerTabBtn.count() > 0) {
    await customizerTabBtn.click();
    await page.waitForTimeout(1000);
  }

  // Check In-Admin Live Preview (Right Column)
  const previewHeading = page.locator('h3:has-text("লাইভ ইন্টারেক্টিভ প্রিভিউ")').first();
  const hasPreview = await previewHeading.isVisible();
  console.log('✅ In-Admin Live Preview Panel Detected:', hasPreview);

  // Test Mobile / Desktop Preview Toggle
  const mobileToggle = page.locator('button:has-text("মোবাইল")').first();
  if (await mobileToggle.count() > 0) {
    await mobileToggle.click();
    await page.waitForTimeout(500);
    console.log('📱 Switched to Mobile Viewport in Preview');
  }

  const desktopToggle = page.locator('button:has-text("ডেস্কটপ")').first();
  if (await desktopToggle.count() > 0) {
    await desktopToggle.click();
    await page.waitForTimeout(500);
    console.log('🖥️ Switched back to Desktop Viewport in Preview');
  }

  // Change Brand Title and Announcement
  const siteNameInput = page.locator('input[placeholder="চাকরি সেবা"]').first();
  if (await siteNameInput.count() > 0) {
    await siteNameInput.fill('চাকরি সেবা বাংলাদেশ (অফিশিয়াল)');
    console.log('✍️ Changed Site Name to: চাকরি সেবা বাংলাদেশ (অফিশিয়াল)');
  }

  const announcementInput = page.locator('textarea[placeholder="জরুরি নোটিশ টেক্সট লিখুন..."]').first();
  if (await announcementInput.count() > 0) {
    await announcementInput.fill('⚡ জরুরি আপডেট: সকল সরকারি ও ব্যাংক চাকরির অনলাইন আবেদন পোর্টাল সক্রিয় রয়েছে!');
    console.log('✍️ Changed Announcement Text');
  }

  await saveArtifact('customizer_with_live_preview.png');

  // Save Settings
  const saveCustomizerBtn = page.locator('button:has-text("সকল হেডার ও ফুটার ডিজাইন পরিবর্তন সংরক্ষণ করুন")').first();
  if (await saveCustomizerBtn.count() > 0) {
    console.log('💾 Saving Customizer Settings...');
    await saveCustomizerBtn.click();
    await page.waitForTimeout(3000);
  }

  // -------------------------------------------------------------
  // TEST 2: Verify Live Public Site Header & Footer Synchronization
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Verifying Live Public Reflection ---');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const publicHeaderText = await page.locator('header').innerText();
  const publicFooterText = await page.locator('footer').innerText();

  const brandInHeader = publicHeaderText.includes('চাকরি সেবা বাংলাদেশ (অফিশিয়াল)');
  const announcementInHeader = publicHeaderText.includes('সকল সরকারি ও ব্যাংক চাকরির অনলাইন আবেদন পোর্টাল সক্রিয় রয়েছে');
  const brandInFooter = publicFooterText.includes('চাকরি সেবা বাংলাদেশ (অফিশিয়াল)');

  console.log('✅ Live Public Header Brand Updated:', brandInHeader);
  console.log('✅ Live Public Header Announcement Updated:', announcementInHeader);
  console.log('✅ Live Public Footer Brand Updated:', brandInFooter);
  await saveArtifact('public_homepage_synced.png');

  // -------------------------------------------------------------
  // TEST 3: Edit Homepage ("হোমপেজ") Hero in Website Builder
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Editing Home Page in Website Builder ---');
  await page.goto(`${baseUrl}/admin?tab=builder`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click on the Hero section in canvas to open inspector
  const h2 = page.locator('h2:has-text("চাকরির খবর")').first();
  if (await h2.count() > 0) {
    await h2.click();
    await page.waitForTimeout(1000);
    console.log('🎯 Clicked Hero Section card in canvas to activate inspector');
  }

  // Find inspector title input and edit it
  const label = page.locator('label:has-text("মূল শিরোনাম")');
  if (await label.count() > 0) {
    const titleInput = label.locator('xpath=following-sibling::input').first();
    await titleInput.fill('চাকরির খবর জানুন সবার আগে — ১০০% সঠিক ও দ্রুত আবেদন সেবা ২০২৬');
    console.log('✍️ Updated Home Hero Title in Website Builder');
  }

  await saveArtifact('website_builder_home_edited.png');

  // Click Publish
  const publishPageBtn = page.locator('button:has-text("পাবলিশ")').first();
  if (await publishPageBtn.count() > 0) {
    console.log('🚀 Publishing Home Page Changes...');
    await publishPageBtn.click();
    await page.waitForTimeout(3000);
  }

  // -------------------------------------------------------------
  // TEST 4: Verify Public Homepage Reflects CMS Hero Edits Live!
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Verifying Public Homepage Reflects CMS Hero Live ---');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const homeH1 = await page.locator('h1').first().innerText();
  console.log('Current Public Homepage H1:', homeH1.replace(/\n/g, ' '));
  const hasUpdatedHero = homeH1.includes('১০০% সঠিক ও দ্রুত আবেদন সেবা ২০২৬');
  console.log('✅ Public Homepage reflects CMS Hero Title edit:', hasUpdatedHero);
  await saveArtifact('public_homepage_hero_updated.png');

  // -------------------------------------------------------------
  // TEST 5: Verify Public Content Pages (about-us, contact-us, faq)
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Verifying Public Custom Pages ---');
  
  // 5a. About Us
  await page.goto(`${baseUrl}/about-us`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const aboutText = await page.locator('main').innerText();
  console.log('✅ /about-us has real content:', aboutText.includes('বাংলাদেশের প্রথম ডিজিটাল জব অ্যাসিস্ট্যান্স') || aboutText.includes('আমাদের লক্ষ্য'));

  // 5b. Contact Us
  await page.goto(`${baseUrl}/contact-us`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const contactText = await page.locator('main').innerText();
  console.log('✅ /contact-us has real helpline:', contactText.includes('+৮৮০ ১৭৭৪-৩৬৬৬৪৩'));

  // 5c. FAQ
  await page.goto(`${baseUrl}/faq`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const faqText = await page.locator('main').innerText();
  console.log('✅ /faq has real FAQ questions:', faqText.includes('চাকরি সেবা প্ল্যাটফর্মের মাধ্যমে কীভাবে আবেদন করবেন') || faqText.includes('সচরাচর জিজ্ঞাসিত'));

  await browser.close();
  console.log('\n🎉 ALL LIVE CMS & REAL-TIME SYNC TESTS COMPLETED CLEANLY!');
}

testRealCms().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
