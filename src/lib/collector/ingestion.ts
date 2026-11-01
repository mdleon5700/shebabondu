import { NormalizedCircularCandidate, IngestionReport } from './types';
import { CircularDraft } from '@/lib/types';
import { serverDB } from '@/lib/db';
import { calculateDuplicateMatch } from './normalizer';

export function ingestDiscoveredCandidates(
  candidates: NormalizedCircularCandidate[],
  adminId = 'SYSTEM_COLLECTOR'
): IngestionReport {
  const existingJobs = serverDB.getJobs();
  const existingDrafts = serverDB.getCircularDrafts();

  let sourceId = '';
  let newDraftsCreated = 0;
  let updatesDetected = 0;
  let duplicatesIgnored = 0;
  let invalidRejected = 0;
  const createdOrUpdatedDrafts: CircularDraft[] = [];
  const errors: string[] = [];

  for (const candidate of candidates) {
    if (!sourceId && candidate.sourceId) {
      sourceId = candidate.sourceId;
    }

    // Safety check on candidate payload
    if (!candidate.title || !candidate.organization || !candidate.sourceUrl) {
      invalidRejected++;
      errors.push(`Rejected incomplete candidate: "${candidate.title || 'Unknown'}"`);
      continue;
    }

    // Run deduplication check
    const match = calculateDuplicateMatch(candidate, existingJobs, existingDrafts);

    if (match.isMatch) {
      if (match.isMaterialUpdate) {
        // Material circular change detected (e.g. deadline extended, vacancies altered)
        // Store as reviewable update draft, NEVER auto-update public canonical jobs directly
        const updateDraftId = candidate.id.endsWith('-update') ? candidate.id : `${candidate.id}-update`;
        const updateDraft: CircularDraft = {
          id: updateDraftId,
          sourceName: candidate.sourceName,
          sourceUrl: candidate.sourceUrl,
          evidenceUrl: candidate.evidenceUrl,
          extractedTitle: candidate.title,
          extractedOrg: candidate.organization,
          category: candidate.category,
          grade: candidate.grade,
          deadline: candidate.deadline,
          vacancies: candidate.vacancies,
          minEducation: candidate.minEducation,
          salary: candidate.salary,
          govtFee: candidate.govtFee,
          confidenceScore: candidate.confidenceScore,
          duplicateDetected: true,
          status: 'pending_review',
          approvedJobId: match.matchedTarget === 'job' ? match.matchedId : undefined,
          notes: `[আপডেট খসড়া] মূল সার্কুলারে পরিবর্তন শনাক্ত হয়েছে: ${match.reason}`,
          createdAt: new Date().toISOString(),
          refNo: candidate.refNo,
          rawEvidenceText: candidate.rawEvidenceText,
          evidenceHash: candidate.evidenceHash,
          needsReview: true,
          reviewReason: `মূল সার্কুলারে পরিবর্তন শনাক্ত: ${match.reason}`,
          extractionWarnings: candidate.extractionWarnings,
          pdfEvidence: candidate.pdfEvidence,
          htmlPdfComparison: candidate.htmlPdfComparison,
          isCancellationNotice: Boolean(candidate.rawMetadata?.isCancellationNotice),
          conflictSummary: candidate.htmlPdfComparison?.conflictSummary || (candidate.pdfEvidence?.isDeadlineExtended ? ['আবেদনের সময়সীমা বৃদ্ধির নোটিশ: PDF বর্ধিত তারিখ প্রযোজ্য'] : undefined)
        };

        serverDB.addCircularDraft(updateDraft);
        createdOrUpdatedDrafts.push(updateDraft);
        updatesDetected++;
      } else {
        // Exact duplicate already exists in published jobs or pending drafts
        duplicatesIgnored++;
      }
    } else {
      // Completely new circular: add to review queue as pending_review draft
      const draft: CircularDraft = {
        id: candidate.id,
        sourceName: candidate.sourceName,
        sourceUrl: candidate.sourceUrl,
        evidenceUrl: candidate.evidenceUrl,
        extractedTitle: candidate.title,
        extractedOrg: candidate.organization,
        category: candidate.category,
        grade: candidate.grade,
        deadline: candidate.deadline,
        vacancies: candidate.vacancies,
        minEducation: candidate.minEducation,
        salary: candidate.salary,
        govtFee: candidate.govtFee,
        confidenceScore: candidate.confidenceScore,
        duplicateDetected: false,
        status: 'pending_review',
        notes: candidate.needsReview
          ? `[পর্যালোচনা আবশ্যক] ${candidate.reviewReason || (candidate.extractionWarnings || []).join('; ')}`
          : candidate.rawMetadata?.notes,
        createdAt: new Date().toISOString(),
        refNo: candidate.refNo,
        rawEvidenceText: candidate.rawEvidenceText,
        evidenceHash: candidate.evidenceHash,
        needsReview: candidate.needsReview,
        reviewReason: candidate.reviewReason,
        extractionWarnings: candidate.extractionWarnings,
        pdfEvidence: candidate.pdfEvidence,
        htmlPdfComparison: candidate.htmlPdfComparison,
        isCancellationNotice: Boolean(candidate.rawMetadata?.isCancellationNotice),
        conflictSummary: candidate.htmlPdfComparison?.conflictSummary || (candidate.pdfEvidence?.isDeadlineExtended ? ['আবেদনের সময়সীমা বৃদ্ধির নোটিশ: PDF বর্ধিত তারিখ প্রযোজ্য'] : undefined)
      };

      serverDB.addCircularDraft(draft);
      createdOrUpdatedDrafts.push(draft);
      newDraftsCreated++;
    }
  }

  // Record telemetry on source
  if (sourceId) {
    const source = serverDB.getJobSourceById(sourceId);
    if (source) {
      serverDB.updateJobSource(sourceId, {
        lastFetchedAt: new Date().toISOString(),
        lastSuccessfulScanAt: new Date().toISOString(),
        fetchStatus: 'active',
        healthStatus: 'healthy',
        metrics: {
          discovered: (source.metrics?.discovered || 0) + candidates.length,
          collected: (source.metrics?.collected || 0) + newDraftsCreated,
          failed: (source.metrics?.failed || 0) + invalidRejected,
          deduplicated: (source.metrics?.deduplicated || 0) + duplicatesIgnored + updatesDetected
        }
      });
    }
  }

  return {
    sourceId,
    totalDiscovered: candidates.length,
    newDraftsCreated,
    updatesDetected,
    duplicatesIgnored,
    invalidRejected,
    drafts: createdOrUpdatedDrafts,
    errors
  };
}
