const { chromium } = require('playwright');
const path = require('path');

async function runLiveVisibleWalkthrough() {
  console.log('🚀 Starting VISIBLE Real-Time Human Walkthrough in Chrome...');
  const baseUrl = 'http://localhost:3000';
  const brainDir = path.join('C:', 'Users', 'Leon Rahman', '.gemini', 'antigravity', 'brain', '28ee63ba-098a-42e1-8ed2-67073b8967cd');

  // Launch visible Chrome window on desktop with human-like slow motion
  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      channel: 'chrome',
      slowMo: 600,
      args: ['--start-maximized']
    });
  } catch {
    browser = await chromium.launch({
      headless: false,
      slowMo: 600,
      args: ['--start-maximized']
    });
  }

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  page.on('dialog', async dialog => {
    console.log(`💬 Dialog popup: [${dialog.type()}] "${dialog.message()}"`);
    await dialog.accept();
  });

  // -------------------------------------------------------------------
  // STEP 1: Visit Live Public Portal and browse like a real user
  // -------------------------------------------------------------------
  console.log('🌐 [STEP 1] Visiting Live Public Portal: http://localhost:3000/');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Smooth scroll down to show the user the live page
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollBy({ top: 700, behavior: 'smooth' }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  // -------------------------------------------------------------------
  // STEP 2: Navigate to Admin and log in with PIN
  // -------------------------------------------------------------------
  console.log('🔐 [STEP 2] Navigating to Admin Panel: http://localhost:3000/admin');
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.count() > 0) {
    console.log('⌨️ Typing Admin PIN: 1234');
    await pinInput.click();
    await pinInput.fill('');
    await pinInput.type('1234', { delay: 150 });
    await page.waitForTimeout(800);

    const submitBtn = page.locator('button[type="submit"]');
    console.log('🖱️ Clicking Login button...');
    await submitBtn.click();
    await page.waitForTimeout(3000);
  }

  // -------------------------------------------------------------------
  // STEP 3: Open Theme Customizer (Header, Footer, Menus)
  // -------------------------------------------------------------------
  console.log('🎨 [STEP 3] Opening Header & Footer Customizer...');
  await page.goto(`${baseUrl}/admin?tab=header-footer`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const customizerSubTab = page.locator('button:has-text("হেডার ও মেনু কাস্টমাইজার")').first();
  if (await customizerSubTab.count() > 0) {
    await customizerSubTab.click();
    await page.waitForTimeout(1500);
  }

  // Test Mobile & Desktop Toggle in Live Preview
  console.log('📱 Testing Mobile Viewport toggle in In-Admin Preview...');
  const mobileToggle = page.locator('button:has-text("মোবাইল")').first();
  if (await mobileToggle.count() > 0) {
    await mobileToggle.click();
    await page.waitForTimeout(1500);
  }

  console.log('🖥️ Switching back to Desktop Viewport in In-Admin Preview...');
  const desktopToggle = page.locator('button:has-text("ডেস্কটপ")').first();
  if (await desktopToggle.count() > 0) {
    await desktopToggle.click();
    await page.waitForTimeout(1500);
  }

  // Update Announcement and Site Name
  console.log('✍️ Updating Site Title & Announcement...');
  const siteNameInput = page.locator('input[placeholder="চাকরি সেবা"]').first();
  if (await siteNameInput.count() > 0) {
    await siteNameInput.click();
    await siteNameInput.fill('চাকরি সেবা বাংলাদেশ (অফিশিয়াল)');
    await page.waitForTimeout(600);
  }

  const announcementInput = page.locator('textarea[placeholder="জরুরি নোটিশ টেক্সট লিখুন..."]').first();
  if (await announcementInput.count() > 0) {
    await announcementInput.click();
    await announcementInput.fill('⚡ জরুরি আপডেট: ২০২৬ সালের সকল সরকারি ও ব্যাংক চাকরির অনলাইন আবেদন সহায়তা পুরোদমে চালু রয়েছে!');
    await page.waitForTimeout(600);
  }

  // Click Save
  const saveBtn = page.locator('button:has-text("সকল হেডার ও ফুটার ডিজাইন পরিবর্তন সংরক্ষণ করুন")').first();
  if (await saveBtn.count() > 0) {
    console.log('💾 Saving Theme Customizer changes...');
    await saveBtn.click();
    await page.waitForTimeout(3000);
  }

  // -------------------------------------------------------------------
  // STEP 4: Website Builder - Edit Homepage Section Live
  // -------------------------------------------------------------------
  console.log('🏗️ [STEP 4] Opening Website Builder: http://localhost:3000/admin?tab=builder');
  await page.goto(`${baseUrl}/admin?tab=builder`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Click on the hero section in the canvas
  const h2Hero = page.locator('h2:has-text("চাকরির খবর")').first();
  if (await h2Hero.count() > 0) {
    console.log('🎯 Selecting Hero Section on canvas...');
    await h2Hero.click();
    await page.waitForTimeout(1500);

    const label = page.locator('label:has-text("মূল শিরোনাম")');
    if (await label.count() > 0) {
      const titleInput = label.locator('xpath=following-sibling::input').first();
      console.log('✍️ Editing Hero Title in Inspector...');
      await titleInput.click();
      await titleInput.fill('চাকরির খবর জানুন সবার আগে — ১০০% নির্ভুল ও দ্রুত আবেদন পোর্টাল ২০২৬');
      await page.waitForTimeout(1000);
    }
  }

  // Click Publish
  const publishBtn = page.locator('button:has-text("পাবলিশ")').first();
  if (await publishBtn.count() > 0) {
    console.log('🚀 Publishing Home Page to live website...');
    await publishBtn.click();
    await page.waitForTimeout(3500);
  }

  // -------------------------------------------------------------------
  // STEP 5: Visit Public Site to verify live changes on screen
  // -------------------------------------------------------------------
  console.log('🌟 [STEP 5] Navigating to Public Homepage to verify live changes...');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const finalH1 = await page.locator('h1').first().innerText();
  console.log('🎉 Current Live Public Homepage H1:\n', finalH1);

  // Smooth scroll down so user can review the entire live page
  await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollBy({ top: 800, behavior: 'smooth' }));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(3000);

  console.log('✅ Visible Live Human Walkthrough finished successfully!');
  await browser.close();
}

runLiveVisibleWalkthrough().catch(err => {
  console.error('❌ Walkthrough error:', err);
  process.exit(1);
});

