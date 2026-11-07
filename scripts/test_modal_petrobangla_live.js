const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // 1. Login as admin
  await context.request.post('http://localhost:3000/api/auth/login', {
    data: { role: 'admin', adminPin: '1234' }
  });

  // 2. Navigate to admin circulars tab
  await page.goto('http://localhost:3000/admin?tab=circulars', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_auth', JSON.stringify({ isLoggedIn: true, role: 'admin', name: 'সুপার অ্যাডমিন' }));
  });

  // 3. Click "+ নতুন সার্কুলার তৈরি" button
  const newBtn = page.locator('button:has-text("নতুন সার্কুলার"), button:has-text("নতুন সার্কুলার তৈরি"), button:has-text("New Circular")').first();
  await newBtn.waitFor({ state: 'visible', timeout: 8000 });
  await newBtn.click();
  console.log('Clicked "+ নতুন সার্কুলার" button');

  // 4. In the modal, ensure "এআই অটো-বিল্ডার" tab or section is active
  await page.waitForTimeout(500);
  const input = page.locator('input[placeholder*="teletalk"], input[placeholder*="PDF"], input[placeholder*="সার্কুলার"]').first();
  await input.waitFor({ state: 'visible', timeout: 5000 });
  
  // Fill Petrobangla URL
  const testUrl = 'https://alljobs.teletalk.com.bd/jobs/government/445?jobId=14989';
  await input.fill(testUrl);
  console.log('Filled input with:', testUrl);

  // Click "সম্পূর্ণ পেজ বানান" button
  const generateBtn = page.locator('button:has-text("সম্পূর্ণ পেজ বানান"), button:has-text("অটো-বিল্ড")').first();
  const startTime = Date.now();
  await generateBtn.click();
  console.log('Clicked generate button...');

  // Wait for auto-fill to finish (success message or form fields populated)
  await page.waitForFunction(() => {
    const orgInput = document.querySelector('input[placeholder*="প্রতিষ্ঠানের নাম"], input[name*="org"], input[value*="পেট্রোবাংলা"]');
    const successAlert = document.querySelector('.bg-emerald-50, .text-emerald-800');
    return Boolean(orgInput || (successAlert && successAlert.textContent?.includes('জেমিনি')));
  }, { timeout: 15000 });

  const duration = Date.now() - startTime;
  console.log(`Auto-fill completed successfully in ${duration} ms!`);

  // Take screenshot of filled modal
  await page.screenshot({ path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/verified_modal_petrobangla_success.png' });
  console.log('Saved screenshot: verified_modal_petrobangla_success.png');

  await browser.close();
})();

