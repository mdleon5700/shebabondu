#!/usr/bin/env node
/**
 * CHAKRI SHEBA — OFFICIAL PDF CIRCULAR EXTRACTION DRY-RUN CLI
 * 
 * Usage:
 *   node scripts/pdf_dry_run.js --fixture=valid_circular
 *   node scripts/pdf_dry_run.js --fixture=bengali_dates
 *   node scripts/pdf_dry_run.js --fixture=deadline_extension
 *   node scripts/pdf_dry_run.js --source=bb-erecruitment --url=https://erecruitment.bb.org.bd/career/circular_25103.pdf
 *   node scripts/pdf_dry_run.js --fixture=valid_circular --json
 * 
 * Invariants:
 *   1. Zero mutations to persistent database (local_store.json)
 *   2. Strict security validation on all PDF URLs
 *   3. Prominent labeling: [LIVE DATA] vs [NOT LIVE] Offline Fixture
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { serverDB } = require(path.resolve('src/lib/db.ts'));
const {
  validatePdfUrlForSource,
  downloadBoundedPdf,
  extractPdfTextAndPages,
  parsePdfCircular,
  compareHtmlAndPdfCandidate,
  enrichCandidateWithPdfEvidence,
  // Fixtures
  FIXTURE_PDF_VALID_TEXT_CIRCULAR,
  FIXTURE_PDF_BENGALI_NUMERALS_DATES,
  FIXTURE_PDF_MULTIPLE_POSTS,
  FIXTURE_PDF_CATEGORY_FEES,
  FIXTURE_PDF_MISSING_FIELDS,
  FIXTURE_PDF_DEADLINE_EXTENSION,
  FIXTURE_PDF_CORRECTION_NOTICE,
  FIXTURE_PDF_CONFLICTING_DATA,
  FIXTURE_PDF_SCANNED_OCR,
  FIXTURE_PDF_EMPTY,
  FIXTURE_PDF_MALFORMED,
  FIXTURE_PDF_ENCRYPTED,
  FIXTURE_PDF_OVERSIZED_PAGES,
  FIXTURE_PDF_FAKE_SIGNATURE
} = require(path.resolve('src/lib/collector/index.ts'));

const FIXTURES_MAP = {
  valid_circular: { name: 'Valid Text Recruitment Circular', buf: FIXTURE_PDF_VALID_TEXT_CIRCULAR, sourceId: 'bb-erecruitment' },
  bengali_dates: { name: 'Bengali Numerals & Dates (Bijoy/Unicode)', buf: FIXTURE_PDF_BENGALI_NUMERALS_DATES, sourceId: 'bb-erecruitment' },
  multi_posts: { name: 'Multiple Posts with Vacancies Breakdown', buf: FIXTURE_PDF_MULTIPLE_POSTS, sourceId: 'bpsc-portal' },
  category_fees: { name: 'Category-Wise Application Fees', buf: FIXTURE_PDF_CATEGORY_FEES, sourceId: 'bpsc-portal' },
  missing_fields: { name: 'Missing Deadlines, Fees or Vacancies', buf: FIXTURE_PDF_MISSING_FIELDS, sourceId: 'bb-erecruitment' },
  deadline_extension: { name: 'Deadline Extension Notice', buf: FIXTURE_PDF_DEADLINE_EXTENSION, sourceId: 'bb-erecruitment' },
  corrigendum: { name: 'Correction / Revised Circular', buf: FIXTURE_PDF_CORRECTION_NOTICE, sourceId: 'bpsc-portal' },
  conflicting_data: { name: 'Conflicting Data (HTML vs PDF)', buf: FIXTURE_PDF_CONFLICTING_DATA, sourceId: 'bb-erecruitment' },
  scanned_ocr: { name: 'Scanned Image PDF (Requires OCR)', buf: FIXTURE_PDF_SCANNED_OCR, sourceId: 'bb-erecruitment' },
  empty: { name: 'Empty 0-Byte PDF File', buf: FIXTURE_PDF_EMPTY, sourceId: 'bb-erecruitment' },
  malformed: { name: 'Malformed Corrupted PDF', buf: FIXTURE_PDF_MALFORMED, sourceId: 'bb-erecruitment' },
  encrypted: { name: 'Encrypted / Password Protected PDF', buf: FIXTURE_PDF_ENCRYPTED, sourceId: 'bb-erecruitment' },
  oversized: { name: 'Oversized 25-Page PDF Document', buf: FIXTURE_PDF_OVERSIZED_PAGES, sourceId: 'bb-erecruitment' },
  fake_signature: { name: 'Fake Non-PDF Response (HTML payload)', buf: FIXTURE_PDF_FAKE_SIGNATURE, sourceId: 'bb-erecruitment' }
};

async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const sourceArg = args.find(a => a.startsWith('--source='))?.split('=')[1] || 'bb-erecruitment';
  const urlArg = args.find(a => a.startsWith('--url='))?.split('=')[1];
  const fixtureArg = args.find(a => a.startsWith('--fixture='))?.split('=')[1] || (!urlArg ? 'valid_circular' : undefined);

  // 1. Record Database Baseline Hash
  const dbPath = path.resolve('src/db/local_store.json');
  const dbRawBefore = fs.readFileSync(dbPath);
  const hashBefore = crypto.createHash('sha256').update(dbRawBefore).digest('hex');

  const registeredSources = serverDB.getJobSources();
  const source = registeredSources.find(s => s.id === sourceArg) || {
    id: sourceArg,
    name: sourceArg,
    sourceUrl: sourceArg === 'bpsc-portal' ? 'https://bpsc.teletalk.com.bd' : 'https://erecruitment.bb.org.bd',
    type: 'official_portal',
    fetchStatus: 'active',
    enabled: true
  };

  if (!isJson) {
    console.log('=================================================================');
    console.log(' CHAKRI SHEBA — OFFICIAL PDF CIRCULAR EXTRACTION DRY-RUN');
    console.log(` Timestamp: ${new Date().toISOString()}`);
    console.log('=================================================================');
  }

  let pdfBuffer;
  let targetPdfUrl;
  let isLive = false;

  if (urlArg) {
    isLive = true;
    targetPdfUrl = urlArg;
    if (!isJson) {
      console.log(`\n>>> DATA ORIGIN: [LIVE DATA] Real-time fetch from registered portal`);
      console.log(`>>> Target URL: ${targetPdfUrl}`);
      console.log(`>>> Registered Source: ${source.name} (${source.id})`);
    }

    const dlResult = await downloadBoundedPdf(targetPdfUrl, source);
    if (!dlResult.success || !dlResult.buffer) {
      if (isJson) {
        console.log(JSON.stringify({ success: false, error: dlResult.error, errorCode: dlResult.errorCode }, null, 2));
      } else {
        console.error(`\n[ERROR] PDF Download Failed: ${dlResult.error} (${dlResult.errorCode || 'UNKNOWN'})`);
      }
      verifyDbIntegrity(hashBefore, dbPath, isJson);
      return;
    }

    pdfBuffer = dlResult.buffer;
  } else {
    const fixtureKey = fixtureArg || 'valid_circular';
    const fixtureItem = FIXTURES_MAP[fixtureKey];
    if (!fixtureItem) {
      console.error(`[ERROR] Unknown fixture: "${fixtureKey}". Available: ${Object.keys(FIXTURES_MAP).join(', ')}`);
      return;
    }
    isLive = false;
    targetPdfUrl = `https://erecruitment.bb.org.bd/fixtures/${fixtureKey}.pdf`;
    pdfBuffer = fixtureItem.buf;

    if (!isJson) {
      console.log(`\n>>> DATA ORIGIN: [NOT LIVE] Offline Deterministic Test Fixture`);
      console.log(`>>> Fixture: ${fixtureItem.name} (${fixtureKey})`);
      console.log(`>>> Target Source: ${source.name} (${source.id})`);
    }
  }

  // Extract Text & Pages with unpdf
  const extractResult = await extractPdfTextAndPages(pdfBuffer);
  const parsedCircular = parsePdfCircular(extractResult, targetPdfUrl);

  if (isJson) {
    console.log(JSON.stringify({
      dataOrigin: isLive ? 'LIVE_DATA' : 'OFFLINE_FIXTURE',
      sourceId: source.id,
      pdfUrl: targetPdfUrl,
      extractResult: {
        success: extractResult.success,
        totalPages: extractResult.totalPages,
        pagesProcessed: extractResult.pagesProcessed,
        isScanned: extractResult.isScanned,
        requiresOcr: extractResult.requiresOcr,
        pdfHash: extractResult.pdfHash
      },
      parsedCircular
    }, null, 2));
  } else {
    console.log('\n--- PDF Extraction Summary ---');
    console.log(`Status:              ${parsedCircular.extractionStatus.toUpperCase()}`);
    console.log(`Total Pages:         ${parsedCircular.totalPages} (Processed: ${parsedCircular.pagesProcessed})`);
    console.log(`Scanned Image PDF:   ${parsedCircular.isScanned ? 'YES (OCR Required)' : 'NO (Text-based)'}`);
    console.log(`Requires OCR:        ${parsedCircular.requiresOcr ? 'YES (OCR Engine unavailable)' : 'NO'}`);
    console.log(`SHA-256 Hash:        ${parsedCircular.pdfHash}`);
    console.log(`Deadline Extension:  ${parsedCircular.isDeadlineExtended ? 'YES (Extended Deadline Notice)' : 'NO'}`);
    console.log(`Correction Notice:   ${parsedCircular.isCorrectionNotice ? 'YES (Corrigendum)' : 'NO'}`);

    console.log('\n--- Evidence-Backed Extracted Fields ---');
    const fieldEntries = Object.entries(parsedCircular.fields);
    if (fieldEntries.length === 0) {
      console.log('  (No structured fields could be extracted)');
    } else {
      for (const [key, f] of fieldEntries) {
        if (!f) continue;
        console.log(`  [Field: ${key}]`);
        console.log(`    Normalized Value:  ${JSON.stringify(f.normalizedValue)}`);
        console.log(`    Original Text:     "${f.originalText}"`);
        console.log(`    Page Number:       ${f.pageNumber}`);
        console.log(`    Extraction Method: ${f.extractionMethod}`);
        console.log(`    Confidence:        ${Math.round(f.confidence * 100)}%`);
        console.log(`    Evidence Snippet:  "${f.evidenceSnippet}"`);
      }
    }

    if (parsedCircular.warnings.length > 0) {
      console.log('\n--- Extraction Warnings ---');
      parsedCircular.warnings.forEach(w => console.log(`  * ${w}`));
    }
  }

  // Invariance Verification
  verifyDbIntegrity(hashBefore, dbPath, isJson);
}

function verifyDbIntegrity(hashBefore, dbPath, isJson) {
  const dbRawAfter = fs.readFileSync(dbPath);
  const hashAfter = crypto.createHash('sha256').update(dbRawAfter).digest('hex');

  if (hashBefore !== hashAfter) {
    console.error('\n[CRITICAL FAILURE] Database was mutated during dry-run operation!');
    console.error(`Before SHA256: ${hashBefore}`);
    console.error(`After SHA256:  ${hashAfter}`);
    process.exit(1);
  } else if (!isJson) {
    console.log('\n=================================================================');
    console.log(' DATABASE INTEGRITY AUDIT: 100% UNCHANGED (Zero Mutation Verified)');
    console.log(` Store SHA256: ${hashBefore}`);
    console.log('=================================================================');
  }
}

main().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
