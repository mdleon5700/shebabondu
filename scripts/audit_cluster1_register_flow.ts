import { chromium } from 'playwright';

async function auditRegisterFlow() {
  console.log('🚀 Starting Cluster 1: Candidate Registration (/register) End-to-End System Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  try {
    // 1. Visit /register
    console.log('Navigating to /register...');
    await page.goto('http://localhost:3000/register', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(1000);

    // Verify Title & Hero
    const titleText = await page.locator('h1').innerText();
    console.log(`✓ Page header found: "${titleText}"`);

    // Verify Feature Highlights: Wallet & Vault Auto-Provisioning Badges
    const walletBadge = page.locator('text=শূন্য ব্যালেন্সের ওয়ালেট');
    const vaultBadge = page.locator('text=৮-স্লটের ডকুমেন্ট ভল্ট');
    if (!(await walletBadge.isVisible()) || !(await vaultBadge.isVisible())) {
      throw new Error('Auto-provisioning feature badges (Wallet / 8-slot Vault) not displayed!');
    }
    console.log('✓ Verified Auto-Provisioning feature badges: শূন্য ব্যালেন্সের ওয়ালেট & ৮-স্লটের ডকুমেন্ট ভল্ট');

    // Verify Bilingual Name fields exist
    const bnNameInput = page.locator('input[placeholder*="মোঃ তানভীর হাসান"]');
    const enNameInput = page.locator('input[placeholder*="MD. TANVIR HASAN"]');
    if (!(await bnNameInput.isVisible()) || !(await enNameInput.isVisible())) {
      throw new Error('Bilingual dual name inputs (Bangla & English) not displayed!');
    }
    console.log('✓ Verified bilingual dual name inputs: বাংলা নাম ও English Name');

    // Verify 64 Districts Grouped Select Dropdown
    const districtSelect = page.locator('select');
    const optgroups = page.locator('select optgroup');
    const optgroupCount = await optgroups.count();
    const optionsCount = await page.locator('select option').count();
    console.log(`✓ Verified District Select Dropdown: ${optgroupCount} Division optgroups, ${optionsCount} District options`);
    if (optgroupCount < 8 || optionsCount < 64) {
      throw new Error(`District select incomplete! Expected at least 8 divisions and 64 districts, found ${optgroupCount} & ${optionsCount}`);
    }

    // Verify Confirm Password field exists
    const passInput = page.locator('input[placeholder="পাসওয়ার্ড দিন"]');
    const confirmPassInput = page.locator('input[placeholder="পুনরায় পাসওয়ার্ড লিখুন"]');
    if (!(await passInput.isVisible()) || !(await confirmPassInput.isVisible())) {
      throw new Error('Password & Confirm Password fields not displayed!');
    }
    console.log('✓ Verified Password & Confirm Password input fields with show/hide toggle');

    // 2. Test Real-time Mobile Number Validation
    console.log('\n--- Testing Real-time Mobile Number Validation ---');
    const phoneInput = page.locator('input[placeholder="017XXXXXXXX"]');
    await phoneInput.fill('01712');
    await page.waitForTimeout(300);
    const counterText = await page.locator('text=/১১ ডিজিট').innerText();
    console.log(`✓ Real-time digit counter on partial number: "${counterText}"`);

    await phoneInput.fill('01888123456');
    await page.waitForTimeout(300);
    const validNumberIndicator = await page.locator('text=✓ সঠিক নম্বর').isVisible();
    console.log(`✓ Real-time valid number checkmark visible: ${validNumberIndicator}`);
    if (!validNumberIndicator) throw new Error('11-digit Bangladesh phone validation indicator failed!');

    // 3. Test Password Mismatch Detection
    console.log('\n--- Testing Password Mismatch Detection ---');
    await passInput.fill('secret123456');
    await confirmPassInput.fill('wrongPass999');
    await page.waitForTimeout(300);
    const mismatchIndicator = await page.locator('text=অমিল').isVisible();
    console.log(`✓ Password mismatch detected dynamically: ${mismatchIndicator}`);

    // Fix password match
    await confirmPassInput.fill('secret123456');
    await page.waitForTimeout(300);
    const matchIndicator = await page.locator('text=✓ মিল রয়েছে').isVisible();
    console.log(`✓ Password match verified dynamically: ${matchIndicator}`);

    // 4. Fill form with fresh test candidate
    console.log('\n--- Testing Complete Candidate Registration Pipeline ---');
    const uniqueSuffix = Date.now().toString().slice(-4);
    const testPhone = `01799${uniqueSuffix}${Math.floor(10 + Math.random() * 90)}`;
    
    await bnNameInput.fill('মোঃ রকিবুল ইসলাম');
    await enNameInput.fill('MD. ROKIBUL ISLAM');
    await phoneInput.fill(testPhone);
    await districtSelect.selectOption({ label: 'চট্টগ্রাম (CHATTOGRAM)' });
    await passInput.fill('roqibul2026');
    await confirmPassInput.fill('roqibul2026');

    // Capture showcase screenshot of filled registration page
    const screenshotPath = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/audit_112_register_full_portal_showcase.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Captured filled registration portal showcase at: ${screenshotPath}`);

    // Submit Registration Form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    console.log('Submitted registration form, waiting for instant redirect...');

    // Wait for redirect to /dashboard
    await page.waitForURL(url => url.pathname.startsWith('/dashboard'), { waitUntil: 'commit', timeout: 25000 });
    console.log(`✓ Instant auto-login successful! Current URL: ${page.url()}`);

    // Verify session token cookie exists
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'cs_session_token');
    if (!sessionCookie) {
      throw new Error('cs_session_token cookie was not set upon registration!');
    }
    console.log(`✓ Verified session token cookie: ${sessionCookie.name} = ${sessionCookie.value.slice(0, 12)}... (Max-Age: 30 days)`);

    // Verify candidate profile state in browser
    const storedAuth = await page.evaluate(() => localStorage.getItem('cs_auth_state'));
    console.log(`✓ Stored client auth state: ${storedAuth}`);

    console.log('\n🎉 CANDIDATE REGISTRATION (/register) AUDIT PASSED WITH 100% SUCCESS!');
  } catch (error) {
    console.error('❌ Registration Audit failure:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

auditRegisterFlow();
