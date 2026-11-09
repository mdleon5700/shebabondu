import { chromium } from 'playwright';

async function auditCluster1AuthFlow() {
  console.log('🚀 Starting Cluster 1: Authentication & Security Comprehensive E2E Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  try {
    // 1. Visit /login
    console.log('Navigating to /login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(1000);

    // Verify 3 tabs exist
    const loginTab = page.locator('button:has-text("লগইন")').first();
    const registerTab = page.locator('button:has-text("নিবন্ধন")').first();
    const adminTab = page.locator('button:has-text("অ্যাডমিন")').first();

    if (!(await loginTab.isVisible()) || !(await registerTab.isVisible()) || !(await adminTab.isVisible())) {
      throw new Error('Top 3 mode switcher tabs not fully visible!');
    }
    console.log('✓ Verified 3 Mode Switcher tabs: লগইন, নিবন্ধন, অ্যাডমিন');

    // Verify Remember Me checkbox
    const rememberMeCheck = page.locator('input[type="checkbox"]');
    const isChecked = await rememberMeCheck.isChecked();
    console.log(`✓ Remember Me checkbox found and default checked: ${isChecked}`);

    // Switch to Register Tab
    await registerTab.click();
    await page.waitForTimeout(400);
    const nameInput = page.locator('input[placeholder*="মোঃ তানভীর হাসান"]');
    if (!(await nameInput.isVisible())) {
      throw new Error('Registration form not displayed on tab switch!');
    }
    console.log('✓ Verified Register tab switches smoothly');

    // Switch to Admin PIN Tab
    await adminTab.click();
    await page.waitForTimeout(400);
    const pinInput = page.locator('input[placeholder*="পিন প্রদান করুন"]');
    if (!(await pinInput.isVisible())) {
      throw new Error('Admin PIN form not displayed on tab switch!');
    }
    console.log('✓ Verified Admin PIN tab switches smoothly');

    // Switch back to Login Tab
    await loginTab.click();
    await page.waitForTimeout(400);

    // 2. Test Deep Linking / Redirect Handling
    console.log('\n--- Testing Deep Linking / Redirect Handling ---');
    await page.goto('http://localhost:3000/login?redirect=%2Fdashboard%2Fvault', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Click Quick Demo login chip
    const demoButton = page.locator('button:has-text("১-ক্লিক ডেমো অ্যাকাউন্ট")');
    await demoButton.click();
    console.log('Clicked 1-Click Demo Login button...');

    // Wait for redirect to /dashboard/vault
    await page.waitForFunction(() => window.location.pathname.includes('/dashboard/vault'), null, { timeout: 25000 });
    console.log('✓ Successfully deep-linked to redirect target: /dashboard/vault');

    // 3. Test Social Login Modal
    console.log('\n--- Testing Social Auth Modal & One-Tap Login ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    console.log('Current URL before social click:', page.url());

    const googleBtn = page.locator('button:has-text("Google")').first();
    await googleBtn.scrollIntoViewIfNeeded();
    await googleBtn.click();
    await page.waitForTimeout(800);

    const isModalOpen = await page.locator('text=এক ক্লিকে প্রবেশ').isVisible();
    console.log('Is social modal open:', isModalOpen);
    if (!isModalOpen) {
      console.log('Page title / text:', await page.locator('body').innerText());
      throw new Error('Social auth modal did not open!');
    }
    console.log('✓ Social Auth Modal opened successfully');

    // Click the candidate profile in modal
    const profileBtn = page.locator('button:has-text("মোঃ তানভীর হাসান (বিদ্যমান প্রার্থী)")');
    await profileBtn.click();
    console.log('Clicked Google profile button in modal...');

    // Wait for redirect to /dashboard
    await page.waitForFunction(() => window.location.pathname.startsWith('/dashboard'), null, { timeout: 25000 });
    console.log('✓ Social login successful! Redirected to /dashboard');

    // 4. Test Forgot Password OTP 3-Step Flow
    console.log('\n--- Testing Forgot Password 3-Step OTP Flow ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    // Open Forgot Password modal
    const forgotBtn = page.locator('button:has-text("ভুলে গেছেন")');
    await forgotBtn.scrollIntoViewIfNeeded();
    await forgotBtn.click();
    await page.waitForTimeout(800);

    const isForgotModalOpen = await page.locator('text=রিকভারি').isVisible();
    if (!isForgotModalOpen) {
      // Retry once if hydration was in progress
      await forgotBtn.click();
      await page.waitForTimeout(800);
    }

    // Step 1: Request OTP
    const idInput = page.locator('input[placeholder*="017XXXXXXXX বা user@email.com"]');
    await idInput.fill('01712-345678');
    await page.locator('button:has-text("ওটিপি কোড পাঠান")').click();
    await page.waitForTimeout(1000);

    // Step 2: Verify OTP
    const testOtpEl = page.locator('strong.font-mono');
    const otpCode = (await testOtpEl.textContent())?.trim();
    console.log(`Generated OTP code in UI: ${otpCode}`);
    if (!otpCode) throw new Error('OTP was not generated or displayed!');

    const otpInput = page.locator('input[placeholder="১২৩৪৫৬"]');
    await otpInput.fill(otpCode);
    await page.locator('button:has-text("কোড যাচাই করুন")').click();
    await page.waitForTimeout(1000);

    // Step 3: Set New Password
    const newPassInput = page.locator('input[placeholder="নতুন পাসওয়ার্ড"]');
    const confirmPassInput = page.locator('input[placeholder="পুনরায় পাসওয়ার্ড লিখুন"]');
    await newPassInput.fill('secret987654');
    await confirmPassInput.fill('secret987654');
    await page.locator('button:has-text("পাসওয়ার্ড পরিবর্তন ও লগইন")').click();

    // Verify login and redirect
    await page.waitForFunction(() => window.location.pathname.startsWith('/dashboard'), null, { timeout: 25000 });
    console.log('✓ Forgot password 3-step OTP flow completed and redirected to /dashboard!');

    // Capture showcase screenshot
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const screenshotPath = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/audit_110_cluster1_auth_portal_showcase.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Captured showcase screenshot at: ${screenshotPath}`);

    console.log('\n🎉 ALL CLUSTER 1 AUTH & SECURITY AUDITS PASSED WITH 100% SUCCESS!');
  } catch (error) {
    console.error('❌ Audit failure:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

auditCluster1AuthFlow();
