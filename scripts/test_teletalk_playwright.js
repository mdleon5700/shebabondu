const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  await page.goto('https://dcjamalpur.teletalk.com.bd/dcjamalpur202610/circulars.php');
  await page.waitForTimeout(1000);

  // Click the circular radio button
  await page.locator('input[type="radio"]').first().check();
  await page.waitForTimeout(500);

  // Click submit
  await page.locator('#submit').click();
  await page.waitForTimeout(3000);

  console.log('Current URL after submit:', page.url());
  const postLabels = await page.$$eval('label, li, td', els => els.map(e => e.innerText.trim()).filter(t => t.length > 2));
  console.log('Post labels on page:', postLabels);

  await page.screenshot({ path: 'teletalk_posts_page.png' });
  console.log('Saved screenshot to teletalk_posts_page.png');

  await browser.close();
})();

