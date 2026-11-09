const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const artifactDir = path.resolve('C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd');

async function main() {
  console.log('Starting Playwright Browser Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const results = [];

  // 1. Homepage
  console.log('1. Checking Homepage (http://localhost:3000)...');
  const res1 = await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  const title1 = await page.title();
  const shot1 = path.join(artifactDir, 'audit_step1_homepage.png');
  await page.screenshot({ path: shot1, fullPage: false });
  results.push({ page: 'Homepage', status: res1.status(), title: title1, screenshot: shot1 });

  // 2. Job Search (/jobs)
  console.log('2. Checking Jobs Search Page (http://localhost:3000/jobs)...');
  const res2 = await page.goto('http://localhost:3000/jobs', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  const jobCardsCount = await page.locator('article, .job-card, [data-testid="job-card"]').count();
  const shot2 = path.join(artifactDir, 'audit_step2_jobs.png');
  await page.screenshot({ path: shot2, fullPage: false });
  results.push({ page: 'Jobs Listing', status: res2.status(), jobCardsCount, screenshot: shot2 });

  // 3. Single Job Detail (/jobs/job-ai-gov-fcfec3)
  console.log('3. Checking Single Job Detail Page (http://localhost:3000/jobs/job-ai-gov-fcfec3)...');
  const res3 = await page.goto('http://localhost:3000/jobs/job-ai-gov-fcfec3', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  const shot3 = path.join(artifactDir, 'audit_step3_job_detail.png');
  await page.screenshot({ path: shot3, fullPage: false });
  results.push({ page: 'Job Detail', status: res3.status(), screenshot: shot3 });

  // 4. Login as candidate and verify candidate dashboard
  console.log('4. Performing Candidate Login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.fill('input[name="identifier"], input[type="text"]', '01712-345678');
  await page.fill('input[name="password"], input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  const res4 = await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  const shot4 = path.join(artifactDir, 'audit_step4_candidate_dashboard.png');
  await page.screenshot({ path: shot4, fullPage: false });
  results.push({ page: 'Candidate Dashboard', status: res4.status(), screenshot: shot4 });

  // 5. Candidate Profile
  console.log('5. Checking Candidate Profile (/dashboard/profile)...');
  const res5 = await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  const shot5 = path.join(artifactDir, 'audit_step5_candidate_profile.png');
  await page.screenshot({ path: shot5, fullPage: false });
  results.push({ page: 'Candidate Profile', status: res5.status(), screenshot: shot5 });

  // 6. Candidate Applications
  console.log('6. Checking Candidate Applications (/dashboard/applications)...');
  const res6 = await page.goto('http://localhost:3000/dashboard/applications', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  const shot6 = path.join(artifactDir, 'audit_step6_candidate_applications.png');
  await page.screenshot({ path: shot6, fullPage: false });
  results.push({ page: 'Candidate Applications', status: res6.status(), screenshot: shot6 });

  // 7. Admin Login & Dashboard
  console.log('7. Checking Admin Dashboard (/admin)...');
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    document.cookie = 'cs_session_token=ADMIN-SUPER-SESSION; path=/;';
  });
  // Also login via API to get real admin session cookie
  const adminLoginRes = await page.request.post('http://localhost:3000/api/auth/login', {
    data: { role: 'admin', adminPin: '1234' }
  });
  const adminLoginData = await adminLoginRes.json();
  if (adminLoginData.token) {
    await context.addCookies([{
      name: 'cs_session_token',
      value: adminLoginData.token,
      domain: 'localhost',
      path: '/'
    }]);
  }

  const res7 = await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  const shot7 = path.join(artifactDir, 'audit_step7_admin_dashboard.png');
  await page.screenshot({ path: shot7, fullPage: false });
  results.push({ page: 'Admin Dashboard', status: res7.status(), screenshot: shot7 });

  await browser.close();

  console.log('\n--- VERIFICATION RESULTS ---');
  results.forEach(r => console.log(`✓ [HTTP ${r.status}] ${r.page} -> ${r.screenshot}`));
  console.log(`Total console errors recorded: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors sample:', consoleErrors.slice(0, 3));
  }
}

main().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});

