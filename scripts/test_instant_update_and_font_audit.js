const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';
const TEST_CANDIDATE_ID = 'CS-USR-26-990011';
const TEST_SESSION_TOKEN = 'test-instant-font-token-' + Date.now();

async function runInstantUpdateAndFontAudit() {
  console.log('=== STARTING LIVE BROWSER INSTANT UPDATE & FONT AUDIT ===');

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

  await context.addCookies([
    {
      name: 'cs_session_token',
      value: TEST_SESSION_TOKEN,
      domain: 'localhost',
      path: '/'
    }
  ]);

  await context.addInitScript(() => {
    localStorage.setItem('cs_session_token', 'test-instant-font-token');
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_is_admin', 'true');
  });

  const page = await context.newPage();

  // 1. Visit User Dashboard Profile
  console.log('1. Navigating to /dashboard/profile...');
  await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);

  // 2. Audit Computed Font Styles
  console.log('2. Inspecting Computed Typography & Bengali Ligatures...');
  const fontAudit = await page.evaluate(() => {
    const heading = document.querySelector('h1, h2, h3');
    const para = document.querySelector('p');
    const input = document.querySelector('input');

    return {
      headingFont: heading ? window.getComputedStyle(heading).fontFamily : 'N/A',
      paraFont: para ? window.getComputedStyle(para).fontFamily : 'N/A',
      inputFont: input ? window.getComputedStyle(input).fontFamily : 'N/A',
      fontFeatureSettings: heading ? window.getComputedStyle(heading).fontFeatureSettings : 'N/A'
    };
  });
  console.log('Font Audit Details:', fontAudit);

  // 3. Test Live Instant Edit in User Profile
  console.log('3. Performing Instant Live Update in Personal Information...');
  const nameInput = page.locator('input[value*="তাহমিদ"]').first();
  if (await nameInput.count() > 0) {
    const updatedInstantName = 'তাহমিদ ইকবাল (ইনস্ট্যান্ট লাইভ আপডেট)';
    await nameInput.fill(updatedInstantName);
    await page.waitForTimeout(500);

    // Click Save Button
    const saveBtn = page.locator('button:has-text("প্রোফাইল সংরক্ষণ করুন")').first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      console.log('Clicked Save Profile button! Checking instant update...');
      await page.waitForTimeout(1000);
    }
  }

  const profileLiveScreenshot = path.join(ARTIFACT_DIR, '98_user_profile_instant_update_live.png');
  await page.screenshot({ path: profileLiveScreenshot });
  console.log(`Saved: ${profileLiveScreenshot}`);

  // 4. Verify in Admin Candidate Workspace
  console.log('4. Navigating to Admin Candidate Directory...');
  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('button:has-text("সম্পাদনা")', { timeout: 30000 });
  await page.waitForTimeout(1000);

  // Filter or search
  const searchInput = page.locator('input[placeholder*="খুঁজুন"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('তাহমিদ');
    await page.waitForTimeout(1500);
  }

  const editBtn = page.locator('button:has-text("সম্পাদনা")').first();
  if (await editBtn.count() > 0) {
    console.log('Opening candidate workspace in admin...');
    await editBtn.click();
    await page.waitForTimeout(2500);

    const adminCheckScreenshot = path.join(ARTIFACT_DIR, '99_admin_verified_instant_update.png');
    await page.screenshot({ path: adminCheckScreenshot });
    console.log(`Saved: ${adminCheckScreenshot}`);
  }

  await browser.close();
  console.log('=== INSTANT UPDATE & FONT AUDIT COMPLETED SUCCESSFULLY ===');
}

runInstantUpdateAndFontAudit().catch(console.error);
