const http = require('http');
const fs = require('fs');

const ADMIN_SECRET = '1234';
const TEST_CANDIDATE_ID = 'CS-USR-26-990011'; // তাহমিদ ইকবাল
const TEST_SESSION_TOKEN = 'test-session-sync-token-' + Date.now();

// 1. Setup Session in local_store.json
function setupTestSession() {
  const db = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
  db.sessions[TEST_SESSION_TOKEN] = {
    candidateId: TEST_CANDIDATE_ID,
    role: 'candidate',
    expiresAt: new Date(Date.now() + 86400000).toISOString()
  };
  fs.writeFileSync('src/db/local_store.json', JSON.stringify(db, null, 2));
  console.log(`[SETUP] Registered test session token for ${TEST_CANDIDATE_ID}`);
}

// 2. HTTP Helper
function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method: options.method || 'GET',
        headers: { ...defaultHeaders, ...(options.headers || {}) }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          let json = {};
          try { json = JSON.parse(body); } catch (e) { json = { raw: body }; }
          resolve({ status: res.statusCode, data: json });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// 3. Helper wrappers
const userApi = {
  getProfile: () => request('/api/profile', {
    headers: { 'Authorization': `Bearer ${TEST_SESSION_TOKEN}` }
  }),
  updateProfile: (body) => request('/api/profile', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${TEST_SESSION_TOKEN}` },
    body
  })
};

const adminApi = {
  getCandidate: (id) => request(`/api/admin/candidates/${id}`, {
    headers: { 'x-admin-secret': ADMIN_SECRET }
  }),
  updateCandidate: (id, body) => request(`/api/admin/candidates/${id}`, {
    method: 'PATCH',
    headers: { 'x-admin-secret': ADMIN_SECRET },
    body
  }),
  listCandidates: (search = '') => request(`/api/admin/candidates?search=${encodeURIComponent(search)}`, {
    headers: { 'x-admin-secret': ADMIN_SECRET }
  })
};

async function run10WayBidirectionalSyncAudit() {
  console.log('========================================================================');
  console.log('   CHAKRI SHEBA — 10-WAY BIDIRECTIONAL USER/ADMIN SYNC AUDIT & TEST    ');
  console.log('========================================================================\n');

  setupTestSession();
  const results = [];

  // Helper to record result
  const record = (num, name, dir, success, details) => {
    results.push({ testNum: num, name, direction: dir, pass: success, details });
    const mark = success ? '✅ PASS' : '❌ FAIL';
    console.log(`[TEST ${num}] ${mark} | ${dir} | ${name}`);
    console.log(`         Details: ${details}\n`);
  };

  // --------------------------------------------------------------------------
  // TEST 1: [User -> Admin] Personal Name & Bengali Name
  // --------------------------------------------------------------------------
  try {
    const testName = 'তাহমিদ ইকবাল (লাইভ সিঙ্ক ভেরিফাইড)';
    const testNameBn = 'তাহমিদ ইকবাল (বাংলা)';
    const uRes = await userApi.updateProfile({ name: testName, nameBn: testNameBn });
    const aRes = await adminApi.getCandidate(TEST_CANDIDATE_ID);
    const pass = uRes.status === 200 && aRes.data.candidate?.name === testName && aRes.data.candidate?.nameBn === testNameBn;
    record(1, 'Personal Name & Bangla Name Sync', 'User -> Admin', pass, 
      `User PUT: ${uRes.status} | Admin GET name: "${aRes.data.candidate?.name}"`);
  } catch (err) {
    record(1, 'Personal Name & Bangla Name Sync', 'User -> Admin', false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: [Admin -> User] Contact Email Update
  // --------------------------------------------------------------------------
  try {
    const testEmail = 'tahmid.sync.audit@chakrisheba.com';
    const aRes = await adminApi.updateCandidate(TEST_CANDIDATE_ID, { email: testEmail });
    const uRes = await userApi.getProfile();
    const pass = aRes.status === 200 && uRes.data.profile?.email === testEmail;
    record(2, 'Contact Email Reflection', 'Admin -> User', pass,
      `Admin PATCH: ${aRes.status} | User GET email: "${uRes.data.profile?.email}"`);
  } catch (err) {
    record(2, 'Contact Email Reflection', 'Admin -> User', false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: [User -> Admin] Date of Birth (DOB) Update
  // --------------------------------------------------------------------------
  try {
    const testDob = '1997-08-25';
    const uRes = await userApi.updateProfile({ dob: testDob });
    const aRes = await adminApi.getCandidate(TEST_CANDIDATE_ID);
    const pass = uRes.status === 200 && aRes.data.candidate?.dob === testDob;
    record(3, 'Date of Birth (DOB) Sync', 'User -> Admin', pass,
      `User PUT: ${uRes.status} | Admin GET dob: "${aRes.data.candidate?.dob}"`);
  } catch (err) {
    record(3, 'Date of Birth (DOB) Sync', 'User -> Admin', false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 4: [User -> Admin] Educational Record (নতুন ডিগ্রি যোগ)
  // --------------------------------------------------------------------------
  try {
    const testEducation = [
      { level: 'এসএসসি', degree: 'বিজ্ঞান', board: 'ঢাকা', roll: '109841', year: '2014', result: '5.00' },
      { level: 'এইচএসসি', degree: 'বিজ্ঞান', board: 'ঢাকা', roll: '214589', year: '2016', result: '4.90' },
      { level: 'স্নাতক (অনার্স)', degree: 'বিএসসি ইন সিএসই', board: 'ঢাকা বিশ্ববিদ্যালয়', roll: '160105', year: '2021', result: '3.82' }
    ];
    const uRes = await userApi.updateProfile({ education: testEducation });
    const aRes = await adminApi.getCandidate(TEST_CANDIDATE_ID);
    const eduCount = aRes.data.candidate?.education?.length || 0;
    const highestDegree = aRes.data.candidate?.education?.[2]?.degree;
    const pass = uRes.status === 200 && eduCount === 3 && highestDegree === 'বিএসসি ইন সিএসই';
    record(4, 'Educational Qualifications Array Sync', 'User -> Admin', pass,
      `User PUT: ${uRes.status} | Admin GET degrees count: ${eduCount}, Highest: "${highestDegree}"`);
  } catch (err) {
    record(4, 'Educational Qualifications Array Sync', 'User -> Admin', false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5: [Admin -> User] Professional Work Experience (চাকরির অভিজ্ঞতা)
  // --------------------------------------------------------------------------
  try {
    const testExperiences = [
      {
        id: 'exp-1',
        designation: 'কম্পিউটার অপারেটর',
        organization: 'বাংলাদেশ পরিসংখ্যান ব্যুরো (BBS)',
        duration: '২ বছর',
        isCurrent: true,
        responsibilities: 'ডাটা এন্ট্রি ও অ্যানালিসিস'
      }
    ];
    const aRes = await adminApi.updateCandidate(TEST_CANDIDATE_ID, { experiences: testExperiences });
    const uRes = await userApi.getProfile();
    const expCount = uRes.data.profile?.experiences?.length || 0;
    const desig = uRes.data.profile?.experiences?.[0]?.designation;
    const pass = aRes.status === 200 && expCount === 1 && desig === 'কম্পিউটার অপারেটর';
    record(5, 'Professional Work Experience Sync', 'Admin -> User', pass,
      `Admin PATCH: ${aRes.status} | User GET exp count: ${expCount}, Designation: "${desig}"`);
  } catch (err) {
    record(5, 'Professional Work Experience Sync', 'Admin -> User', false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 6: [User -> Admin] Technical Skills (দক্ষতা ও ভাষা)
  // --------------------------------------------------------------------------
  try {
    const testSkills = [
      { id: 'sk-1', name: 'কম্পিউটার টাইপিং (বাংলা ও ইংরেজি)', proficiency: 'EXPERT' },
      { id: 'sk-2', name: 'এমএস অফিস ও এক্সেল', proficiency: 'ADVANCED' }
    ];
    const uRes = await userApi.updateProfile({ skills: testSkills });
    const aRes = await adminApi.getCandidate(TEST_CANDIDATE_ID);
    const skillsCount = aRes.data.candidate?.skills?.length || 0;
    const pass = uRes.status === 200 && skillsCount === 2;
    record(6, 'Technical Skills Array Sync', 'User -> Admin', pass,
      `User PUT: ${uRes.status} | Admin GET skills count: ${skillsCount}`);
  } catch (err) {
    record(6, 'Technical Skills Array Sync', 'User -> Admin', false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 7: [User -> Admin] Structured Address & District
  // --------------------------------------------------------------------------
  try {
    const testDistrict = 'সিলেট';
    const testDivision = 'Sylhet';
    const testAddress = 'বাড়ি ১২, রোড ৩, আম্বরখানা, সিলেট সদর';
    const uRes = await userApi.updateProfile({ district: testDistrict, division: testDivision, address: testAddress });
    const aRes = await adminApi.getCandidate(TEST_CANDIDATE_ID);
    const pass = uRes.status === 200 && aRes.data.candidate?.district === testDistrict && aRes.data.candidate?.division === testDivision;
    record(7, 'Address & District Sync', 'User -> Admin', pass,
      `User PUT: ${uRes.status} | Admin GET district: "${aRes.data.candidate?.district}", division: "${aRes.data.candidate?.division}"`);
  } catch (err) {
    record(7, 'Address & District Sync', 'User -> Admin', false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 8: [User -> Admin] Quota Claim & Directory Filter
  // --------------------------------------------------------------------------
  try {
    const testQuota = 'freedom_fighter';
    const uRes = await userApi.updateProfile({ quota: testQuota });
    const aRes = await adminApi.getCandidate(TEST_CANDIDATE_ID);
    const pass = uRes.status === 200 && aRes.data.candidate?.quota === testQuota;
    record(8, 'Quota Claim & Admin Detection', 'User -> Admin', pass,
      `User PUT: ${uRes.status} | Admin GET quota: "${aRes.data.candidate?.quota}"`);
  } catch (err) {
    record(8, 'Quota Claim & Admin Detection', 'User -> Admin', false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 9: [Admin -> User] Account Verification & Admin Private Note
  // --------------------------------------------------------------------------
  try {
    const aRes = await adminApi.updateCandidate(TEST_CANDIDATE_ID, {
      isVerified: true,
      accountStatus: 'active',
      adminNote: 'জাতীয় পরিচয়পত্র ও শিক্ষাগত সনদ যাচাই সম্পন্ন হয়েছে।'
    });
    const uRes = await userApi.getProfile();
    const pass = aRes.status === 200 && uRes.data.profile?.isVerified === true && uRes.data.profile?.accountStatus === 'active';
    record(9, 'Verification Status & Admin Note', 'Admin -> User', pass,
      `Admin PATCH: ${aRes.status} | User GET isVerified: ${uRes.data.profile?.isVerified}, Status: "${uRes.data.profile?.accountStatus}"`);
  } catch (err) {
    record(9, 'Verification Status & Admin Note', 'Admin -> User', false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 10: [Admin -> User] Wallet Balance Adjustment
  // --------------------------------------------------------------------------
  try {
    const testBalance = 450;
    const aRes = await adminApi.updateCandidate(TEST_CANDIDATE_ID, {
      walletBalance: testBalance,
      reason: 'অ্যাডমিন ক্রেডিট সমন্বয়'
    });
    const uRes = await userApi.getProfile();
    const pass = aRes.status === 200 && uRes.data.profile?.walletBalance === testBalance;
    record(10, 'Wallet Balance Adjustment Sync', 'Admin -> User', pass,
      `Admin PATCH: ${aRes.status} | User GET walletBalance: ৳${uRes.data.profile?.walletBalance}`);
  } catch (err) {
    record(10, 'Wallet Balance Adjustment Sync', 'Admin -> User', false, err.message);
  }

  console.log('========================================================================');
  console.log('   AUDIT SUMMARY REPORT');
  console.log('========================================================================');
  const passCount = results.filter(r => r.pass).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passCount} | FAILED: ${results.length - passCount}`);
  console.log(`OVERALL HEALTH: ${passCount === 10 ? '100% PERFECT BI-DIRECTIONAL SYNC' : 'SYNC DEFECT DETECTED'}\n`);

  fs.writeFileSync('sync_audit_results.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    passCount,
    totalTests: results.length,
    results
  }, null, 2));
}

run10WayBidirectionalSyncAudit().catch(console.error);
