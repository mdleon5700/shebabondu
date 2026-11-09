import { chromium } from 'playwright';
import path from 'path';

async function auditJobsDirectory() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const artifactDir = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

  console.log('1. Loading http://localhost:3000/jobs ...');
  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });

  // Initial screenshot
  await page.screenshot({ path: path.join(artifactDir, 'audit_14_jobs_directory_initial.png'), fullPage: false });
  console.log('Saved audit_14_jobs_directory_initial.png');

  // 2. Select category = 'govt'
  console.log('2. Selecting category = govt ...');
  const catSelect = page.locator('select').nth(1); // 0 is sort, 1 is category, 2 is grade, 3 is district, 4 is salary
  await catSelect.selectOption('govt');
  await page.waitForTimeout(500);

  // 3. Select grade = '৯ম গ্রেড'
  console.log('3. Selecting grade = ৯ গ্রেড ...');
  const gradeSelect = page.locator('select').nth(2);
  await gradeSelect.selectOption('৯ম গ্রেড');
  await page.waitForTimeout(500);

  // Take screenshot with active filters
  await page.screenshot({ path: path.join(artifactDir, 'audit_15_jobs_directory_filtered.png'), fullPage: false });
  console.log('Saved audit_15_jobs_directory_filtered.png');

  // 4. Click Reset Filters
  console.log('4. Clicking Reset Filters button ...');
  const resetBtn = page.getByText('সকল ফিল্টার রিসেট');
  if (await resetBtn.isVisible()) {
    await resetBtn.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(artifactDir, 'audit_16_jobs_directory_reset.png'), fullPage: false });
  console.log('Saved audit_16_jobs_directory_reset.png');

  // 5. Navigate to Page 2
  console.log('5. Clicking page 2 ...');
  const page2Btn = page.getByRole('button', { name: 'পৃষ্ঠা ২' }).first();
  if (await page2Btn.isVisible()) {
    await page2Btn.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(artifactDir, 'audit_17_jobs_directory_page_2.png'), fullPage: false });
  console.log('Saved audit_17_jobs_directory_page_2.png');

  await browser.close();
  console.log('All jobs directory browser tests completed successfully!');
}

auditJobsDirectory().catch(err => {
  console.error('Jobs directory audit error:', err);
  process.exit(1);
});
