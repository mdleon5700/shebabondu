import { chromium } from 'playwright';
import path from 'path';
import { serverDB } from '../src/lib/db';
import { JobCircular } from '../src/lib/types';
import { BangladeshDateHelper } from '../src/lib/feeds/timezone';

const ARTIFACTS_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('=== STEP 1: AUDITING /closing-soon ===');
  await page.goto('http://localhost:3000/closing-soon', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot33Path = path.join(ARTIFACTS_DIR, 'audit_33_closing_soon_feed.png');
  await page.screenshot({ path: screenshot33Path, fullPage: true });
  console.log('Saved audit_33_closing_soon_feed.png');

  const content1 = await page.content();
  if (content1.includes('জরুরি ডেডলাইন — আবেদনের সময় শীঘ্রই শেষ') && content1.includes('আজকের ডেডলাইন') && content1.includes('আবেদন করুন')) {
    console.log('SUCCESS: /closing-soon rendered with Hub Navigator, jobs feed, and apply buttons!');
  } else {
    throw new Error('FAILED: /closing-soon missing expected elements.');
  }

  // Test live search on /closing-soon
  console.log('Testing search on /closing-soon ...');
  const searchInput = page.locator('input[placeholder="পদ বা প্রতিষ্ঠান খুঁজুন..."]').first();
  const searchPromise = page.waitForResponse(
    (res) => res.url().includes('/api/jobs/closing-soon') && res.url().includes('q=BCIC') && res.status() === 200,
    { timeout: 10000 }
  );
  await searchInput.fill('BCIC');
  await searchPromise;
  await page.waitForTimeout(800);

  const screenshot34Path = path.join(ARTIFACTS_DIR, 'audit_34_closing_soon_search.png');
  await page.screenshot({ path: screenshot34Path, fullPage: true });
  console.log('Saved audit_34_closing_soon_search.png');

  const content2 = await page.content();
  if (content2.includes('BCIC') || content2.includes('রাসায়নিক')) {
    console.log('SUCCESS: Search on /closing-soon successfully filtered BCIC circulars!');
  } else {
    throw new Error('FAILED: Search on /closing-soon failed to find BCIC.');
  }

  console.log('=== STEP 2: AUDITING /deadline-today (EMPTY STATE) ===');
  await page.goto('http://localhost:3000/deadline-today', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot35Path = path.join(ARTIFACTS_DIR, 'audit_35_deadline_today_empty_state.png');
  await page.screenshot({ path: screenshot35Path, fullPage: true });
  console.log('Saved audit_35_deadline_today_empty_state.png');

  const content3 = await page.content();
  if (content3.includes('আজ কোনো সার্কুলারের ডেডলাইন নেই') || content3.includes('আজকেই আবেদনের শেষ সময়')) {
    console.log('SUCCESS: /deadline-today loaded and verified initial state.');
  } else {
    throw new Error('FAILED: /deadline-today failed to render initial state.');
  }

  console.log('=== STEP 3: ADMIN PUBLISHING TODAY DEADLINE CIRCULAR ===');
  const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();
  const testJobId = 'test-today-deadline-audit-job';
  const testJob: JobCircular = {
    id: testJobId,
    title: 'জরুরি ডেডলাইন টেস্ট স্পেশাল অফিসার পদ (আজ রাত ১১:৫৯ শেষ)',
    organization: 'বাংলাদেশ ব্যাংক রেগুলেশন সেল',
    logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
    category: 'bank',
    categoryLabel: 'ব্যাংক ও আর্থিক',
    grade: '৯ম গ্রেড',
    totalPosts: 25,
    minEducation: 'স্নাতকোত্তর / এমবিএ',
    salary: '২২,০০০-৫৩,০৬০ টাকা',
    deadline: `${todayInfo.dateBn} রাত ১১:৫৯`,
    daysRemaining: 0,
    publishedDate: todayInfo.dateBn,
    district: 'ঢাকা',
    districts: 'সকল জেলা',
    minAge: 21,
    maxAge: 32,
    govtFee: 200,
    serviceFee: 50,
    featured: false,
    isHot: true,
    applicationUrl: 'https://bb.teletalk.com.bd',
    officialLink: 'https://bb.org.bd',
    circularImage: '',
    audioSummary: '',
    requirements: ['স্নাতকোত্তর']
  };

  serverDB.saveJob(testJob);
  console.log('Saved test today-deadline job to DB with deadline:', testJob.deadline);

  // Reload /deadline-today and verify live rendering
  await page.goto('http://localhost:3000/deadline-today', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot36Path = path.join(ARTIFACTS_DIR, 'audit_36_deadline_today_admin_live.png');
  await page.screenshot({ path: screenshot36Path, fullPage: true });
  console.log('Saved audit_36_deadline_today_admin_live.png');

  const content4 = await page.content();
  if (
    content4.includes('জরুরি ডেডলাইন টেস্ট স্পেশাল অফিসার পদ') &&
    content4.includes('১-ক্লিকে এখনই আবেদন') &&
    content4.includes('বিস্তারিত সার্কুলার')
  ) {
    console.log('SUCCESS: /deadline-today reactively rendered the newly published closing-today job with 1-click apply and details links!');
  } else {
    // Clean up before throwing
    serverDB.deleteJob(testJobId);
    throw new Error('FAILED: /deadline-today did not render the new test job.');
  }

  // Clean up test job
  serverDB.deleteJob(testJobId);
  console.log('Cleaned up test job from DB.');

  console.log('=== STEP 4: AUDITING /deadline-approaching ===');
  await page.goto('http://localhost:3000/deadline-approaching', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const screenshot37Path = path.join(ARTIFACTS_DIR, 'audit_37_deadline_approaching_page.png');
  await page.screenshot({ path: screenshot37Path, fullPage: true });
  console.log('Saved audit_37_deadline_approaching_page.png');

  const content5 = await page.content();
  if (
    content5.includes('আবেদনের শেষ সময় সমাগত (Deadline Approaching)') &&
    content5.includes('জরুরি ডেডলাইন (৪৮-৭২ ঘণ্টা)') &&
    content5.includes('আবেদন করুন')
  ) {
    console.log('SUCCESS: /deadline-approaching rendered with Hub Navigator, approaching circulars, and apply buttons!');
  } else {
    throw new Error('FAILED: /deadline-approaching missing expected elements.');
  }

  await browser.close();
  console.log('=== ALL AUDIT CHECKS PASSED FOR CLUSTER 2 ITEM 7! ===');
}

main().catch(err => {
  console.error('AUDIT ERROR:', err);
  process.exit(1);
});
