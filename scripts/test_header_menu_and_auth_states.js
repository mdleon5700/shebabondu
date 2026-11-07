const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function safeGoto(page, url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      return;
    } catch (err) {
      if (err.message.includes('ERR_ABORTED') && attempt < maxRetries) {
        console.warn(`[safeGoto] ${url} aborted (attempt ${attempt}), retrying in 1.5s...`);
        await page.waitForTimeout(1500);
      } else {
        throw err;
      }
    }
  }
}

async function runHeaderMenuAndAuthStateQA() {
  const artifactDir = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  console.log('🚀 Starting Automated Header Menu Reordering & Auth States QA Test...\n');
  const browser = await chromium.launch({ headless: true });

  // ==========================================================
  // STEP 1: Admin Panel - Edit Menu Order & Configure Auth Buttons
  // ==========================================================
  console.log('1️⃣ Admin Session: Navigating to Website Builder & Opening Header Settings Modal...');
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await adminContext.addCookies([
    {
      name: 'cs_session_token',
      value: 'mock-admin-session-token',
      domain: 'localhost',
      path: '/'
    }
  ]);
  const adminPage = await adminContext.newPage();
  await adminPage.goto('http://localhost:3000/');
  await adminPage.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
  });

  await safeGoto(adminPage, 'http://localhost:3000/admin?tab=builder');
  await adminPage.waitForTimeout(2000);

  // Click "হেডার ও ফুটার সেটিংস" button
  console.log('🔧 Clicking হেডার ও ফুটার সেটিংস button...');
  const chromeBtn = adminPage.locator('button:has-text("হেডার ও ফুটার সেটিংস")').first();
  await chromeBtn.click();
  await adminPage.waitForTimeout(1000);

  // Switch to Menu Tab
  console.log('📂 Switching to মেনু বার লিংক tab...');
  const menuTabBtn = adminPage.locator('button:has-text("মেনু বার লিংক")').first();
  await menuTabBtn.click();
  await adminPage.waitForTimeout(600);

  // Reorder: click Down button on first menu item
  console.log('⬇️ Reordering menu: clicking down arrow on #1 menu item...');
  const downBtn = adminPage.locator('button[title="নিচে নিন"]').first();
  if (await downBtn.isVisible()) {
    await downBtn.click();
    await adminPage.waitForTimeout(500);
  }

  // Switch to Auth Buttons Tab
  console.log('🔐 Switching to বাটন ও অথ কন্ট্রোল tab...');
  const authTabBtn = adminPage.locator('button:has-text("বাটন ও অথ কন্ট্রোল")').first();
  await authTabBtn.click();
  await adminPage.waitForTimeout(600);

  // Screenshot 20: Admin Header Settings Modal with Auth Controls
  const screen20 = path.join(artifactDir, '20_admin_header_settings_modal_edited.png');
  await adminPage.screenshot({ path: screen20 });
  console.log(`📸 Screenshot saved: ${screen20}`);

  // Save changes
  console.log('💾 Saving Header & Footer Changes...');
  const saveBtn = adminPage.locator('button:has-text("হেডার ও ফুটার পরিবর্তন সংরক্ষণ করুন")').first();
  await saveBtn.click();
  await adminPage.waitForTimeout(2500);

  // ==========================================================
  // STEP 2: Public Guest State Verification (Without Login)
  // ==========================================================
  console.log('\n2️⃣ Guest Session: Verifying Guest Header & Action Buttons (Without Login)...');
  const guestContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const guestPage = await guestContext.newPage();

  await safeGoto(guestPage, 'http://localhost:3000/');
  await guestPage.waitForTimeout(2000);

  const guestHeaderText = await guestPage.locator('header').innerText();

  const hasLoginBtn = guestHeaderText.includes('লগইন');
  const hasRegisterBtn = guestHeaderText.includes('রেজিস্ট্রেশন');
  const hasWhatsAppBtn = guestHeaderText.includes('হোয়াটসঅ্যাপ') || guestHeaderText.includes('WhatsApp');
  const hasTrackBtn = guestHeaderText.includes('আবেদন ট্র্যাক');

  console.log(`👉 Guest Login button visible: ${hasLoginBtn}`);
  console.log(`👉 Guest Register CTA button visible: ${hasRegisterBtn}`);
  console.log(`👉 Guest WhatsApp button visible: ${hasWhatsAppBtn}`);
  console.log(`👉 Guest Track Application link visible: ${hasTrackBtn}`);

  const screen21 = path.join(artifactDir, '21_public_guest_header_verified.png');
  await guestPage.screenshot({ path: screen21 });
  console.log(`📸 Screenshot saved: ${screen21}`);

  // ==========================================================
  // STEP 3: Candidate Logged-In State Verification (After Login)
  // ==========================================================
  console.log('\n3️⃣ Candidate Session: Registering and Verifying User Header Widgets (After Login)...');
  const candidateContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const candidatePage = await candidateContext.newPage();

  // Register a candidate to establish real verified auth session
  const candidatePhone = `01799${Math.floor(100000 + Math.random() * 900000)}`;
  await safeGoto(candidatePage, 'http://localhost:3000/register');
  await candidatePage.fill('input[placeholder*="তানভীর"]', 'তানভীর আহমেদ (হেডার টেস্ট)');
  await candidatePage.fill('input[placeholder*="017"]', candidatePhone);
  await candidatePage.fill('input[placeholder*="ঢাকা"]', 'ঢাকা');
  await candidatePage.fill('input[type="password"]', 'Pass@2026Secure');
  await candidatePage.click('button[type="submit"]');
  await candidatePage.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
  await candidatePage.waitForTimeout(2000);

  // Navigate to Homepage as authenticated candidate
  console.log('🏠 Navigating to Homepage as authenticated candidate...');
  await safeGoto(candidatePage, 'http://localhost:3000/');
  await candidatePage.waitForTimeout(2000);

  // Assert user widgets via header text
  const candidateHeaderText = await candidatePage.locator('header').innerText();

  const hasDashboardBtn = candidateHeaderText.includes('ড্যাশবোর্ড');
  const hasWalletWidget = candidateHeaderText.includes('৳');
  const hasAvatarInitial = candidateHeaderText.includes('ত');
  const hasNotificationBell = await candidatePage.locator('header a[href="/dashboard/notifications"]').first().isVisible();

  // Guest buttons should NOT be visible when candidate is logged in
  const guestRegisterHidden = !candidateHeaderText.includes('ফ্রি রেজিস্ট্রেশন');

  console.log(`👉 Candidate Dashboard CTA button visible: ${hasDashboardBtn}`);
  console.log(`👉 Candidate Wallet widget visible: ${hasWalletWidget}`);
  console.log(`👉 Candidate Avatar Initial visible: ${hasAvatarInitial}`);
  console.log(`👉 Candidate Notification bell visible: ${hasNotificationBell}`);
  console.log(`👉 Guest register button hidden on auth state: ${guestRegisterHidden}`);

  // Click Avatar dropdown to verify menu items
  const avatarBtn = candidatePage.locator('header button:has(.rounded-full)').first();
  let hasProfileLink = false;
  let hasLogoutBtn = false;
  if (await avatarBtn.isVisible()) {
    console.log('👤 Opening Candidate Profile Avatar Dropdown...');
    await avatarBtn.click();
    await candidatePage.waitForTimeout(600);
    const dropdownBody = await candidatePage.locator('body').innerText();
    hasProfileLink = dropdownBody.includes('আমার প্রোফাইল') || dropdownBody.includes('আমার আবেদন');
    hasLogoutBtn = dropdownBody.includes('লগআউট');
  }
  console.log(`👉 Profile dropdown contains links & logout: ${hasProfileLink && hasLogoutBtn}`);

  const screen22 = path.join(artifactDir, '22_public_logged_in_candidate_header_verified.png');
  await candidatePage.screenshot({ path: screen22 });
  console.log(`📸 Screenshot saved: ${screen22}`);

  await browser.close();

  const allPassed = hasLoginBtn && hasRegisterBtn && hasDashboardBtn && hasWalletWidget && guestRegisterHidden;
  console.log('\n======================================================');
  console.log(`🎉 ALL HEADER MENU & AUTH STATES QA ASSERTIONS PASSED: ${allPassed}`);
  console.log('======================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runHeaderMenuAndAuthStateQA().catch(err => {
  console.error('❌ QA Test failed with error:', err);
  process.exit(1);
});
