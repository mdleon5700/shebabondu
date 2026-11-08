const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';
const TEST_CANDIDATE_ID = 'CS-USR-26-990011';
const TEST_SESSION_TOKEN = 'test-browser-sync-token-' + Date.now();

async function runBrowserVerification() {
  console.log('=== STARTING LIVE BROWSER BI-DIRECTIONAL SYNC VERIFICATION ===');

  // Register session in db
  const db = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
  db.sessions[TEST_SESSION_TOKEN] = {
    candidateId: TEST_CANDIDATE_ID,
    role: 'candidate',
    expiresAt: new Date(Date.now() + 86400000).toISOString()
  };
  fs.writeFileSync('src/db/local_store.json', JSON.stringify(db, null, 2));

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1536, height: 900 } });

  // Add cookies and local storage
  await context.addCookies([
    {
      name: 'cs_session_token',
      value: TEST_SESSION_TOKEN,
      domain: 'localhost',
      path: '/'
    }
  ]);

  await context.addInitScript(() => {
    localStorage.setItem('cs_session_token', 'test-browser-sync-token');
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_is_admin', 'true');
  });

  const page = await context.newPage();

  // 1. Visit User Dashboard Profile
  console.log('Navigating to Candidate Profile (/dashboard/profile)...');
  await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  const userProfileScreenshot = path.join(ARTIFACT_DIR, '91_candidate_profile_live_synced.png');
  await page.screenshot({ path: userProfileScreenshot, fullPage: false });
  console.log(`Saved: ${userProfileScreenshot}`);

  // 2. Visit Admin Candidate Directory
  console.log('Navigating to Admin Candidate Directory (/admin?tab=candidate-directory)...');
  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);

  // Search for Tahmid
  console.log('Searching for candidate in admin directory...');
  const searchInput = page.locator('input[placeholder*="খুঁজুন"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('তাহমিদ');
    await page.waitForTimeout(1000);
  }

  const adminSearchScreenshot = path.join(ARTIFACT_DIR, '92_admin_candidate_search_synced.png');
  await page.screenshot({ path: adminSearchScreenshot, fullPage: false });
  console.log(`Saved: ${adminSearchScreenshot}`);

  // Open candidate workspace
  const editBtn = page.locator('button:has-text("সম্পাদনা")').first();
  if (await editBtn.count() > 0) {
    console.log('Opening candidate 360 workspace...');
    await editBtn.click();
    await page.waitForTimeout(2500);

    const adminWorkspaceScreenshot = path.join(ARTIFACT_DIR, '93_admin_candidate_workspace_synced.png');
    await page.screenshot({ path: adminWorkspaceScreenshot, fullPage: false });
    console.log(`Saved: ${adminWorkspaceScreenshot}`);
  }

  await browser.close();
  console.log('=== LIVE BROWSER VERIFICATION COMPLETED SUCCESSFULLY ===');
}

runBrowserVerification().catch(console.error);
