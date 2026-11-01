const fs = require('fs');
const path = require('path');
const http = require('http');

// Setup isolated temporary database fixture
const TEMP_DB_PATH = path.resolve('src/db/local_store.test_parser_tmp.json');
const PROD_DB_PATH = path.resolve('src/db/local_store.json');

fs.copyFileSync(PROD_DB_PATH, TEMP_DB_PATH);
process.env.CHAKRI_DB_FILE = TEMP_DB_PATH;

const { serverDB } = require(path.resolve('src/lib/db.ts'));
const {
  parseTeletalkHtml,
  calculateDuplicateMatch,
  ingestDiscoveredCandidates,
  FIXTURE_VALID_SINGLE,
  FIXTURE_MULTIPLE_LISTINGS,
  FIXTURE_BENGALI_NUMERALS_DATES,
  FIXTURE_MISSING_DEADLINE_REF,
  FIXTURE_DUPLICATE_CIRCULAR,
  FIXTURE_SIMILAR_TITLE_DISTINCT_ROLE,
  FIXTURE_MALFORMED_HTML,
  FIXTURE_UNSAFE_LINKS,
  FIXTURE_EMPTY_PAGE,
  FIXTURE_CHANGED_PAGE_STRUCTURE
} = require(path.resolve('src/lib/collector/index.ts'));

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
  console.log(' CHAKRI SHEBA — TELETALK HTML PARSER & DRAFT INGESTION QA');
  console.log(` Environment: Isolated Fixture (${TEMP_DB_PATH})`);
  console.log('=================================================================\n');

  try {
    const mockSource = {
      id: 'teletalk-alljobs',
      name: 'Teletalk Alljobs Portal',
      sourceUrl: 'https://alljobs.teletalk.com.bd',
      type: 'official_portal',
      fetchStatus: 'active',
      lastFetchedAt: new Date().toISOString(),
      autoSync: true,
      classification: 'official',
      enabled: true,
      collectionMethod: 'html_scrape',
      scanIntervalMinutes: 360,
      healthStatus: 'healthy',
      metrics: { discovered: 0, collected: 0, failed: 0, deduplicated: 0 }
    };

    // --- SCENARIO 1: Valid Single Job Listing ---
    console.log('--- 1. Valid Single Job Listing ---');
    const res1 = parseTeletalkHtml(FIXTURE_VALID_SINGLE, mockSource);
    assert('Parser extracts single valid circular', res1.discoveredCount === 1 && res1.candidates.length === 1, `Count: ${res1.discoveredCount}`);
    const c1 = res1.candidates[0];
    assert('Correct title extracted', c1.title === 'সহকারী পরিচালক (সাধারণ)', `Title: ${c1.title}`);
    assert('Correct organization extracted', c1.organization.includes('বাংলাদেশ সরকারি কর্ম কমিশন'), `Org: ${c1.organization}`);
    assert('Correct reference number extracted', c1.refNo === '০৫.০১.০০০০.১২৩.২৪.০২৬', `RefNo: ${c1.refNo}`);
    assert('Correct vacancies parsed', c1.vacancies === 45, `Vacancies: ${c1.vacancies}`);
    assert('Correct deadline extracted', c1.deadline === '৩০ নভেম্বর ২০২৬', `Deadline: ${c1.deadline}`);
    assert('Official PDF URL extracted safely', c1.evidenceUrl === 'https://bpsc.teletalk.com.bd/circulars/adm01.pdf', `PDF: ${c1.evidenceUrl}`);

    // --- SCENARIO 2: Multiple Listings on One Page ---
    console.log('\n--- 2. Multiple Listings on One Page ---');
    const res2 = parseTeletalkHtml(FIXTURE_MULTIPLE_LISTINGS, mockSource);
    assert('Parser extracts all items from multiple listings', res2.discoveredCount === 2 && res2.candidates.length === 2, `Count: ${res2.discoveredCount}`);
    assert('First item matches Post Accounts Officer', res2.candidates[0].title === 'হিসাবরক্ষণ কর্মকর্তা', `Title: ${res2.candidates[0].title}`);
    assert('Second item matches Sub-Assistant Engineer', res2.candidates[1].title.includes('উপ-সহকারী প্রকৌশলী'), `Title: ${res2.candidates[1].title}`);

    // --- SCENARIO 3: Bengali Numerals and Dates ---
    console.log('\n--- 3. Bengali Numerals & Dates ---');
    const res3 = parseTeletalkHtml(FIXTURE_BENGALI_NUMERALS_DATES, mockSource);
    assert('Extracts Bengali job notice', res3.candidates.length === 1, `Count: ${res3.candidates.length}`);
    const c3 = res3.candidates[0];
    assert('Converts Bengali vacancies "১৪০টি" to number 140', c3.vacancies === 140, `Vacancies: ${c3.vacancies}`);
    assert('Extracts Bengali deadline text accurately', c3.deadline.includes('১৫ ডিসেম্বর ২০২৬'), `Deadline: ${c3.deadline}`);

    // --- SCENARIO 4: Missing Deadline or Reference Number ---
    console.log('\n--- 4. Missing Deadline / Reference Number Handling ---');
    const res4 = parseTeletalkHtml(FIXTURE_MISSING_DEADLINE_REF, mockSource);
    assert('Parses notice with missing fields', res4.discoveredCount === 1, `Count: ${res4.discoveredCount}`);
    assert('Missing deadline is flagged for manual review', res4.rawNotices[0].needsReview === true, `NeedsReview: ${res4.rawNotices[0].needsReview}`);
    assert('Missing deadline is marked as awaiting without inventing dates', 
      res4.candidates[0].deadline.includes('অপেক্ষমাণ') && res4.candidates[0].refNo === undefined,
      `Deadline: ${res4.candidates[0].deadline}, RefNo: ${res4.candidates[0].refNo}`
    );

    // --- SCENARIO 5: Duplicate Circular Detection ---
    console.log('\n--- 5. Duplicate Circular Detection ---');
    const existingJobs = serverDB.getJobs();
    const existingDrafts = serverDB.getCircularDrafts();
    const res5 = parseTeletalkHtml(FIXTURE_DUPLICATE_CIRCULAR, mockSource);
    const match5 = calculateDuplicateMatch(res5.candidates[0], existingJobs, existingDrafts);
    assert('Detects duplicate of canonical published job', match5.isMatch === true && match5.matchedTarget === 'job', `Match: ${match5.reason}`);

    // --- SCENARIO 6: Similar Titles for Distinct Positions ---
    console.log('\n--- 6. Similar Titles for Distinct Positions ---');
    const res6 = parseTeletalkHtml(FIXTURE_SIMILAR_TITLE_DISTINCT_ROLE, mockSource);
    const match6 = calculateDuplicateMatch(res6.candidates[0], existingJobs, existingDrafts);
    assert('Distinct position with different role keyword (IT vs General) is NOT merged as duplicate', 
      match6.isMatch === false, 
      `isMatch: ${match6.isMatch}`
    );

    // --- SCENARIO 7: Malformed HTML Resilience ---
    console.log('\n--- 7. Malformed HTML Parsing Resilience ---');
    const res7 = parseTeletalkHtml(FIXTURE_MALFORMED_HTML, mockSource);
    assert('Parser does not crash on malformed HTML', res7.success === true, `Success: ${res7.success}`);
    assert('Extracts circular from broken markup', res7.candidates.length >= 1 && res7.candidates[0].title.includes('কম্পিউটার অপারেটর'), `Extracted: ${res7.candidates[0]?.title}`);

    // --- SCENARIO 8: Unsafe External Links (SSRF Prevention) ---
    console.log('\n--- 8. Unsafe External Links & SSRF Guard ---');
    const res8 = parseTeletalkHtml(FIXTURE_UNSAFE_LINKS, mockSource);
    assert('Parser succeeds without following unsafe links', res8.success === true, `Success: ${res8.success}`);
    assert('Unsafe 169.254.x SSRF link is stripped/blocked', 
      res8.candidates[0].sourceUrl !== 'http://169.254.169.254/latest/meta-data',
      `SourceUrl: ${res8.candidates[0].sourceUrl}`
    );
    assert('Untrusted domain PDF link is rejected from evidenceUrl', 
      res8.candidates[0].evidenceUrl === undefined,
      `EvidenceUrl: ${res8.candidates[0].evidenceUrl}`
    );

    // --- SCENARIO 9: Empty Listing Page ---
    console.log('\n--- 9. Empty Listing Page ---');
    const res9 = parseTeletalkHtml(FIXTURE_EMPTY_PAGE, mockSource);
    assert('Empty page returns clean success with 0 items', res9.success === true && res9.discoveredCount === 0, `Count: ${res9.discoveredCount}`);

    // --- SCENARIO 10: Changed Page Structure ---
    console.log('\n--- 10. Changed Page Structure / Maintenance Page ---');
    const res10 = parseTeletalkHtml(FIXTURE_CHANGED_PAGE_STRUCTURE, mockSource);
    assert('Maintenance page returns clean 0 items without throwing', res10.success === true && res10.discoveredCount === 0, `Count: ${res10.discoveredCount}`);

    // --- SCENARIO 11: Dry-Run Zero Mutation Guarantee ---
    console.log('\n--- 11. Dry-Run Database Invariance ---');
    const initialJobs = serverDB.getJobs().length;
    const initialDrafts = serverDB.getCircularDrafts().length;

    // Simulate dry run
    const dryRunResult = parseTeletalkHtml(FIXTURE_MULTIPLE_LISTINGS, mockSource);
    const postDryJobs = serverDB.getJobs().length;
    const postDryDrafts = serverDB.getCircularDrafts().length;

    assert('Dry-run does NOT modify persistent jobs count', postDryJobs === initialJobs && initialJobs === 9, `Jobs: ${postDryJobs}`);
    assert('Dry-run does NOT modify persistent drafts count', postDryDrafts === initialDrafts && initialDrafts === 1, `Drafts: ${postDryDrafts}`);

    // --- SCENARIO 12: Explicit Admin Ingestion Action ---
    console.log('\n--- 12. Explicit Admin Ingestion & Idempotency ---');
    
    // Ingest candidate from fixture 1
    const validCandidate = res1.candidates[0];
    const report1 = ingestDiscoveredCandidates([validCandidate], 'ADMIN_EXPLICIT_TEST');
    assert('Explicit ingestion creates pending_review draft', report1.newDraftsCreated === 1, `New Drafts: ${report1.newDraftsCreated}`);
    
    const draftsAfterIngest = serverDB.getCircularDrafts();
    const createdDraft = draftsAfterIngest.find(d => d.extractedTitle === validCandidate.title);
    assert('Draft persisted in pending_review status', 
      createdDraft && createdDraft.status === 'pending_review',
      `Draft Status: ${createdDraft?.status}`
    );

    // Canonical jobs must still be 9 (never auto-publish)
    const jobsAfterIngest = serverDB.getJobs();
    assert('Canonical published jobs count strictly unchanged after ingestion', jobsAfterIngest.length === 9, `Jobs: ${jobsAfterIngest.length}`);

    // Retrying the exact same ingestion must be idempotent
    const report2 = ingestDiscoveredCandidates([validCandidate], 'ADMIN_EXPLICIT_TEST');
    assert('Repeated ingestion creates ZERO duplicate drafts (idempotency)', 
      report2.newDraftsCreated === 0 && report2.duplicatesIgnored === 1,
      `New: ${report2.newDraftsCreated}, Ignored: ${report2.duplicatesIgnored}`
    );

    const draftsAfterRetry = serverDB.getCircularDrafts();
    assert('Drafts count strictly unchanged on retry', draftsAfterRetry.length === draftsAfterIngest.length, `Count: ${draftsAfterRetry.length}`);

  } finally {
    // Clean up temporary fixture
    try {
      if (fs.existsSync(TEMP_DB_PATH)) fs.unlinkSync(TEMP_DB_PATH);
      const bak = TEMP_DB_PATH + '.bak';
      if (fs.existsSync(bak)) fs.unlinkSync(bak);
      const tmp = TEMP_DB_PATH + '.tmp';
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    } catch {}
  }

  console.log('\n=================================================================');
  console.log(`TOTAL PARSER CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`STATUS: ${failed === 0 ? 'ALL HTML PARSER & INGESTION QA CHECKS PASSED (100%)' : 'PARSER QA FAILURES DETECTED'}`);
  console.log('=================================================================');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
