const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

(async () => {
  console.log('===============================================================');
  console.log('🔍 CANDIDATE DASHBOARD DEEP AUDIT');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  const page = await context.newPage();

  // 1. Log in via API & set localStorage / cookie
  console.log('Step 1: Logging in as candidate (01774366647)...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });

  const loginResult = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '01774366647',
          password: '01774366647',
          role: 'candidate'
        })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('cs_auth', JSON.stringify({
          isLoggedIn: true,
          role: 'candidate',
          userId: data.user?.id,
          phone: data.user?.phone,
          name: data.user?.name
        }));
        if (data.user) {
          localStorage.setItem('cs_candidate_profile', JSON.stringify(data.user));
        }
        if (data.token) {
          document.cookie = `cs_session_token=${encodeURIComponent(data.token)}; path=/; max-age=2592000; SameSite=Lax`;
          localStorage.setItem('cs_session_token', data.token);
        }
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  console.log('Login result:', loginResult);
  if (!loginResult.success) {
    console.error('Candidate login failed!');
    await browser.close();
    process.exit(1);
  }

  // Reload or go to /dashboard
  await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle' });
  console.log('Successfully navigated to /dashboard. Title:', await page.title());

  const dashboardRoutes = [
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/vault',
    '/dashboard/wallet',
    '/dashboard/transactions',
    '/dashboard/applications',
    '/dashboard/application-check',
    '/dashboard/recommended-jobs',
    '/dashboard/saved-jobs',
    '/dashboard/eligible-jobs',
    '/dashboard/admit-cards',
    '/dashboard/exam-calendar',
    '/dashboard/notifications',
    '/dashboard/alerts',
    '/dashboard/cv-builder',
    '/dashboard/preparation',
    '/dashboard/performance',
    '/dashboard/settings'
  ];

  const results = { passed: [], failed: [] };

  for (const route of dashboardRoutes) {
    const pageErrors = [];
    const consoleErrors = [];

    page.removeAllListeners('pageerror');
    page.removeAllListeners('console');

    page.on('pageerror', err => pageErrors.push(err.toString()));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon.ico')) {
          consoleErrors.push(text);
        }
      }
    });

    try {
      const res = await page.goto(BASE_URL + route, { waitUntil: 'networkidle', timeout: 15000 });
      const status = res ? res.status() : 0;
      const bodyText = await page.evaluate(() => document.body ? document.body.innerText.trim() : '');
      const isCrash = bodyText.includes('একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে') || bodyText.includes('Application error');
      const is404 = (status === 404) || (bodyText.includes('404') && bodyText.includes('পৃষ্ঠাটি খুঁজে পাওয়া যায়নি'));
      const isBlank = bodyText.length < 50;

      const item = {
        route,
        status,
        bodyLength: bodyText.length,
        isCrash,
        is404,
        isBlank,
        pageErrors,
        consoleErrors: consoleErrors.slice(0, 3)
      };

      if (status >= 400 || isCrash || is404 || isBlank || pageErrors.length > 0) {
        results.failed.push(item);
        console.log(`❌ [FAIL] ${route.padEnd(35)} | Status: ${status} | Crash: ${isCrash} | 404: ${is404} | Blank: ${isBlank} | PageErrors: ${pageErrors.length}`);
        if (pageErrors.length > 0) console.log('   Errors:', pageErrors);
      } else {
        results.passed.push(item);
        console.log(`✅ [PASS] ${route.padEnd(35)} | Status: ${status} | Content: ${bodyText.length} chars | PageErrors: 0`);
      }
    } catch (e) {
      results.failed.push({ route, error: e.message });
      console.log(`❌ [TIMEOUT/FAIL] ${route.padEnd(35)} | Error: ${e.message}`);
    }
  }

  console.log('\n===============================================================');
  console.log(`CANDIDATE AUDIT: Passed: ${results.passed.length} | Failed: ${results.failed.length}`);
  console.log('===============================================================');

  if (results.failed.length > 0) {
    console.log(JSON.stringify(results.failed, null, 2));
  } else {
    console.log('🌟 ALL 18 CANDIDATE DASHBOARD PAGES PASSED WITH 0 ERRORS!');
  }

  await browser.close();
})();
