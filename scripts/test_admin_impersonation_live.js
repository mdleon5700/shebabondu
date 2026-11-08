const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function test1ClickAdminImpersonation() {
  console.log('=== STARTING 1-CLICK ADMIN IMPERSONATION LIVE TEST ===');

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1536, height: 900 } });

  await context.addInitScript(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_is_admin', 'true');
  });

  const page = await context.newPage();

  // 1. Visit Admin Candidate Directory
  console.log('1. Loading Admin Candidate Directory...');
  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'domcontentloaded', timeout: 45000 });
  
  // Wait for candidates table to populate
  console.log('Waiting for candidates table...');
  await page.waitForSelector('button:has-text("সম্পাদনা")', { timeout: 30000 });
  await page.waitForTimeout(1000);

  // Search for Tahmid
  console.log('2. Searching for Tahmid Iqbal...');
  const searchInput = page.locator('input[placeholder*="খুঁজুন"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('তাহমিদ');
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '94_admin_impersonate_ready.png') });
  console.log('Saved 94_admin_impersonate_ready.png');

  // 3. Click "পোর্টাল" (Impersonate) Button in Table Row
  console.log('3. Clicking 1-Click "পোর্টাল" Impersonation button...');
  const portalBtn = page.locator('button:has-text("পোর্টাল")').first();
  console.log('Portal buttons count:', await portalBtn.count());
  
  await portalBtn.click();
  console.log('Clicked portal button, waiting for redirect to /dashboard...');
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '95_impersonation_active_dashboard.png') });
  console.log('Saved 95_impersonation_active_dashboard.png');

  // 4. Navigate to /dashboard/profile as impersonated user
  console.log('4. Navigating to candidate profile in impersonated mode...');
  await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '96_impersonation_candidate_profile_edit.png') });
  console.log('Saved 96_impersonation_candidate_profile_edit.png');

  // 5. Click "✕ অ্যাডমিন প্যানেলে ফিরুন" (Exit Impersonation)
  console.log('5. Clicking "✕ অ্যাডমিন প্যানেলে ফিরুন" button...');
  const exitBtn = page.locator('button:has-text("অ্যাডমিন প্যানেলে ফিরুন")').first();
  if (await exitBtn.count() > 0) {
    await exitBtn.click();
    console.log('Clicked exit button, waiting for return to /admin...');
    await page.waitForURL('**/admin**', { timeout: 30000 });
    await page.waitForTimeout(2500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '97_impersonation_exit_back_to_admin.png') });
    console.log('Saved 97_impersonation_exit_back_to_admin.png');
  }

  await browser.close();
  console.log('=== 1-CLICK IMPERSONATION TEST COMPLETED SUCCESSFULLY ===');
}

test1ClickAdminImpersonation().catch(console.error);
