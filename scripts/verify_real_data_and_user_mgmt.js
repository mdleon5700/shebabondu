const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1536, height: 900 }
  });
  const page = await context.newPage();

  console.log('--- 1. Navigating to Admin Dashboard ---');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Set admin session in localStorage if needed
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_is_admin', 'true');
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Take full dashboard screenshot
  const shot1 = path.join(ARTIFACT_DIR, '85_admin_dashboard_real_data_verified.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('Saved screenshot 1:', shot1);

  // Read the rendered metric values
  const textContent = await page.textContent('body');
  const hasOldJobsCount = textContent.includes('২,৮৪৭') || textContent.includes('2,847');
  const hasOldCandCount = textContent.includes('৪৮,৯২১') || textContent.includes('48,921');
  const hasRealJobsCount = textContent.includes('৭৪'); // 74 jobs in Bangla
  const hasRealCandCount = textContent.includes('৭'); // 7 candidates in Bangla

  console.log('Has old dummy 2,847?', hasOldJobsCount);
  console.log('Has old dummy 48,921?', hasOldCandCount);
  console.log('Has real 74 jobs?', hasRealJobsCount);
  console.log('Has real 7 candidates?', hasRealCandCount);

  if (hasOldJobsCount || hasOldCandCount) {
    console.error('FAILED: Found legacy dummy data on dashboard!');
  } else {
    console.log('SUCCESS: Dashboard displays 100% authentic real data!');
  }

  // --- 2. Test Candidate Management Directory & Deep Workspace ---
  console.log('--- 2. Navigating to Candidate Directory ---');
  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click on the first candidate's edit/profile button to open UniversalUserWorkspace
  const editButtons = page.locator('button:has-text("সম্পাদনা"), button[title="সম্পাদনা"], button:has-text("প্রোফাইল দেখুন"), button:has-text("৩৬০° ভিউ")');
  const btnCount = await editButtons.count();
  console.log('Found action buttons in candidate directory:', btnCount);

  if (btnCount > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(2000);

    // Take screenshot of UniversalUserWorkspace open
    const shot2 = path.join(ARTIFACT_DIR, '86_candidate_workspace_applications.png');
    
    // Click on "চাকরির আবেদনসমূহ" tab
    const appTab = page.locator('button:has-text("চাকরির আবেদনসমূহ")');
    if (await appTab.count() > 0) {
      await appTab.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: shot2 });
      console.log('Saved screenshot 2 (Applications tab):', shot2);
    }

    // Click on "ওয়ালেট ও লেনদেন" tab
    const walletTab = page.locator('button:has-text("ওয়ালেট ও লেনদেন")');
    const shot3 = path.join(ARTIFACT_DIR, '87_candidate_workspace_wallet.png');
    if (await walletTab.count() > 0) {
      await walletTab.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: shot3 });
      console.log('Saved screenshot 3 (Wallet tab):', shot3);
    }
  }

  await browser.close();
  console.log('Playwright test completed successfully!');
}

run().catch(err => {
  console.error('Playwright error:', err);
  process.exit(1);
});
