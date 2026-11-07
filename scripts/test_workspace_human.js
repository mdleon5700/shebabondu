const { chromium } = require('playwright');

(async () => {
  console.log('🤖 Simulating human in Universal Job Workspace with enhanced AI resolver...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await page.goto('http://localhost:3000/admin?tab=circulars', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click on "নতুন সার্কুলার"
  const openBtn = page.locator('button:has-text("নতুন সার্কুলার"), button:has-text("ওয়ার্কস্পেস ওপেন")').first();
  await openBtn.click();
  await page.waitForTimeout(2000);
  console.log('1. Workspace opened');

  // Click on "AI অটো-ফিল"
  const aiAutoTab = page.locator('button:has-text("AI অটো-ফিল")').first();
  await aiAutoTab.click();
  await page.waitForTimeout(1000);
  console.log('2. AI Auto-fill tab clicked');

  // Target input box
  const urlInput = page.locator('input[placeholder*="teletalk"]').first();
  const testPdf = 'https://alljobs.teletalk.com.bd/media/public/uploads/governments/jobs/advertisement-1793683909289.pdf';
  await urlInput.fill(testPdf);
  console.log('3. Entered PDF URL:', testPdf);

  const generateBtn = page.locator('button:has-text("সম্পূর্ণ পেজ বানান")').first();
  console.log('4. Clicking "সম্পূর্ণ পেজ বানান"...');
  await generateBtn.click();

  console.log('5. Waiting for AI generation to complete (switches to basic tab)...');
  await page.waitForSelector('text=🎉 জেমিনি এআই সফলভাবে', { timeout: 45000 });
  console.log('✅ AI generation completed successfully!');

  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'workspace_result_v2.png', fullPage: true });
  console.log('6. Screenshot saved to workspace_result_v2.png');

  // Verify form values
  const titleVal = await page.locator('input[value*="JAMALPUR"], input[value*="জামালপুর"]').first().inputValue().catch(() => '');
  const positionsCount = await page.locator('.border-slate-200.rounded-xl.p-3').count().catch(() => 0);

  console.log('--- VERIFIED RESULTS IN UI ---');
  console.log('Title in UI:', titleVal);
  console.log('Position cards in UI:', positionsCount);

  await browser.close();
})();
