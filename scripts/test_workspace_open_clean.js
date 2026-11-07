const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function testClean() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1536, height: 900 } });
  
  // Set localStorage before any page navigation
  await context.addInitScript(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_is_admin', 'true');
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  console.log('Finding edit buttons...');
  const editBtn = page.locator('button:has-text("সম্পাদনা")').first();
  await editBtn.click();
  console.log('Clicked edit button!');
  await page.waitForTimeout(2000);

  // Take screenshot of UniversalUserWorkspace modal
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '86_candidate_workspace_overview.png') });
  console.log('Saved 86_candidate_workspace_overview.png');

  // Click on "চাকরির আবেদনসমূহ" tab
  const appTab = page.locator('button:has-text("চাকরির আবেদনসমূহ")').first();
  if (await appTab.count() > 0) {
    await appTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '87_candidate_workspace_applications.png') });
    console.log('Saved 87_candidate_workspace_applications.png');
  } else {
    console.log('appTab not found');
  }

  // Click on "ওয়ালেট ও লেনদেন" tab
  const walletTab = page.locator('button:has-text("ওয়ালেট ও লেনদেন")').first();
  if (await walletTab.count() > 0) {
    await walletTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '88_candidate_workspace_wallet.png') });
    console.log('Saved 88_candidate_workspace_wallet.png');
  } else {
    console.log('walletTab not found');
  }

  await browser.close();
  console.log('Test clean finished!');
}

testClean().catch(err => {
  console.error(err);
  process.exit(1);
});
