import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const { serverDB } = require(path.resolve('src/lib/db.ts'));
const {
  // Parsers & Adapters
  parseBbHtml,
  BbCollectorAdapter,
  parseBpscHtml,
  BpscCollectorAdapter,
  TeletalkCollectorAdapter,
  parseTeletalkHtml,
  // Normalizer & Security
  normalizeCircularNotice,
  calculateDuplicateMatch,
  computeContentHash,
  validateSafeUrl,
  validateSafeRedirect,
  convertBnToEnDigits,
  ingestDiscoveredCandidates,
  // Fixtures
  FIXTURE_BB_VALID_SINGLE,
  FIXTURE_BB_MULTIPLE_LISTINGS,
  FIXTURE_BB_BENGALI_NUMERALS_DATES,
  FIXTURE_BB_MISSING_FIELDS,
  FIXTURE_BB_DISTINCT_SIMILAR_TITLES,
  FIXTURE_BB_MALFORMED_HTML,
  FIXTURE_BB_UNSAFE_LINKS,
  FIXTURE_BB_EMPTY_STRUCTURE,
  FIXTURE_BB_CAPTCHA_CHALLENGE,
  FIXTURE_BPSC_VALID_SINGLE,
  FIXTURE_BPSC_MULTIPLE_LISTINGS,
  FIXTURE_BPSC_BENGALI_NUMERALS_DATES,
  FIXTURE_BPSC_MISSING_DEADLINE_REF,
  FIXTURE_BPSC_DISTINCT_SIMILAR_TITLES,
  FIXTURE_BPSC_MALFORMED_HTML,
  FIXTURE_BPSC_UNSAFE_LINKS,
  FIXTURE_BPSC_EMPTY_STRUCTURE
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

async function runPhase3Tests() {
  console.log('=================================================================');
  console.log(' CHAKRI SHEBA — STEP 3B PHASE 3 VERIFIED QA TEST SUITE');
  console.log(' Timestamp:', new Date().toISOString());
  console.log('=================================================================\\n');

  // Record baseline store counts
  const baselineJobs = serverDB.getJobs();
  const baselineDrafts = serverDB.getCircularDrafts();
  const baselineSources = serverDB.getJobSources();

  console.log(`[BASELINE AUDIT] Canonical Jobs: ${baselineJobs.length}, Drafts: ${baselineDrafts.length}, Sources: ${baselineSources.length}`);
  assert(baselineJobs.length === 9, 'Baseline 1: Canonical jobs count is strictly 9', `Count: ${baselineJobs.length}`);
  assert(baselineDrafts.length === 1, 'Baseline 2: Review drafts count is strictly 1', `Count: ${baselineDrafts.length}`);
  assert(baselineSources.length === 3, 'Baseline 3: Registered sources count is strictly 3', `Count: ${baselineSources.length}`);

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
  // 1. EVIDENCE INTEGRITY & NO INFERRED DEFAULTS (FEES, VACANCIES, GRADES)
  // ---------------------------------------------------------------------------
  console.log('\\n--- 1. Evidence Integrity & No Inferred Defaults ---');

  // Test 1.1: Absent Fee is NOT defaulted to 200 or 700
  const noticeWithoutFee = {
    title: 'Assistant Director (Research)',
    organization: 'Bangladesh Bank',
    sourceUrl: 'https://erecruitment.bb.org.bd/career/job.php',
    deadline: '30 Dec, 2026'
    // govtFee completely omitted
  };
  const normNoFee = normalizeCircularNotice(noticeWithoutFee, bbSource);
  assert(normNoFee.valid, 'Test 1.1: Notice without fee is normalized successfully');
  assert(normNoFee.candidate.govtFee === 0, 'Test 1.1: Fee is 0 (not defaulted to 200 or 700)', `Fee: ${normNoFee.candidate.govtFee}`);
  assert(normNoFee.candidate.needsReview === true, 'Test 1.1: Absent fee triggers needsReview: true');
  assert(normNoFee.candidate.reviewReason.includes('ফি অনুল্লিখিত'), 'Test 1.1: Review reason notes absent fee');

  // Test 1.2: Absent Vacancies is NOT defaulted to 1
  const noticeWithoutVac = {
    title: 'Senior Officer (General)',
    organization: 'Sonali Bank PLC',
    sourceUrl: 'https://erecruitment.bb.org.bd/career/job.php',
    deadline: '30 Dec, 2026'
    // vacancies completely omitted
  };
  const normNoVac = normalizeCircularNotice(noticeWithoutVac, bbSource);
  assert(normNoVac.candidate.vacancies === 0, 'Test 1.2: Vacancies is 0 (not defaulted to 1)', `Vacancies: ${normNoVac.candidate.vacancies}`);
  assert(normNoVac.candidate.reviewReason.includes('পদসংখ্যা অনুল্লিখিত'), 'Test 1.2: Review reason notes absent vacancies');

  // Test 1.3: Absent Grade is NOT defaulted to '১০ম গ্রেড'
  assert(normNoVac.candidate.grade === 'অনির্ধারিত', 'Test 1.3: Grade is "অনির্ধারিত" (not defaulted to ১০ম গ্রেড)', `Grade: ${normNoVac.candidate.grade}`);

  // Test 1.4: Explicit Fee is preserved exactly when supported by evidence
  const noticeWithExplicitFee = {
    title: 'Assistant Programmer',
    organization: 'BPSC',
    sourceUrl: 'https://bpsc.teletalk.com.bd/ncad',
    govtFee: '৫০০ টাকা',
    vacancies: '২৫টি',
    grade: '৯ম গ্রেড',
    deadline: '20 Jan, 2027',
    rawEvidenceText: 'পরীক্ষার ফি ৫০০ টাকা এবং পদসংখ্যা ২৫টি'
  };
  const normExplicit = normalizeCircularNotice(noticeWithExplicitFee, bpscSource);
  assert(normExplicit.candidate.govtFee === 500, 'Test 1.4: Explicit fee 500 parsed correctly from Bengali numerals');
  assert(normExplicit.candidate.vacancies === 25, 'Test 1.4: Explicit vacancies 25 parsed correctly from Bengali numerals');
  assert(normExplicit.candidate.grade === '৯ম গ্রেড', 'Test 1.4: Explicit grade preserved');
  assert(normExplicit.candidate.rawEvidenceText.includes('পরীক্ষার ফি ৫০০ টাকা'), 'Test 1.4: Raw evidence text snippet stored');
  assert(Boolean(normExplicit.candidate.evidenceHash), 'Test 1.4: Deterministic evidence hash generated', `Hash: ${normExplicit.candidate.evidenceHash}`);

  // ---------------------------------------------------------------------------
  // 2. DEADLINE VALIDATION & REVIEW TRIGGERS
  // ---------------------------------------------------------------------------
  console.log('\\n--- 2. Missing & Ambiguous Deadlines ---');

  // Test 2.1: Missing deadline flags manual review
  const noticeNoDeadline = {
    title: 'Accounts Officer',
    organization: 'Agrani Bank',
    sourceUrl: 'https://erecruitment.bb.org.bd/career/job.php'
  };
  const normNoDl = normalizeCircularNotice(noticeNoDeadline, bbSource);
  assert(normNoDl.candidate.needsReview === true, 'Test 2.1: Missing deadline triggers manual review');
  assert(normNoDl.candidate.deadline.includes('পর্যালোচনা আবশ্যক'), 'Test 2.1: Missing deadline marked as awaiting review without inventing dates');

  // Test 2.2: Ambiguous / placeholder deadline flags manual review
  const noticeAwaitingDl = {
    title: 'Medical Officer',
    organization: 'BPSC',
    sourceUrl: 'https://bpsc.teletalk.com.bd/ncad',
    deadline: 'শীঘ্রই প্রকাশিত হবে'
  };
  const normAwaitingDl = normalizeCircularNotice(noticeAwaitingDl, bpscSource);
  assert(normAwaitingDl.candidate.needsReview === true, 'Test 2.2: Ambiguous/placeholder deadline triggers manual review');

  // ---------------------------------------------------------------------------
  // 3. SSRF & REDIRECT REVALIDATION SECURITY
  // ---------------------------------------------------------------------------
  console.log('\\n--- 3. SSRF & Redirect Revalidation Security ---');

  // Test 3.1: Private IP loopback blocked
  const check127 = validateSafeUrl('http://127.0.0.1/admin');
  assert(!check127.safe, 'Test 3.1: 127.0.0.1 blocked');

  // Test 3.2: Cloud metadata endpoint blocked
  const checkMetadata = validateSafeUrl('http://169.254.169.254/latest/meta-data');
  assert(!checkMetadata.safe, 'Test 3.2: 169.254.169.254 cloud metadata blocked');

  // Test 3.3: Javascript scheme blocked
  const checkJs = validateSafeUrl('javascript:alert(1)');
  assert(!checkJs.safe, 'Test 3.3: javascript: scheme blocked');

  // Test 3.4: Open redirect to internal network blocked
  const safeBase = 'https://bpsc.teletalk.com.bd/ncad/home.php';
  const evilRedirect = 'http://192.168.1.1/router/config';
  const redCheck1 = validateSafeRedirect(safeBase, evilRedirect, new Set(['bpsc.teletalk.com.bd']));
  assert(!redCheck1.safe, 'Test 3.4: Redirect to private network (192.168.x) blocked');

  // Test 3.5: Open redirect to untrusted external host blocked
  const untrustedRedirect = 'https://attacker-controlled-site.com/exploit';
  const redCheck2 = validateSafeRedirect(safeBase, untrustedRedirect, new Set(['bpsc.teletalk.com.bd']));
  assert(!redCheck2.safe, 'Test 3.5: Redirect to external unauthorized domain blocked');

  // Test 3.6: Legitimate relative redirect permitted
  const validRelativeRedirect = 'admitcard/index.php';
  const redCheck3 = validateSafeRedirect(safeBase, validRelativeRedirect, new Set(['bpsc.teletalk.com.bd']));
  assert(redCheck3.safe, 'Test 3.6: Legitimate relative redirect to same domain allowed', `Resolved: ${redCheck3.resolvedUrl}`);

  // ---------------------------------------------------------------------------
  // 4. PARSER NOISE FILTERING & BOT CHALLENGE RECOVERY
  // ---------------------------------------------------------------------------
  console.log('\\n--- 4. Parser Noise Filtering & Bot Challenge Recovery ---');

  // Test 4.1: BB Parser discards navigational menu links
  const bbNavNoiseHtml = `
    <div class="color_menu">
      <a href="https://www.bb.org.bd" class="menu">BB Website</a>
      <button class="w3-button">Job Circulars/Notices</button>
      <a href="/onlineapp/joblist.php">Online Application</a>
      <a href="/faq.php">FAQ</a>
    </div>
  `;
  const bbNoiseResult = parseBbHtml(bbNavNoiseHtml, bbSource);
  assert(bbNoiseResult.candidates.length === 0, 'Test 4.1: BB Parser discards all navigational menu items', `Count: ${bbNoiseResult.candidates.length}`);

  // Test 4.2: BPSC Parser discards footer copyright and ancient 2005 admit card links
  const bpscNoiseHtml = `
    <table>
      <tr><td><a href="/bcs27" class="mainlink">Admit Card for 27th BCS Examination 2005</a></td></tr>
      <tr><td><a href="/bcs51" class="mainlink">51st BCS (Special) Examination 2026</a></td></tr>
      <tr><td class="captionL">BCS</td></tr>
      <tr><td>&copy;2026 BPSC, Bangladesh Public Service Commission, All Rights Reserved.</td></tr>
    </table>
  `;
  const bpscNoiseResult = parseBpscHtml(bpscNoiseHtml, bpscSource);
  assert(bpscNoiseResult.candidates.length === 1, 'Test 4.2: BPSC Parser discards footers and old 2005 cards, keeps only active 51st BCS', `Count: ${bpscNoiseResult.candidates.length}`);
  if (bpscNoiseResult.candidates.length === 1) {
    assert(bpscNoiseResult.candidates[0].title.includes('51st BCS'), 'Test 4.2: Retained candidate is 51st BCS');
  }

  // Test 4.3: Captcha challenge handled gracefully
  const captchaResult = parseBbHtml(FIXTURE_BB_CAPTCHA_CHALLENGE, bbSource);
  assert(captchaResult.isCaptchaBlocked === true, 'Test 4.3: Captcha challenge detected and flagged cleanly without error');

  // ---------------------------------------------------------------------------
  // 5. SIMILAR TITLES UNDER SAME ORGANIZATION (NO FALSE MERGES)
  // ---------------------------------------------------------------------------
  console.log('\\n--- 5. Deduplication: Similar Titles Preserved ---');

  const parsedSimilar = parseBbHtml(FIXTURE_BB_DISTINCT_SIMILAR_TITLES, bbSource);
  assert(parsedSimilar.candidates.length === 2, 'Test 5.1: Parsed 2 similar roles');
  if (parsedSimilar.candidates.length === 2) {
    const cGeneral = parsedSimilar.candidates[0];
    const cIT = parsedSimilar.candidates[1];
    const match = calculateDuplicateMatch(cIT, [{ officialLink: cGeneral.sourceUrl, ...cGeneral }], []);
    assert(!match.isMatch, 'Test 5.2: Assistant Director (General) and Assistant Director (IT) are NOT merged as duplicates', `isMatch: ${match.isMatch}`);
  }

  // ---------------------------------------------------------------------------
  // 6. MATERIAL UPDATE PROPOSAL (NO DIRECT PUBLISHED OVERWRITE)
  // ---------------------------------------------------------------------------
  console.log('\\n--- 6. Material Updates: Reviewable Proposal Queue ---');

  // Create a candidate that matches canonical job-877477 by title & org, but has extended deadline
  const publishedJob = baselineJobs.find(j => j.id === 'job-877477');
  assert(Boolean(publishedJob), 'Test 6.1: Published job-877477 found in baseline');

  if (publishedJob) {
    const candidateMaterialUpdate = {
      id: 'draft-update-rupali-02',
      sourceId: 'bb-erecruitment',
      sourceName: 'Bangladesh Bank e-Recruitment System',
      sourceUrl: publishedJob.officialLink,
      title: publishedJob.title,
      organization: publishedJob.organization,
      category: 'bank',
      grade: '৯ম গ্রেড',
      vacancies: publishedJob.totalPosts + 10, // Changed vacancies!
      minEducation: 'স্নাতক',
      salary: '২২,০০০ - ৫৩,০৬০ টাকা',
      deadline: '৩১ জানুয়ারি ২০২৭', // Extended deadline!
      govtFee: 200,
      confidenceScore: 0.98,
      contentHash: 'hash-update-test',
      extractedAt: new Date().toISOString()
    };

    const duplicateCheck = calculateDuplicateMatch(candidateMaterialUpdate, [publishedJob], []);
    assert(duplicateCheck.isMatch === true, 'Test 6.2: Match detected against published job');
    assert(duplicateCheck.isMaterialUpdate === true, 'Test 6.3: Flagged as material update (deadline/vacancy altered)');

    // Ingest the material update into isolated test store
    const ingestionReport = ingestDiscoveredCandidates([candidateMaterialUpdate]);
    assert(ingestionReport.updatesDetected === 1, 'Test 6.4: Ingestion reports updatesDetected: 1');
    assert(ingestionReport.newDraftsCreated === 0, 'Test 6.4: Reports newDraftsCreated: 0 (update, not completely new)');

    // Verify published job was NEVER overwritten directly
    const jobsAfterUpdate = serverDB.getJobs();
    const unchangedPublished = jobsAfterUpdate.find(j => j.id === 'job-877477');
    assert(unchangedPublished.deadline === publishedJob.deadline, 'Test 6.5: Published job deadline is UNTOUCHED (zero direct write)', `Published DL: ${unchangedPublished.deadline}`);
    assert(unchangedPublished.totalPosts === publishedJob.totalPosts, 'Test 6.5: Published job totalPosts is UNTOUCHED');

    // Verify update proposal draft was created in pending_review
    const draftsAfterUpdate = serverDB.getCircularDrafts();
    const proposalDraft = draftsAfterUpdate.find(d => d.id === 'draft-update-rupali-02-update');
    assert(Boolean(proposalDraft), 'Test 6.6: Material update proposal draft created in review queue');
    if (proposalDraft) {
      assert(proposalDraft.status === 'pending_review', 'Test 6.6: Proposal draft has status: pending_review');
      assert(proposalDraft.notes.includes('[আপডেট খসড়া]'), 'Test 6.6: Notes identify it as an update proposal');
    }

    // Clean up update test draft
    if (proposalDraft) {
      serverDB.deleteCircularDraft(proposalDraft.id);
    }
  }

  // ---------------------------------------------------------------------------
  // 7. INGESTION IDEMPOTENCY & DB ISOLATION INVARIANTS
  // ---------------------------------------------------------------------------
  console.log('\\n--- 7. Ingestion Idempotency & DB Isolation ---');

  const testNotice = {
    title: 'Assistant Director (Legal)',
    organization: 'Bangladesh Bank',
    sourceUrl: 'https://erecruitment.bb.org.bd/onlineapp/joblist.php?id=legal-01',
    refNo: 'BB-LEGAL-2026-99',
    deadline: '28 Feb, 2027',
    govtFee: 200,
    vacancies: 5
  };
  const normTest = normalizeCircularNotice(testNotice, bbSource);
  assert(normTest.valid, 'Test 7.1: Normalized test notice');

  // Ingestion #1
  const rep1 = ingestDiscoveredCandidates([normTest.candidate]);
  assert(rep1.newDraftsCreated === 1, 'Test 7.2: First ingestion creates exactly 1 draft', `Created: ${rep1.newDraftsCreated}`);

  // Ingestion #2 (Idempotency)
  const rep2 = ingestDiscoveredCandidates([normTest.candidate]);
  assert(rep2.newDraftsCreated === 0, 'Test 7.3: Repeated ingestion creates ZERO duplicate drafts (Idempotent)', `Created: ${rep2.newDraftsCreated}`);
  assert(rep2.duplicatesIgnored === 1, 'Test 7.3: Duplicate correctly ignored');

  // Verify published jobs count remained strictly 9 throughout
  const jobsFinal = serverDB.getJobs();
  assert(jobsFinal.length === 9, 'Test 7.4: Canonical published jobs count remained strictly 9', `Jobs: ${jobsFinal.length}`);

  // Clean up created test draft
  serverDB.deleteCircularDraft(normTest.candidate.id);

  // Verify drafts count restored to baseline (1)
  const draftsFinal = serverDB.getCircularDrafts();
  assert(draftsFinal.length === 1, 'Test 7.5: Review drafts count restored to baseline 1', `Drafts: ${draftsFinal.length}`);
  assert(draftsFinal[0].id === 'draft-rupali-01', 'Test 7.5: Original baseline draft draft-rupali-01 preserved intact');

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\\n=================================================================');
  console.log(` TEST EXECUTION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('=================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runPhase3Tests().catch(err => {
  console.error('[FATAL] Phase 3 QA Runner Failed:', err);
  process.exit(1);
});
