const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

(async () => {
  console.log('===============================================================');
  console.log('🔍 CHAKRI SHEBA — FULL BROWSER & SECTION AUDIT');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  const page = await context.newPage();

  // Test list
  const publicRoutes = [
    '/',
    '/jobs',
    '/jobs/job-alljobs-dcjamalpur-15137',
    '/government-jobs',
    '/bank-jobs',
    '/categories/bcs',
    '/categories/bank',
    '/categories/railway',
    '/categories/teacher',
    '/teacher-jobs',
    '/ngo-jobs',
    '/private-jobs',
    '/engineering-jobs',
    '/it-jobs',
    '/medical-jobs',
    '/organizations',
    '/about-us',
    '/contact-us',
    '/faq',
    '/privacy-policy',
    '/terms-and-conditions',
    '/admit-cards',
    '/exam-results',
    '/model-tests',
    '/job-alerts',
    '/report-a-job',
    '/daily-jobs'
  ];

  const userRoutes = [
    '/login',
    '/register',
    '/profile',
    '/wallet',
    '/vault',
    '/documents',
    '/notifications'
  ];

  const adminTabs = [
    'dashboard',
    'circulars',
    'imported-drafts',
    'publishing-center',
    'category-search-manager',
    'source-monitoring',
    'candidate-directory',
    'company-directory',
    'content-studio',
    'builder',
    'automation-hub',
    'analytics-center',
    'settings'
  ];

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  async function auditRoute(url, section) {
    const pageErrors = [];
    const consoleErrors = [];

    page.removeAllListeners('pageerror');
    page.removeAllListeners('console');

    page.on('pageerror', err => pageErrors.push(err.toString()));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore favicon or non-critical 404s
        if (!text.includes('favicon.ico')) {
          consoleErrors.push(text);
        }
      }
    });

    try {
      const fullUrl = BASE_URL + url;
      const res = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
      const status = res ? res.status() : 0;

      // Extract body text & check for crash / blank issues
      const bodyText = await page.evaluate(() => document.body ? document.body.innerText.trim() : '');
      const isCrash = bodyText.includes('একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে') || bodyText.includes('Application error');
      const is404 = (status === 404) || (bodyText.includes('404') && bodyText.includes('পৃষ্ঠাটি খুঁজে পাওয়া যায়নি'));
      const isBlank = bodyText.length < 50;

      const title = await page.title();

      const item = {
        url,
        section,
        status,
        title,
        bodyLength: bodyText.length,
        isCrash,
        is404,
        isBlank,
        pageErrors,
        consoleErrors: consoleErrors.slice(0, 3)
      };

      if (status >= 400 || isCrash || is404 || isBlank || pageErrors.length > 0) {
        results.failed.push(item);
        console.log(`❌ [FAIL] ${section.padEnd(8)} | ${url.padEnd(35)} | Status: ${status} | Crash: ${isCrash} | 404: ${is404} | Blank: ${isBlank} | PageErrors: ${pageErrors.length}`);
        if (pageErrors.length > 0) console.log('   Errors:', pageErrors);
      } else {
        results.passed.push(item);
        console.log(`✅ [PASS] ${section.padEnd(8)} | ${url.padEnd(35)} | Status: ${status} | Content: ${bodyText.length} chars | Title: "${title.substring(0, 30)}"`);
      }
    } catch (e) {
      results.failed.push({ url, section, error: e.message });
      console.log(`❌ [TIMEOUT/FAIL] ${section.padEnd(8)} | ${url.padEnd(35)} | Error: ${e.message}`);
    }
  }

  // 1. PUBLIC ROUTES AUDIT
  console.log('\n--- SECTION 1: PUBLIC PAGES ---');
  for (const route of publicRoutes) {
    await auditRoute(route, 'PUBLIC');
  }

  // 2. USER ROUTES AUDIT
  console.log('\n--- SECTION 2: USER & CANDIDATE PAGES ---');
  for (const route of userRoutes) {
    await auditRoute(route, 'USER');
  }

  // 3. ADMIN PANEL AUDIT (First log in as Admin)
  console.log('\n--- SECTION 3: ADMIN PANEL & SUB-HUBS ---');
  console.log('Authenticating Admin on /login...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });

  // Click on "অ্যাডমিন প্যানেল" tab
  const adminTabBtn = await page.$('button:has-text("অ্যাডমিন প্যানেল")');
  if (adminTabBtn) {
    await adminTabBtn.click();
    await page.waitForTimeout(300);
    // Fill admin pin
    const pinInput = await page.$('input[type="password"]');
    if (pinInput) {
      await pinInput.fill('1234');
      const submitBtn = await page.$('button:has-text("অ্যাডমিন প্রবেশ")');
      if (submitBtn) await submitBtn.click();
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    }
  }

  for (const tab of adminTabs) {
    await auditRoute(`/admin?tab=${tab}`, 'ADMIN');
  }

  console.log('\n===============================================================');
  console.log(`AUDIT COMPLETED: Passed: ${results.passed.length} | Failed/Issues: ${results.failed.length}`);
  console.log('===============================================================');

  if (results.failed.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    console.log(JSON.stringify(results.failed, null, 2));
  } else {
    console.log('\n🌟 ALL PAGES & SECTIONS PASSED WITH 0 ERRORS!');
  }

  await browser.close();
})();
