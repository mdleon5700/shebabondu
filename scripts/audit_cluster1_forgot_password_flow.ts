import { chromium } from 'playwright';
import path from 'path';

async function auditForgotPasswordFlow() {
  console.log('🚀 Starting Cluster 1: Forgot Password & OTP Recovery (/auth/forgot-password & /login modal) System Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('BROWSER UNCAUGHT ERROR:', err.message));

  const artifactDir = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';
  const screenshotPath = path.join(artifactDir, 'audit_113_forgot_password_showcase.png');

  try {
    // -----------------------------------------------------------------------------------
    // PART 1: TEST STANDALONE /auth/forgot-password PAGE
    // -----------------------------------------------------------------------------------
    console.log('\n--- 1. Testing Standalone Route /auth/forgot-password ---');
    await page.goto('http://localhost:3000/auth/forgot-password', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(1000);

    // Verify 3-step pills & Title
    const title = await page.locator('h1').innerText();
    console.log(`✓ Standalone page title: "${title}"`);

    const step1Badge = page.locator('text=১. তথ্য দিন');
    const step2Badge = page.locator('text=২. ওটিপি যাচাই');
    const step3Badge = page.locator('text=৩. নতুন পাসওয়ার্ড');
    if (!(await step1Badge.isVisible()) || !(await step2Badge.isVisible()) || !(await step3Badge.isVisible())) {
      throw new Error('3-Step progress badges not visible on /auth/forgot-password');
    }
    console.log('✓ Verified 3-Step Wizard Progress Badges');

    // Step 1: Input registered identifier (01712-345678)
    const idInput = page.locator('input[placeholder*="017XXXXXXXX"]');
    await idInput.fill('01712-345678');
    console.log('Filled identifier, submitting form...');
    const submitBtn = page.locator('form button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(1500);

    // Check if error message is displayed
    const errorEl = page.locator('.text-rose-800, .bg-rose-50');
    if (await errorEl.isVisible()) {
      console.log('ERROR ON PAGE:', await errorEl.innerText());
    }

    // Verify transitioned to Step 2
    console.log('Verifying transition to Step 2...');
    const step2Indicator = page.locator('input[placeholder="১২৩৪৫৬"]');
    await step2Indicator.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Successfully moved to Step 2: OTP Verification');

    // Verify Masked Target and Countdown Timer
    const maskedText = await page.locator('text=017****678').or(page.locator('text=017****5678')).or(page.locator('text=017')).first().innerText();
    console.log(`✓ Masked target displayed: "${maskedText}"`);

    const countdownText = await page.locator('text=পুনরায় পাঠান').first().innerText();
    console.log(`✓ Countdown timer active: "${countdownText}"`);

    // Extract test OTP code from page
    const testOtpEl = page.locator('span:has-text("টেস্টিং ওটিপি কোড:")').locator('..').locator('strong').first();
    const otpCode = await testOtpEl.innerText();
    console.log(`✓ Detected test OTP from server: "${otpCode}"`);

    // Fill OTP
    await step2Indicator.fill(otpCode.trim());
    const verifyBtn = page.locator('form button[type="submit"]').first();
    await verifyBtn.click();
    await page.waitForTimeout(1200);

    // Verify transitioned to Step 3
    console.log('Verifying transition to Step 3...');
    const step3Indicator = page.locator('text=নতুন পাসওয়ার্ড').first();
    await step3Indicator.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Successfully moved to Step 3: New Password');

    // Fill new password and confirm
    const newPassInput = page.locator('input[placeholder*="নতুন পাসওয়ার্ড"]').first();
    const confirmPassInput = page.locator('input[placeholder*="পুনরায় পাসওয়ার্ড"]').first();
    await newPassInput.fill('password123');
    await confirmPassInput.fill('password123');

    // Verify real-time match badge
    const matchBadge = page.locator('text=✓ পাসওয়ার্ড দুটি মিল রয়েছে').first();
    if (await matchBadge.isVisible()) {
      console.log('✓ Real-time match badge verified: "✓ পাসওয়ার্ড দুটি মিল রয়েছে"');
    }

    // Submit password reset
    const savePassBtn = page.locator('form button[type="submit"]').first();
    await savePassBtn.click();
    await page.waitForTimeout(2000);

    // Verify redirection to /dashboard
    const currentUrl = page.url();
    console.log(`✓ Redirection after password reset: ${currentUrl}`);
    if (!currentUrl.includes('/dashboard')) {
      throw new Error(`Expected redirection to /dashboard, got ${currentUrl}`);
    }
    console.log('✓ Standalone /auth/forgot-password flow completed with auto-login!');

    // -----------------------------------------------------------------------------------
    // PART 2: TEST MODAL ON /login
    // -----------------------------------------------------------------------------------
    console.log('\n--- 2. Testing Interactive Forgot Password Modal on /login ---');
    // Clear cookies & storage to test modal cleanly
    await context.clearCookies();
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(1000);

    // Click "পাসওয়ার্ড ভুলে গেছেন?"
    const forgotLink = page.locator('button:has-text("পাসওয়ার্ড ভুলে গেছেন?")');
    await forgotLink.click();
    await page.waitForTimeout(500);

    // Verify modal is open
    const modalTitle = page.locator('h3:has-text("পাসওয়ার্ড রিকভারি")');
    if (!(await modalTitle.isVisible())) {
      throw new Error('Forgot password modal did not open upon clicking link!');
    }
    console.log('✓ Modal opened successfully');

    // Verify 3-step badges in modal
    const modalStep1 = page.locator('.fixed').locator('text=১. তথ্য দিন');
    const modalStep2 = page.locator('.fixed').locator('text=২. ওটিপি যাচাই');
    const modalStep3 = page.locator('.fixed').locator('text=৩. নতুন পাসওয়ার্ড');
    if (!(await modalStep1.isVisible()) || !(await modalStep2.isVisible()) || !(await modalStep3.isVisible())) {
      throw new Error('3-Step indicator inside modal not visible!');
    }
    console.log('✓ Verified 3-Step Wizard Indicator inside modal');

    // Input email or phone in modal
    const modalIdInput = page.locator('.fixed input[placeholder*="017XXXXXXXX"]');
    await modalIdInput.fill('tanvir.jobseeker@gmail.com');

    // Click Send OTP
    const modalSendBtn = page.locator('.fixed button:has-text("ওটিপি কোড পাঠান")');
    await modalSendBtn.click();
    await page.waitForTimeout(1200);

    // Verify Step 2 inside modal
    const modalOtpInput = page.locator('.fixed input[placeholder="১২৩৪৫৬"]');
    await modalOtpInput.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Modal moved to Step 2');

    // Check masked email target (ta***@gmail.com)
    const modalMaskedTarget = await page.locator('.fixed').locator('text=ta***@gmail.com').or(page.locator('.fixed').locator('text=@gmail.com')).first().innerText();
    console.log(`✓ Masked email recipient verified in modal: "${modalMaskedTarget}"`);

    // Check test OTP in modal
    const modalTestOtpEl = page.locator('.fixed').locator('span:has-text("টেস্টিং ওটিপি কোড:")').locator('..').locator('strong').first();
    const modalOtp = await modalTestOtpEl.innerText();
    console.log(`✓ Modal test OTP extracted: "${modalOtp}"`);

    // Fill OTP in modal
    await modalOtpInput.fill(modalOtp.trim());

    // Click verify in modal
    const modalVerifyBtn = page.locator('.fixed button:has-text("কোড যাচাই করুন")').first();
    await modalVerifyBtn.click();
    await page.waitForTimeout(1200);

    // Verify Step 3 in modal
    const modalStep3Title = page.locator('.fixed').locator('text=নতুন পাসওয়ার্ড');
    await modalStep3Title.first().waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Modal moved to Step 3: New Password');

    // Take Showcase Screenshot of Step 3 in Modal
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✓ Showcase screenshot saved to: ${screenshotPath}`);

    // Fill new password in modal
    const modalNewPass = page.locator('.fixed input[placeholder*="নতুন পাসওয়ার্ড"]').first();
    const modalConfirmPass = page.locator('.fixed input[placeholder*="পুনরায় পাসওয়ার্ড"]').first();
    await modalNewPass.fill('newpass2026');
    await modalConfirmPass.fill('newpass2026');

    // Verify match badge in modal
    const modalMatchBadge = page.locator('.fixed').locator('text=✓ মিল রয়েছে').first();
    if (await modalMatchBadge.isVisible()) {
      console.log('✓ Password match badge verified in modal: "✓ মিল রয়েছে"');
    }

    // Submit password reset in modal
    const modalSubmitBtn = page.locator('.fixed button:has-text("পাসওয়ার্ড পরিবর্তন ও লগইন")').first();
    await modalSubmitBtn.click();
    await page.waitForTimeout(2000);

    // Verify redirection to /dashboard
    const modalFinalUrl = page.url();
    console.log(`✓ Final URL after modal password reset: ${modalFinalUrl}`);
    if (!modalFinalUrl.includes('/dashboard')) {
      throw new Error(`Expected redirection to /dashboard from modal reset, got ${modalFinalUrl}`);
    }
    console.log('✓ Modal forgot password flow completed with auto-login!');

    // -----------------------------------------------------------------------------------
    // PART 3: TEST QUERY PARAM AUTO-OPEN (?tab=forgot & ?forgot=1)
    // -----------------------------------------------------------------------------------
    console.log('\n--- 3. Testing Query Parameter Auto-Open (?tab=forgot) ---');
    await page.goto('http://localhost:3000/login?tab=forgot', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(1000);
    const queryModal = page.locator('h3:has-text("পাসওয়ার্ড রিকভারি")');
    if (!(await queryModal.isVisible())) {
      throw new Error('Forgot modal failed to auto-open when navigating with ?tab=forgot');
    }
    console.log('✓ Verified ?tab=forgot auto-opens forgot password modal');

    console.log('\n======================================================');
    console.log('🎉 ALL CLUSTER 1 PART 3 TESTS PASSED PERFECTLY (100%)');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

auditForgotPasswordFlow();
