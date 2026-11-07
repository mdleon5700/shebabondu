import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyWorkerAuth } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { ingestDiscoveredCandidates } from '@/lib/collector/ingestion';
import { NormalizedCircularCandidate } from '@/lib/collector/types';

const ALLOWED_CATEGORIES: Array<NormalizedCircularCandidate['category']> = [
  'govt', 'bank', 'railway', 'defense', 'teacher', 'ngo', 'private', 'health'
];

function sanitizeCategory(cat?: string): NormalizedCircularCandidate['category'] {
  if (cat && ALLOWED_CATEGORIES.includes(cat as any)) {
    return cat as NormalizedCircularCandidate['category'];
  }
  return 'govt';
}

export async function POST(req: Request) {
  if (!verifyWorkerAuth(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Valid worker authorization token required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'INVALID_REQUEST: JSON payload required.' }, { status: 400 });
    }

    const taskId = String(body.taskId || 'unknown_task');
    const sourceId = String(body.sourceId || 'teletalk-alljobs');

    const source = serverDB.getJobSourceById(sourceId);
    const sourceName = source?.name || 'Local Automated Worker';

    // Support single or multiple candidate submissions
    const rawCandidates: any[] = Array.isArray(body.candidates)
      ? body.candidates
      : body.candidate
      ? [body.candidate]
      : [];

    if (rawCandidates.length === 0) {
      // Worker ran but found no new items (e.g., zero updates)
      if (source) {
        serverDB.updateJobSource(sourceId, {
          fetchStatus: 'active',
          lastSuccessfulScanAt: new Date().toISOString()
        });
      }
      return NextResponse.json({
        success: true,
        taskId,
        sourceId,
        message: 'No candidates in payload. Source marked as up-to-date.',
        ingestedCount: 0
      });
    }

    const normalizedCandidates: NormalizedCircularCandidate[] = [];

    for (const item of rawCandidates) {
      if (!item || typeof item !== 'object') continue;

      const title = String(item.title || item.extractedTitle || '').trim();
      const org = String(item.organization || item.extractedOrg || '').trim();
      const sourceUrl = String(item.sourceUrl || source?.sourceUrl || '').trim();

      if (!title || !org) {
        continue; // Discard malformed items without title or org
      }

      const contentHash = crypto
        .createHash('sha256')
        .update(`${title}|${org}|${item.deadline || ''}|${item.pdfUrl || ''}`)
        .digest('hex');

      const candidateId = item.id
        ? String(item.id)
        : `worker_${sourceId}_${contentHash.substring(0, 12)}`;

      const vacancies = typeof item.vacancies === 'number'
        ? item.vacancies
        : parseInt(String(item.vacancies || '0').replace(/[^\d]/g, ''), 10) || 1;

      const govtFee = typeof item.govtFee === 'number'
        ? item.govtFee
        : parseInt(String(item.govtFee || '0').replace(/[^\d]/g, ''), 10) || 0;

      const normCandidate: NormalizedCircularCandidate = {
        id: candidateId,
        refNo: item.refNo ? String(item.refNo).trim() : undefined,
        sourceId,
        sourceName,
        sourceUrl,
        evidenceUrl: item.evidenceUrl ? String(item.evidenceUrl).trim() : sourceUrl,
        pdfUrl: item.pdfUrl ? String(item.pdfUrl).trim() : undefined,
        title,
        organization: org,
        category: sanitizeCategory(item.category),
        grade: String(item.grade || 'গ্রেড উল্লেখ নেই').trim(),
        vacancies,
        minEducation: String(item.minEducation || 'বিজ্ঞপ্তি দেখুন').trim(),
        salary: String(item.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী').trim(),
        deadline: String(item.deadline || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]).trim(),
        govtFee,
        confidenceScore: typeof item.confidenceScore === 'number' ? item.confidenceScore : 0.95,
        contentHash,
        extractedAt: new Date().toISOString(),
        rawEvidenceText: item.rawEvidenceText ? String(item.rawEvidenceText) : undefined,
        evidenceHash: item.checksumSha256 || item.evidenceHash || contentHash,
        needsReview: true, // Always require review before publishing
        reviewReason: item.reviewReason || 'স্বয়ংক্রিয় লোকাল এআই এক্সট্র্যাকশন — অ্যাডমিন পর্যালোচনা প্রয়োজন',
        extractionWarnings: Array.isArray(item.extractionWarnings) ? item.extractionWarnings : [],
        rawMetadata: {
          submittedVia: 'hybrid_local_worker',
          taskId,
          modelUsed: item.modelUsed || 'local_qwen_or_gemini',
          collectedAt: new Date().toISOString()
        }
      };

      normalizedCandidates.push(normCandidate);
    }

    // Ingest candidates into review drafts (NEVER auto-publish to live jobs directly)
    const report = ingestDiscoveredCandidates(normalizedCandidates, 'HYBRID_WORKER');

    // Update source status
    if (source) {
      serverDB.updateJobSource(sourceId, {
        fetchStatus: 'active',
        lastSuccessfulScanAt: new Date().toISOString(),
        healthStatus: 'healthy'
      });
    }

    return NextResponse.json({
      success: true,
      taskId,
      sourceId,
      submittedTotal: rawCandidates.length,
      processedTotal: normalizedCandidates.length,
      report: {
        newDraftsCreated: report.newDraftsCreated,
        updatesDetected: report.updatesDetected,
        duplicatesIgnored: report.duplicatesIgnored,
        invalidRejected: report.invalidRejected,
        errors: report.errors
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'SUBMISSION_ERROR' }, { status: 500 });
  }
}
