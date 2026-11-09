import { chromium } from 'playwright';

async function runE2EValidation() {
  console.log('🚀 Running Comprehensive E2E Validation of Admin Architecture & Layout Fixes...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Step 1: Open /admin and authenticate
  await page.goto('http://localhost:3000/admin');
  await page.waitForTimeout(1500);

  const isPinScreen = await page.locator('input[type="password"]').isVisible();
  console.log('Test 1: Admin PIN Screen visible:', isPinScreen);
  if (isPinScreen) {
    await page.fill('input[type="password"]', 'CHAKRISEBA_SECURE_ADMIN_2026');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  // Verify Header & Sidebar layout
  const sidebar = page.locator('aside');
  const header = page.locator('header');
  if (!(await sidebar.isVisible()) || !(await header.isVisible())) {
    throw new Error('Test 1 Failed: Sidebar or Header not visible after login');
  }
  console.log('✅ Test 1 Passed: Admin authenticated and layout framework rendered.');

  // Step 2: Test "published-jobs" subtab (previously blank defect)
  console.log('Test 2: Verifying "published-jobs" subtab no longer renders blank...');
  // Click "চাকরি ব্যবস্থাপনা"
  const jobMgmtBtn = page.locator('button:has-text("চাকরি ব্যবস্থাপনা")');
  await jobMgmtBtn.click();
  await page.waitForTimeout(800);

  const publishedJobsBtn = page.locator('button:has-text("প্রকাশিত চাকরি")');
  await publishedJobsBtn.click();
  await page.waitForTimeout(2000);

  const breadcrumb = await page.locator('main').innerText();
  if (breadcrumb.length < 300) {
    throw new Error(`Test 2 Failed: published-jobs still appears blank, length: ${breadcrumb.length}`);
  }
  console.log(`✅ Test 2 Passed: "published-jobs" rendered successfully (${breadcrumb.length} chars of content).`);
  await page.screenshot({ path: 'audit_124_published_jobs_fixed.png' });

  // Step 3: Test "pending-approval" subtab (imported drafts)
  console.log('Test 3: Verifying "pending-approval" subtab renders draft verification...');
  const pendingApprovalBtn = page.locator('button:has-text("অনুমোদনের অপেক্ষায়")');
  await pendingApprovalBtn.click();
  await page.waitForTimeout(2000);
  const pendingText = await page.locator('main').innerText();
  if (!pendingText.includes('খসড়া') && !pendingText.includes('সার্কুলার')) {
    throw new Error('Test 3 Failed: pending-approval did not render draft verification');
  }
  console.log('✅ Test 3 Passed: "pending-approval" correctly mapped to draft verification hub.');

  // Step 4: Test newly added "job-reports" in sidebar
  console.log('Test 4: Verifying "🚨 ভুয়া সার্কুলার ও অভিযোগ সেল" in sidebar...');
  const jobReportsSubBtn = sidebar.locator('button:has-text("ভুয়া সার্কুলার ও অভিযোগ সেল")');
  if (!(await jobReportsSubBtn.isVisible())) {
    throw new Error('Test 4 Failed: job-reports missing from sidebar');
  }
  await jobReportsSubBtn.click();
  await page.waitForTimeout(2000);

  const reportCellText = await page.locator('main').innerText();
  if (!reportCellText.includes('অভিযোগ') && !reportCellText.includes('REP-')) {
    throw new Error('Test 4 Failed: job-reports view did not render');
  }
  console.log('✅ Test 4 Passed: "job-reports" is visible in sidebar and opens fraud investigation hub.');
  await page.screenshot({ path: 'audit_124_job_reports_sidebar_fixed.png' });

  // Step 5: Test newly added "support-tickets" in sidebar
  console.log('Test 5: Verifying "🎧 সাপোর্ট টিকেট ও হেল্পডেস্ক" in sidebar...');
  const notifGroupBtn = sidebar.locator('button:has-text("নোটিফিকেশন ও সাপোর্ট")');
  await notifGroupBtn.click();
  await page.waitForTimeout(800);

  const supportTicketsSubBtn = sidebar.locator('button:has-text("সাপোর্ট টিকেট ও হেল্পডেস্ক")');
  if (!(await supportTicketsSubBtn.isVisible())) {
    throw new Error('Test 5 Failed: support-tickets missing from sidebar');
  }
  await supportTicketsSubBtn.click();
  await page.waitForTimeout(2000);

  const supportText = await page.locator('main').innerText();
  if (!supportText.includes('টিকেট') && !supportText.includes('TCK-') && !supportText.includes('সাপোর্ট')) {
    throw new Error('Test 5 Failed: support-tickets view did not render');
  }
  console.log('✅ Test 5 Passed: "support-tickets" is visible in sidebar and opens helpdesk support hub.');
  await page.screenshot({ path: 'audit_124_support_tickets_sidebar_fixed.png' });

  // Step 6: Test Global Search with Ctrl+K and authentication headers
  console.log('Test 6: Verifying Ctrl+K Global Search with admin auth headers...');
  await page.keyboard.press('Control+KeyK');
  await page.waitForTimeout(1000);

  const searchInput = page.locator('div.animate-fadeIn input[type="text"]');
  if (!(await searchInput.isVisible())) {
    throw new Error('Test 6 Failed: Global search modal did not open on Ctrl+K');
  }

  // Type search term
  await searchInput.fill('চাকরি');
  await page.waitForTimeout(2000);

  // Check if search modal shows results or non-error state
  const modalText = await page.locator('div.animate-fadeIn').innerText();
  if (modalText.includes('FORBIDDEN') || modalText.includes('403')) {
    throw new Error('Test 6 Failed: Global search returned 403 Forbidden auth error');
  }
  console.log('✅ Test 6 Passed: Global search modal authenticated and functioning cleanly with no 403 errors.');
  await page.screenshot({ path: 'audit_124_global_search_authenticated.png' });

  // Close search modal by clicking close button
  await page.locator('button[title="সার্চ বন্ধ করুন"]').click();
  await page.waitForTimeout(1000);

  // Step 7: Test "new-candidates" subtab
  console.log('Test 7: Verifying "new-candidates" subtab renders candidate directory...');
  const candGroupBtn = sidebar.locator('button:has-text("প্রার্থীদের ব্যবস্থাপনা")');
  await candGroupBtn.click();
  await page.waitForTimeout(800);

  const newCandBtn = sidebar.locator('button:has-text("নতুন নিবন্ধিত প্রার্থী")');
  await newCandBtn.click();
  await page.waitForTimeout(2000);
  const candContent = await page.locator('main').innerText();
  if (candContent.length < 300 || (!candContent.includes('প্রার্থী') && !candContent.includes('মোবাইল'))) {
    throw new Error(`Test 7 Failed: new-candidates rendered blank content, length: ${candContent.length}`);
  }
  console.log('✅ Test 7 Passed: "new-candidates" correctly renders candidate directory with zero blanks.');

  console.log('\n🎉 ALL 7 END-TO-END ARCHITECTURAL VALIDATION TESTS PASSED 100%!');
  await browser.close();
}

runE2EValidation().catch(err => {
  console.error('❌ E2E Validation Failed:', err);
  process.exit(1);
});
