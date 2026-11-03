const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

const ALL_ADMIN_TABS = [
  'dashboard',
  'system-health',
  'all-applications',
  'payment-verification',
  'processing-queue',
  'completed-rejected',
  'documents',
  'circulars',
  'source-monitoring',
  'content-studio',
  'publishing-center',
  'category-search-manager',
  'job-feed-manager',
  'deadline-alert-manager',
  'smart-job-matching',
  'imported-drafts',
  'candidate-directory',
  'company-directory',
  'media-library',
  'analytics-center',
  'testing-spider',
  'automation-hub',
  'coupons-discounts',
  'transactions',
  'platform-operations',
  'builder',
  'pages-sections',
  'audit-logs',
  'notifications',
  'settings'
];

(async () => {
  console.log('===============================================================');
  console.log('🔍 EXHAUSTIVE 30-TAB ADMIN WORKSPACE AUDIT');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // 1. Pre-authenticate admin in localStorage & cookie
  await page.goto(BASE_URL + '/admin', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
    document.cookie = 'cs_session_token=ADMIN-SUPER-SESSION; path=/; max-age=2592000; SameSite=Lax';
  });

  // Reload to activate session
  await page.goto(BASE_URL + '/admin?tab=dashboard', { waitUntil: 'networkidle' });

  // If PIN screen is still showing, enter 1234
  const pinInput = await page.$('input[type="password"]');
  if (pinInput) {
    console.log('Entering PIN 1234...');
    await pinInput.fill('1234');
    const submitBtn = await page.$('button:has-text("অ্যাডমিন ড্যাশবোর্ডে প্রবেশ")');
    if (submitBtn) await submitBtn.click();
    await page.waitForTimeout(1000);
  }

  const results = {
    passed: [],
    failed: [],
    pinLocked: []
  };

  for (const tab of ALL_ADMIN_TABS) {
    const pageErrors = [];
    const consoleErrors = [];

    page.removeAllListeners('pageerror');
    page.removeAllListeners('console');

    page.on('pageerror', err => pageErrors.push(err.toString()));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon.ico') && !text.includes('404 (Not Found)')) {
          consoleErrors.push(text);
        }
      }
    });

    try {
      const url = `${BASE_URL}/admin?tab=${tab}`;
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      const status = res ? res.status() : 0;

      const bodyText = await page.evaluate(() => document.body ? document.body.innerText.trim() : '');
      const isCrash = bodyText.includes('একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে') || bodyText.includes('Application error');
      const isLocked = bodyText.includes('সিকিউর অ্যাডমিন অথেন্টিকেশন') || bodyText.includes('অ্যাডমিন ড্যাশবোর্ডে প্রবেশ');
      const isBlank = bodyText.length < 100;

      const item = {
        tab,
        status,
        bodyLength: bodyText.length,
        isCrash,
        isLocked,
        isBlank,
        pageErrors,
        consoleErrors: consoleErrors.slice(0, 3)
      };

      if (status >= 400 || isCrash || isBlank || pageErrors.length > 0) {
        results.failed.push(item);
        console.log(`❌ [FAIL] Tab: ${tab.padEnd(25)} | Status: ${status} | Crash: ${isCrash} | Blank: ${isBlank} | Errors: ${pageErrors.length}`);
        if (pageErrors.length > 0) console.log('   PageErrors:', pageErrors);
      } else if (isLocked) {
        results.pinLocked.push(item);
        console.log(`🔒 [PIN-LOCKED] Tab: ${tab.padEnd(25)} | Locked: true | Content: ${bodyText.length} chars`);
      } else {
        results.passed.push(item);
        console.log(`✅ [PASS] Tab: ${tab.padEnd(25)} | Status: ${status} | Content: ${bodyText.length} chars | OK`);
      }
    } catch (e) {
      results.failed.push({ tab, error: e.message });
      console.log(`❌ [TIMEOUT/FAIL] Tab: ${tab.padEnd(25)} | Error: ${e.message}`);
    }
  }

  console.log('\n===============================================================');
  console.log(`ADMIN TABS AUDIT: Passed: ${results.passed.length} | Pin-Locked: ${results.pinLocked.length} | Failed: ${results.failed.length}`);
  console.log('===============================================================');

  if (results.failed.length > 0) {
    console.log('Issues:', JSON.stringify(results.failed, null, 2));
  } else if (results.pinLocked.length > 0) {
    console.log(`Note: ${results.pinLocked.length} tabs were PIN-locked during reload. Let's inspect session persistence.`);
  } else {
    console.log('🌟 ALL 30 ADMIN TABS RENDERED CLEANLY WITH ZERO ERRORS!');
  }

  await browser.close();
})();
