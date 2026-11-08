/**
 * CHAKRI SHEBA (চাকরি সেবা) — COMPREHENSIVE DATA UPDATING & EDITING VERIFICATION
 * Tests real mutations across all 9 core subsystems:
 * 1. Candidate Profile Update (PATCH /api/candidate/profile)
 * 2. Admin Candidate Workspace Update (PATCH /api/admin/candidates/[id])
 * 3. Universal Page Builder Create & Edit (POST & PUT /api/admin/pages/[id])
 * 4. Job Publishing Create & Edit (POST & PATCH /api/admin/jobs/[id])
 * 5. Platform Settings Update (PATCH /api/admin/settings)
 * 6. Job Matching Engine Config Update (PATCH /api/admin/job-matching/config)
 * 7. Job Feeds Config Update (PATCH /api/admin/job-feeds/config)
 * 8. Category Management Create & Edit (POST & PATCH /api/admin/categories/[id])
 * 9. Source Collector Config Update (PATCH /api/admin/sources/[id])
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'CHAKRISEBA_SECURE_ADMIN_2026';
const DB_FILE = path.join(process.cwd(), 'src', 'db', 'local_store.json');

const adminHeaders = {
  'Content-Type': 'application/json',
  'x-admin-secret': ADMIN_SECRET
};

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

async function runDataUpdateVerification() {
  console.log('================================================================');
  console.log('CHAKRI SHEBA — FULL DATA UPDATING & EDITING VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const db = readDb();

  // Find candidate for testing
  const candidateId = Object.keys(db.candidates || {})[0] || 'CS-USR-26-366564';
  console.log(`[TEST TARGET] Using Candidate: ${candidateId}`);

  // Impersonate candidate to get auth cookie
  let candidateCookie = '';
  const impRes = await fetch(`${BASE_URL}/api/admin/impersonate`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ candidateId })
  });
  const setCookie = impRes.headers.get('set-cookie');
  if (setCookie) {
    const match = setCookie.match(/cs_session_token=([^;]+)/);
    if (match) candidateCookie = `cs_session_token=${match[1]}`;
  }
  if (!candidateCookie) {
    console.error('❌ Failed to obtain candidate session token!');
    process.exit(1);
  }
  console.log('✅ Impersonation session cookie acquired successfully.\n');

  const candidateHeaders = {
    'Content-Type': 'application/json',
    'Cookie': candidateCookie
  };

  // -------------------------------------------------------------
  // TEST 1: Candidate Profile Update via Candidate Panel API
  // -------------------------------------------------------------
  console.log('--- TEST 1: Candidate Self-Profile Update (PATCH /api/profile) ---');
  const testBio = 'প্রকৌশলী ও প্রযুক্তি গবেষক — লাইভ ডাটা এডিটিং ভেরিফাইড ' + Date.now();
  const profileRes = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PATCH',
    headers: candidateHeaders,
    body: JSON.stringify({
      bio: testBio,
      district: 'ঢাকা',
      thana: 'মিরপুর'
    })
  });
  const profileJson = await profileRes.json();
  const dbAfterProfile = readDb();
  const persistedBio = dbAfterProfile.candidates[candidateId]?.bio || dbAfterProfile.candidates[candidateId]?.personalInfo?.bio;
  if (profileRes.status === 200 && (persistedBio === testBio || JSON.stringify(dbAfterProfile.candidates[candidateId]).includes(testBio))) {
    console.log(`✅ [PASS] Candidate Profile updated & persisted to disk!`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Candidate Profile update failed. Status: ${profileRes.status}`, profileJson);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 2: Admin Candidate Workspace Update
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Admin Candidate Workspace Edit (PATCH /api/admin/candidates/[id]) ---');
  const testFatherName = 'মোঃ আব্দুল মান্নান (এডিটেড ' + Date.now() + ')';
  const adminCandRes = await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      fatherName: testFatherName,
      religion: 'ইসলাম',
      maritalStatus: 'অবিবাহিত'
    })
  });
  const adminCandJson = await adminCandRes.json();
  const dbAfterAdminCand = readDb();
  const candRecord = dbAfterAdminCand.candidates[candidateId];
  if (adminCandRes.status === 200 && (candRecord?.fatherName === testFatherName || candRecord?.biodata?.fatherName === testFatherName)) {
    console.log(`✅ [PASS] Admin Candidate Workspace edit updated & persisted to disk!`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Admin Candidate edit failed. Status: ${adminCandRes.status}`, adminCandJson);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 3: Universal Page Builder Create & Edit
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Page Builder Create & Edit (POST & PUT /api/admin/pages/[id]) ---');
  const testPageId = `test-page-${Date.now()}`;
  const createPageRes = await fetch(`${BASE_URL}/api/admin/pages`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      id: testPageId,
      title: 'টেস্ট পাতা (অডিট)',
      slug: testPageId,
      content: 'প্রাথমিক খসড়া কনটেন্ট',
      isPublished: false
    })
  });
  const createPageJson = await createPageRes.json();
  
  // Now Edit the created page
  const editedContent = 'সম্পাদিত উন্নত কনটেন্ট — ' + new Date().toISOString();
  const updatePageRes = await fetch(`${BASE_URL}/api/admin/pages/${testPageId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      title: 'টেস্ট পাতা (সম্পাদিত)',
      content: editedContent,
      isPublished: true
    })
  });
  const updatePageJson = await updatePageRes.json();
  const dbAfterPage = readDb();
  const pageInDb = dbAfterPage.pages && dbAfterPage.pages[testPageId];
  if ((createPageRes.status === 200 || createPageRes.status === 201) &&
      (updatePageRes.status === 200) &&
      pageInDb && pageInDb.content === editedContent) {
    console.log(`✅ [PASS] Universal Page Builder create & edit persisted to disk!`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Page Builder edit failed. Status: create=${createPageRes.status}, update=${updatePageRes.status}`, updatePageJson);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 4: Job Publishing Create & Edit
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Job Publishing Create & Edit (POST & PATCH /api/admin/jobs) ---');
  const testJobId = `job-test-${Date.now()}`;
  const createJobRes = await fetch(`${BASE_URL}/api/admin/jobs`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      id: testJobId,
      title: 'টেস্ট সিনিয়র অফিসার নিয়োগ ২০২৬',
      organization: 'বাংলাদেশ চিনি ও খাদ্য শিল্প কর্পোরেশন',
      orgType: 'autonomous',
      deadline: '2026-12-31',
      salary: '২২,০০০ - ৫৩,০৬০ টাকা',
      totalPosts: 15,
      category: 'govt',
      status: 'published'
    })
  });
  let createJobJson = {};
  try {
    createJobJson = await createJobRes.json();
  } catch (err) {
    console.error('Failed to parse createJob JSON:', err);
  }

  // Edit Job details via PATCH
  const editedSalary = '৩০,০০০ - ৬৫,০০০ টাকা (সংশোধিত বেতন স্কেল)';
  const updateJobRes = await fetch(`${BASE_URL}/api/admin/jobs/${testJobId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      salary: editedSalary,
      totalPosts: 20
    })
  });
  let updateJobJson = {};
  try {
    updateJobJson = await updateJobRes.json();
  } catch (err) {
    console.error('Failed to parse updateJob JSON:', err);
  }
  const dbAfterJob = readDb();
  const jobInDb = dbAfterJob.jobs && dbAfterJob.jobs[testJobId];
  if ((createJobRes.status === 200 || createJobRes.status === 201) &&
      (updateJobRes.status === 200) &&
      jobInDb && jobInDb.salary === editedSalary) {
    console.log(`✅ [PASS] Job create & edit updated & persisted to disk!`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Job create & edit failed. Status: create=${createJobRes.status}, update=${updateJobRes.status}`, updateJobJson);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 5: Platform Settings Update
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Platform Settings Update (PATCH /api/admin/settings) ---');
  const testNotice = 'সতর্কতা: চাকরি সেবা শতভাগ বিনামূল্যে পরিচালিত হয় — ' + Date.now();
  const settingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      announcementBanner: testNotice,
      siteNameBn: 'চাকরি সেবা'
    })
  });
  const settingsJson = await settingsRes.json();
  const dbAfterSettings = readDb();
  const noticeInDb = dbAfterSettings.platformSettings?.announcementBanner;
  if (settingsRes.status === 200 && noticeInDb === testNotice) {
    console.log(`✅ [PASS] Platform Settings updated & persisted to disk!`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Platform Settings update failed. Status: ${settingsRes.status}`, settingsJson);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 6: Job Matching Engine Config Update
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Job Matching Engine Config Update (PATCH /api/admin/job-matching/config) ---');
  const testMinScore = Math.floor(40 + Math.random() * 20);
  const matchingRes = await fetch(`${BASE_URL}/api/admin/job-matching/config`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      minMatchScoreThreshold: testMinScore,
      enableDistrictStrictBonus: true
    })
  });
  const matchingJson = await matchingRes.json();
  const dbAfterMatching = readDb();
  const scoreInDb = dbAfterMatching.matchingConfig?.minMatchScoreThreshold;
  if (matchingRes.status === 200 && scoreInDb === testMinScore) {
    console.log(`✅ [PASS] Job Matching Engine config updated & persisted to disk!`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Job Matching config update failed. Status: ${matchingRes.status}`, matchingJson);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 7: Job Feeds Config Update
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Job Feeds Config Update (PATCH /api/admin/job-feeds/config) ---');
  const testFeedLimit = 45;
  const feedRes = await fetch(`${BASE_URL}/api/admin/job-feeds/config`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      maxItemsPerFeed: testFeedLimit,
      enableRssFeed: true
    })
  });
  const feedJson = await feedRes.json();
  const dbAfterFeed = readDb();
  const feedInDb = dbAfterFeed.feedConfig?.maxItemsPerFeed;
  if (feedRes.status === 200 && feedInDb === testFeedLimit) {
    console.log(`✅ [PASS] Job Feeds config updated & persisted to disk!`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Job Feeds config update failed. Status: ${feedRes.status}`, feedJson);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 8: Category Create & Edit
  // -------------------------------------------------------------
  console.log('\n--- TEST 8: Category Create & Edit (POST & PATCH /api/admin/categories) ---');
  const testCatId = `cat-test-${Date.now()}`;
  const createCatRes = await fetch(`${BASE_URL}/api/admin/categories`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      id: testCatId,
      name_en: 'Test Category',
      name_bn: 'টেস্ট ক্যাটাগরি',
      slug: testCatId,
      is_active: true
    })
  });
  const createCatJson = await createCatRes.json();

  const editedCatNameBn = 'টেস্ট ক্যাটাগরি (সম্পাদিত)';
  const updateCatRes = await fetch(`${BASE_URL}/api/admin/categories/${testCatId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      name_bn: editedCatNameBn
    })
  });
  const updateCatJson = await updateCatRes.json();
  const dbAfterCat = readDb();
  const catInDb = dbAfterCat.categories && dbAfterCat.categories[testCatId];
  if ((createCatRes.status === 200 || createCatRes.status === 201) &&
      (updateCatRes.status === 200) &&
      catInDb && catInDb.name_bn === editedCatNameBn) {
    console.log(`✅ [PASS] Category create & edit updated & persisted to disk!`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Category create & edit failed. Status: create=${createCatRes.status}, update=${updateCatRes.status}`, updateCatJson);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 9: Source Config Update
  // -------------------------------------------------------------
  console.log('\n--- TEST 9: Source Collector Update (PATCH /api/admin/sources/[id]) ---');
  const sourceId = Object.keys(db.jobSources || {})[0] || 'teletalk-alljobs';
  const testInterval = Math.floor(30 + Math.random() * 60);
  const sourceRes = await fetch(`${BASE_URL}/api/admin/sources/${sourceId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({
      scanIntervalMinutes: testInterval
    })
  });
  const sourceJson = await sourceRes.json();
  const dbAfterSource = readDb();
  const sourceInDb = dbAfterSource.jobSources && dbAfterSource.jobSources[sourceId];
  if (sourceRes.status === 200 && sourceInDb && sourceInDb.scanIntervalMinutes === testInterval) {
    console.log(`✅ [PASS] Source Collector config updated & persisted to disk!`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Source config update failed. Status: ${sourceRes.status}`, sourceJson);
    failed++;
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`DATA EDITING & UPDATING VERIFICATION RESULTS:`);
  console.log(`✅ PASSED: ${passed} / 9 Subsystems`);
  console.log(`❌ FAILED: ${failed} / 9 Subsystems`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🎉 ALL DATA UPDATES AND EDITING OPERATIONS ARE 100% WORKABLE AND PERSISTENT!');
  } else {
    console.error(`⚠️ Detected ${failed} updating flaws. Check the logs above.`);
    process.exit(1);
  }
}

runDataUpdateVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
