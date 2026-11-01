const http = require('http');
const fs = require('fs');
const path = require('path');

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

function extractCookie(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return '';
  const cookieList = Array.isArray(setCookie) ? setCookie : [setCookie];
  const tokenCookie = cookieList.find(c => c.startsWith('cs_session_token='));
  return tokenCookie ? tokenCookie.split(';')[0] : '';
}

async function runTestSuite() {
  console.log('=================================================================');
  console.log(' CHAKRI SHEBA — JOB SOURCE REGISTRY & INGESTION API AUDIT');
  console.log(' Target Server: http://localhost:3000');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(label, condition, details = '') {
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

  // --- 1. UNAUTHORIZED GUEST ACCESS GUARDS ---
  console.log('--- 1. Unauthorized Access Guards (Guest / No Session) ---');
  
  const guestGet = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'GET'
  });
  assert('Guest GET /api/admin/sources blocked with HTTP 401', guestGet.statusCode === 401, `Status: ${guestGet.statusCode}`);

  const guestPost = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'Hack Source', sourceUrl: 'https://hacker.com' });
  assert('Guest POST /api/admin/sources blocked with HTTP 401', guestPost.statusCode === 401, `Status: ${guestPost.statusCode}`);

  const guestPut = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, { id: 'teletalk-alljobs', enabled: false });
  assert('Guest PUT /api/admin/sources blocked with HTTP 401', guestPut.statusCode === 401, `Status: ${guestPut.statusCode}`);

  const guestToggle = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/teletalk-alljobs/toggle', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { enabled: false });
  assert('Guest POST /api/admin/sources/:id/toggle blocked with HTTP 401', guestToggle.statusCode === 401, `Status: ${guestToggle.statusCode}`);

  const guestIngest = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/teletalk-alljobs/ingest', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { candidates: [{ title: 'Unauthorized', organization: 'Org', sourceUrl: 'https://example.com' }] });
  assert('Guest POST /api/admin/sources/:id/ingest blocked with HTTP 401', guestIngest.statusCode === 401, `Status: ${guestIngest.statusCode}`);

  const guestDelete = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/teletalk-alljobs', method: 'DELETE'
  });
  assert('Guest DELETE /api/admin/sources/:id blocked with HTTP 401', guestDelete.statusCode === 401, `Status: ${guestDelete.statusCode}`);

  // --- 2. CANDIDATE PRIVILEGE ESCALATION GUARDS ---
  console.log('\n--- 2. Privilege Escalation Guards (Candidate Session) ---');
  
  const candLogin = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'tanvir2026', password: '123456' });
  
  const candCookie = extractCookie(candLogin.headers);
  assert('Candidate login succeeds', candLogin.statusCode === 200 && candCookie.length > 0, `Candidate: ${candLogin.json?.user?.name}`);

  const candHeaders = { 'Cookie': candCookie };

  const candGet = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'GET',
    headers: candHeaders
  });
  assert('Candidate GET /api/admin/sources blocked with HTTP 403', candGet.statusCode === 403, `Status: ${candGet.statusCode}`);

  const candPost = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...candHeaders }
  }, { name: 'Escalation Source', sourceUrl: 'https://bad.com' });
  assert('Candidate POST /api/admin/sources blocked with HTTP 403', candPost.statusCode === 403, `Status: ${candPost.statusCode}`);

  const candPut = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...candHeaders }
  }, { id: 'teletalk-alljobs', enabled: false });
  assert('Candidate PUT /api/admin/sources blocked with HTTP 403', candPut.statusCode === 403, `Status: ${candPut.statusCode}`);

  const candToggle = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/teletalk-alljobs/toggle', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...candHeaders }
  }, { enabled: false });
  assert('Candidate POST /api/admin/sources/:id/toggle blocked with HTTP 403', candToggle.statusCode === 403, `Status: ${candToggle.statusCode}`);

  const candIngest = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/teletalk-alljobs/ingest', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...candHeaders }
  }, { candidates: [{ title: 'Escalate Ingest', organization: 'Org', sourceUrl: 'https://example.com' }] });
  assert('Candidate POST /api/admin/sources/:id/ingest blocked with HTTP 403', candIngest.statusCode === 403, `Status: ${candIngest.statusCode}`);

  // --- 3. AUTHORIZED ADMIN AUTHENTICATION ---
  console.log('\n--- 3. Authorized Admin Authentication & Source Listing ---');
  
  const adminLogin = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { role: 'admin', adminPin: 'CHAKRISEBA_SECURE_ADMIN_2026' });

  const adminCookie = extractCookie(adminLogin.headers);
  assert('Admin authentication succeeds with secret PIN', adminLogin.statusCode === 200 && adminCookie.length > 0, `Admin session active`);

  const adminHeaders = { 'Cookie': adminCookie };

  const adminGet = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'GET',
    headers: adminHeaders
  });
  assert('Admin GET /api/admin/sources returns 200 OK', adminGet.statusCode === 200, `Status: ${adminGet.statusCode}`);
  assert('Admin receives normalized source records', adminGet.json?.success === true && Array.isArray(adminGet.json?.sources) && adminGet.json.sources.length >= 3, `Count: ${adminGet.json?.sources?.length}`);
  
  const teletalkSrc = adminGet.json?.sources?.find(s => s.id === 'teletalk-alljobs');
  assert('Legacy source has backward-compatible fields', 
    teletalkSrc && teletalkSrc.classification === 'official' && teletalkSrc.healthStatus === 'healthy' && teletalkSrc.enabled === true,
    `ID: ${teletalkSrc?.id}, Health: ${teletalkSrc?.healthStatus}`
  );

  // --- 4. VALIDATION GUARDS & CONFLICT HANDLING ---
  console.log('\n--- 4. Validation Guards & Error Handling ---');

  const invalidUrlRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, { name: 'Invalid URL Source', sourceUrl: 'not-a-valid-http-url' });
  assert('Invalid URL rejected with HTTP 400', invalidUrlRes.statusCode === 400, `Error: ${invalidUrlRes.json?.error}`);

  const invalidIntervalRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, { name: 'Invalid Interval Source', sourceUrl: 'https://example.com/jobs', scanIntervalMinutes: 5 });
  assert('Bounded scan interval (<15 min) rejected with HTTP 400', invalidIntervalRes.statusCode === 400, `Error: ${invalidIntervalRes.json?.error}`);

  const invalidClassificationRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, { name: 'Invalid Class Source', sourceUrl: 'https://example.com/jobs', classification: 'unsupported_class' });
  assert('Unsupported classification rejected with HTTP 400', invalidClassificationRes.statusCode === 400, `Error: ${invalidClassificationRes.json?.error}`);

  const duplicateUrlRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, { name: 'Duplicate Teletalk', sourceUrl: 'https://alljobs.teletalk.com.bd' });
  assert('Duplicate URL rejected with HTTP 409 Conflict', duplicateUrlRes.statusCode === 409, `Error: ${duplicateUrlRes.json?.error}`);

  // --- 5. VALID SOURCE CREATION ---
  console.log('\n--- 5. Source Creation & Settings Management ---');

  const createRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, {
    name: 'Prothom Alo Chakri',
    sourceUrl: 'https://www.prothomalo.com/chakri',
    classification: 'news',
    collectionMethod: 'html_scrape',
    scanIntervalMinutes: 180,
    enabled: true,
    adminNotes: 'National newspaper job section'
  });
  assert('New source creation returns HTTP 201 Created', createRes.statusCode === 201 && createRes.json?.success === true, `Created Source: ${createRes.json?.source?.id}`);
  const createdSourceId = createRes.json?.source?.id;

  // Retrieve single source
  const getSingleRes = await request({
    hostname: 'localhost', port: 3000,
    path: `/api/admin/sources/${createdSourceId}`, method: 'GET',
    headers: adminHeaders
  });
  assert('GET /api/admin/sources/:id returns newly created source', getSingleRes.statusCode === 200 && getSingleRes.json?.source?.name === 'Prothom Alo Chakri', `Found: ${getSingleRes.json?.source?.name}`);

  // Update source settings
  const updateRes = await request({
    hostname: 'localhost', port: 3000,
    path: `/api/admin/sources/${createdSourceId}`, method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, {
    scanIntervalMinutes: 120,
    adminNotes: 'Updated scan frequency to 2 hours'
  });
  assert('PUT /api/admin/sources/:id updates settings successfully', updateRes.statusCode === 200 && updateRes.json?.source?.scanIntervalMinutes === 120, `Interval: ${updateRes.json?.source?.scanIntervalMinutes}m`);

  // --- 6. ENABLE / PAUSE TOGGLE ---
  console.log('\n--- 6. Source Pause & Re-enable Toggle ---');

  const pauseRes = await request({
    hostname: 'localhost', port: 3000,
    path: `/api/admin/sources/${createdSourceId}/toggle`, method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, { enabled: false });
  assert('POST /api/admin/sources/:id/toggle pauses source', pauseRes.statusCode === 200 && pauseRes.json?.source?.enabled === false && pauseRes.json?.source?.healthStatus === 'paused', `Enabled: ${pauseRes.json?.source?.enabled}, Health: ${pauseRes.json?.source?.healthStatus}`);

  const resumeRes = await request({
    hostname: 'localhost', port: 3000,
    path: `/api/admin/sources/${createdSourceId}/toggle`, method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, { enabled: true });
  assert('POST /api/admin/sources/:id/toggle re-enables source', resumeRes.statusCode === 200 && resumeRes.json?.source?.enabled === true && resumeRes.json?.source?.healthStatus === 'healthy', `Enabled: ${resumeRes.json?.source?.enabled}, Health: ${resumeRes.json?.source?.healthStatus}`);

  // --- 7. EXPLICIT DRAFT INGESTION ACTION & IDEMPOTENCY ---
  console.log('\n--- 7. Explicit Admin Draft Ingestion ---');

  const emptyIngestRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/teletalk-alljobs/ingest', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, { candidates: [] });
  assert('Empty candidates rejected with HTTP 400', emptyIngestRes.statusCode === 400, `Status: ${emptyIngestRes.statusCode}`);

  const sampleCandidate = {
    refNo: 'BPSC-API-TEST-2026',
    title: 'প্রশাসনিক কর্মকর্তা (আইন)',
    organization: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)',
    sourceUrl: 'https://bpsc.teletalk.com.bd/circular/law-officer',
    vacancies: 10,
    deadline: '২৫ ডিসেম্বর ২০২৬',
    govtFee: 200
  };

  const validIngestRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/teletalk-alljobs/ingest', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, { candidates: [sampleCandidate] });

  assert('Authorized admin ingestion succeeds with HTTP 200', validIngestRes.statusCode === 200 && validIngestRes.json?.success === true, `New Drafts: ${validIngestRes.json?.report?.newDraftsCreated}`);
  assert('New draft created with status pending_review', validIngestRes.json?.report?.newDraftsCreated === 1, `Created: 1`);

  // Retrying the exact same ingestion must be idempotent
  const retryIngestRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/teletalk-alljobs/ingest', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, { candidates: [sampleCandidate] });

  assert('Retried ingestion creates ZERO duplicate drafts (idempotency)', 
    retryIngestRes.statusCode === 200 && retryIngestRes.json?.report?.newDraftsCreated === 0 && retryIngestRes.json?.report?.duplicatesIgnored === 1,
    `New: ${retryIngestRes.json?.report?.newDraftsCreated}, Ignored: ${retryIngestRes.json?.report?.duplicatesIgnored}`
  );

  // Clean up created test draft to ensure production DB remains strictly at 1 draft
  const createdDraftId = validIngestRes.json?.report?.drafts?.[0]?.id;
  if (createdDraftId) {
    const raw = fs.readFileSync(path.resolve('src/db/local_store.json'), 'utf8');
    const store = JSON.parse(raw);
    if (store.circularDrafts && store.circularDrafts[createdDraftId]) {
      delete store.circularDrafts[createdDraftId];
      fs.writeFileSync(path.resolve('src/db/local_store.json'), JSON.stringify(store, null, 2), 'utf8');
    }
  }

  // --- 8. DELETION PROTECTION VS CUSTOM DELETION ---
  console.log('\n--- 8. Reference Integrity & Deletion Protection ---');

  const protectRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/teletalk-alljobs', method: 'DELETE',
    headers: adminHeaders
  });
  assert('Core referenced source is protected from deletion (archived instead)', protectRes.statusCode === 200 && protectRes.json?.action === 'archived', `Action: ${protectRes.json?.action}, Message: ${protectRes.json?.message}`);

  // Re-enable teletalk source so test leaves system in pristine state
  await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/teletalk-alljobs/toggle', method: 'POST',
    headers: { 'Content-Type': 'application/json', ...adminHeaders }
  }, { enabled: true });

  // Delete test custom source
  const deleteTestRes = await request({
    hostname: 'localhost', port: 3000,
    path: `/api/admin/sources/${createdSourceId}`, method: 'DELETE',
    headers: adminHeaders
  });
  assert('Unreferenced test source cleanly deleted', deleteTestRes.statusCode === 200 && deleteTestRes.json?.action === 'deleted', `Action: ${deleteTestRes.json?.action}`);

  // --- 9. AUDIT LOGGING VERIFICATION ---
  console.log('\n--- 9. Admin Audit Logging ---');

  const auditRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/audit-logs', method: 'GET',
    headers: adminHeaders
  });
  const logs = auditRes.json?.logs || [];
  const sourceLogs = logs.filter(l => l.targetType === 'source');
  assert('Audit logs record source management actions', auditRes.statusCode === 200 && sourceLogs.length >= 3, `Recorded source audit entries: ${sourceLogs.length}`);

  // --- 10. PRODUCTION CANONICAL DATA INVARIANCE ---
  console.log('\n--- 10. Production Data Invariance ---');

  const jobsRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/jobs', method: 'GET'
  });
  assert('Canonical published jobs count remains strictly 9', jobsRes.statusCode === 200 && jobsRes.json?.jobs?.length === 9, `Jobs: ${jobsRes.json?.jobs?.length}`);

  const draftsRes = await request({
    hostname: 'localhost', port: 3000,
    path: '/api/admin/sources/drafts', method: 'GET',
    headers: adminHeaders
  });
  assert('Circular drafts count in database remains strictly 1', draftsRes.statusCode === 200 && draftsRes.json?.drafts?.length === 1, `Drafts count: ${draftsRes.json?.drafts?.length}`);

  console.log('\n=================================================================');
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`STATUS: ${failed === 0 ? 'ALL API & INGESTION AUDIT CHECKS PASSED (100%)' : 'AUDIT FAILURES DETECTED'}`);
  console.log('=================================================================');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
