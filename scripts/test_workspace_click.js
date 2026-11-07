const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function testClick() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 } });
  
  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'networkidle' });
  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.count() > 0) {
    await pinInput.fill('1234');
    await page.locator('button:has-text("কনসোলে প্রবেশ করুন")').click();
    await page.waitForTimeout(2000);
  }

  // Click editor button
  const editorBtn = page.locator('button[title="ইউনিভার্সাল প্রোফাইল এডিটর"]').first();
  await editorBtn.click();
  await page.waitForTimeout(2000);

  // Take screenshot of whatever is on screen
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'debug_workspace_click.png') });
  console.log('Saved debug screenshot');
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Has চাকরির আবেদনসমূহ?', text.includes('চাকরির আবেদনসমূহ'));
  console.log('Has ওয়ালেট ও লেনদেন?', text.includes('ওয়ালেট ও লেনদেন'));
  
  // Find all buttons in the workspace header/tabs
  const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean));
  console.log('Buttons:', btns.slice(0, 30));

  await browser.close();
}

testClick();
