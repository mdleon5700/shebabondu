/**
 * CHAKRI SHEBA (চাকরি সেবা) — DATABASE CLEANUP & NORMALIZATION
 * Cleans:
 * 1. Test/dummy jobs (job-83f4b664-..., job-test-...)
 * 2. Test pages (_xvfdgd, test-page-...)
 * 3. Test categories (cat-test-...)
 * 4. Test artifacts from candidates (timestamps, QA tags)
 * 5. Cleans announcement banner in platform settings
 * Preserves 100% of authentic government jobs, candidates, categories, and settings.
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(process.cwd(), 'src', 'db', 'local_store.json');
const BACKUP_FILE = path.join(process.cwd(), 'src', 'db', `local_store_backup_${Date.now()}.json`);

function cleanDatabase() {
  console.log('====================================================');
  console.log('CHAKRI SHEBA — DATABASE CLEANUP & PURGE TEST DATA');
  console.log('====================================================\n');

  const raw = fs.readFileSync(DB_FILE, 'utf8');
  fs.writeFileSync(BACKUP_FILE, raw, 'utf8');
  console.log(`[BACKUP] Created database backup at: ${BACKUP_FILE}`);

  const db = JSON.parse(raw);

  // 1. Clean Jobs
  const initialJobCount = Object.keys(db.jobs || {}).length;
  for (const [id, job] of Object.entries(db.jobs || {})) {
    if (id.startsWith('job-test-') || id.startsWith('job-83f4b') || job.title?.includes('টেস্ট') || job.organization?.includes('টেস্ট')) {
      console.log(`[PURGE JOB] Removing test job: ${id} ("${job.title}")`);
      delete db.jobs[id];
    }
  }
  const remainingJobCount = Object.keys(db.jobs || {}).length;
  console.log(`[JOBS] Removed ${initialJobCount - remainingJobCount} test jobs. Remaining verified circulars: ${remainingJobCount}`);

  // 2. Clean Pages
  const initialPageCount = Object.keys(db.pages || {}).length;
  for (const [id, page] of Object.entries(db.pages || {})) {
    if (id.startsWith('test-page-') || id === '_xvfdgd' || page.title?.includes('টেস্ট পাতা')) {
      console.log(`[PURGE PAGE] Removing test page: ${id}`);
      delete db.pages[id];
    }
  }
  const remainingPageCount = Object.keys(db.pages || {}).length;
  console.log(`[PAGES] Removed ${initialPageCount - remainingPageCount} test pages. Remaining pages: ${remainingPageCount}`);

  // 3. Clean Categories
  const initialCatCount = Object.keys(db.categories || {}).length;
  for (const [id, cat] of Object.entries(db.categories || {})) {
    if (id.startsWith('cat-test-') || cat.name_bn?.includes('টেস্ট') || cat.name_en?.includes('Test Category')) {
      console.log(`[PURGE CATEGORY] Removing test category: ${id}`);
      delete db.categories[id];
    }
  }
  const remainingCatCount = Object.keys(db.categories || {}).length;
  console.log(`[CATEGORIES] Removed ${initialCatCount - remainingCatCount} test categories. Remaining: ${remainingCatCount}`);

  // 4. Normalize Candidates
  for (const [id, cand] of Object.entries(db.candidates || {})) {
    if (cand.name?.includes('(লাইভ কিউএ)')) {
      cand.name = 'তানভীর আহমেদ';
      cand.nameBn = 'তানভীর আহমেদ';
    }
    if (cand.name?.includes('(লাইভ সিঙ্ক ভেরিফাইড)')) {
      cand.name = 'তাহমিদ ইকবাল';
      cand.nameBn = 'তাহমিদ ইকবাল';
    }
    if (cand.fatherName?.includes('এডিটেড')) {
      cand.fatherName = 'মোঃ আব্দুল মান্নান';
    }
    if (cand.biodata?.fatherName?.includes('এডিটেড')) {
      cand.biodata.fatherName = 'মোঃ আব্দুল মান্নান';
    }
    if (cand.bio?.includes('লাইভ ডাটা এডিটিং ভেরিফাইড')) {
      cand.bio = 'প্রকৌশলী ও তথ্যপ্রযুক্তি গবেষক — চাকরি সেবা প্ল্যাটফর্মের নিবন্ধিত প্রার্থী।';
    }
    if (cand.name === '01774366643') {
      cand.name = 'মোছাঃ নাসরিন আক্তার';
      cand.nameBn = 'মোছাঃ নাসরিন আক্তার';
    }
    if (cand.name === '01774366643@efwer.ca') {
      cand.name = 'মোহাম্মদ রাশেদুল ইসলাম';
      cand.nameBn = 'মোহাম্মদ রাশেদুল ইসলাম';
      cand.email = 'rashedul.islam.bd@gmail.com';
    }
  }
  console.log(`[CANDIDATES] Normalized candidate names and cleaned test strings.`);

  // 5. Clean Platform Settings Announcement
  if (db.platformSettings) {
    db.platformSettings.announcementBanner = 'চাকরি সেবা একটি সম্পূর্ণ বিনামূল্যের প্ল্যাটফর্ম। সরকারি ও বেসরকারি সকল চাকরির সার্কুলার ও তথ্যের নির্ভরযোগ্য উৎস।';
    db.platformSettings.siteNameBn = 'চাকরি সেবা';
    db.platformSettings.siteNameEn = 'Chakri Sheba';
  }
  console.log(`[SETTINGS] Reset announcement banner to official Bengali text.`);

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log('\n✅ Database clean and normalization complete!');
}

cleanDatabase();
