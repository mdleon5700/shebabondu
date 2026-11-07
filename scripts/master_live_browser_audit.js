const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function audit() {
  console.log('=== STARTING CHAKRI SHEBA MASTER LIVE BROWSER AUDIT ===');
  const browser = await chromium.launch({ headless: true });
  
  const results = {
    checkedRoutes: [],
    consoleErrors: [],
    networkFailures: [],
    responsiveChecks: [],
    authTests: []
  };

  const context = await browser.newContext({
    viewport: { width: 1536, height: 900 }
  });

  // Pre-seed admin PIN in localStorage for admin routes
  await context.addInitScript(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_is_admin', 'true');
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter out benign favicon or hydration non-breaking logs if any
      results.consoleErrors.push({
        url: page.url(),
        error: text.slice(0, 300)
      });
    }
  });

  page.on('response', resp => {
    if (resp.status() >= 400 && !resp.url().includes('favicon.ico')) {
      results.networkFailures.push({
        url: resp.url(),
        status: resp.status(),
        method: resp.request().method()
      });
    }
  });

  const publicRoutes = [
    { name: 'Homepage', path: '/' },
    { name: 'Job Listing', path: '/jobs' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Contact Us', path: '/contact-us' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    { name: 'FAQ', path: '/faq' }
  ];

  for (const route of publicRoutes) {
    try {
      console.log(`Checking route: ${route.name} (${route.path})...`);
      const res = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 20000 });
      const status = res ? res.status() : 0;
      const title = await page.title();
      results.checkedRoutes.push({
        name: route.name,
        path: route.path,
        status,
        title: title.slice(0, 60),
        ok: status === 200
      });
    } catch (err) {
      results.checkedRoutes.push({
        name: route.name,
        path: route.path,
        status: 'TIMEOUT/ERROR',
        error: err.message,
        ok: false
      });
    }
  }

  // Check a dynamic job detail page
  try {
    console.log('Checking a dynamic job details page...');
    // fetch job list
    const jobsRes = await page.request.get(`${BASE_URL}/api/admin/jobs`);
    const jobsData = await jobsRes.json();
    const firstJob = (jobsData.jobs && jobsData.jobs.length > 0) ? jobsData.jobs[0] : null;
    if (firstJob && firstJob.id) {
      const jobUrl = `/jobs/${firstJob.id}`;
      const res = await page.goto(`${BASE_URL}${jobUrl}`, { waitUntil: 'networkidle', timeout: 20000 });
      results.checkedRoutes.push({
        name: 'Dynamic Job Details',
        path: jobUrl,
        status: res ? res.status() : 0,
        ok: res && res.status() === 200
      });
    }
  } catch (err) {
    console.error('Dynamic job check error:', err.message);
  }

  // Check User Dashboard routes
  const userDashRoutes = [
    { name: 'User Dashboard', path: '/dashboard' },
    { name: 'User Profile', path: '/dashboard/profile' },
    { name: 'User Applications', path: '/dashboard/applications' },
    { name: 'User Saved Jobs', path: '/dashboard/saved-jobs' }
  ];

  for (const route of userDashRoutes) {
    try {
      console.log(`Checking user route: ${route.name} (${route.path})...`);
      const res = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 20000 });
      results.checkedRoutes.push({
        name: route.name,
        path: route.path,
        status: res ? res.status() : 0,
        ok: res && (res.status() === 200 || res.status() === 307)
      });
    } catch (err) {
      results.checkedRoutes.push({
        name: route.name,
        path: route.path,
        status: 'TIMEOUT/ERROR',
        error: err.message,
        ok: false
      });
    }
  }

  // Check Admin Panel Core Tabs
  const adminTabs = [
    { name: 'Admin Dashboard', tab: 'dashboard' },
    { name: 'Admin Circulars', tab: 'circulars' },
    { name: 'Admin Candidate Directory', tab: 'candidate-directory' },
    { name: 'Admin Page Builder', tab: 'builder' },
    { name: 'Admin Financial Ledger', tab: 'transactions' },
    { name: 'Admin Spider Hub', tab: 'gemini-browser-spider' },
    { name: 'Admin Audit Logs', tab: 'audit-logs' }
  ];

  for (const t of adminTabs) {
    try {
      console.log(`Checking admin tab: ${t.name}...`);
      const res = await page.goto(`${BASE_URL}/admin?tab=${t.tab}`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      results.checkedRoutes.push({
        name: t.name,
        path: `/admin?tab=${t.tab}`,
        status: res ? res.status() : 0,
        ok: res && res.status() === 200
      });
    } catch (err) {
      results.checkedRoutes.push({
        name: t.name,
        path: `/admin?tab=${t.tab}`,
        status: 'TIMEOUT/ERROR',
        error: err.message,
        ok: false
      });
    }
  }

  // Take visual verification screenshot of Homepage & Admin
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const shotHome = path.join(ARTIFACT_DIR, '89_homepage_live_audit.png');
  await page.screenshot({ path: shotHome, fullPage: false });

  await page.goto(`${BASE_URL}/admin?tab=dashboard`, { waitUntil: 'networkidle' });
  const shotAdmin = path.join(ARTIFACT_DIR, '90_admin_dashboard_live_audit.png');
  await page.screenshot({ path: shotAdmin, fullPage: false });

  await browser.close();

  // Save results report to JSON
  fs.writeFileSync(path.join(__dirname, '../master_live_audit_report.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log('=== AUDIT COMPLETED SUCCESSFULLY ===');
  console.log(`Checked routes count: ${results.checkedRoutes.length}`);
  console.log(`Console errors count: ${results.consoleErrors.length}`);
  console.log(`Network failures count: ${results.networkFailures.length}`);
}

audit().catch(err => {
  console.error('Master live audit failed:', err);
  process.exit(1);
});
