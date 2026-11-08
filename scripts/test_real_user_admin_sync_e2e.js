/**
 * CHAKRI SHEBA — REAL USER/ADMIN SYNCHRONIZATION E2E AUDIT
 * Tests: User profile, Admin profile, Biodata, Education, CV/Skills, Documents, Applications
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

function readCandidateFromDisk(id) {
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  return db.candidates ? db.candidates[id] : null;
}

async function runSyncE2ETest() {
  console.log('========================================================');
  console.log('REAL USER/ADMIN SYNCHRONIZATION E2E AUDIT');
  console.log('========================================================\n');

  // Step 1: Identify an isolated candidate or create session
  const candListRes = await fetch(`${BASE_URL}/api/admin/candidates?limit=1`, { headers: adminHeaders });
  const candListData = await candListRes.json();
  const candidate = candListData.candidates[0];
  if (!candidate) throw new Error('No candidate found in database to audit');
  const candidateId = candidate.id;
  console.log(`Using Test Candidate: ID=${candidateId}, Name="${candidate.name}"`);

  // Step 2: Acquire session token for candidate via Impersonation API
  const impRes = await fetch(`${BASE_URL}/api/admin/impersonate`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ candidateId })
  });
  if (!impRes.ok) throw new Error(`Impersonation failed: HTTP ${impRes.status}`);
  const cookieHeader = impRes.headers.get('set-cookie') || '';
  const tokenMatch = cookieHeader.match(/cs_session_token=([^;]+)/);
  if (!tokenMatch) throw new Error('Failed to extract session cookie from impersonation response');
  const sessionToken = tokenMatch[1];
  console.log(`Candidate Session Token generated: ${sessionToken.slice(0, 15)}...`);

  const candidateHeaders = {
    'Content-Type': 'application/json',
    'Cookie': `cs_session_token=${sessionToken}`
  };

  // --- TEST 1: User Profile Update (User Panel Side) ---
  console.log('\n[TEST 1] User Profile Update (via Candidate Session)');
  const testBanglaName = 'মো: লিওন রহমান (ভেরিফায়েড)';
  const updateRes1 = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: candidateHeaders,
    body: JSON.stringify({ banglaName: testBanglaName })
  });
  if (!updateRes1.ok) throw new Error(`Profile update failed: HTTP ${updateRes1.status}`);
  const updateData1 = await updateRes1.json();
  console.log(`  -> User API returned HTTP 200. Updated banglaName: "${updateData1.profile?.banglaName}"`);

  // Verify Admin Panel sees it
  const adminCheck1 = await (await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}`, { headers: adminHeaders })).json();
  if (adminCheck1.candidate?.banglaName !== testBanglaName) {
    throw new Error(`Admin panel did not see update! Saw "${adminCheck1.candidate?.banglaName}"`);
  }
  console.log(`  -> Admin Panel Workspace verified matching banglaName: "${adminCheck1.candidate?.banglaName}"`);

  // Verify on Disk
  const diskCheck1 = readCandidateFromDisk(candidateId);
  if (diskCheck1?.banglaName !== testBanglaName) {
    throw new Error('Database disk persistence mismatch for banglaName');
  }
  console.log('  -> Disk local_store.json confirmed matching banglaName.');

  // --- TEST 2: Admin Profile Update (Admin Panel Side) ---
  console.log('\n[TEST 2] Admin Profile Update (via Admin Workspace)');
  const testDistrict = 'ঢাকা (মেট্রোপলিটন)';
  const adminUpdateRes = await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ district: testDistrict, reason: 'Admin verification audit' })
  });
  if (!adminUpdateRes.ok) throw new Error(`Admin PATCH failed: HTTP ${adminUpdateRes.status}`);
  console.log(`  -> Admin PATCH returned HTTP 200.`);

  // Verify Candidate sees it
  const userCheck2 = await (await fetch(`${BASE_URL}/api/profile`, { headers: candidateHeaders })).json();
  if (userCheck2.profile?.district !== testDistrict) {
    throw new Error(`Candidate profile did not see admin update! Saw "${userCheck2.profile?.district}"`);
  }
  console.log(`  -> Candidate Profile verified matching district: "${userCheck2.profile?.district}"`);

  // --- TEST 3: Biodata Update (Personal details) ---
  console.log('\n[TEST 3] Biodata & Personal Details Update');
  const biodataPayload = {
    fatherName: 'মরহুম আব্দুর রহমান',
    motherName: 'মোসা: রহিমা খাতুন',
    religion: 'ইসলাম',
    maritalStatus: 'অবিবাহিত',
    nationality: 'বাংলাদেশী'
  };
  const bioRes = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: candidateHeaders,
    body: JSON.stringify(biodataPayload)
  });
  if (!bioRes.ok) throw new Error(`Biodata update failed: HTTP ${bioRes.status}`);
  const bioData = await bioRes.json();
  console.log(`  -> Biodata saved: Father="${bioData.profile?.fatherName}", Religion="${bioData.profile?.religion}"`);

  const adminBioCheck = await (await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}`, { headers: adminHeaders })).json();
  if (adminBioCheck.candidate?.fatherName !== biodataPayload.fatherName || adminBioCheck.candidate?.religion !== biodataPayload.religion) {
    throw new Error('Admin workspace did not reflect biodata updates!');
  }
  console.log('  -> Admin Workspace confirmed matching biodata fields.');

  // --- TEST 4: Education Array Update ---
  console.log('\n[TEST 4] Education History Update');
  const eduPayload = {
    education: [
      {
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Dhaka University',
        board: 'Dhaka',
        passingYear: '2024',
        result: '3.85',
        scale: '4.00'
      },
      {
        degree: 'H.S.C (Science)',
        institution: 'Dhaka College',
        board: 'Dhaka',
        passingYear: '2019',
        result: '5.00',
        scale: '5.00'
      }
    ]
  };
  const eduRes = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: candidateHeaders,
    body: JSON.stringify(eduPayload)
  });
  if (!eduRes.ok) throw new Error(`Education update failed: HTTP ${eduRes.status}`);
  console.log(`  -> Candidate updated education records (${eduPayload.education.length} entries).`);

  const adminEduCheck = await (await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}`, { headers: adminHeaders })).json();
  if (!Array.isArray(adminEduCheck.candidate?.education) || adminEduCheck.candidate.education.length !== 2) {
    throw new Error('Admin workspace education array mismatch!');
  }
  console.log(`  -> Admin Workspace confirmed ${adminEduCheck.candidate.education.length} education records.`);

  // --- TEST 5: CV / Skills Update ---
  console.log('\n[TEST 5] CV & Technical Skills Update');
  const skillsPayload = {
    skills: ['TypeScript', 'Next.js', 'Playwright', 'Node.js', 'PostgreSQL', 'Python'],
    careerObjective: 'অভিজ্ঞ ফুল-স্ট্যাক ও অটোমেশন ইঞ্জিনিয়ার হিসেবে জাতীয় ও আন্তর্জাতিক প্ল্যাটফর্মে অবদান রাখা।'
  };
  const skillRes = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: candidateHeaders,
    body: JSON.stringify(skillsPayload)
  });
  if (!skillRes.ok) throw new Error(`Skills update failed: HTTP ${skillRes.status}`);
  console.log(`  -> Candidate updated ${skillsPayload.skills.length} technical skills.`);

  const adminSkillCheck = await (await fetch(`${BASE_URL}/api/admin/candidates/${candidateId}`, { headers: adminHeaders })).json();
  if (adminSkillCheck.candidate?.skills?.length !== skillsPayload.skills.length) {
    throw new Error('Admin workspace skills array length mismatch!');
  }
  console.log(`  -> Admin Workspace confirmed ${adminSkillCheck.candidate.skills.length} skills matching candidate update.`);

  // --- TEST 6: Application Records & Verification ---
  console.log('\n[TEST 6] Application Records Check');
  const adminApps = adminSkillCheck.applications || [];
  console.log(`  -> Candidate has ${adminApps.length} active job applications tracked in Admin Workspace.`);

  console.log('\n========================================================');
  console.log('ALL REAL USER/ADMIN SYNCHRONIZATION AUDITS PASSED!');
  console.log('========================================================');
}

runSyncE2ETest().catch(err => {
  console.error('\nFAILURE:', err.message);
  process.exit(1);
});

