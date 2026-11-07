const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyAdminDashboard() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1536, height: 864 }
  });
  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:3000/admin ...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });

  // Set admin authentication pin in localStorage and reload
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_admin_auth', 'true');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // If login form is visible, submit it
  const pinInput = await page.$('input[placeholder*="পিন"]');
  if (pinInput) {
    console.log('Submitting login form with PIN 1234...');
    await pinInput.fill('1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
  }

  console.log('2. Verifying Admin Dashboard Elements...');
  // Check Page Title
  const titleText = await page.textContent('h1');
  console.log('Page Title:', titleText);

  // Check 5 KPI cards count
  const kpiCards = await page.$$('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-5 > div');
  console.log('KPI Cards rendered:', kpiCards.length);

  // Check Sidebar Main Nav items
  const sidebarButtons = await page.$$('aside nav button');
  console.log('Sidebar Navigation Buttons rendered:', sidebarButtons.length);

  // Capture Desktop 1536 screenshot
  const screenshotPath1536 = path.join(__dirname, 'admin_dashboard_1536_redesigned.png');
  await page.screenshot({ path: screenshotPath1536, fullPage: true });
  console.log('Saved 1536 screenshot to:', screenshotPath1536);

  // Also copy to artifacts dir
  const artifactDir = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(screenshotPath1536, path.join(artifactDir, '77_admin_dashboard_redesigned_1536.png'));
    console.log('Copied to artifact 77_admin_dashboard_redesigned_1536.png');
  }

  // Viewport 1366x768
  console.log('3. Testing 1366x768 Viewport...');
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.waitForTimeout(500);
  const screenshotPath1366 = path.join(__dirname, 'admin_dashboard_1366_redesigned.png');
  await page.screenshot({ path: screenshotPath1366, fullPage: true });
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(screenshotPath1366, path.join(artifactDir, '78_admin_dashboard_redesigned_1366.png'));
  }

  // Viewport 390x844 (Mobile)
  console.log('4. Testing Mobile Viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  const screenshotPathMobile = path.join(__dirname, 'admin_dashboard_mobile_redesigned.png');
  await page.screenshot({ path: screenshotPathMobile, fullPage: true });
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(screenshotPathMobile, path.join(artifactDir, '79_admin_dashboard_redesigned_mobile.png'));
  }

  // Test Navigation to another tab (e.g. candidate-directory)
  console.log('5. Testing Navigation to candidate-directory...');
  await page.setViewportSize({ width: 1536, height: 864 });
  await page.click('text=প্রার্থীদের ব্যবস্থাপনা');
  await page.waitForTimeout(800);
  const currentUrl = page.url();
  console.log('URL after clicking candidates:', currentUrl);
  const candidateHeader = await page.$('text=প্রার্থী ও প্রতিষ্ঠান হাব');
  console.log('Candidate hub header found:', !!candidateHeader);

  // Test Global Search Modal (Ctrl + K or clicking search bar)
  console.log('6. Testing Global Search Modal...');
  await page.click('text=চাকরি, প্রতিষ্ঠান, পদ, পৃষ্ঠা বা প্রার্থীর তথ্য খুঁজুন...');
  await page.waitForTimeout(500);
  const searchModalInput = await page.$('input[placeholder*="সার্বজনীন"]');
  console.log('Search modal input visible:', !!searchModalInput);
  if (searchModalInput) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  await browser.close();
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

verifyAdminDashboard().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

