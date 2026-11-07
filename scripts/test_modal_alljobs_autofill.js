const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Set admin authentication
  await page.goto('http://localhost:3000/admin');
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_auth_data', JSON.stringify({
      isLoggedIn: true,
      role: 'admin',
      name: 'Super Admin',
      userId: 'adm_demo'
    }));
  });

  await page.reload();
  await page.waitForTimeout(1000);

  // 2. Open the UniversalJobWorkspace modal ("+ নতুন সার্কুলার তৈরি করুন" or direct button)
  const newCircularBtn = await page.locator('button:has-text("নতুন সার্কুলার"), button:has-text("পোস্ট তৈরি")').first();
  if (await newCircularBtn.count() > 0) {
    await newCircularBtn.click();
  } else {
    // If not found, look for button in action bar
    await page.locator('button:has-text("সার্কুলার যোগ")').first().click();
  }

  await page.waitForTimeout(1000);

  // 3. Locate the AI input inside the modal
  const aiInput = page.locator('input[placeholder*="alljobs.teletalk.com.bd"], input[placeholder*="breb.teletalk.com.bd"]');
  await aiInput.waitFor({ state: 'visible', timeout: 10000 });
  await aiInput.fill('https://alljobs.teletalk.com.bd/jobs/government/445?jobId=14989');

  // 4. Click the "✨ সম্পূর্ণ পেজ বানান" button
  const buildBtn = page.locator('button:has-text("সম্পূর্ণ পেজ বানান")');
  console.log('Clicking "সম্পূর্ণ পেজ বানান" button...');
  await buildBtn.click();

  // 5. Wait for generation to finish (up to 30s)
  console.log('Waiting for AI generation to complete...');
  await page.waitForFunction(() => {
    const errorEl = document.querySelector('div.bg-rose-50');
    const successEl = document.querySelector('div.bg-emerald-50');
    const spinning = document.querySelector('button .animate-spin');
    // Return true if finished
    return (!spinning && (errorEl || successEl));
  }, { timeout: 35000 });

  await page.waitForTimeout(1500);

  const result = await page.evaluate(() => {
    const errorEl = document.querySelector('div.bg-rose-50');
    const successEl = document.querySelector('div.bg-emerald-50');
    const titleInput = document.querySelector('input[placeholder*="বাংলাদেশ রেলওয়ে"]');
    const orgInput = document.querySelector('input[placeholder*="বাংলাদেশ পল্লী"]');
    return {
      hasError: !!errorEl,
      errorMessage: errorEl ? errorEl.innerText.trim() : null,
      hasSuccess: !!successEl,
      successMessage: successEl ? successEl.innerText.trim() : null,
      title: titleInput ? titleInput.value : null,
      organization: orgInput ? orgInput.value : null
    };
  });

  console.log('UI Result:', JSON.stringify(result, null, 2));

  await page.screenshot({ path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/73_ai_autofill_alljobs_success.png' });
  await browser.close();
})();

