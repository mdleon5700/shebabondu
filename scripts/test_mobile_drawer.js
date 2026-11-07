const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testMobileDrawer() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }
  });

  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_admin_auth', 'true');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Click hamburger menu
  console.log('Clicking hamburger button...');
  await page.click('button[title="মেনু টগল করুন"]');
  await page.waitForTimeout(600);

  const screenshotPath = path.join(__dirname, 'admin_mobile_drawer_open.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved mobile drawer screenshot:', screenshotPath);

  const artifactDir = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(screenshotPath, path.join(artifactDir, '80_admin_mobile_drawer_open.png'));
    console.log('Copied to artifact 80_admin_mobile_drawer_open.png');
  }

  await browser.close();
  console.log('Mobile drawer test completed successfully!');
}

testMobileDrawer().catch(err => {
  console.error('Mobile drawer test failed:', err);
  process.exit(1);
});

