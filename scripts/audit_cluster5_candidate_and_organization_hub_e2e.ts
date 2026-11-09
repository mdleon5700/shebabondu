import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PIN = 'CHAKRISEBA_SECURE_ADMIN_2026';

async function runCluster5Audit() {
  console.log('🚀 Starting Cluster 5: Candidate Directory & Impersonation Deep Audit...\n');

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
  await page.goto(`${BASE_URL}/admin?tab=candidate-directory`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((pin) => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', pin);
  }, ADMIN_PIN);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // -------------------------------------------------------------
  // STEP 1: Audit Candidate Directory Master Table (/admin?tab=candidate-directory)
  // -------------------------------------------------------------
  console.log('Step 1: Auditing Candidate Directory Master Table (/admin?tab=candidate-directory)...');
  const candidateHeader = page.locator('h1:has-text("চাকরিপ্রার্থী ও প্রোফাইল মাস্টার হাব")');
  await candidateHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Candidate Directory Master title visible: true');

  // Wait for candidates table to populate
  const portalBtn = page.locator('button:has-text("পোর্টাল")').first();
  await portalBtn.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Candidate Portal action button found!');

  await page.screenshot({ path: 'audit_130_candidate_directory_master.png', fullPage: true });
  console.log('📸 Captured: audit_130_candidate_directory_master.png\n');

  // -------------------------------------------------------------
  // STEP 2: Audit 360° Profile Inspector (/admin?tab=candidate-details)
  // -------------------------------------------------------------
  console.log('Step 2: Auditing 360° Profile Inspector (/admin?tab=candidate-details)...');
  await page.goto(`${BASE_URL}/admin?tab=candidate-details`, { waitUntil: 'domcontentloaded' });
  const detailsTabBtn = page.locator('button:has-text("৩৬০° প্রোফাইল ও ভল্ট")');
  await detailsTabBtn.waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'audit_130_candidate_profile_360_inspector.png', fullPage: true });
  console.log('📸 Captured: audit_130_candidate_profile_360_inspector.png\n');

  // -------------------------------------------------------------
  // STEP 3: Audit 1-Click Admin Impersonation Mode & Banner
  // -------------------------------------------------------------
  console.log('Step 3: Auditing 1-Click Admin Support Impersonation Mode...');
  await page.goto(`${BASE_URL}/admin?tab=candidate-directory`, { waitUntil: 'domcontentloaded' });
  const portalActionBtn = page.locator('button:has-text("পোর্টাল")').first();
  await portalActionBtn.waitFor({ state: 'visible', timeout: 15000 });

  console.log('Clicking 1-Click Impersonation button...');
  await Promise.all([
    page.waitForURL('**/dashboard', { timeout: 15000 }),
    portalActionBtn.click()
  ]);
  await page.waitForTimeout(2500);
  console.log('Navigated to:', page.url());

  const banner = page.locator('text=⚠️ সতর্কবার্তা: আপনি সাপোর্ট দেওয়ার জন্য এই প্রার্থীর অ্যাকাউন্টে অ্যাডমিন হিসেবে প্রবেশ করেছেন');
  await banner.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Golden Impersonation Banner visible: true');

  const returnBtn = page.locator('button:has-text("অ্যাডমিন প্যানেলে ফিরুন ↗")');
  await returnBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Return to Admin button visible: true');

  await page.screenshot({ path: 'audit_130_admin_impersonation_banner.png', fullPage: false });
  console.log('📸 Captured: audit_130_admin_impersonation_banner.png\n');

  console.log('Clicking "অ্যাডমিন প্যানেলে ফিরুন ↗" button...');
  await returnBtn.click();
  await page.waitForURL('**/admin**', { timeout: 20000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  console.log('Successfully returned to Admin Portal! Current URL:', page.url());

  // -------------------------------------------------------------
  // STEP 4: Audit Organization Directory Master (/admin?tab=company-directory)
  // -------------------------------------------------------------
  console.log('Step 4: Auditing Organization Directory Master (/admin?tab=company-directory)...');
  await page.goto(`${BASE_URL}/admin?tab=company-directory`, { waitUntil: 'domcontentloaded' });
  const orgHeader = page.locator('h1:has-text("প্রতিষ্ঠান ও নিয়োগকারী হাব")');
  await orgHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Organization Directory Header visible: true');

  const addOrgBtn = page.locator('button:has-text("নতুন প্রতিষ্ঠান যোগ করুন")');
  await addOrgBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Add Organization button visible: true');

  await page.screenshot({ path: 'audit_130_organization_directory_master.png', fullPage: true });
  console.log('📸 Captured: audit_130_organization_directory_master.png\n');

  // -------------------------------------------------------------
  // STEP 5: Audit Organization Past Circulars Archive History Modal
  // -------------------------------------------------------------
  console.log('Step 5: Auditing Past Circulars Archive Drawer/Modal...');
  const circularsCountBadge = page.locator('button[title="সার্কুলার তালিকা দেখুন"]').first();
  await circularsCountBadge.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Clicking circulars archive button...');
  await circularsCountBadge.click();
  await page.waitForTimeout(2000);

  const archiveModalText = page.locator('text=মোট সক্রিয় সার্কুলার').first();
  await archiveModalText.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Archive drawer/modal opened and verified!');

  await page.screenshot({ path: 'audit_130_organization_jobs_archive_drawer.png', fullPage: false });
  console.log('📸 Captured: audit_130_organization_jobs_archive_drawer.png\n');

  await browser.close();
  console.log('🎉 All Cluster 5 Playwright E2E Audits Passed Successfully!');
}

runCluster5Audit().catch((err) => {
  console.error('❌ Cluster 5 Audit Failed:', err);
  process.exit(1);
});
