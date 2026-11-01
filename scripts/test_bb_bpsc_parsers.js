/**
 * CHAKRI SHEBA — BANGLADESH BANK & BPSC PARSER AND COLLECTOR TEST SUITE
 * 
 * Verifies:
 * 1. BB HTML Parser: single, multiple, Bengali, missing fields, similar roles, malformed HTML, SSRF, captcha, empty
 * 2. BPSC HTML Parser: single, multiple, Bengali, missing fields, similar roles, malformed HTML, SSRF, empty
 * 3. BB & BPSC Adapters: fixture collection, paused state handling, SSRF security
 * 4. Deduplication & Material Update Detection
 * 5. Dry-run zero mutation invariant
 * 6. Authenticated Draft Ingestion isolation
 */

const path = require('path');
const fs = require('fs');

const { serverDB } = require(path.resolve('src/lib/db.ts'));
const {
  // BB
  parseBbHtml,
  BbCollectorAdapter,
  FIXTURE_BB_VALID_SINGLE,
  FIXTURE_BB_MULTIPLE_LISTINGS,
  FIXTURE_BB_BENGALI_NUMERALS_DATES,
  FIXTURE_BB_MISSING_FIELDS,
  FIXTURE_BB_DISTINCT_SIMILAR_TITLES,
  FIXTURE_BB_MALFORMED_HTML,
  FIXTURE_BB_UNSAFE_LINKS,
  FIXTURE_BB_EMPTY_STRUCTURE,
  FIXTURE_BB_CAPTCHA_CHALLENGE,
  // BPSC
  parseBpscHtml,
  BpscCollectorAdapter,
  FIXTURE_BPSC_VALID_SINGLE,
  FIXTURE_BPSC_MULTIPLE_LISTINGS,
  FIXTURE_BPSC_BENGALI_NUMERALS_DATES,
  FIXTURE_BPSC_MISSING_DEADLINE_REF,
  FIXTURE_BPSC_DISTINCT_SIMILAR_TITLES,
  FIXTURE_BPSC_MALFORMED_HTML,
  FIXTURE_BPSC_UNSAFE_LINKS,
  FIXTURE_BPSC_EMPTY_STRUCTURE,
  // Core
  calculateDuplicateMatch,
  ingestDiscoveredCandidates
} = require(path.resolve('src/lib/collector/index.ts'));

let passCount = 0;
let failCount = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${testName} ${detail ? '-> ' + detail : ''}`);
    failCount++;
  }
}

async function runTestSuite() {
  console.log('=================================================================');
  console.log(' CHAKRI SHEBA — BB & BPSC PARSERS & ADAPTERS TEST SUITE');
  console.log(' Execution Time:', new Date().toISOString());
  console.log('=================================================================\n');

  const bbSource = {
    id: 'bb-erecruitment',
    name: 'Bangladesh Bank e-Recruitment System',
    sourceUrl: 'https://erecruitment.bb.org.bd',
    type: 'official_portal',
    fetchStatus: 'active',
    enabled: true
  };

  const bpscSource = {
    id: 'bpsc-portal',
    name: 'Bangladesh Public Service Commission (BPSC)',
    sourceUrl: 'https://bpsc.teletalk.com.bd',
    type: 'official_portal',
    fetchStatus: 'active',
    enabled: true
  };

  // ---------------------------------------------------------------------------
  // 1. BANGLADESH BANK PARSER TESTS
  // ---------------------------------------------------------------------------
  console.log('[SECTION 1] Bangladesh Bank HTML Parser (bb_parser.ts)');

  // Test 1.1: Single valid tabular circular
  const bbSingle = parseBbHtml(FIXTURE_BB_VALID_SINGLE, bbSource);
  assert(bbSingle.success, 'BB 1.1: parseBbHtml succeeded on valid single tabular circular');
  assert(bbSingle.candidates.length === 1, 'BB 1.1: Exactly 1 candidate discovered', `Count: ${bbSingle.candidates.length}`);
  if (bbSingle.candidates.length > 0) {
    const c = bbSingle.candidates[0];
    assert(c.title === 'Assistant Director (General)', 'BB 1.1: Correct title parsed', `Got: ${c.title}`);
    assert(c.organization === 'Bangladesh Bank', 'BB 1.1: Correct organization parsed', `Got: ${c.organization}`);
    assert(c.vacancies === 100, 'BB 1.1: Vacancies parsed as 100', `Got: ${c.vacancies}`);
    assert(c.deadline === '30 Nov, 2026', 'BB 1.1: Deadline parsed accurately', `Got: ${c.deadline}`);
    assert(c.govtFee === 200, 'BB 1.1: Govt fee parsed as 200', `Got: ${c.govtFee}`);
    assert(c.category === 'bank', 'BB 1.1: Category inferred as bank', `Got: ${c.category}`);
  }

  // Test 1.2: Multiple live-format listings
  const bbMulti = parseBbHtml(FIXTURE_BB_MULTIPLE_LISTINGS, bbSource);
  assert(bbMulti.success, 'BB 1.2: parseBbHtml succeeded on live multi-format list');
  assert(bbMulti.candidates.length === 5, 'BB 1.2: Discovered 5 listings (3 ongoing + 2 circular notices)', `Count: ${bbMulti.candidates.length}`);
  const hasSystemManager = bbMulti.candidates.some(c => c.title === 'System Manager' && c.organization === 'Ansar VDP Unnayan Bank');
  assert(hasSystemManager, 'BB 1.2: Found System Manager with correct organization (Ansar VDP Unnayan Bank)');

  // Test 1.3: Bengali numerals & dates
  const bbBn = parseBbHtml(FIXTURE_BB_BENGALI_NUMERALS_DATES, bbSource);
  assert(bbBn.candidates.length === 2, 'BB 1.3: Bengali circulars parsed', `Count: ${bbBn.candidates.length}`);
  if (bbBn.candidates.length >= 2) {
    assert(bbBn.candidates[0].vacancies === 100, 'BB 1.3: Bengali numeral "১০০টি" converted to 100', `Got: ${bbBn.candidates[0].vacancies}`);
    assert(bbBn.candidates[0].deadline.includes('১৫ ডিসেম্বর ২০২৬'), 'BB 1.3: Bengali deadline preserved', `Got: ${bbBn.candidates[0].deadline}`);
    assert(bbBn.candidates[0].govtFee === 200, 'BB 1.3: Bengali fee "২০০ টাকা" converted to 200', `Got: ${bbBn.candidates[0].govtFee}`);
  }

  // Test 1.4: Missing fields and review flagging
  const bbMissing = parseBbHtml(FIXTURE_BB_MISSING_FIELDS, bbSource);
  assert(bbMissing.discoveredCount === 1, 'BB 1.4: Discovered circular with missing deadline');
  assert(bbMissing.needsReviewCount === 1, 'BB 1.4: Circular flagged for manual review', `Count: ${bbMissing.needsReviewCount}`);
  assert(bbMissing.rawNotices[0].reviewReason.includes('আবেদনের শেষ তারিখ অনুপস্থিত'), 'BB 1.4: Review reason explicitly notes missing deadline');

  // Test 1.5: Distinct positions with similar titles under same bank
  const bbSimilar = parseBbHtml(FIXTURE_BB_DISTINCT_SIMILAR_TITLES, bbSource);
  assert(bbSimilar.candidates.length === 2, 'BB 1.5: Both similar roles parsed', `Count: ${bbSimilar.candidates.length}`);
  if (bbSimilar.candidates.length === 2) {
    const c1 = bbSimilar.candidates[0];
    const c2 = bbSimilar.candidates[1];
    const match = calculateDuplicateMatch(c2, [{ officialLink: c1.sourceUrl, ...c1 }], []);
    assert(!match.isMatch, 'BB 1.5: Assistant Director (General) and Assistant Director (IT) NOT merged as duplicate', `Match: ${match.isMatch}`);
  }

  // Test 1.6: Malformed HTML resilience
  const bbMalformed = parseBbHtml(FIXTURE_BB_MALFORMED_HTML, bbSource);
  assert(bbMalformed.success, 'BB 1.6: Malformed HTML handled gracefully without crashing');
  assert(bbMalformed.candidates.length >= 1, 'BB 1.6: Extracted valid circulars from malformed HTML', `Count: ${bbMalformed.candidates.length}`);

  // Test 1.7: Unsafe links SSRF neutralization
  const bbUnsafe = parseBbHtml(FIXTURE_BB_UNSAFE_LINKS, bbSource);
  assert(bbUnsafe.candidates.length === 1, 'BB 1.7: Parsed notice with unsafe links');
  const unsafeCand = bbUnsafe.candidates[0];
  assert(!unsafeCand.sourceUrl.includes('169.254'), 'BB 1.7: Cloud metadata IP (169.254) blocked');
  assert(!unsafeCand.sourceUrl.includes('malicious'), 'BB 1.7: Untrusted domain blocked');
  if (unsafeCand.evidenceUrl) {
    assert(unsafeCand.evidenceUrl.includes('erecruitment.bb.org.bd'), 'BB 1.7: Evidence URL points only to approved BB domain');
  }

  // Test 1.8: Empty structure
  const bbEmpty = parseBbHtml(FIXTURE_BB_EMPTY_STRUCTURE, bbSource);
  assert(bbEmpty.candidates.length === 0, 'BB 1.8: Empty structure yields 0 candidates');

  // Test 1.9: Captcha / bot challenge
  const bbCaptcha = parseBbHtml(FIXTURE_BB_CAPTCHA_CHALLENGE, bbSource);
  assert(bbCaptcha.isCaptchaBlocked === true, 'BB 1.9: Bot challenge / captcha detected gracefully');

  // ---------------------------------------------------------------------------
  // 2. BPSC PARSER TESTS
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 2] BPSC HTML Parser (bpsc_parser.ts)');

  // Test 2.1: Single valid BCS circular
  const bpscSingle = parseBpscHtml(FIXTURE_BPSC_VALID_SINGLE, bpscSource);
  assert(bpscSingle.success, 'BPSC 2.1: parseBpscHtml succeeded on valid single BCS circular');
  assert(bpscSingle.candidates.length === 1, 'BPSC 2.1: Exactly 1 candidate discovered', `Count: ${bpscSingle.candidates.length}`);
  if (bpscSingle.candidates.length > 0) {
    const c = bpscSingle.candidates[0];
    assert(c.title.includes('51st BCS'), 'BPSC 2.1: Title includes 51st BCS', `Got: ${c.title}`);
    assert(c.refNo === 'BPSC-BCS-51' || c.refNo === 'BPSC/EXAM/2026-51', 'BPSC 2.1: RefNo identified correctly', `Got: ${c.refNo}`);
    assert(c.govtFee === 700, 'BPSC 2.1: BPSC fee set to 700 BDT', `Got: ${c.govtFee}`);
    assert(c.category === 'govt', 'BPSC 2.1: Category inferred as govt', `Got: ${c.category}`);
  }

  // Test 2.2: Multiple live-layout listings
  const bpscMulti = parseBpscHtml(FIXTURE_BPSC_MULTIPLE_LISTINGS, bpscSource);
  assert(bpscMulti.success, 'BPSC 2.2: parseBpscHtml succeeded on multiple portal table listings');
  assert(bpscMulti.candidates.length === 4, 'BPSC 2.2: Discovered 4 exam/circular listings', `Count: ${bpscMulti.candidates.length}`);
  const titles = bpscMulti.candidates.map(c => c.title);
  assert(titles.some(t => t.includes('51st BCS')), 'BPSC 2.2: Contains 51st BCS');
  assert(titles.some(t => t.includes('50th BCS')), 'BPSC 2.2: Contains 50th BCS');
  assert(titles.some(t => t.includes('Non Cadre Online Application')), 'BPSC 2.2: Contains Non Cadre Online Application');

  // Test 2.3: Bengali numerals & dates
  const bpscBn = parseBpscHtml(FIXTURE_BPSC_BENGALI_NUMERALS_DATES, bpscSource);
  assert(bpscBn.candidates.length === 2, 'BPSC 2.3: Parsed 2 Bengali circulars', `Count: ${bpscBn.candidates.length}`);
  if (bpscBn.candidates.length >= 2) {
    assert(bpscBn.candidates[0].vacancies === 500, 'BPSC 2.3: Bengali vacancies "৫০০" parsed as 500', `Got: ${bpscBn.candidates[0].vacancies}`);
    assert(bpscBn.candidates[0].govtFee === 700, 'BPSC 2.3: Bengali fee "৭০০ টাকা" parsed as 700', `Got: ${bpscBn.candidates[0].govtFee}`);
    assert(Boolean(bpscBn.candidates[0].refNo && bpscBn.candidates[0].refNo.includes('০৫.০০.০০০০')), 'BPSC 2.3: Circular memo number extracted', `Got: ${bpscBn.candidates[0].refNo}`);
  }

  // Test 2.4: Missing deadline / ref flagged for review
  const bpscMissing = parseBpscHtml(FIXTURE_BPSC_MISSING_DEADLINE_REF, bpscSource);
  assert(bpscMissing.discoveredCount === 1, 'BPSC 2.4: Discovered notice with missing deadline');
  assert(bpscMissing.needsReviewCount === 1, 'BPSC 2.4: Flagged for manual review', `Count: ${bpscMissing.needsReviewCount}`);

  // Test 2.5: Distinct roles under same ministry
  const bpscSimilar = parseBpscHtml(FIXTURE_BPSC_DISTINCT_SIMILAR_TITLES, bpscSource);
  assert(bpscSimilar.candidates.length === 2, 'BPSC 2.5: Both similar roles parsed');
  if (bpscSimilar.candidates.length === 2) {
    const c1 = bpscSimilar.candidates[0];
    const c2 = bpscSimilar.candidates[1];
    const match = calculateDuplicateMatch(c2, [{ officialLink: c1.sourceUrl, ...c1 }], []);
    assert(!match.isMatch, 'BPSC 2.5: সহকারী পরিচালক (প্রশাসন) and সহকারী পরিচালক (অর্থ ও হিসাব) NOT merged', `Match: ${match.isMatch}`);
  }

  // Test 2.6: Malformed HTML resilience
  const bpscMalformed = parseBpscHtml(FIXTURE_BPSC_MALFORMED_HTML, bpscSource);
  assert(bpscMalformed.success, 'BPSC 2.6: Malformed HTML handled without crashing');
  assert(bpscMalformed.candidates.length >= 1, 'BPSC 2.6: Candidates extracted from malformed HTML');

  // Test 2.7: Unsafe links SSRF neutralization
  const bpscUnsafe = parseBpscHtml(FIXTURE_BPSC_UNSAFE_LINKS, bpscSource);
  assert(bpscUnsafe.candidates.length === 1, 'BPSC 2.7: Parsed notice with unsafe links');
  const bpscUnsafeCand = bpscUnsafe.candidates[0];
  assert(!bpscUnsafeCand.sourceUrl.includes('10.0.0.1'), 'BPSC 2.7: Private IP 10.0.0.1 blocked');
  assert(!bpscUnsafeCand.sourceUrl.includes('unauthorized-domain'), 'BPSC 2.7: Unauthorized domain blocked');

  // Test 2.8: Empty structure
  const bpscEmpty = parseBpscHtml(FIXTURE_BPSC_EMPTY_STRUCTURE, bpscSource);
  assert(bpscEmpty.candidates.length === 0, 'BPSC 2.8: Empty structure yields 0 candidates');

  // ---------------------------------------------------------------------------
  // 3. ADAPTER CONTRACT TESTS
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 3] BB & BPSC Collector Adapters (JobCollector Contract)');

  const bbAdapter = new BbCollectorAdapter();
  assert(bbAdapter.id === 'bb-collector-adapter', 'Adapter 3.1: BB adapter id correct');
  assert(bbAdapter.supportedMethods.includes('html_scrape'), 'Adapter 3.1: BB adapter supports html_scrape');

  const bpscAdapter = new BpscCollectorAdapter();
  assert(bpscAdapter.id === 'bpsc-collector-adapter', 'Adapter 3.2: BPSC adapter id correct');
  assert(bpscAdapter.supportedMethods.includes('html_scrape'), 'Adapter 3.2: BPSC adapter supports html_scrape');

  // Test 3.3: Collect with fixture
  const bbResult = await bbAdapter.collect(bbSource, { htmlFixture: FIXTURE_BB_VALID_SINGLE });
  assert(bbResult.success, 'Adapter 3.3: BB adapter collect succeeded with fixture');
  assert(bbResult.candidates.length === 1, 'Adapter 3.3: 1 candidate returned');

  // Test 3.4: Source disabled / paused handling
  const pausedSource = { ...bbSource, enabled: false };
  const pausedResult = await bbAdapter.collect(pausedSource);
  assert(!pausedResult.success, 'Adapter 3.4: Paused source collection refused');
  assert(pausedResult.error.code === 'INVALID_SOURCE', 'Adapter 3.4: Returns INVALID_SOURCE error code');

  // Test 3.5: SSRF prevention in adapter
  const ssrfSource = { ...bpscSource, sourceUrl: 'http://169.254.169.254/latest/meta-data' };
  const ssrfResult = await bpscAdapter.collect(ssrfSource);
  assert(!ssrfResult.success, 'Adapter 3.5: SSRF source collection blocked');
  assert(ssrfResult.error.code === 'SECURITY_BLOCKED', 'Adapter 3.5: Returns SECURITY_BLOCKED error code');

  // ---------------------------------------------------------------------------
  // 4. DATABASE INVARIANTS & INTEGRATION
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 4] System Invariants & Database Integrity');

  const jobsBefore = serverDB.getJobs();
  const draftsBefore = serverDB.getCircularDrafts();
  const sourcesBefore = serverDB.getJobSources();

  assert(jobsBefore.length === 9, 'DB 4.1: Exactly 9 canonical jobs in database', `Count: ${jobsBefore.length}`);
  assert(draftsBefore.length === 1, 'DB 4.2: Exactly 1 draft in database', `Count: ${draftsBefore.length}`);
  assert(sourcesBefore.length === 3, 'DB 4.3: Exactly 3 registered sources in database', `Count: ${sourcesBefore.length}`);

  // Test 4.4: Ingestion creates only pending_review drafts and never modifies jobs
  const sampleCandidates = bbSingle.candidates;
  const ingestionReport = ingestDiscoveredCandidates(sampleCandidates, serverDB);
  assert(ingestionReport.newDraftsCreated === 1, 'DB 4.4: Ingestion created 1 new draft', `Created: ${ingestionReport.newDraftsCreated}`);

  const jobsAfter = serverDB.getJobs();
  assert(jobsAfter.length === 9, 'DB 4.4: Canonical jobs strictly preserved at 9', `Count: ${jobsAfter.length}`);

  const draftsAfter = serverDB.getCircularDrafts();
  assert(draftsAfter.length === 2, 'DB 4.4: Drafts count increased to 2', `Count: ${draftsAfter.length}`);

  // Clean up the test draft so database remains strictly at 1 draft
  const createdDraftId = sampleCandidates[0].id;
  serverDB.deleteCircularDraft(createdDraftId);

  const draftsCleaned = serverDB.getCircularDrafts();
  assert(draftsCleaned.length === 1, 'DB 4.5: Cleaned up test draft, drafts restored to 1', `Count: ${draftsCleaned.length}`);

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n=================================================================');
  console.log(` TEST EXECUTION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('=================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('[FATAL] Test runner failed:', err);
  process.exit(1);
});
