const fs = require('fs');
const path = require('path');

// Ensure isolated temporary database fixture for test execution
const TEMP_DB_PATH = path.resolve('src/db/local_store.test_collector_tmp.json');
const PROD_DB_PATH = path.resolve('src/db/local_store.json');

// Copy production DB to isolated test fixture
fs.copyFileSync(PROD_DB_PATH, TEMP_DB_PATH);
process.env.CHAKRI_DB_FILE = TEMP_DB_PATH;

const { serverDB } = require(path.resolve('src/lib/db.ts'));
const { 
  MockJobCollector, 
  TeletalkCollectorAdapter, 
  validateSafeUrl, 
  normalizeCircularNotice, 
  calculateDuplicateMatch, 
  ingestDiscoveredCandidates 
} = require(path.resolve('src/lib/collector/index.ts'));

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

async function runTestSuite() {
  console.log('=================================================================');
  console.log(' CHAKRI SHEBA — MODULAR JOB COLLECTOR FOUNDATION QA');
  console.log(` Environment: Isolated Database Fixture (${TEMP_DB_PATH})`);
  console.log('=================================================================\n');

  try {
    const mockSource = {
      id: 'src-mock-test',
      name: 'Mock Test Portal',
      sourceUrl: 'https://mockjobs.portal.gov.bd/circulars',
      type: 'official_portal',
      fetchStatus: 'active',
      lastFetchedAt: new Date().toISOString(),
      autoSync: true,
      classification: 'official',
      enabled: true,
      collectionMethod: 'html_scrape',
      scanIntervalMinutes: 180,
      healthStatus: 'healthy',
      metrics: { discovered: 0, collected: 0, failed: 0, deduplicated: 0 }
    };

    // --- TEST 1: Successful Mock Collection ---
    console.log('--- 1. Successful Mock Collection ---');
    const sampleFixtures = [
      {
        refNo: 'MOCK-2026-001',
        title: 'সহকারী প্রোগ্রামার নিয়োগ বিজ্ঞপ্তি ২০২৬',
        organization: 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
        sourceUrl: 'https://mockjobs.portal.gov.bd/circulars/001',
        evidenceUrl: 'https://mockjobs.portal.gov.bd/circulars/001.pdf',
        vacancies: 15,
        deadline: '১৫ ডিসেম্বর ২০২৬',
        govtFee: 200,
        salary: '২২,০০০ - ৫৩,০৬০ টাকা'
      },
      {
        refNo: 'MOCK-2026-002',
        title: 'উপ-সহকারী প্রকৌশলী (সিভিল)',
        organization: 'সড়ক ও জনপথ অধিদপ্তর',
        sourceUrl: 'https://mockjobs.portal.gov.bd/circulars/002',
        vacancies: 30,
        deadline: '২০ ডিসেম্বর ২০২৬',
        govtFee: 100,
        salary: '১৬,০০০ - ৩৮,৬৪০ টাকা'
      }
    ];

    const collector = new MockJobCollector(sampleFixtures);
    const result1 = await collector.collect(mockSource);
    assert('Collector executes successfully', result1.success === true, `Success: ${result1.success}`);
    assert('Collector discovers and normalizes all valid items', result1.candidates.length === 2, `Candidates count: ${result1.candidates.length}`);
    assert('Normalized candidate contains deterministic contentHash', 
      typeof result1.candidates[0].contentHash === 'string' && result1.candidates[0].contentHash.length > 10,
      `Hash: ${result1.candidates[0].contentHash}`
    );

    // --- TEST 2: Empty Successful Collection ---
    console.log('\n--- 2. Empty Successful Collection ---');
    const emptyCollector = new MockJobCollector([]);
    const emptyResult = await emptyCollector.collect(mockSource);
    assert('Empty collection succeeds cleanly', emptyResult.success === true, `Success: ${emptyResult.success}`);
    assert('Empty collection returns zero candidates without error', emptyResult.candidates.length === 0 && !emptyResult.error, `Count: ${emptyResult.candidates.length}`);

    // --- TEST 3: Collector Failure Handling ---
    console.log('\n--- 3. Collector Failure Handling ---');
    const failingCollector = new MockJobCollector();
    failingCollector.simulateFailure({
      code: 'NETWORK_ERROR',
      message: 'Connection timed out while reaching host.',
      httpStatus: 504,
      timestamp: new Date().toISOString(),
      retryable: true
    });
    const failResult = await failingCollector.collect(mockSource);
    assert('Failing collector reports success: false', failResult.success === false, `Success: ${failResult.success}`);
    assert('Structured error details provided', 
      failResult.error && failResult.error.code === 'NETWORK_ERROR' && failResult.error.retryable === true,
      `Code: ${failResult.error?.code}, Message: ${failResult.error?.message}`
    );

    // --- TEST 4: SSRF & URL Validation Guards ---
    console.log('\n--- 4. SSRF & URL Security Boundaries ---');
    const ssrfLocalhost = validateSafeUrl('http://localhost:3000/api/admin');
    assert('Localhost blocked for SSRF prevention', ssrfLocalhost.safe === false, `Reason: ${ssrfLocalhost.reason}`);

    const ssrfLoopback = validateSafeUrl('http://127.0.0.1:8080/secret');
    assert('127.0.0.1 loopback blocked', ssrfLoopback.safe === false, `Reason: ${ssrfLoopback.reason}`);

    const ssrfCloudMeta = validateSafeUrl('http://169.254.169.254/latest/meta-data');
    assert('169.254.169.254 cloud metadata blocked', ssrfCloudMeta.safe === false, `Reason: ${ssrfCloudMeta.reason}`);

    const ssrfPrivate192 = validateSafeUrl('http://192.168.1.1/admin');
    assert('Private 192.168.x IP blocked', ssrfPrivate192.safe === false, `Reason: ${ssrfPrivate192.reason}`);

    const ssrfPrivate10 = validateSafeUrl('http://10.0.0.5/internal');
    assert('Private 10.x IP blocked', ssrfPrivate10.safe === false, `Reason: ${ssrfPrivate10.reason}`);

    const validPublicUrl = validateSafeUrl('https://alljobs.teletalk.com.bd/jobs');
    assert('Valid public HTTPS URL allowed', validPublicUrl.safe === true, `Safe: ${validPublicUrl.safe}`);

    // --- TEST 5: Invalid Record Rejection ---
    console.log('\n--- 5. Invalid Record Rejection ---');
    const invalidTitle = normalizeCircularNotice({
      title: '  ',
      organization: 'ডাক বিভাগ',
      sourceUrl: 'https://example.com'
    }, mockSource);
    assert('Empty title rejected during normalization', invalidTitle.valid === false, `Errors: ${invalidTitle.errors.join('; ')}`);

    const invalidOrg = normalizeCircularNotice({
      title: 'হিসাবরক্ষক নিয়োগ',
      organization: '',
      sourceUrl: 'https://example.com'
    }, mockSource);
    assert('Missing organization rejected during normalization', invalidOrg.valid === false, `Errors: ${invalidOrg.errors.join('; ')}`);

    // --- TEST 6: Duplicate Circular Detection ---
    console.log('\n--- 6. Duplicate Circular Detection ---');
    const publishedJobs = serverDB.getJobs();
    const existingDrafts = serverDB.getCircularDrafts();
    
    // Candidate matching an existing published job (e.g. Bangladesh Bank refNo)
    const duplicateCandidate = {
      id: 'draft-test-dup',
      refNo: '20261027_bscs_348',
      sourceId: 'teletalk-alljobs',
      sourceName: 'Teletalk Alljobs',
      sourceUrl: 'https://erecruitment.bb.org.bd',
      title: publishedJobs[0]?.title || 'অফিসার (সাধারণ)',
      organization: publishedJobs[0]?.organization || 'বাংলাদেশ ব্যাংক',
      category: 'bank',
      grade: '৯ম গ্রেড',
      vacancies: publishedJobs[0]?.totalPosts || 874,
      minEducation: 'স্নাতকোত্তর',
      salary: '২২,০০০ - ৫৩,০৬০ টাকা',
      deadline: publishedJobs[0]?.deadline || '২৫ নভেম্বর ২০২৬',
      govtFee: 200,
      confidenceScore: 0.95,
      contentHash: 'hash-abc-123',
      extractedAt: new Date().toISOString()
    };

    const dupMatch = calculateDuplicateMatch(duplicateCandidate, publishedJobs, existingDrafts);
    assert('Existing published circular detected as duplicate', dupMatch.isMatch === true, `Matched Target: ${dupMatch.matchedTarget}, Type: ${dupMatch.matchType}`);
    assert('Identical duplicate is not flagged as material update', dupMatch.isMaterialUpdate === false, `MaterialUpdate: ${dupMatch.isMaterialUpdate}`);

    // --- TEST 7: Distinct Circulars with Similar Titles ---
    console.log('\n--- 7. Distinct Circulars with Similar Titles Guard ---');
    // Notice under same organization with different role keyword ('আইটি' vs 'সাধারণ')
    const distinctCandidate = {
      id: 'draft-test-distinct',
      refNo: 'DISTINCT-ROLE-2026',
      sourceId: 'teletalk-alljobs',
      sourceName: 'Teletalk Alljobs',
      sourceUrl: 'https://erecruitment.bb.org.bd/it-officer',
      title: 'সিনিয়র অফিসার (তথ্যপ্রযুক্তি / আইটি)',
      organization: publishedJobs[0]?.organization || 'বাংলাদেশ ব্যাংক',
      category: 'bank',
      grade: '৯ম গ্রেড',
      vacancies: 40,
      minEducation: 'সিএসই স্নাতক',
      salary: '২২,০০০ - ৫৩,০৬০ টাকা',
      deadline: '৩০ ডিসেম্বর ২০২৬',
      govtFee: 200,
      confidenceScore: 0.95,
      contentHash: 'hash-distinct-456',
      extractedAt: new Date().toISOString()
    };

    const distinctMatch = calculateDuplicateMatch(distinctCandidate, publishedJobs, existingDrafts);
    assert('Distinct recruitment notice with different role is NOT merged as duplicate', distinctMatch.isMatch === false, `isMatch: ${distinctMatch.isMatch}`);

    // --- TEST 8: Repeated Ingestion Idempotency ---
    console.log('\n--- 8. Ingestion Idempotency (Zero Duplicate Drafts) ---');
    const initialDraftsCount = serverDB.getCircularDrafts().length;

    // Run 1: Ingest 2 new mock notices
    const ingestReport1 = ingestDiscoveredCandidates(result1.candidates, 'TEST_ADMIN');
    assert('First ingestion creates new drafts in review queue', 
      ingestReport1.newDraftsCreated === 2, 
      `New Drafts: ${ingestReport1.newDraftsCreated}`
    );

    const postRun1DraftsCount = serverDB.getCircularDrafts().length;
    assert('Drafts count increased by exactly 2', postRun1DraftsCount === initialDraftsCount + 2, `Count: ${postRun1DraftsCount}`);

    // Run 2: Re-ingest the exact same 2 notices
    const ingestReport2 = ingestDiscoveredCandidates(result1.candidates, 'TEST_ADMIN');
    assert('Second ingestion of identical notices creates ZERO new drafts', 
      ingestReport2.newDraftsCreated === 0 && ingestReport2.duplicatesIgnored === 2, 
      `New: ${ingestReport2.newDraftsCreated}, Ignored Dups: ${ingestReport2.duplicatesIgnored}`
    );

    const postRun2DraftsCount = serverDB.getCircularDrafts().length;
    assert('Total drafts in database remained strictly unchanged after re-run', postRun2DraftsCount === postRun1DraftsCount, `Drafts count: ${postRun2DraftsCount}`);

    // --- TEST 9: Material Update Detection ---
    console.log('\n--- 9. Material Update Detection & Review Queue ---');
    // Modify deadline on candidate 1 to simulate official deadline extension
    const updatedCandidate = {
      ...result1.candidates[0],
      deadline: '৩১ ডিসেম্বর ২০২৬ (সময় বৃদ্ধি)'
    };

    const updateReport = ingestDiscoveredCandidates([updatedCandidate], 'TEST_ADMIN');
    assert('Material change detected on re-ingestion', updateReport.updatesDetected === 1, `Updates detected: ${updateReport.updatesDetected}`);
    assert('Updated circular submitted as reviewable draft rather than overwriting canonical job', 
      updateReport.drafts.length === 1 && updateReport.drafts[0].duplicateDetected === true,
      `Draft Status: ${updateReport.drafts[0]?.status}, Notes: ${updateReport.drafts[0]?.notes?.slice(0, 50)}...`
    );

    // --- TEST 10: Invariant Guard — No Direct Public Job Writing ---
    console.log('\n--- 10. Canonical Public Jobs Invariant ---');
    const finalJobs = serverDB.getJobs();
    assert('Canonical published jobs count remains strictly 9 (zero direct writes)', 
      finalJobs.length === 9, 
      `Canonical Jobs Count: ${finalJobs.length}`
    );

    // --- TEST 11: Teletalk Collector Adapter Interface ---
    console.log('\n--- 11. Teletalk Collector Adapter Whitelist & Safety ---');
    const teletalkAdapter = new TeletalkCollectorAdapter();
    const teletalkSource = serverDB.getJobSourceById('teletalk-alljobs');
    
    if (teletalkSource) {
      const adapterRes = await teletalkAdapter.collect(teletalkSource);
      assert('Teletalk adapter validates verified official source without error', adapterRes.success === true, `Adapter Success: ${adapterRes.success}`);
    }

    // Attempting adapter collection on an untrusted external domain is blocked
    const untrustedSource = {
      id: 'src-untrusted',
      name: 'Untrusted Site',
      sourceUrl: 'https://untrusted-scam-jobs.com/feed',
      type: 'official_portal',
      fetchStatus: 'active',
      lastFetchedAt: new Date().toISOString(),
      autoSync: true
    };
    const untrustedRes = await teletalkAdapter.collect(untrustedSource);
    assert('Untrusted domain rejected by Teletalk adapter whitelist', 
      untrustedRes.success === false && untrustedRes.error?.code === 'INVALID_SOURCE',
      `Error Code: ${untrustedRes.error?.code}`
    );

  } finally {
    // Clean up isolated temporary database fixture
    try {
      if (fs.existsSync(TEMP_DB_PATH)) fs.unlinkSync(TEMP_DB_PATH);
      const bak = TEMP_DB_PATH + '.bak';
      if (fs.existsSync(bak)) fs.unlinkSync(bak);
      const tmp = TEMP_DB_PATH + '.tmp';
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    } catch {}
  }

  console.log('\n=================================================================');
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`STATUS: ${failed === 0 ? 'ALL MODULAR COLLECTOR FOUNDATION CHECKS PASSED (100%)' : 'QA FAILURES DETECTED'}`);
  console.log('=================================================================');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch(err => {
  console.error('Fatal test suite crash:', err);
  process.exit(1);
});
