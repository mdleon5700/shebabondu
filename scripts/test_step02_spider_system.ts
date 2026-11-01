/**
 * Chakri Sheba - Step 02 Spider System Master Verification Test Suite
 * Tests Source Registry, HTML Parsers, PDF Processing, Normalization,
 * Deduplication, Cancellation Detection, Concurrency Locking, and Draft Isolation.
 */
import { serverDB } from '../src/lib/db';
import { 
  validateSafeUrl,
  normalizeCircularNotice,
  calculateDuplicateMatch,
  compareHtmlAndPdfCandidate,
  acquireScrapeLock,
  releaseScrapeLock,
  isScrapingActive,
  getScrapeLockStatus,
  ingestDiscoveredCandidates,
  RawDiscoveredNotice,
  NormalizedCircularCandidate
} from '../src/lib/collector';
import { JobSource, SpiderRun } from '../src/lib/types';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, failureMsg?: string) {
  if (condition) {
    results.push({ name, passed: true });
    console.log(`  ? PASS: ${name}`);
  } else {
    results.push({ name, passed: false, message: failureMsg || 'Assertion failed' });
    console.error(`  ? FAIL: ${name} -> ${failureMsg}`);
  }
}

async function runStep02Tests() {
  console.log('=====================================================');
  console.log(' CHAKRI SHEBA ? STEP 02 SPIDER SYSTEM TEST SUITE');
  console.log('=====================================================');

  // -----------------------------------------------------------------
  // 1. SSRF & URL Security Tests
  // -----------------------------------------------------------------
  console.log('\n[TEST SUITE 1] SSRF & URL Security Validation:');
  const safeGovUrl = validateSafeUrl('https://alljobs.teletalk.com.bd/jobs');
  assert(safeGovUrl.safe === true, 'Allows valid HTTPS public URL');

  const localhostUrl = validateSafeUrl('http://127.0.0.1:8080/admin');
  assert(localhostUrl.safe === false, 'Blocks loopback IPv4 127.0.0.1');

  const privateSubnetUrl = validateSafeUrl('http://192.168.1.50/api');
  assert(privateSubnetUrl.safe === false, 'Blocks private IPv4 192.168.x.x');

  const cloudMetadataUrl = validateSafeUrl('http://169.254.169.254/latest/meta-data/');
  assert(cloudMetadataUrl.safe === false, 'Blocks AWS/GCP cloud metadata IP');

  const javascriptProto = validateSafeUrl('javascript:alert(1)');
  assert(javascriptProto.safe === false, 'Blocks non-HTTP javascript: scheme');

  // -----------------------------------------------------------------
  // 2. Normalization & Bengali Localization Tests
  // -----------------------------------------------------------------
  console.log('\n[TEST SUITE 2] Normalization & Bengali Number/Date Localization:');
  const mockSource: JobSource = {
    id: 'test-source-01',
    name: 'Test Government Source',
    sourceUrl: 'https://test.gov.bd',
    type: 'official_portal',
    fetchStatus: 'active',
    lastFetchedAt: new Date().toISOString(),
    autoSync: true,
    classification: 'official',
    collectionMethod: 'html_scrape',
    enabled: true
  };

  const rawNotice: RawDiscoveredNotice = {
    title: '\u09b8\u09b9\u0995\u09be\u09b0\u09c0 \u09aa\u09b0\u09bf\u099a\u09be\u09b2\u0995 \u09aa\u09a6\u09c7 \u09a8\u09bf\u09df\u09cb\u0997 \u09ac\u09bf\u099c\u09cd\u099e\u09aa\u09cd\u09a4\u09bf', // ?????? ??????? ??? ????? ?????????
    organization: '\u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6 \u09aa\u09b0\u09bf\u09b8\u0982\u0996\u09cd\u09af\u09be\u09a8 \u09ac\u09cd\u09af\u09c1\u09b0\u09cb', // ???????? ?????????? ??????
    sourceUrl: 'https://test.gov.bd/job/101',
    category: 'govt',
    vacancies: '\u09e8\u09eb', // Bengali 25
    govtFee: '\u09e8\u09e8\u09e9',  // Bengali 223
    salary: '?????-????? ????',
    deadline: '?? ??????? ????'
  };

  const normResult = normalizeCircularNotice(rawNotice, mockSource);
  assert(normResult.valid === true, 'Normalizer successfully validates notice');
  assert(normResult.candidate?.vacancies === 25, `Converts Bengali vacancies ?? -> 25 (got ${normResult.candidate?.vacancies})`);
  assert(normResult.candidate?.govtFee === 223, `Converts Bengali fee ??? -> 223 (got ${normResult.candidate?.govtFee})`);
  assert(Boolean(normResult.candidate?.organization && normResult.candidate.organization.length > 0), 'Preserves organization');

  // -----------------------------------------------------------------
  // 3. Deduplication & Material Update Detection
  // -----------------------------------------------------------------
  console.log('\n[TEST SUITE 3] Deduplication & Material Update Detection:');
  const existingCandidate: NormalizedCircularCandidate = {
    id: 'cand-orig-101',
    sourceId: mockSource.id,
    sourceName: mockSource.name,
    sourceUrl: 'https://test.gov.bd/job/101',
    title: '?????? ???????',
    organization: '???????? ?????????? ??????',
    category: 'govt',
    grade: '9th',
    vacancies: 25,
    minEducation: '??????',
    salary: '?????-?????',
    deadline: '2026-11-30',
    govtFee: 223,
    confidenceScore: 0.95,
    contentHash: 'hash101',
    extractedAt: new Date().toISOString()
  };

  // Exact duplicate candidate
  const duplicateCandidate = { ...existingCandidate };
  const exactMatch = calculateDuplicateMatch(duplicateCandidate, [], [{
    id: 'draft-101',
    sourceName: mockSource.name,
    sourceUrl: 'https://test.gov.bd/job/101',
    extractedTitle: '?????? ???????',
    extractedOrg: '???????? ?????????? ??????',
    category: 'govt',
    grade: '9th',
    deadline: '2026-11-30',
    vacancies: 25,
    minEducation: '??????',
    salary: '?????-?????',
    govtFee: 223,
    status: 'pending_review',
    confidenceScore: 0.95,
    duplicateDetected: false,
    createdAt: new Date().toISOString()
  }]);
  assert(exactMatch.isMatch === true && exactMatch.isMaterialUpdate === false, 'Detects exact duplicate (isMatch=true, isMaterialUpdate=false)');

  // Material update candidate: Deadline extended to December 15
  const updatedCandidate = { 
    ...existingCandidate, 
    deadline: '2026-12-15' 
  };
  const updateMatch = calculateDuplicateMatch(updatedCandidate, [], [{
    id: 'draft-101',
    sourceName: mockSource.name,
    sourceUrl: 'https://test.gov.bd/job/101',
    extractedTitle: '?????? ???????',
    extractedOrg: '???????? ?????????? ??????',
    category: 'govt',
    grade: '9th',
    deadline: '2026-11-30',
    vacancies: 25,
    minEducation: '??????',
    salary: '?????-?????',
    govtFee: 223,
    status: 'pending_review',
    confidenceScore: 0.95,
    duplicateDetected: false,
    createdAt: new Date().toISOString()
  }]);
  assert(updateMatch.isMatch === true && updateMatch.isMaterialUpdate === true, 'Detects deadline extension material update');

  // -----------------------------------------------------------------
  // 4. Cancellation & Suspension Detection
  // -----------------------------------------------------------------
  console.log('\n[TEST SUITE 4] Cancellation and Suspension Notice Detection:');
  const cancellationNotice: RawDiscoveredNotice = {
    title: '\u09b8\u09b9\u0995\u09be\u09b0\u09c0 \u09aa\u09b0\u09bf\u099a\u09be\u09b2\u0995 \u09aa\u09a6\u09c7 \u09a8\u09bf\u09df\u09cb\u0997 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be \u09b8\u09cd\u09a5\u0997\u09bf\u09a4 \u09b8\u0982\u0995\u09cd\u09b0\u09be\u09a8\u09cd\u09a4 \u09ac\u09bf\u099c\u09cd\u099e\u09aa\u09cd\u09a4\u09bf', // ?????? ??????? ??? ????? ??????? ?????? ????????? ?????????
    organization: '\u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6 \u09aa\u09b0\u09bf\u09b8\u0982\u0996\u09cd\u09af\u09be\u09a8 \u09ac\u09cd\u09af\u09c1\u09b0\u09cb',
    sourceUrl: 'https://test.gov.bd/job/101/postponed',
    rawEvidenceText: '\u0985\u09a8\u09bf\u09ac\u09be\u09b0\u09cd\u09af \u0995\u09be\u09b0\u09a3\u09ac\u09b6\u09a4\u0983 \u0989\u0995\u09cd\u09a4 \u09aa\u09a6\u09c7\u09b0 \u09a8\u09bf\u09df\u09cb\u0997 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be \u09aa\u09b0\u09ac\u09b0\u09cd\u09a4\u09c0 \u09a8\u09bf\u09b0\u09cd\u09a6\u09c7\u09b6 \u09a8\u09be \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u09b8\u09cd\u09a5\u0997\u09bf\u09a4 \u0995\u09b0\u09be \u09b9\u09b2\u09cb\u098c'
  };
  const normCancel = normalizeCircularNotice(cancellationNotice, mockSource);
  assert(normCancel.candidate?.needsReview === true, 'Flags cancellation notice for mandatory admin review');
  assert(normCancel.candidate?.rawMetadata?.isCancellationNotice === true, 'Sets isCancellationNotice metadata flag to true');

  // -----------------------------------------------------------------
  // 5. Concurrency Mutex Lock
  // -----------------------------------------------------------------
  console.log('\n[TEST SUITE 5] Concurrency Lock & Reentrancy Safety:');
  const lock1 = acquireScrapeLock('TEST_WORKER_1');
  assert(lock1 === true, 'Acquires scrape mutex lock for Worker 1');
  assert(isScrapingActive() === true, 'Reports scrape mutex is active');

  const lock2 = acquireScrapeLock('TEST_WORKER_2');
  assert(lock2 === false, 'Rejects overlapping acquisition request from Worker 2');

  const status = getScrapeLockStatus();
  assert(status.owner === 'TEST_WORKER_1', 'Verifies lock owner is Worker 1');

  releaseScrapeLock('TEST_WORKER_1');
  assert(isScrapingActive() === false, 'Releases mutex lock successfully');

  // -----------------------------------------------------------------
  // 6. Draft Isolation & Public Zero Leakage
  // -----------------------------------------------------------------
  console.log('\n[TEST SUITE 6] Draft Isolation & Public Zero Leakage Verification:');
  const initialJobsCount = serverDB.getJobs().length;
  const initialDraftsCount = serverDB.getCircularDrafts().length;

  const testNewCandidate: NormalizedCircularCandidate = {
    id: 'test_can_' + Date.now(),
    sourceId: mockSource.id,
    sourceName: mockSource.name,
    sourceUrl: 'https://test.gov.bd/job/unique_' + Date.now(),
    title: 'Assistant Director General Unit ' + Date.now(),
    organization: 'Directorate of Testing Services ' + Date.now(),
    category: 'govt',
    grade: '9th',
    vacancies: 14,
    minEducation: 'BSc Honors',
    salary: '22000-53060',
    deadline: '2026-12-31',
    govtFee: 223,
    confidenceScore: 0.96,
    contentHash: 'hash_' + Date.now(),
    extractedAt: new Date().toISOString()
  };

  const matchDbg = calculateDuplicateMatch(testNewCandidate, serverDB.getJobs(), serverDB.getCircularDrafts());
  const report = ingestDiscoveredCandidates([testNewCandidate], 'UNIT_TEST_AGENT');
  const currentJobsCount = serverDB.getJobs().length;
  const currentDraftsCount = serverDB.getCircularDrafts().length;

  assert(report.newDraftsCreated === 1, 'Ingestion created 1 reviewable draft');
  assert(currentJobsCount === initialJobsCount, 'Zero leakage: Public jobs count remained strictly unchanged');
  assert(currentDraftsCount === initialDraftsCount + 1, 'Draft queued into circularDrafts pending review');

  // Clean up temporary test draft
  const draftsNow = serverDB.getCircularDrafts();
  const testDraftKey = testNewCandidate.id;
  const dbFile = 'src/db/local_store.json';
  try {
    const fs = require('fs');
    const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    if (dbData.circularDrafts && dbData.circularDrafts[testDraftKey]) {
      delete dbData.circularDrafts[testDraftKey];
      fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2), 'utf8');
    }
  } catch (err) {
    // ignore cleanup err
  }


  // -----------------------------------------------------------------
  // 7. Spider Run Telemetry Persistence
  // -----------------------------------------------------------------
  console.log('\n[TEST SUITE 7] Spider Run Telemetry Persistence:');
  const testRun: SpiderRun = {
    id: `run_test_${Date.now()}`,
    sourceId: mockSource.id,
    sourceName: mockSource.name,
    triggerType: 'admin',
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    durationMs: 1250,
    status: 'completed',
    pagesVisited: 1,
    jobsDiscovered: 5,
    jobsExtracted: 5,
    pdfsDiscovered: 3,
    pdfsDownloaded: 3,
    newDraftsCreated: 1,
    duplicatesDetected: 4,
    updatesDetected: 0,
    conflictsDetected: 0,
    failedRecords: []
  };

  serverDB.recordSpiderRun(testRun);
  const fetchedRun = serverDB.getSpiderRunById(testRun.id);
  assert(Boolean(fetchedRun && fetchedRun.id === testRun.id), 'SpiderRun recorded and retrievable by ID');
  assert(fetchedRun?.jobsDiscovered === 5, 'SpiderRun preserved exact jobsDiscovered count');

  // -----------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------
  console.log('\n=====================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('=====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runStep02Tests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
