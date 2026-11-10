import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PIN = 'CHAKRISEBA_SECURE_ADMIN_2026';

async function runCluster8And9Audit() {
  console.log('🚀 Starting Cluster 8 & 9: Communications, Reports, System Health & Governance Deep Audit...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Inject Admin Authentication Cookies
  await context.addCookies([
    {
      name: 'cs_admin_auth',
      value: 'verified',
      domain: 'localhost',
      path: '/'
    },
    {
      name: 'session_token',
      value: 'SYNTH-ADMIN-SUPER',
      domain: 'localhost',
      path: '/'
    }
  ]);

  const page = await context.newPage();

  // Set localStorage credentials
  await page.goto(`${BASE_URL}/admin?tab=job-reports`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((pin) => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', pin);
  }, ADMIN_PIN);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // -------------------------------------------------------------
  // STEP 1: Audit Fake Circular & Job Reports Desk (/admin?tab=job-reports)
  // -------------------------------------------------------------
  console.log('Step 1: Auditing Job Reports Management Desk (/admin?tab=job-reports)...');
  const reportHeader = page.locator('h1:has-text("ভুয়া সার্কুলার ও অভিযোগ পর্যবেক্ষণ")');
  await reportHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Job Reports title visible: true');

  // Verify at least one report row is visible
  const reportRow = page.locator('text=REP-2026-').first();
  await reportRow.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Report tracking row (REP-2026-XXXX) found!');

  await page.screenshot({ path: 'audit_132_job_reports_management.png', fullPage: true });
  console.log('📸 Captured: audit_132_job_reports_management.png\n');

  // -------------------------------------------------------------
  // STEP 2: Audit Support Tickets & Helpdesk (/admin?tab=support-tickets)
  // -------------------------------------------------------------
  console.log('Step 2: Auditing Support Tickets & Helpdesk (/admin?tab=support-tickets)...');
  await page.goto(`${BASE_URL}/admin?tab=support-tickets`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const ticketHeader = page.locator('h2:has-text("সাপোর্ট টিকেট ও হেল্পডেস্ক কন্ট্রোল")');
  await ticketHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Support Tickets header visible: true');

  const ticketRow = page.locator('text=TCK-2026-').first();
  await ticketRow.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Support Ticket row (TCK-2026-XXXX) found!');

  await page.screenshot({ path: 'audit_132_support_tickets_helpdesk.png', fullPage: true });
  console.log('📸 Captured: audit_132_support_tickets_helpdesk.png\n');

  // -------------------------------------------------------------
  // STEP 3: Audit SMS Gateway & Broadcast Console (/admin?tab=notifications)
  // -------------------------------------------------------------
  console.log('Step 3: Auditing SMS Gateway & Broadcast Console (/admin?tab=notifications)...');
  await page.goto(`${BASE_URL}/admin?tab=notifications`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const smsHeader = page.locator('h1:has-text("যোগাযোগ ও বার্তা ব্যবস্থাপনা হাব")');
  await smsHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('SMS Management Hub visible: true');

  const broadcastHeader = page.locator('text=নতুন সিস্টেম ও পুশ ব্রডকাস্ট কম্পোজ').or(page.locator('text=ক্যান্ডিডেট ড্যাশবোর্ড প্রিভিউ')).first();
  await broadcastHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Push Broadcast Console visible: true');

  // Switch to sms-status subtab to test live sms console
  const smsTabBtn = page.locator('button:has-text("এসএমএস গেটওয়ে ও ব্যালেন্স")').or(page.locator('button:has-text("এসএমএস")')).first();
  await smsTabBtn.click();
  await page.waitForTimeout(1500);

  const smsConsoleHeader = page.locator('text=লাইভ টেস্ট এসএমএস সেন্ডার কনসোল').first();
  await smsConsoleHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Live SMS Test Console visible: true');

  await page.screenshot({ path: 'audit_132_sms_and_notifications_hub.png', fullPage: true });
  console.log('📸 Captured: audit_132_sms_and_notifications_hub.png\n');

  // -------------------------------------------------------------
  // STEP 4: Audit Live System Health & Ping Monitor (/admin?tab=system-health)
  // -------------------------------------------------------------
  console.log('Step 4: Auditing Live System Health & Diagnostics (/admin?tab=system-health)...');
  await page.goto(`${BASE_URL}/admin?tab=system-health`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const healthHeader = page.locator('text=সিস্টেম হেলথ ও ডায়াগনস্টিক রিপোর্ট');
  await healthHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('System Health & Diagnostics header visible: true');

  // Run live diagnostics test
  const diagBtn = page.locator('button:has-text("লাইভ ডায়াগনস্টিক টেস্ট চালান")');
  await diagBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Clicking Live Diagnostics button...');
  await diagBtn.click();
  await page.waitForTimeout(2500);

  await page.screenshot({ path: 'audit_133_system_health_and_ping.png', fullPage: true });
  console.log('📸 Captured: audit_133_system_health_and_ping.png\n');

  // -------------------------------------------------------------
  // STEP 5: Audit Admin Activity & Audit Logs (/admin?tab=audit-logs)
  // -------------------------------------------------------------
  console.log('Step 5: Auditing Admin Activity & Audit Logs (/admin?tab=audit-logs)...');
  await page.goto(`${BASE_URL}/admin?tab=audit-logs`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const auditHeader = page.locator('h2:has-text("অ্যাডমিন অ্যাক্টিভিটি ও অডিট লগ")');
  await auditHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Audit Logs table visible: true');

  await page.screenshot({ path: 'audit_133_platform_governance_audit_logs.png', fullPage: true });
  console.log('📸 Captured: audit_133_platform_governance_audit_logs.png\n');

  // -------------------------------------------------------------
  // STEP 6: Audit Platform Settings & Backup Recovery (/admin?tab=settings)
  // -------------------------------------------------------------
  console.log('Step 6: Auditing Platform Global Settings & Backup Diagnostics (/admin?tab=settings)...');
  await page.goto(`${BASE_URL}/admin?tab=settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const settingsHeader = page.locator('text=প্ল্যাটফর্মের সাধারণ তথ্য');
  await settingsHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Platform Global Settings form visible: true');

  // Switch to backup-diagnostics subtab
  const backupTabBtn = page.locator('button:has-text("ব্যাকআপ ও ডায়াগনস্টিকস")').first();
  await backupTabBtn.click();
  await page.waitForTimeout(1500);

  const backupHeader = page.locator('text=সম্পূর্ণ ডাটাবেস ব্যাকআপ সংরক্ষণ করুন');
  await backupHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Backup Diagnostics section visible: true');

  // Switch to staff-roles subtab
  const staffTabBtn = page.locator('button:has-text("স্টাফ ও রোল পারমিশন")').or(page.locator('button:has-text("স্টাফ")')).first();
  await staffTabBtn.click();
  await page.waitForTimeout(1500);

  const staffHeader = page.locator('text=স্টাফ ও রোল পারমিশন ম্যানেজমেন্ট');
  await staffHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Staff RBAC Permissions section visible: true');

  await page.screenshot({ path: 'audit_133_system_settings_and_backup.png', fullPage: true });
  console.log('📸 Captured: audit_133_system_settings_and_backup.png\n');

  await browser.close();
  console.log('🎉 All Cluster 8 & 9 Playwright E2E Audits Passed Successfully!');
}

runCluster8And9Audit().catch((err) => {
  console.error('❌ Cluster 8 & 9 Audit Failed:', err);
  process.exit(1);
});
