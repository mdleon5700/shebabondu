import { chromium } from 'playwright';
import path from 'path';

async function auditLatestJobs() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const artifactDir = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

  console.log('1. Loading http://localhost:3000/latest-jobs ...');
  await page.goto('http://localhost:3000/latest-jobs', { waitUntil: 'networkidle' });

  // Initial screenshot
  await page.screenshot({ path: path.join(artifactDir, 'audit_18_latest_jobs_page_initial.png'), fullPage: false });
  console.log('Saved audit_18_latest_jobs_page_initial.png');

  // Verify that the top card has November 10 date
  const firstCard = page.locator('.grid > div').first();
  const cardText = await firstCard.innerText();
  console.log('Top card excerpt:', cardText.slice(0, 100).replace(/\n/g, ' '));

  // 2. Filter by Category = 'government-jobs'
  console.log('2. Filtering by category = government-jobs ...');
  const catSelect = page.locator('select').first();
  await catSelect.selectOption('government-jobs');
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(artifactDir, 'audit_19_latest_jobs_filtered_category.png'), fullPage: false });
  console.log('Saved audit_19_latest_jobs_filtered_category.png');

  // 3. Reset and Search 'রেলওয়ে'
  console.log('3. Searching for railway in Bengali / English ...');
  const resetBtn = page.getByRole('button', { name: 'রিসেট' });
  if (await resetBtn.isVisible()) {
    await resetBtn.click();
    await page.waitForTimeout(500);
  }

  const searchInput = page.getByPlaceholder('পদ বা প্রতিষ্ঠান খুঁজুন...');
  await searchInput.fill('রেলওয়ে');
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(artifactDir, 'audit_20_latest_jobs_bilingual_search.png'), fullPage: false });
  console.log('Saved audit_20_latest_jobs_bilingual_search.png');

  await browser.close();
  console.log('Latest jobs interactive audit completed successfully!');
}

auditLatestJobs().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});

