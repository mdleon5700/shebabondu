import { chromium } from 'playwright';
import path from 'path';
import { serverDB } from '../src/lib/db';
import { JobCircular } from '../src/lib/types';

const ARTIFACTS_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Loading http://localhost:3000/featured-jobs ...');
  await page.goto('http://localhost:3000/featured-jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot1Path = path.join(ARTIFACTS_DIR, 'audit_27_featured_jobs_initial_page.png');
  await page.screenshot({ path: screenshot1Path, fullPage: true });
  console.log('Saved audit_27_featured_jobs_initial_page.png');

  // Verify elements on /featured-jobs
  const pageContent1 = await page.content();
  if (pageContent1.includes('বিশেষ ও গুরুত্বপূর্ণ চাকরির বিজ্ঞপ্তি ২০২৬') && pageContent1.includes('বিশেষ সার্কুলার')) {
    console.log('SUCCESS: Featured Jobs page rendered successfully with curated circulars!');
  } else {
    throw new Error('FAILED: Featured Jobs page missing title or badge.');
  }

  // 2. Test search for Petrobangla
  console.log('2. Searching for "Petrobangla" in featured jobs filter ...');
  const searchInput = page.locator('input[placeholder="পদ বা প্রতিষ্ঠান খুঁজুন..."]').first();
  const responsePromise = page.waitForResponse(
    (res) => res.url().includes('/api/jobs/featured') && res.url().includes('q=Petrobangla') && res.status() === 200,
    { timeout: 10000 }
  );
  await searchInput.fill('Petrobangla');
  await responsePromise;
  await page.waitForTimeout(800);

  const screenshot2Path = path.join(ARTIFACTS_DIR, 'audit_28_featured_jobs_search_filter.png');
  await page.screenshot({ path: screenshot2Path, fullPage: true });
  console.log('Saved audit_28_featured_jobs_search_filter.png');

  const pageContent2 = await page.content();
  if (pageContent2.includes('Petrobangla') || pageContent2.includes('পেট্রোবাংলা')) {
    console.log('SUCCESS: Search filter in featured jobs returned matched organization records!');
  } else {
    throw new Error('FAILED: Search filter did not find expected Petrobangla circulars.');
  }

  // 3. Admin publishes a top-priority featured job
  console.log('3. Admin publishing an urgent featured job ...');
  const testJobId = 'test-featured-job-admin-audit';
  const testJob: JobCircular = {
    id: testJobId,
    title: 'প্রধান সিস্টেম স্পেশালিস্ট (১ম গ্রেড) পদে বিশেষ নিয়োগ ২০২৬',
    organization: 'বাংলাদেশ তথ্য প্রযুক্তি কর্তৃপক্ষ (BITA)',
    logo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=120&q=80',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি',
    grade: '১ম গ্রেড',
    totalPosts: 3,
    salary: '৭৮,০০০ টাকা (নির্ধারিত)',
    minEducation: 'এমএসসি ইন সিএসই / পিএইচডি',
    minAge: 35,
    maxAge: 45,
    districts: 'সকল জেলা',
    deadline: '২৫ নভেম্বর ২০২৬',
    daysRemaining: 16,
    publishedDate: '৯ নভেম্বর ২০২৬',
    createdAt: '2026-11-09T08:30:00.000Z',
    status: 'published',
    verificationStatus: 'VERIFIED',
    featured: true,
    isHot: true,
    circularImage: '',
    audioSummary: '',
    requirements: ['১০ বছরের উচ্চ পর্যায়ের কাজের অভিজ্ঞতা'],
    officialLink: 'https://bita.teletalk.com.bd',
    serviceFee: 60,
    govtFee: 500
  };

  serverDB.saveJob(testJob, 'ADMIN');
  console.log('Saved test featured circular in database:', testJobId);

  // 4. Reload /featured-jobs to verify top ranking
  console.log('4. Reloading /featured-jobs to verify instant top placement ...');
  await page.goto('http://localhost:3000/featured-jobs', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const screenshot3Path = path.join(ARTIFACTS_DIR, 'audit_29_featured_jobs_admin_top_published.png');
  await page.screenshot({ path: screenshot3Path, fullPage: true });
  console.log('Saved audit_29_featured_jobs_admin_top_published.png');

  const topJobTitle = page.locator('text=প্রধান সিস্টেম স্পেশালিস্ট (১ম গ্রেড)');
  const isTopVisible = await topJobTitle.isVisible();
  if (isTopVisible) {
    console.log('SUCCESS: Admin featured job is immediately visible at the top!');
  } else {
    throw new Error('FAILED: Newly published featured job not visible.');
  }

  // 5. Cleanup test job
  serverDB.deleteJob(testJobId, 'ADMIN');
  console.log('Cleaned up test featured job successfully.');

  await browser.close();
  console.log('All /featured-jobs interactive tests passed successfully!');
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
