const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1536, height: 900 }
  });
  const page = await context.newPage();

  console.log('--- 1. Navigating to Candidate Directory ---');
  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check if PIN gate is visible
  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.count() > 0) {
    console.log('Filling admin PIN...');
    await pinInput.fill('1234');
    await page.locator('button:has-text("কনসোলে প্রবেশ করুন")').click();
    await page.waitForTimeout(2000);
  }

  console.log('Checking for candidate directory...');
  // Ensure we are on candidate-directory tab
  await page.waitForSelector('h1:has-text("চাকরিপ্রার্থী ও প্রোফাইল মাস্টার হাব")', { timeout: 15000 });

  // Click on the universal editor button for first candidate
  const editorBtn = page.locator('button[title="ইউনিভার্সাল প্রোফাইল এডিটর"]').first();
  await editorBtn.waitFor({ state: 'visible', timeout: 10000 });
  await editorBtn.click();
  console.log('Clicked universal editor button!');
  await page.waitForTimeout(2000);

  // Take screenshot of Applications tab
  const appTab = page.locator('button:has-text("চাকরির আবেদনসমূহ")').first();
  await appTab.waitFor({ state: 'visible', timeout: 5000 });
  await appTab.click();
  await page.waitForTimeout(1000);
  const shotApp = path.join(ARTIFACT_DIR, '86_candidate_workspace_applications.png');
  await page.screenshot({ path: shotApp });
  console.log('Saved screenshot 2 (Applications tab):', shotApp);

  // Click on "ওয়ালেট ও লেনদেন" tab
  const walletTab = page.locator('button:has-text("ওয়ালেট ও লেনদেন")').first();
  await walletTab.waitFor({ state: 'visible', timeout: 5000 });
  await walletTab.click();
  await page.waitForTimeout(1000);
  const shotWallet = path.join(ARTIFACT_DIR, '87_candidate_workspace_wallet.png');
  await page.screenshot({ path: shotWallet });
  console.log('Saved screenshot 3 (Wallet tab):', shotWallet);

  // Also capture the candidate 360 view
  const shot360 = path.join(ARTIFACT_DIR, '88_candidate_directory_live.png');
  // Close workspace modal
  await page.locator('button[title="উইন্ডো বন্ধ করুন"]').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: shot360 });
  console.log('Saved screenshot 4 (Candidate Directory):', shot360);

  await browser.close();
  console.log('All candidate workspace screenshots captured successfully!');
}

run().catch(err => {
  console.error('Playwright error:', err);
  process.exit(1);
});
