import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PIN = 'CHAKRISEBA_SECURE_ADMIN_2026';

interface RouteCheckResult {
  route: string;
  category: 'public' | 'user' | 'admin';
  status: number;
  title?: string;
  hasErrors: boolean;
  errorDetails?: string;
}

async function runRoutesAudit() {
  console.log('🚀 [Stage 1] Launching Full Platform Route Audit (Public, User Panel, Admin Panel)...\n');

  const browser = await chromium.launch({ headless: true });
  const results: RouteCheckResult[] = [];

  // 1. PUBLIC ROUTES AUDIT
  console.log('--- 1. AUDITING PUBLIC ROUTES ---');
  const publicContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const publicPage = await publicContext.newPage();

  const publicRoutes = [
    '/',
    '/jobs',
    '/categories',
    '/organizations',
    '/blog',
    '/contact',
    '/about-us',
    '/login',
    '/register',
    '/model-tests',
    '/todays-jobs',
    '/admit-cards'
  ];

  for (const r of publicRoutes) {
    try {
      const response = await publicPage.goto(`${BASE_URL}${r}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const status = response ? response.status() : 0;
      await publicPage.waitForTimeout(600);
      const title = await publicPage.title();
      const isOk = status >= 200 && status < 400;
      console.log(`[Public] ${r.padEnd(20)} -> HTTP ${status} | Title: "${title.slice(0, 30)}..." | ${isOk ? '✅ OK' : '❌ FAIL'}`);
      results.push({
        route: r,
        category: 'public',
        status,
        title,
        hasErrors: !isOk
      });
    } catch (err: any) {
      console.error(`[Public] ${r} -> ❌ Error: ${err.message}`);
      results.push({
        route: r,
        category: 'public',
        status: 500,
        hasErrors: true,
        errorDetails: err.message
      });
    }
  }
  await publicContext.close();

  // 2. USER DASHBOARD ROUTES AUDIT (with Candidate Session)
  console.log('\n--- 2. AUDITING USER DASHBOARD ROUTES ---');
  const userContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Add cookies for synthetic candidate
  await userContext.addCookies([
    { name: 'session_token', value: 'SYNTH-CAND-001', domain: 'localhost', path: '/' }
  ]);
  const userPage = await userContext.newPage();

  const userRoutes = [
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/applications',
    '/dashboard/documents',
    '/dashboard/admit-cards',
    '/dashboard/wallet',
    '/dashboard/notifications',
    '/dashboard/cv-builder',
    '/dashboard/settings',
    '/dashboard/eligible-jobs',
    '/dashboard/exam-calendar'
  ];

  for (const r of userRoutes) {
    try {
      const response = await userPage.goto(`${BASE_URL}${r}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const status = response ? response.status() : 0;
      await userPage.waitForTimeout(600);
      const title = await userPage.title();
      const isOk = status >= 200 && status < 400;
      console.log(`[User]   ${r.padEnd(25)} -> HTTP ${status} | Title: "${title.slice(0, 30)}..." | ${isOk ? '✅ OK' : '❌ FAIL'}`);
      results.push({
        route: r,
        category: 'user',
        status,
        title,
        hasErrors: !isOk
      });
    } catch (err: any) {
      console.error(`[User]   ${r} -> ❌ Error: ${err.message}`);
      results.push({
        route: r,
        category: 'user',
        status: 500,
        hasErrors: true,
        errorDetails: err.message
      });
    }
  }
  await userContext.close();

  // 3. ADMIN PORTAL AUDIT (with Admin Session & PIN)
  console.log('\n--- 3. AUDITING ADMIN PORTAL ROUTES ---');
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await adminContext.addCookies([
    { name: 'cs_admin_auth', value: 'verified', domain: 'localhost', path: '/' },
    { name: 'session_token', value: 'SYNTH-ADMIN-SUPER', domain: 'localhost', path: '/' }
  ]);
  const adminPage = await adminContext.newPage();

  // Pre-seed localStorage
  await adminPage.goto(`${BASE_URL}/admin?tab=dashboard`, { waitUntil: 'domcontentloaded' });
  await adminPage.evaluate((pin) => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', pin);
  }, ADMIN_PIN);
  await adminPage.reload({ waitUntil: 'domcontentloaded' });
  await adminPage.waitForTimeout(1000);

  const adminTabs = [
    'dashboard',
    'all-applications',
    'teletalk-queue',
    'circulars',
    'create-circular',
    'candidate-directory',
    'transactions',
    'coupons-discounts',
    'raffle-campaigns',
    'gemini-browser-spider',
    'builder',
    'job-reports',
    'support-tickets',
    'sms-broadcast',
    'system-health',
    'audit-logs'
  ];

  for (const tab of adminTabs) {
    const url = `/admin?tab=${tab}`;
    try {
      const response = await adminPage.goto(`${BASE_URL}${url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = response ? response.status() : 0;
      await adminPage.waitForTimeout(600);
      const isOk = status >= 200 && status < 400;
      console.log(`[Admin]  ${url.padEnd(25)} -> HTTP ${status} | ${isOk ? '✅ OK' : '❌ FAIL'}`);
      results.push({
        route: url,
        category: 'admin',
        status,
        hasErrors: !isOk
      });
    } catch (err: any) {
      console.error(`[Admin]  ${url} -> ❌ Error: ${err.message}`);
      results.push({
        route: url,
        category: 'admin',
        status: 500,
        hasErrors: true,
        errorDetails: err.message
      });
    }
  }
  await adminContext.close();

  await browser.close();

  const total = results.length;
  const passed = results.filter(r => !r.hasErrors).length;
  const failed = results.filter(r => r.hasErrors).length;

  console.log(`\n========================================`);
  console.log(`🎯 Route Audit Summary: Total ${total} | Passed ${passed} | Failed ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRoutesAudit().catch((err) => {
  console.error('Fatal Route Audit Error:', err);
  process.exit(1);
});

