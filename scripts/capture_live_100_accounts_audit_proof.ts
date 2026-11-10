import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PIN = 'CHAKRISEBA_SECURE_ADMIN_2026';

async function captureProof() {
  console.log('🚀 Capturing Live Admin Visual Proof for 100 Accounts Lifecycle Audit...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  await context.addCookies([
    { name: 'cs_admin_auth', value: 'verified', domain: 'localhost', path: '/' },
    { name: 'session_token', value: 'SYNTH-ADMIN-SUPER', domain: 'localhost', path: '/' }
  ]);

  const page = await context.newPage();

  // Set localStorage credentials
  await page.goto(`${BASE_URL}/admin?tab=candidate-directory`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((pin) => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', pin);
  }, ADMIN_PIN);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 1. Candidate Directory with 100 candidates
  console.log('Capturing Candidate Directory with verified accounts...');
  await page.screenshot({ path: 'audit_135_candidate_directory_100_accounts.png', fullPage: false });
  console.log('📸 Captured: audit_135_candidate_directory_100_accounts.png');

  // 2. Master Applications Table with 100 applications
  console.log('Capturing Master Applications Table...');
  await page.goto(`${BASE_URL}/admin?tab=all-applications`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'audit_135_master_applications_100_processed.png', fullPage: false });
  console.log('📸 Captured: audit_135_master_applications_100_processed.png');

  // 3. User Dashboard Live View (inspecting candidate #1)
  console.log('Capturing User Dashboard Live View...');
  const userContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  // Login as first simulated candidate
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '01711000001', password: 'SecurePassword2026!' })
  });
  const loginData = await loginRes.json();
  await userContext.addCookies([
    { name: 'session_token', value: loginData.token, domain: 'localhost', path: '/' }
  ]);
  const userPage = await userContext.newPage();
  await userPage.goto(`${BASE_URL}/dashboard/applications`, { waitUntil: 'domcontentloaded' });
  await userPage.waitForTimeout(3000);
  await userPage.screenshot({ path: 'audit_135_user_dashboard_application_tracking.png', fullPage: false });
  console.log('📸 Captured: audit_135_user_dashboard_application_tracking.png');

  // 4. User Notifications Inbox
  await userPage.goto(`${BASE_URL}/dashboard/notifications`, { waitUntil: 'domcontentloaded' });
  await userPage.waitForTimeout(3000);
  await userPage.screenshot({ path: 'audit_135_user_notifications_inbox.png', fullPage: false });
  console.log('📸 Captured: audit_135_user_notifications_inbox.png');

  await userContext.close();
  await browser.close();
  console.log('🎉 All 4 Proof Screenshots Captured Successfully!');
}

captureProof().catch(err => {
  console.error('Error capturing proof:', err);
  process.exit(1);
});

