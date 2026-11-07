const { chromium } = require('@playwright/test');

async function debugBuilder() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
  });

  await page.goto('http://localhost:3000/admin?tab=builder', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Finding section elements...');
  const sections = await page.locator('div[data-section-id]').all();
  console.log(`Found ${sections.length} sections in canvas`);
  for (const s of sections) {
    const id = await s.getAttribute('data-section-id');
    console.log(' - Section ID:', id);
  }

  // Click on sec-home-how-it-works
  const sec = page.locator('div[data-section-id="sec-home-how-it-works"]');
  console.log('Is sec-home-how-it-works visible:', await sec.isVisible());
  await sec.click();
  await page.waitForTimeout(1000);

  // Check if inspector opened
  const inspector = page.locator('text=সেকশন ইন্সপেক্টর');
  console.log('Inspector visible:', await inspector.isVisible());

  if (await inspector.isVisible()) {
    const titleInput = page.locator('label:has-text("মূল শিরোনাম") + input');
    console.log('Title input current value:', await titleInput.inputValue());
    await titleInput.fill('সহজ ৩টি ধাপে সরাসরি চাকরি আবেদন সম্পন্ন করুন (লাইভ টেস্ট)');

    // Click Save Page button
    const savePageBtn = page.locator('button:has-text("সংরক্ষণ করুন")').first();
    await savePageBtn.click();
    console.log('Clicked Save Page');
    await page.waitForTimeout(2000);
  }

  await browser.close();
}

debugBuilder().catch(console.error);

