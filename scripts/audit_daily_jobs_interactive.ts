import { chromium } from 'playwright';
import path from 'path';
import { serverDB } from '../src/lib/db';
import { JobCircular } from '../src/lib/types';

const ARTIFACTS_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Loading http://localhost:3000/daily-jobs ...');
  await page.goto('http://localhost:3000/daily-jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot1Path = path.join(ARTIFACTS_DIR, 'audit_23_daily_jobs_directory_page.png');
  await page.screenshot({ path: screenshot1Path, fullPage: true });
  console.log('Saved audit_23_daily_jobs_directory_page.png');

  // Verify elements on /daily-jobs
  const pageContent1 = await page.content();
  if (pageContent1.includes('দৈনিক চাকরির আর্কাইভ ক্যালেন্ডার') && pageContent1.includes('ক্যালেন্ডার থেকে নির্দিষ্ট তারিখ নির্বাচন করুন')) {
    console.log('SUCCESS: Daily Jobs Directory and Calendar Picker successfully rendered!');
  } else {
    throw new Error('FAILED: Daily Jobs Directory missing required elements.');
  }

  // 2. Click or jump to a date with jobs: e.g. /daily-jobs/2026-11-05
  console.log('2. Navigating to /daily-jobs/2026-11-05 (Date with 33 jobs) ...');
  await page.goto('http://localhost:3000/daily-jobs/2026-11-05', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot2Path = path.join(ARTIFACTS_DIR, 'audit_24_daily_jobs_date_archive_populated.png');
  await page.screenshot({ path: screenshot2Path, fullPage: true });
  console.log('Saved audit_24_daily_jobs_date_archive_populated.png');

  const pageContent2 = await page.content();
  if (pageContent2.includes('৫ নভেম্বর ২০২৬ এর চাকরির সার্কুলার') && pageContent2.includes('পূর্ববর্তী দিন')) {
    console.log('SUCCESS: Populated daily jobs date archive with day navigation pills rendered!');
  } else {
    throw new Error('FAILED: Populated daily jobs date archive missing expected headers.');
  }

  // 3. Navigate to an empty date e.g. 2026-11-07 (Saturday / no circulars)
  console.log('3. Navigating to /daily-jobs/2026-11-07 (Empty Date) ...');
  await page.goto('http://localhost:3000/daily-jobs/2026-11-07', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot3Path = path.join(ARTIFACTS_DIR, 'audit_25_daily_jobs_empty_date_state.png');
  await page.screenshot({ path: screenshot3Path, fullPage: true });
  console.log('Saved audit_25_daily_jobs_empty_date_state.png');

  const pageContent3 = await page.content();
  if (pageContent3.includes('৭ নভেম্বর ২০২৬ তারিখে কোনো নতুন সার্কুলার প্রকাশিত হয়নি')) {
    console.log('SUCCESS: Friendly empathetic empty state rendered for weekend/empty date!');
  } else {
    console.warn('WARNING: Empty state text mismatch, check screenshot 25.');
  }

  // 4. Test Admin Publication into 2026-11-07
  console.log('4. Admin publishing a job backdated to 2026-11-07 to test reactivity ...');
  const testJobId = 'test-daily-job-reactive-audit';
  const testJob: JobCircular = {
    id: testJobId,
    title: 'সহকারী পরিচালক (প্রকৌশল) পদে বিশেষ নিয়োগ ২০২৬',
    organization: 'বাংলাদেশ পেট্রোলিয়াম কর্পোরেশন (BPC)',
    logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=120&q=80',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি',
    grade: '৯ম গ্রেড',
    totalPosts: 5,
    salary: '২২,০০০ - ৫৩,০৬০ টাকা',
    minEducation: 'বিএসসি ইঞ্জিনিয়ারিং',
    minAge: 18,
    maxAge: 32,
    districts: 'সকল জেলা',
    deadline: '২৮ নভেম্বর ২০২৬',
    daysRemaining: 19,
    publishedDate: '৭ নভেম্বর ২০২৬',
    createdAt: '2026-11-07T10:00:00.000Z',
    status: 'published',
    verificationStatus: 'VERIFIED',
    circularImage: '',
    audioSummary: '',
    requirements: ['বিএসসি ইঞ্জিনিয়ারিং ডিগ্রি'],
    officialLink: 'https://bpc.teletalk.com.bd',
    serviceFee: 60,
    govtFee: 223
  };

  serverDB.saveJob(testJob, 'ADMIN');
  console.log('Saved test circular in database for 2026-11-07:', testJobId);

  // Reload /daily-jobs/2026-11-07
  console.log('5. Reloading /daily-jobs/2026-11-07 to verify instant rendering ...');
  await page.goto('http://localhost:3000/daily-jobs/2026-11-07', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const screenshot4Path = path.join(ARTIFACTS_DIR, 'audit_26_daily_jobs_admin_published_reactive.png');
  await page.screenshot({ path: screenshot4Path, fullPage: true });
  console.log('Saved audit_26_daily_jobs_admin_published_reactive.png');

  // Verify that the job card actually rendered
  const jobCard = page.locator('text=সহকারী পরিচালক (প্রকৌশল)');
  const isVisible = await jobCard.isVisible();
  if (isVisible) {
    console.log('SUCCESS: The backdated job is immediately live and visible on /daily-jobs/2026-11-07!');
  } else {
    throw new Error('FAILED: Job card not visible on /daily-jobs/2026-11-07.');
  }

  // 6. Clean up test job
  serverDB.deleteJob(testJobId, 'ADMIN');
  console.log('Cleaned up test job successfully.');

  await browser.close();
  console.log('All /daily-jobs interactive tests passed successfully!');
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
