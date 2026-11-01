import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';
const BASE_URL = 'http://localhost:3000';

async function testCreateJob() {
  console.log('=== Testing Job Creation & Notification Dispatch via API ===');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  // Test creating a new job via POST /api/admin/jobs
  const newJobPayload = {
    title: 'বাংলাদেশ পল্লি বিদ্যুতায়ন বোর্ড (BREB) সহকারী প্রকৌশলী নিয়োগ ২০২৬',
    organization: 'বাংলাদেশ পল্লি বিদ্যুতায়ন বোর্ড (BREB)',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি',
    grade: '৯ম গ্রেড',
    totalPosts: 45,
    salary: '২২,০০০ - ৫৩,০৬০ টাকা (জাতীয় বেতন স্কেল ২০১৫)',
    minEducation: 'বিএসসি ইঞ্জিনিয়ারিং (ইইই/সিভিল/মেকানিক্যাল)',
    minAge: 18,
    maxAge: 32,
    districts: 'সকল জেলা',
    deadline: '2026-11-28 17:00:00',
    daysRemaining: 26,
    govtFee: 500,
    serviceFee: 80,
    officialLink: 'https://breb.teletalk.com.bd',
    circularImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
    circularPdfUrl: 'https://breb.teletalk.com.bd/docs/circular_breb_2026.pdf',
    publishedDate: '০২/১১/২০২৬',
    bengaliDescription: 'পল্লি বিদ্যুতায়ন বোর্ড (BREB) এর রাজস্ব খাতভুক্ত শূন্য পদসমূহে সরাসরি নিয়োগের নিমিত্তে উপযুক্ত বাংলাদেশী নাগরিকদের নিকট হতে দরখাস্ত আহবান করা যাচ্ছে।',
    status: 'published',
    verificationStatus: 'VERIFIED',
    verificationConfidence: 100,
    verificationNotes: 'অফিসিয়াল টেলিটক গ্যাজেট ও বিজ্ঞপ্তির সাথে মিলিয়ে যাচাইকৃত।'
  };

  const createRes = await page.evaluate(async (payload) => {
    const res = await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': '1234'
      },
      body: JSON.stringify(payload)
    });
    return { status: res.status, data: await res.json() };
  }, newJobPayload);

  console.log('Job Create Result:', createRes.status, createRes.data.success ? 'SUCCESS' : 'FAILED', createRes.data.job?.id);

  // Check database for created job
  const db = JSON.parse(fs.readFileSync('C:/Users/Leon Rahman/Documents/chakri-sheba/src/db/local_store.json', 'utf8'));
  const createdId = createRes.data.job?.id;
  console.log('Database has created job:', Boolean(db.jobs[createdId]));
  console.log('Created Job Title:', db.jobs[createdId]?.title);

  // Verify candidate notification received for this new job
  const candidateSampleNotifs = db.notifications['USR-01712345678'] || [];
  const latestNotif = candidateSampleNotifs[0];
  console.log('Latest candidate notification for USR-01712345678:');
  console.log('  Title:', latestNotif?.title);
  console.log('  Message:', latestNotif?.message);
  console.log('  Link:', latestNotif?.link);

  // Take screenshot of the public jobs directory showing all 6 jobs
  await page.goto(`${BASE_URL}/#circulars-section`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_5jobs_06_homepage_circulars_with_new_job.png'), fullPage: false });
  console.log('Saved admin_5jobs_06_homepage_circulars_with_new_job.png');

  // Clean up: delete the test job to keep exactly the 5 authentic jobs requested by user
  console.log('\nCleaning up created test job to restore exact 5 authentic jobs...');
  const delRes = await page.evaluate(async (id) => {
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-secret': '1234' }
    });
    return { status: res.status, data: await res.json() };
  }, createdId);
  console.log('Delete result:', delRes.status, delRes.data);

  const dbAfter = JSON.parse(fs.readFileSync('C:/Users/Leon Rahman/Documents/chakri-sheba/src/db/local_store.json', 'utf8'));
  console.log('Remaining authentic jobs in DB:', Object.keys(dbAfter.jobs || {}).length);

  await browser.close();
}

testCreateJob().catch(console.error);
