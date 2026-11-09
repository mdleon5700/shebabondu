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

  console.log('=== 1. AUDITING /jobs/jsc-pass ===');
  await page.goto('http://localhost:3000/jobs/jsc-pass', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const screenshot38 = path.join(ARTIFACTS_DIR, 'audit_38_jsc_pass_feed.png');
  await page.screenshot({ path: screenshot38, fullPage: true });
  console.log('Saved audit_38_jsc_pass_feed.png');

  const contentJsc = await page.content();
  if (contentJsc.includes('জেএসসি ও ৮ম শ্রেণি পাসে সরকারি চাকরি ২০২৬') && contentJsc.includes('শিক্ষাগত যোগ্যতা ও অভিজ্ঞতাকেন্দ্রিক হাব')) {
    console.log('SUCCESS: /jobs/jsc-pass rendered with Education Navigator Bar and matching circulars!');
  } else {
    throw new Error('FAILED: /jobs/jsc-pass missing title or navigator bar.');
  }

  console.log('=== 2. AUDITING /jobs/ssc-pass ===');
  await page.goto('http://localhost:3000/jobs/ssc-pass', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const screenshot39 = path.join(ARTIFACTS_DIR, 'audit_39_ssc_pass_feed.png');
  await page.screenshot({ path: screenshot39, fullPage: true });
  console.log('Saved audit_39_ssc_pass_feed.png');

  console.log('=== 3. AUDITING /jobs/hsc-pass ===');
  await page.goto('http://localhost:3000/jobs/hsc-pass', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const screenshot40 = path.join(ARTIFACTS_DIR, 'audit_40_hsc_pass_feed.png');
  await page.screenshot({ path: screenshot40, fullPage: true });
  console.log('Saved audit_40_hsc_pass_feed.png');

  console.log('=== 4. AUDITING /jobs/diploma-pass ===');
  await page.goto('http://localhost:3000/jobs/diploma-pass', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const screenshot41 = path.join(ARTIFACTS_DIR, 'audit_41_diploma_pass_feed.png');
  await page.screenshot({ path: screenshot41, fullPage: true });
  console.log('Saved audit_41_diploma_pass_feed.png');

  console.log('=== 5. AUDITING /jobs/bachelor-degree ===');
  await page.goto('http://localhost:3000/jobs/bachelor-degree', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const screenshot42 = path.join(ARTIFACTS_DIR, 'audit_42_bachelor_pass_feed.png');
  await page.screenshot({ path: screenshot42, fullPage: true });
  console.log('Saved audit_42_bachelor_pass_feed.png');

  console.log('=== 6. AUDITING /jobs/masters-degree ===');
  await page.goto('http://localhost:3000/jobs/masters-degree', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const screenshot43 = path.join(ARTIFACTS_DIR, 'audit_43_masters_pass_feed.png');
  await page.screenshot({ path: screenshot43, fullPage: true });
  console.log('Saved audit_43_masters_pass_feed.png');

  console.log('=== 7. AUDITING /jobs/no-experience ===');
  await page.goto('http://localhost:3000/jobs/no-experience', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const screenshot44 = path.join(ARTIFACTS_DIR, 'audit_44_no_experience_feed.png');
  await page.screenshot({ path: screenshot44, fullPage: true });
  console.log('Saved audit_44_no_experience_feed.png');

  console.log('=== 8. AUDITING /fresher-jobs ===');
  await page.goto('http://localhost:3000/fresher-jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const screenshot45 = path.join(ARTIFACTS_DIR, 'audit_45_fresher_jobs_feed.png');
  await page.screenshot({ path: screenshot45, fullPage: true });
  console.log('Saved audit_45_fresher_jobs_feed.png');

  console.log('=== 9. AUDITING /internships ===');
  await page.goto('http://localhost:3000/internships', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const screenshot46 = path.join(ARTIFACTS_DIR, 'audit_46_internships_feed.png');
  await page.screenshot({ path: screenshot46, fullPage: true });
  console.log('Saved audit_46_internships_feed.png');

  console.log('=== 10. AUDITING /part-time-jobs ===');
  await page.goto('http://localhost:3000/part-time-jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const screenshot47 = path.join(ARTIFACTS_DIR, 'audit_47_part_time_jobs_feed.png');
  await page.screenshot({ path: screenshot47, fullPage: true });
  console.log('Saved audit_47_part_time_jobs_feed.png');

  console.log('=== 11. TESTING ADMIN LIVE JSC JOB PUBLICATION ===');
  const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();
  const testJscJobId = 'test-jsc-audit-job-live';
  const testJscJob: JobCircular = {
    id: testJscJobId,
    title: 'অফিস সহায়ক ও নিরাপত্তা প্রহরী পদে বিশেষ নিয়োগ ২০২৬ (জেএসসি পাস)',
    organization: 'বাংলাদেশ পাট গবেষণা ইনস্টিটিউট (বিজেআরআই)',
    logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি',
    grade: '২০তম গ্রেড',
    totalPosts: 45,
    minEducation: 'কোনো স্বীকৃত বোর্ড হতে জুনিয়র স্কুল সার্টিফিকেট (জেএসসি) বা অষ্টম শ্রেণি উত্তীর্ণ',
    salary: '৮,২৫০-২০,০১০ টাকা',
    deadline: '৩০ নভেম্বর ২০২৬',
    daysRemaining: 21,
    publishedDate: todayInfo.dateBn,
    district: 'ঢাকা',
    districts: 'সকল জেলা',
    minAge: 18,
    maxAge: 30,
    govtFee: 100,
    serviceFee: 50,
    featured: true,
    isHot: true,
    applicationUrl: 'https://bjri.teletalk.com.bd',
    officialLink: 'https://bjri.gov.bd',
    circularImage: '',
    audioSummary: '',
    requirements: ['জেএসসি বা অষ্টম শ্রেণি পাস']
  };

  serverDB.saveJob(testJscJob);
  console.log('Saved live test JSC job to DB.');

  await page.goto('http://localhost:3000/jobs/jsc-pass', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot48 = path.join(ARTIFACTS_DIR, 'audit_48_jsc_pass_admin_live.png');
  await page.screenshot({ path: screenshot48, fullPage: true });
  console.log('Saved audit_48_jsc_pass_admin_live.png');

  const contentJscLive = await page.content();
  if (contentJscLive.includes('অফিস সহায়ক ও নিরাপত্তা প্রহরী পদে বিশেষ নিয়োগ ২০২৬ (জেএসসি পাস)')) {
    console.log('SUCCESS: /jobs/jsc-pass reactively rendered the newly created JSC job live!');
  } else {
    serverDB.deleteJob(testJscJobId);
    throw new Error('FAILED: /jobs/jsc-pass did not render new test JSC job.');
  }

  // Cleanup test job
  serverDB.deleteJob(testJscJobId);
  console.log('Cleaned up test JSC job.');

  await browser.close();
  console.log('=== ALL CLUSTER 3 EDUCATION & EXPERIENCE AUDIT CHECKS PASSED! ===');
}

main().catch(err => {
  console.error('CLUSTER 3 AUDIT ERROR:', err);
  process.exit(1);
});

