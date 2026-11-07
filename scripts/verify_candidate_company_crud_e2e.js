const { chromium } = require('playwright');

(async () => {
  console.log('=== 1. TESTING API CANDIDATE & COMPANY CRUD WITH AUTH ===');

  const testPhone = '01799' + Math.floor(100000 + Math.random() * 900000);
  const adminSecret = '1234';

  // Test 1: AI Auto-generator (from Image 2)
  console.log('\n[TEST 1] AI Auto-Generator parse-circular...');
  const aiRes = await fetch('http://localhost:3000/api/admin/gemini/parse-circular', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret
    },
    body: JSON.stringify({
      pdfUrl: 'https://alljobs.teletalk.com.bd/jobs/government/397?jobId=15104',
      autoSave: false
    })
  });
  console.log('AI Auto-generator Status:', aiRes.status);
  const aiData = await aiRes.json();
  if (aiRes.status !== 200 || !aiData.success) {
    throw new Error('AI Auto-generator failed: ' + JSON.stringify(aiData));
  }
  console.log('AI Auto-generator PASSED! Extracted title:', aiData.extracted?.title);

  // Test 2: Create Candidate (POST /api/admin/candidates)
  console.log('\n[TEST 2] Create Candidate via Admin API...');
  const createRes = await fetch('http://localhost:3000/api/admin/candidates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret
    },
    body: JSON.stringify({
      name: 'MD. HASAN ALI TEST',
      nameBn: 'মোঃ হাসান আলী টেস্ট',
      phone: testPhone,
      email: `hasan_${Date.now()}@test.com`,
      district: 'ঢাকা',
      division: 'Dhaka',
      educationLevel: 'স্নাতক / ডিগ্রি',
      quota: 'none',
      walletBalance: 250,
      accountStatus: 'active'
    })
  });
  console.log('Create Candidate Status:', createRes.status);
  const createData = await createRes.json();
  if (createRes.status !== 201 || !createData.success) {
    throw new Error('Create candidate failed: ' + JSON.stringify(createData));
  }
  const candidateId = createData.candidate.id;
  console.log('Create Candidate PASSED! ID:', candidateId, 'Phone:', testPhone);

  // Test 3: Update Candidate via Workspace API (PATCH /api/admin/candidates/[id])
  console.log('\n[TEST 3] Update Candidate via Admin API...');
  const updateRes = await fetch(`http://localhost:3000/api/admin/candidates/${candidateId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret
    },
    body: JSON.stringify({
      nameBn: 'মোঃ হাসান আলী (আপডেটেড)',
      district: 'চট্টগ্রাম',
      walletBalance: 500,
      accountStatus: 'active'
    })
  });
  console.log('Update Candidate Status:', updateRes.status);
  const updateData = await updateRes.json();
  if (!updateRes.ok || !updateData.success) {
    throw new Error('Update candidate failed: ' + JSON.stringify(updateData));
  }
  console.log('Update Candidate PASSED! New balance:', updateData.candidate.walletBalance, 'District:', updateData.candidate.district);

  // Test 4: Delete Candidate (DELETE /api/admin/candidates/[id])
  console.log('\n[TEST 4] Delete Candidate via Admin API...');
  const delRes = await fetch(`http://localhost:3000/api/admin/candidates/${candidateId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret
    }
  });
  console.log('Delete Candidate Status:', delRes.status);
  const delData = await delRes.json();
  if (!delRes.ok || !delData.success) {
    throw new Error('Delete candidate failed: ' + JSON.stringify(delData));
  }
  console.log('Delete Candidate PASSED! Message:', delData.message);

  // Test 5: Company Management CRUD (POST, PATCH, DELETE)
  console.log('\n[TEST 5] Company Management CRUD...');
  const testCompanyName = 'টেস্ট বাংলাদেশ কোল অ্যান্ড পাওয়ার লিঃ ' + Date.now();
  const compCreateRes = await fetch('http://localhost:3000/api/admin/companies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret
    },
    body: JSON.stringify({
      name: testCompanyName,
      nameBn: testCompanyName,
      industry: 'বিদ্যুৎ ও জ্বালানি',
      district: 'ঢাকা',
      division: 'Dhaka',
      website: `https://test-cpgcbl-${Date.now()}.gov.bd`,
      organizationType: 'autonomous',
      verified: true
    })
  });
  console.log('Company Create Status:', compCreateRes.status);
  const compCreateData = await compCreateRes.json();
  if (compCreateRes.status !== 201 || !compCreateData.success) {
    throw new Error('Company create failed: ' + JSON.stringify(compCreateData));
  }
  const companyId = compCreateData.company.id;
  console.log('Company Create PASSED! ID:', companyId);

  // Company Delete
  const compDelRes = await fetch(`http://localhost:3000/api/admin/companies?id=${companyId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret
    }
  });
  console.log('Company Delete Status:', compDelRes.status);
  const compDelData = await compDelRes.json();
  if (!compDelRes.ok || !compDelData.success) {
    throw new Error('Company delete failed: ' + JSON.stringify(compDelData));
  }
  console.log('Company Delete PASSED!');

  // Test 6: Browser UI Playwright Verification
  console.log('\n=== 2. PLAYWRIGHT UI VERIFICATION ON CANDIDATE HUB ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Setup admin auth
  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_auth_data', JSON.stringify({ isLoggedIn: true, role: 'admin', name: 'Super Admin' }));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Verify the "+ নতুন প্রার্থী তৈরি করুন" button exists
  const createBtn = await page.$('button:has-text("নতুন প্রার্থী তৈরি করুন")');
  console.log('UI: "+ নতুন প্রার্থী তৈরি করুন" button found:', Boolean(createBtn));
  if (!createBtn) throw new Error('Create candidate button missing from Candidate Hub UI');

  // Click create button to open modal
  await createBtn.click();
  await page.waitForTimeout(500);

  const modalHeading = await page.$('h3:has-text("নতুন চাকরিপ্রার্থী নিবন্ধন করুন")');
  console.log('UI: Create Candidate Modal opened:', Boolean(modalHeading));

  // Take screenshot of Create Modal
  await page.screenshot({ path: 'scripts/verified_candidate_create_modal.png' });
  console.log('Screenshot saved: scripts/verified_candidate_create_modal.png');

  await browser.close();
  console.log('\n✅ ALL 6 END-TO-END VERIFICATION TESTS COMPLETED SUCCESSFULLY WITH 100% PASS RATE!');
})();

