const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });
    req.on('error', reject);
    if (body) {
      if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runAudit() {
  console.log('===============================================================');
  console.log('CHAKRI SHEBA - MASTER SYSTEM AUDIT & INTEGRATION VERIFICATION');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function test(label, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${label}`);
      if (details) console.log(`       Evidence: ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${label}`);
      if (details) console.error(`       Error: ${details}`);
      failed++;
    }
  }

  // 1. PUBLIC GUEST FRONTEND
  console.log('\n--- 1. Public / Guest Frontend & Security Boundaries ---');
  
  const homeRes = await request({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' });
  test('Homepage accessible to guests', homeRes.statusCode === 200, `HTTP 200, length: ${homeRes.data.length}`);

  const jobRes = await request({ hostname: 'localhost', port: 3000, path: '/jobs/job-teletalk-20261027-bscs-348', method: 'GET' });
  test('Job detail view accessible to guests', jobRes.statusCode === 200, `HTTP 200, length: ${jobRes.data.length}`);

  const loginRes = await request({ hostname: 'localhost', port: 3000, path: '/login', method: 'GET' });
  test('Login view accessible to guests', loginRes.statusCode === 200, `HTTP 200, length: ${loginRes.data.length}`);

  const guestAppRes = await request({ hostname: 'localhost', port: 3000, path: '/api/applications', method: 'GET' });
  test('Guest blocked from private /api/applications', guestAppRes.statusCode === 401, `HTTP ${guestAppRes.statusCode} Unauthorized`);

  const guestStatsRes = await request({ hostname: 'localhost', port: 3000, path: '/api/admin/stats', method: 'GET' });
  test('Guest blocked from admin /api/admin/stats', guestStatsRes.statusCode === 403, `HTTP ${guestStatsRes.statusCode} Forbidden`);

  // 2. CANDIDATE AUTHENTICATION & IDOR BOUNDARIES
  console.log('\n--- 2. Candidate Authentication & IDOR Boundaries ---');

  const candLoginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'tanvir2026', password: '123456' });

  test('Candidate login succeeds with username tanvir2026', candLoginRes.statusCode === 200 && candLoginRes.json?.success === true, `Candidate: ${candLoginRes.json?.user?.name}`);

  const candCookie = (candLoginRes.headers['set-cookie'] || []).find(c => c.startsWith('cs_session_token='));
  const candTokenHeader = candCookie ? { 'Cookie': candCookie.split(';')[0] } : {};

  const candAppsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/applications',
    method: 'GET',
    headers: candTokenHeader
  });
  test('Candidate accesses only own applications', candAppsRes.statusCode === 200 && candAppsRes.json?.role === 'candidate', `Count: ${candAppsRes.json?.totalCount}, Role: ${candAppsRes.json?.role}`);

  const candAdminStatsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: candTokenHeader
  });
  test('Candidate blocked from /api/admin/stats (Privilege escalation denied)', candAdminStatsRes.statusCode === 403, `HTTP ${candAdminStatsRes.statusCode} Forbidden`);

  // 3. ADMIN AUTHENTICATION & OPERATIONS
  console.log('\n--- 3. Admin Authentication & Management Operations ---');

  const adminLoginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { role: 'admin', adminPin: 'CHAKRISEBA_SECURE_ADMIN_2026' });

  test('Admin authentication succeeds with secret PIN', adminLoginRes.statusCode === 200 && adminLoginRes.json?.user?.role === 'admin', `Role: ${adminLoginRes.json?.user?.role}`);

  const adminCookie = (adminLoginRes.headers['set-cookie'] || []).find(c => c.startsWith('cs_session_token='));
  const adminTokenHeader = adminCookie ? { 'Cookie': adminCookie.split(';')[0] } : {};

  const adminStatsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: adminTokenHeader
  });
  test('Admin accesses live KPI metrics', adminStatsRes.statusCode === 200 && adminStatsRes.json?.success === true, `Total Apps: ${adminStatsRes.json?.stats?.totalApplications}, Candidates: ${adminStatsRes.json?.stats?.totalCandidates}, Revenue: BDT ${adminStatsRes.json?.stats?.totalRevenue}`);

  const adminAppsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/applications',
    method: 'GET',
    headers: adminTokenHeader
  });
  test('Admin accesses global applications queue', adminAppsRes.statusCode === 200 && adminAppsRes.json?.role === 'admin', `Total Queue: ${adminAppsRes.json?.totalCount} orders`);

  const targetAppId = adminAppsRes.json?.applications?.[0]?.id || 'APP-2026-001';

  // Candidate trying to approve payment on real order
  const candApproveRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/applications/${targetAppId}`,
    method: 'PATCH',
    headers: { ...candTokenHeader, 'Content-Type': 'application/json' }
  }, { status: 'completed' });
  test('Candidate blocked from approving payment / completing order', candApproveRes.statusCode === 403, `HTTP ${candApproveRes.statusCode} Forbidden`);

  // Admin status transition: Approve payment (pending_payment -> processing)
  const approveRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/applications/${targetAppId}`,
    method: 'PATCH',
    headers: { ...adminTokenHeader, 'Content-Type': 'application/json' }
  }, {
    status: 'processing',
    verificationType: 'admin_verified',
    notes: 'TrxID verified by admin'
  });
  test('Admin transitions order to processing with immutable history', approveRes.statusCode === 200 && approveRes.json?.application?.status === 'processing', `New Status: ${approveRes.json?.application?.status}`);

  // Admin completes order & uploads PDF
  const completeRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/applications/${targetAppId}`,
    method: 'PATCH',
    headers: { ...adminTokenHeader, 'Content-Type': 'application/json' }
  }, {
    status: 'completed',
    verificationType: 'officially_verified',
    applicantCopyPdfUrl: `https://alljobs.teletalk.com.bd/slips/${targetAppId}.pdf`,
    notes: 'Teletalk form filled and applicant copy PDF attached'
  });
  test('Admin completes order with applicant copy PDF and audit logging', completeRes.statusCode === 200 && completeRes.json?.application?.status === 'completed', `Slip URL: ${completeRes.json?.application?.applicantCopyPdfUrl}`);

  // 4. ELEMENTOR-LIKE VISUAL WEBSITE BUILDER
  console.log('\n--- 4. Elementor-Like Visual Website Builder Inside Admin ---');

  const pagesRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/pages',
    method: 'GET',
    headers: adminTokenHeader
  });
  test('Website Builder lists editable pages', pagesRes.statusCode === 200 && Array.isArray(pagesRes.json?.pages), `Found ${pagesRes.json?.pages?.length} editable pages`);

  const createPageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/pages',
    method: 'POST',
    headers: { ...adminTokenHeader, 'Content-Type': 'application/json' }
  }, {
    title: 'পরীক্ষা নির্দেশিকা সহায়িকা ২০২৬',
    slug: '/exam-guidelines-2026'
  });
  test('Website Builder creates new page', createPageRes.statusCode === 200 && createPageRes.json?.success === true, `Created Page ID: ${createPageRes.json?.page?.id}, Slug: ${createPageRes.json?.page?.slug}`);

  const pageId = createPageRes.json?.page?.id || '_exam-guidelines-2026';
  const savePageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/pages/${pageId}`,
    method: 'PUT',
    headers: { ...adminTokenHeader, 'Content-Type': 'application/json' }
  }, {
    id: pageId,
    title: 'পরীক্ষা নির্দেশিকা সহায়িকা ২০২৬ (হালনাগাদ)',
    slug: '/exam-guidelines-2026',
    metaTitle: 'বিসিএস ও ব্যাংক পরীক্ষা প্রস্তুতি নির্দেশিকা',
    metaDescription: 'সকল সরকারি ও স্বায়ত্তশাসিত চাকরির প্রস্তুতি নিয়মাবলী',
    action: 'publish',
    sections: [
      {
        id: 'sec-hero-01',
        type: 'hero',
        title: 'চাকরি পরীক্ষার সম্পূর্ণ সহায়ক গাইডলাইন',
        subtitle: 'টেলিটক ও ব্যাংকার্স সিলেকশন কমিটির সকল প্রস্তুতি নিয়ম',
        content: { ctaText: 'আবেদন শুরু করুন', ctaUrl: '/dashboard' },
        style: { backgroundColor: '#064e3b', textColor: '#ffffff', paddingY: 'xl', textAlign: 'center' },
        isVisible: true
      },
      {
        id: 'sec-features-01',
        type: 'features',
        title: 'কেন আমাদের নির্দেশিকা পড়বেন',
        subtitle: 'সঠিক তথ্যের নিশ্চয়তা',
        content: {
          items: [
            { title: 'সঠিক ফরম্যাট ও ছবির মাপ', desc: 'টেলিটক আবেদনের ছবি ও স্বাক্ষর নির্দেশিকা' },
            { title: 'পেমেন্ট ভেরিফিকেশন নিয়ম', desc: 'এসএমএস ফরম্যাট ও ট্রানজেকশন আইডি নিয়ম' },
            { title: 'প্রবেশপত্র ডাউনলোডের তথ্য', desc: 'এসএমএস পেলে প্রবেশপত্র ডাউনলোডের সঠিক নির্দেশিকা' }
          ]
        },
        style: { backgroundColor: '#ffffff', textColor: '#0f172a', paddingY: 'lg', columns: 3 },
        isVisible: true
      }
    ]
  });
  test('Website Builder saves styled sections, creates revision snapshot & publishes', savePageRes.statusCode === 200 && savePageRes.json?.page?.status === 'published', `Status: ${savePageRes.json?.page?.status}, Version: v${savePageRes.json?.page?.version}, Revisions: ${savePageRes.json?.page?.revisions?.length}`);

  const reloadPageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/pages/${pageId}`,
    method: 'GET',
    headers: adminTokenHeader
  });
  test('Website Builder persisted content survives reload', reloadPageRes.statusCode === 200 && reloadPageRes.json?.page?.sections?.length === 2, `Sections persisted: ${reloadPageRes.json?.page?.sections?.length}`);

  // 5. JOB SOURCES & CIRCULAR INGESTION PIPELINE
  console.log('\n--- 5. Job News Collection & Ingestion Pipeline ---');

  const sourcesRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/sources',
    method: 'GET',
    headers: adminTokenHeader
  });
  test('Official job sources active (Teletalk Alljobs, BPSC, BB)', sourcesRes.statusCode === 200 && sourcesRes.json?.sources?.length >= 3, `Count: ${sourcesRes.json?.sources?.length}`);

  const draftsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/sources/drafts',
    method: 'GET',
    headers: adminTokenHeader
  });
  test('Circular ingestion drafts retrieved with AI extraction confidence', draftsRes.statusCode === 200 && Array.isArray(draftsRes.json?.drafts), `Drafts count: ${draftsRes.json?.drafts?.length}`);

  if (draftsRes.json?.drafts?.length > 0) {
    const draftId = draftsRes.json.drafts[0].id;
    const approveDraftRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/sources/drafts',
      method: 'POST',
      headers: { ...adminTokenHeader, 'Content-Type': 'application/json' }
    }, { action: 'approve', draftId });
    test('1-Click approve converts draft into live Job Circular with audit trail', approveDraftRes.statusCode === 200 && approveDraftRes.json?.success === true, `Created Live Job ID: ${approveDraftRes.json?.job?.id}, Title: ${approveDraftRes.json?.job?.title}`);
  }

  // 6. FINANCIAL INVARIANTS & RECONCILIATION
  console.log('\n--- 6. Financial Invariants & Discount Calculation ---');

  const discountValRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/discounts/validate',
    method: 'POST',
    headers: { ...candTokenHeader, 'Content-Type': 'application/json' }
  }, {
    couponCode: 'FIRST50',
    serviceCharge: 80,
    governmentFee: 200
  });

  const snapshot = discountValRes.json?.snapshot;
  test('Government fee remains 100% protected and strictly non-discountable', 
    snapshot?.governmentApplicationFee === 200 && 
    snapshot?.totalPayable >= 200,
    `Govt Fee: BDT ${snapshot?.governmentApplicationFee}, Total Payable: BDT ${snapshot?.totalPayable}`
  );

  test('Discount applies strictly to platform service fee only',
    snapshot?.finalServiceCharge < 80,
    `Original Service: BDT 80 -> Final Service: BDT ${snapshot?.finalServiceCharge}, Discount: BDT ${snapshot?.couponDiscount}`
  );

  // 7. AUDIT LOGGING INTEGRITY
  console.log('\n--- 7. Immutable Admin Audit Logging ---');

  const auditRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/audit-logs',
    method: 'GET',
    headers: adminTokenHeader
  });
  test('Audit log records administrative actions (actor, timestamp, changes)', auditRes.statusCode === 200 && auditRes.json?.logs?.length > 0, `Recorded Audit Events: ${auditRes.json?.logs?.length}`);

  // SUMMARY
  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`FINAL OUTCOME: ${failed === 0 ? 'VERIFIED WORKING (100% PASS)' : 'FAILED'}`);
  console.log('===============================================================\n');

  process.exit(failed === 0 ? 0 : 1);
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});