import http from 'http';
import https from 'https';
import path from 'path';
import fs from 'fs';

const { serverDB } = require(path.resolve('src/lib/db.ts'));
const { 
  BbCollectorAdapter, 
  BpscCollectorAdapter, 
  TeletalkCollectorAdapter,
  calculateDuplicateMatch
} = require(path.resolve('src/lib/collector/index.ts'));

async function auditLiveSource(sourceId) {
  const source = serverDB.getJobSourceById(sourceId);
  if (!source) {
    return { error: `Source not found: ${sourceId}` };
  }

  const existingJobs = serverDB.getJobs();
  const existingDrafts = serverDB.getCircularDrafts();

  let adapter;
  if (sourceId === 'bb-erecruitment') adapter = new BbCollectorAdapter();
  else if (sourceId === 'bpsc-portal') adapter = new BpscCollectorAdapter();
  else adapter = new TeletalkCollectorAdapter();

  const startTime = Date.now();
  let liveResult;

  const liveUrl = (sourceId === 'bpsc-portal' && source.sourceUrl.includes('bpsc.gov.bd'))
    ? 'https://bpsc.teletalk.com.bd'
    : source.sourceUrl;

  const targetSource = { ...source, sourceUrl: liveUrl };

  try {
    liveResult = await adapter.collect(targetSource, {
      enableLiveFetch: true,
      timeoutMs: 8000
    });
  } catch (err) {
    liveResult = {
      success: false,
      candidates: [],
      discoveredCount: 0,
      durationMs: Date.now() - startTime,
      error: { code: 'NETWORK_ERROR', message: err.message }
    };
  }

  // Deduplication & match analysis
  let newCandidates = 0;
  let matchingJobs = 0;
  let matchingDrafts = 0;
  let materialUpdates = 0;

  const candidateDetails = (liveResult.candidates || []).map((cand, idx) => {
    const match = calculateDuplicateMatch(cand, existingJobs, existingDrafts);
    if (match.isMatch) {
      if (match.isMaterialUpdate) materialUpdates++;
      else if (match.matchedTarget === 'job') matchingJobs++;
      else matchingDrafts++;
    } else {
      newCandidates++;
    }

    return {
      index: idx + 1,
      title: cand.title,
      organization: cand.organization,
      refNo: cand.refNo || null,
      vacancies: cand.vacancies,
      deadline: cand.deadline,
      govtFee: cand.govtFee,
      isMatch: match.isMatch,
      matchTarget: match.matchedTarget || null,
      matchReason: match.reason || null,
      isMaterialUpdate: match.isMaterialUpdate || false,
      evidenceUrl: cand.evidenceUrl || null,
      sourceUrl: cand.sourceUrl
    };
  });

  return {
    sourceId,
    sourceName: source.name,
    configuredUrl: source.sourceUrl,
    probedUrl: liveUrl,
    success: liveResult.success,
    durationMs: liveResult.durationMs,
    candidatesFound: (liveResult.candidates || []).length,
    newEligibleCandidates: newCandidates,
    matchingJobs,
    matchingDrafts,
    materialUpdates,
    error: liveResult.error || null,
    candidateDetails
  };
}

async function runLiveAudit() {
  console.log('=================================================================');
  console.log(' CHAKRI SHEBA — LIVE DATA ACCURACY AUDIT (3 SOURCES)');
  console.log(' Timestamp:', new Date().toISOString());
  console.log('=================================================================\n');

  const sources = ['bb-erecruitment', 'bpsc-portal', 'teletalk-alljobs'];
  const results = {};

  for (const s of sources) {
    console.log(`[AUDITING SOURCE] ${s} ...`);
    const res = await auditLiveSource(s);
    results[s] = res;
    console.log(`  Success: ${res.success}`);
    console.log(`  Probed URL: ${res.probedUrl}`);
    console.log(`  Candidates discovered: ${res.candidatesFound}`);
    console.log(`  New Eligible for Draft Review: ${res.newEligibleCandidates}`);
    console.log(`  Matching Existing Published Jobs: ${res.matchingJobs}`);
    console.log(`  Matching Existing Review Drafts: ${res.matchingDrafts}`);
    if (res.error) {
      console.log(`  Error: [${res.error.code}] ${res.error.message}`);
    }
    if (res.candidateDetails && res.candidateDetails.length > 0) {
      console.log('  Discovered Live Candidates:');
      res.candidateDetails.forEach(c => {
        console.log(`    - [#${c.index}] "${c.title}" | Org: "${c.organization}" | Ref: ${c.refNo} | Deadline: ${c.deadline}`);
        console.log(`      Match: ${c.isMatch ? `Matched (${c.matchTarget}): ${c.matchReason}` : 'NEW_ELIGIBLE'}`);
      });
    }
    console.log('');
  }

  // Save report
  fs.writeFileSync('scripts/live_audit_report.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('[COMPLETED] Live audit saved to scripts/live_audit_report.json');
}

runLiveAudit().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
