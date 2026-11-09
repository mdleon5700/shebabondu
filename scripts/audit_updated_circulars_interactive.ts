import { chromium } from 'playwright';
import path from 'path';
import { serverDB } from '../src/lib/db';
import { JobCircular } from '../src/lib/types';
import { DeadlineRevision } from '../src/lib/deadlines/types';

const ARTIFACTS_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Loading http://localhost:3000/updated-circulars (Initial State) ...');
  await page.goto('http://localhost:3000/updated-circulars', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot1Path = path.join(ARTIFACTS_DIR, 'audit_30_updated_circulars_empty_state.png');
  await page.screenshot({ path: screenshot1Path, fullPage: true });
  console.log('Saved audit_30_updated_circulars_empty_state.png');

  // Verify header & tabs on /updated-circulars
  const pageContent1 = await page.content();
  if (pageContent1.includes('সংশোধিত ও সময় বর্ধিত সার্কুলার') && pageContent1.includes('সংশোধনী গেজেট')) {
    console.log('SUCCESS: Updated Circulars page and filter tabs rendered successfully!');
  } else {
    throw new Error('FAILED: Missing updated circulars header or tabs.');
  }

  // 2. Admin publishes a Corrigendum & Deadline Extended Job
  console.log('2. Admin publishing a circular with corrigendum and extended deadline ...');
  const testJobId = 'test-bb-updated-corrigendum-audit';
  const testJob: JobCircular = {
    id: testJobId,
    title: 'সহকারী পরিচালক (সাধারণ) পদে সংশোধিত নিয়োগ বিজ্ঞপ্তি ২০২৬',
    organization: 'বাংলাদেশ ব্যাংক (Bangladesh Bank)',
    logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=120&q=80',
    category: 'bank',
    categoryLabel: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান',
    grade: '৯ম গ্রেড',
    totalPosts: 50,
    salary: '২২,০০০ - ৫৩,০৬০ টাকা',
    minEducation: 'যেকোনো বিষয়ে স্নাতকোত্তর বা ৪ বছর মেয়াদী স্নাতক',
    minAge: 21,
    maxAge: 32,
    districts: 'সকল জেলা',
    deadline: '১৫ ডিসেম্বর ২০২৬ (আবেদনের সময় বৃদ্ধি করা হয়েছে)',
    daysRemaining: 36,
    publishedDate: '৯ নভেম্বর ২০২৬',
    createdAt: '2026-11-09T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
    status: 'published',
    verificationStatus: 'VERIFIED',
    circularImage: '',
    audioSummary: '',
    requirements: ['কম্পিউটার পরিচালনায় দক্ষতা'],
    officialLink: 'https://erecruitment.bb.org.bd',
    serviceFee: 60,
    govtFee: 200,
    // Corrigendum fields
    hasCorrigendum: true,
    corrigendumText: 'বাংলাদেশ ব্যাংক কর্তৃক প্রকাশিত বিজ্ঞপ্তি নং ০৪/২০২৬ এর সংশোধনী: প্রার্থীদের সুবিধার জন্য আবেদনের শেষ তারিখ আগামী ১৫ ডিসেম্বর ২০২৬ রাত ১১:৫৯ পর্যন্ত বৃদ্ধি করা হলো এবং মোট শূন্যপদ সংখ্যা ৪০ থেকে বাড়িয়ে ৫০ করা হলো।',
    corrigendumPdfUrl: 'https://erecruitment.bb.org.bd/corrigendum.pdf',
    corrigendumDate: '৯ নভেম্বর ২০২৬',
    isExtended: true,
    vacanciesChanged: true
  } as any;

  serverDB.saveJob(testJob, 'ADMIN');

  // Add an authoritative deadline revision
  const testRevision: DeadlineRevision = {
    id: 'rev-test-bb-1',
    jobId: testJobId,
    previousDeadline: '১০ নভেম্বর ২০২৬',
    newDeadline: '১৫ ডিসেম্বর ২০২৬',
    changeReason: 'বাংলাদেশ ব্যাংক কর্তৃক অফিশিয়াল গেজেটের মাধ্যমে সময় বৃদ্ধি',
    verificationStatus: 'VERIFIED',
    approvedBy: 'ADMIN',
    approvedAt: new Date().toISOString(),
    timestamp: new Date().toISOString()
  };
  serverDB.addDeadlineRevision(testRevision);
  console.log('Saved test corrigendum circular & deadline revision in database:', testJobId);

  // 3. Reload /updated-circulars to verify live rendering
  console.log('3. Reloading /updated-circulars to verify live data ...');
  await page.goto('http://localhost:3000/updated-circulars', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const screenshot2Path = path.join(ARTIFACTS_DIR, 'audit_31_updated_circulars_live_rendered.png');
  await page.screenshot({ path: screenshot2Path, fullPage: true });
  console.log('Saved audit_31_updated_circulars_live_rendered.png');

  const liveTitle = page.locator('text=সহকারী পরিচালক (সাধারণ) পদে সংশোধিত নিয়োগ বিজ্ঞপ্তি');
  const isLiveVisible = await liveTitle.isVisible();
  if (isLiveVisible) {
    console.log('SUCCESS: The updated corrigendum circular is live and visible on /updated-circulars!');
  } else {
    throw new Error('FAILED: Corrigendum circular not rendered.');
  }

  // 4. Test Tab Filter: click "সংশোধনী গেজেট"
  console.log('4. Testing tab click on "সংশোধনী গেজেট" ...');
  const corrigendumTab = page.locator('button:has-text("সংশোধনী গেজেট")').first();
  await corrigendumTab.click();
  await page.waitForTimeout(800);

  const screenshot3Path = path.join(ARTIFACTS_DIR, 'audit_32_updated_circulars_filtered_tab.png');
  await page.screenshot({ path: screenshot3Path, fullPage: true });
  console.log('Saved audit_32_updated_circulars_filtered_tab.png');

  const isStillVisible = await liveTitle.isVisible();
  if (isStillVisible) {
    console.log('SUCCESS: Corrigendum tab filtering works correctly!');
  } else {
    throw new Error('FAILED: Circular disappeared when clicking Corrigendum tab.');
  }

  // 5. Cleanup test job
  serverDB.deleteJob(testJobId, 'ADMIN');
  console.log('Cleaned up test job successfully.');

  await browser.close();
  console.log('All /updated-circulars interactive tests passed successfully!');
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
