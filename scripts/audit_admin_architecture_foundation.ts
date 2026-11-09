import { chromium } from 'playwright';

async function auditAdminArchitecture() {
  console.log('🚀 Starting Admin Architecture & Layout Deep Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Visit /admin directly
  await page.goto('http://localhost:3000/admin');
  await page.waitForTimeout(2000);

  // Check login screen
  const isPinScreen = await page.locator('input[type="password"]').isVisible();
  console.log('1. Admin PIN Screen visible:', isPinScreen);

  // Login with correct admin pin
  if (isPinScreen) {
    await page.fill('input[type="password"]', 'CHAKRISEBA_SECURE_ADMIN_2026');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  // Verify Header & Sidebar
  const sidebarVisible = await page.locator('aside').isVisible();
  const headerVisible = await page.locator('header').isVisible();
  console.log('2. Layout elements rendered -> Sidebar:', sidebarVisible, 'Header:', headerVisible);

  // Check SolaimanLipi font family
  const fontFamily = await page.evaluate(() => {
    const el = document.querySelector('header span');
    return el ? window.getComputedStyle(el).fontFamily : 'unknown';
  });
  console.log('3. Typography computed font:', fontFamily);

  // Take screenshot of main dashboard
  await page.screenshot({ path: 'admin_architecture_overview.png', fullPage: false });
  console.log('4. Screenshot captured: admin_architecture_overview.png');

  // Test clicking an unhandled subtab in sidebar e.g. "published-jobs" or "pending-approval"
  // Expand "চাকরি ব্যবস্থাপনা"
  const jobMgmtBtn = page.locator('button:has-text("চাকরি ব্যবস্থাপনা")');
  if (await jobMgmtBtn.isVisible()) {
    await jobMgmtBtn.click();
    await page.waitForTimeout(1000);

    const publishedJobsSub = page.locator('button:has-text("প্রকাশিত চাকরি")');
    if (await publishedJobsSub.isVisible()) {
      console.log('5. Clicking subtab "প্রকাশিত চাকরি" (published-jobs)...');
      await publishedJobsSub.click();
      await page.waitForTimeout(2000);

      // Check URL and main content
      console.log('Current URL:', page.url());
      const mainContentText = await page.locator('main').innerText();
      console.log('Main content length after clicking published-jobs:', mainContentText.trim().length);
      console.log('Main content snippet:', JSON.stringify(mainContentText.slice(0, 150)));
      await page.screenshot({ path: 'admin_subtab_published_jobs_blank_proof.png' });
    }
  }

  await browser.close();
  console.log('Audit completed successfully.');
}

auditAdminArchitecture().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
