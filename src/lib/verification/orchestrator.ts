/**
 * Master Verification Orchestrator
 * Coordinates deterministic validations, Gemini AI fact checking, confidence scoring,
 * and admin conflict resolution workflows.
 */
import { serverDB } from '@/lib/db';
import { CircularDraft } from '@/lib/types';
import { 
  VerificationResult, 
  VerificationStatus,
  AdminCorrection 
} from './types';
import { classifySourceAuthority } from './source_authority';
import { 
  validateDocumentAvailability, 
  buildDeterministicFieldVerifications, 
  detectCancellationOrRevision 
} from './deterministic_engine';
import { runGeminiVerification } from './gemini_provider';
import { evaluateVerificationConfidence } from './confidence_engine';

export async function verifyCircularDraft(
  draftId: string,
  options: {
    skipAi?: boolean;
    forceRerun?: boolean;
    adminId?: string;
  } = {}
): Promise<VerificationResult> {
  const drafts = serverDB.getCircularDrafts();
  const draft = drafts.find(d => d.id === draftId);

  if (!draft) {
    throw new Error(`খসড়া সার্কুলার ID "${draftId}" খুঁজে পাওয়া যায়নি`);
  }

  // 1. Source Authority Classification
  const sourceAuthority = classifySourceAuthority(draft.sourceUrl);

  // 2. Official Document Availability & Integrity
  const documentValidation = validateDocumentAvailability(draft);

  // 3. Deterministic Field Concordance
  const fields = buildDeterministicFieldVerifications(draft, documentValidation);

  // 4. Cancellation & Revision Detection
  const cancellationStatus = detectCancellationOrRevision(draft);

  // 5. Gemini AI Verification Agent (with graceful deterministic fallback)
  let geminiResult = undefined;
  if (!options.skipAi) {
    try {
      const pdfText = draft.pdfEvidence?.rawTextByPage?.map(p => `[Page ${p.pageNumber}]: ${p.text}`).join('\n');
      const aiResponse = await runGeminiVerification({
        draftId: draft.id,
        draftTitle: draft.extractedTitle,
        draftOrg: draft.extractedOrg,
        sourceUrl: draft.sourceUrl,
        vacancies: draft.vacancies,
        deadline: draft.deadline,
        salary: draft.salary,
        govtFee: draft.govtFee,
        minEducation: draft.minEducation,
        sourceEvidenceText: draft.rawEvidenceText || '',
        pdfEvidenceText: pdfText,
        refNo: draft.refNo
      });

      geminiResult = aiResponse.result;

      // Persist AI usage log
      serverDB.recordAiUsageLog(aiResponse.usageLog);

      // If AI extracted age or education conditions, incorporate into fields
      if (geminiResult.eligibilityAnalysis?.age?.rawText && fields.ageLimit) {
        fields.ageLimit.evidenceSnippet = geminiResult.eligibilityAnalysis.age.rawText;
        if (geminiResult.eligibilityAnalysis.age.isSupported) {
          fields.ageLimit.verificationStatus = 'SUPPORTED_BY_EVIDENCE';
          fields.ageLimit.confidence = 0.95;
          fields.ageLimit.reviewRequired = false;
        }
      }

      if (geminiResult.eligibilityAnalysis?.education?.degree && fields.minEducation) {
        fields.minEducation.evidenceSnippet = geminiResult.eligibilityAnalysis.education.rawText || fields.minEducation.evidenceSnippet;
      }
    } catch (err: any) {
      console.warn(`Gemini verification error on draft ${draft.id}:`, err.message);
    }
  }

  // 6. Confidence Scoring & State Machine Transition
  const confidence = evaluateVerificationConfidence({
    sourceAuthority,
    documentValidation,
    fields,
    geminiResult,
    isCancellation: cancellationStatus.isCancellation,
    isRevised: cancellationStatus.isRevised,
    isExtended: cancellationStatus.isExtended
  });

  // 7. Unresolved Warnings Compilation
  const unresolvedWarnings: string[] = [];
  if (cancellationStatus.summary) {
    unresolvedWarnings.push(cancellationStatus.summary);
  }
  for (const [key, f] of Object.entries(fields)) {
    if (f.verificationStatus === 'CONFLICTING') {
      unresolvedWarnings.push(`${key}: ${f.conflictReason || 'তথ্যগত বিরোধ'}`);
    } else if (f.reviewRequired && f.verificationStatus !== 'VERIFIED') {
      unresolvedWarnings.push(`${key}: তথ্য পর্যালোচনা আবশ্যক`);
    }
  }
  if (geminiResult?.detectedIssues && geminiResult.detectedIssues.length > 0) {
    unresolvedWarnings.push(...geminiResult.detectedIssues);
  }

  // 8. Construct Natural Bengali Summary
  let bengaliSummary = `সার্কুলারটি ${sourceAuthority.authorityLabel} থেকে সংগৃহীত। `;
  if (documentValidation.isValidPdf) {
    bengaliSummary += `অফিসিয়াল PDF ডকুমেন্ট (${documentValidation.pageCount} পৃষ্ঠা) যাচাই করা হয়েছে। `;
  }
  if (confidence.status === 'VERIFIED') {
    bengaliSummary += 'বিজ্ঞপ্তির সকল মৌলিক তথ্যাবলি (পদ, ডেডলাইন, বেতন, ফি) সম্পূর্ণ সঠিক ও সমর্থিত রয়েছে।';
  } else if (confidence.status === 'VERIFIED_WITH_WARNINGS') {
    bengaliSummary += 'বিজ্ঞপ্তিতে কিছু সতর্কতা পাওয়া গেছে, তবে এটি প্রকাশের যোগ্য। অ্যাডমিন পর্যালোচনা করতে পারেন।';
  } else if (confidence.status === 'CONFLICT_DETECTED') {
    bengaliSummary += 'HTML ও PDF ডকুমেন্টের মধ্যে তথ্যগত অমিল (দ্বন্দ্ব) চিহ্নিত হয়েছে। মানব অ্যাডমিনের সিদ্ধান্ত প্রয়োজন।';
  } else {
    bengaliSummary += 'বিজ্ঞপ্তিটির কিছু গুরুত্বপূর্ণ তথ্য নিশ্চিত না হওয়ায় বা বিশেষ নোটিশ থাকায় মানব পর্যালোচনা আবশ্যক।';
  }

  if (geminiResult?.bengaliExplanation) {
    bengaliSummary += ` AI পর্যবেক্ষণ: ${geminiResult.bengaliExplanation}`;
  }

  const result: VerificationResult = {
    draftId: draft.id,
    sourceId: draft.sourceName,
    verifiedAt: new Date().toISOString(),
    status: confidence.status,
    confidenceScore: confidence.overallScore,
    confidenceBand: confidence.confidenceBand,
    confidenceReasons: confidence.reasons,
    sourceAuthority,
    documentValidation,
    htmlPdfComparison: draft.htmlPdfComparison,
    fields,
    geminiVerification: geminiResult,
    eligibility: geminiResult?.eligibilityAnalysis,
    isCancellationNotice: cancellationStatus.isCancellation,
    isUpdateProposal: false,
    unresolvedWarnings,
    bengaliSummary,
    scoreBreakdown: confidence.breakdown,
    verifiedData: {
      organization: String(fields.organizationName?.normalizedValue || draft.extractedOrg),
      title: String(fields.title?.normalizedValue || draft.extractedTitle),
      vacancies: Number(fields.vacancies?.normalizedValue || draft.vacancies),
      deadline: String(fields.deadline?.normalizedValue || draft.deadline),
      salary: String(fields.salary?.normalizedValue || draft.salary),
      govtFee: Number(fields.govtFee?.normalizedValue || draft.govtFee),
      category: draft.category,
      grade: draft.grade,
      minEducation: String(fields.minEducation?.normalizedValue || draft.minEducation),
      ageLimit: String(fields.ageLimit?.normalizedValue || '১৮ হতে ৩০ বছর'),
      applicationUrl: draft.sourceUrl,
      refNo: draft.refNo
    },
    adminCorrections: draft.adminCorrections
  };

  // 9. Send Admin Notification if critical conflict or cancellation
  if (confidence.status === 'CONFLICT_DETECTED') {
    serverDB.addAdminNotification('সার্কুলারে তথ্যগত দ্বন্দ্ব সনাক্ত', `খসড়া "${draft.extractedTitle}" এ তথ্যগত অমিল রয়েছে। অ্যাডমিন পর্যালোচনা আবশ্যক।`);
  } else if (cancellationStatus.isCancellation) {
    serverDB.addAdminNotification('নিয়োগ স্থগিত/বাতিল নোটিশ সনাক্ত', `খসড়া "${draft.extractedTitle}" নিয়োগ কার্যক্রম স্থগিত বা বাতিল সংক্রান্ত বলে চিহ্নিত হয়েছে।`);
  }

  // 10. Save Verification Result into Database & Attach to Draft
  serverDB.saveVerificationResult(result);
  
  draft.verificationResult = result;
  draft.confidenceScore = confidence.overallScore;
  draft.needsReview = confidence.status === 'NEEDS_MANUAL_REVIEW' || confidence.status === 'CONFLICT_DETECTED';
  draft.isCancellationNotice = cancellationStatus.isCancellation;
  draft.conflictSummary = unresolvedWarnings;
  serverDB.saveCircularDraft(draft);

  return result;
}

/**
 * Verifies all pending drafts in batch
 */
export async function verifyAllPendingDrafts(adminId?: string): Promise<{
  totalProcessed: number;
  verifiedCount: number;
  warningsCount: number;
  conflictsCount: number;
  needsReviewCount: number;
  results: VerificationResult[];
}> {
  const drafts = serverDB.getCircularDrafts();
  const results: VerificationResult[] = [];
  let verifiedCount = 0;
  let warningsCount = 0;
  let conflictsCount = 0;
  let needsReviewCount = 0;

  for (const draft of drafts) {
    try {
      const res = await verifyCircularDraft(draft.id, { adminId });
      results.push(res);
      if (res.status === 'VERIFIED') verifiedCount++;
      else if (res.status === 'VERIFIED_WITH_WARNINGS') warningsCount++;
      else if (res.status === 'CONFLICT_DETECTED') conflictsCount++;
      else needsReviewCount++;
    } catch (err: any) {
      console.warn(`Failed to verify draft ${draft.id}:`, err.message);
    }
  }

  return {
    totalProcessed: results.length,
    verifiedCount,
    warningsCount,
    conflictsCount,
    needsReviewCount,
    results
  };
}

/**
 * Resolves a field conflict with audited human decision
 * Accepts either an object parameter or positional arguments
 */
export function resolveFieldConflict(
  param1: string | { draftId: string; fieldName: string; chosenValue: any; rationale: string; resolvedBy: string },
  param2?: string,
  param3?: any,
  param4?: string,
  param5?: string
): VerificationResult {
  let draftId: string;
  let fieldName: string;
  let chosenValue: any;
  let resolvedBy: string;
  let rationale: string;

  if (typeof param1 === 'object') {
    draftId = param1.draftId;
    fieldName = param1.fieldName;
    chosenValue = param1.chosenValue;
    rationale = param1.rationale;
    resolvedBy = param1.resolvedBy;
  } else {
    draftId = param1;
    fieldName = param2!;
    chosenValue = param3;
    resolvedBy = param4 || 'admin';
    rationale = param5 || 'অ্যাডমিন কর্তৃক বিরোধ সমাধান করা হয়েছে';
  }

  const drafts = serverDB.getCircularDrafts();
  const draft = drafts.find(d => d.id === draftId);
  if (!draft) {
    throw new Error(`খসড়া সার্কুলার ID "${draftId}" পাওয়া যায়নি`);
  }

  const result = draft.verificationResult || serverDB.getVerificationResult(draftId);
  if (!result) {
    throw new Error('সার্কুলারটির পূর্বে কোনো যাচাইকরণ ফলাফল সংরক্ষিত নেই');
  }

  if (result.fields[fieldName]) {
    const f = result.fields[fieldName];
    f.normalizedValue = chosenValue;
    f.verificationStatus = 'VERIFIED';
    f.reviewRequired = false;
    f.conflictReason = undefined;
    f.sourceType = 'ADMIN';
  }

  // Update corresponding field in draft
  if (fieldName === 'vacancies') draft.vacancies = Number(chosenValue) || 0;
  if (fieldName === 'deadline') draft.deadline = String(chosenValue);
  if (fieldName === 'govtFee') draft.govtFee = Number(chosenValue) || 0;
  if (fieldName === 'minEducation') draft.minEducation = String(chosenValue);
  if (fieldName === 'title') draft.extractedTitle = String(chosenValue);
  if (fieldName === 'organizationName') draft.extractedOrg = String(chosenValue);

  // Update verifiedData in result
  if (fieldName === 'vacancies') result.verifiedData.vacancies = Number(chosenValue) || 0;
  if (fieldName === 'deadline') result.verifiedData.deadline = String(chosenValue);
  if (fieldName === 'govtFee') result.verifiedData.govtFee = Number(chosenValue) || 0;
  if (fieldName === 'minEducation') result.verifiedData.minEducation = String(chosenValue);
  if (fieldName === 'title') result.verifiedData.title = String(chosenValue);
  if (fieldName === 'organizationName') result.verifiedData.organization = String(chosenValue);

  // Clear warning for resolved field
  result.unresolvedWarnings = (result.unresolvedWarnings || []).filter(w => !w.startsWith(fieldName + ':'));

  // Re-check if any conflicts remain
  const remainingConflicts = Object.values(result.fields).filter(f => f.verificationStatus === 'CONFLICTING');
  if (remainingConflicts.length === 0 && result.status === 'CONFLICT_DETECTED') {
    result.status = result.unresolvedWarnings.length > 0 ? 'VERIFIED_WITH_WARNINGS' : 'VERIFIED';
    draft.needsReview = false;
  }

  result.verifiedAt = new Date().toISOString();
  serverDB.saveVerificationResult(result);
  draft.verificationResult = result;
  serverDB.saveCircularDraft(draft);

  return result;
}

/**
 * Records an audited manual correction to a verified field
 * Accepts either an object parameter or positional arguments
 */
export function correctDraftField(
  param1: string | { draftId: string; fieldName: string; correctedValue: any; correctionReason: string; correctedBy: string },
  param2?: string,
  param3?: any,
  param4?: string,
  param5?: string
): {
  draft: CircularDraft;
  correction: AdminCorrection;
} {
  let draftId: string;
  let fieldName: string;
  let correctedValue: any;
  let correctedBy: string;
  let correctionReason: string;

  if (typeof param1 === 'object') {
    draftId = param1.draftId;
    fieldName = param1.fieldName;
    correctedValue = param1.correctedValue;
    correctionReason = param1.correctionReason;
    correctedBy = param1.correctedBy;
  } else {
    draftId = param1;
    fieldName = param2!;
    correctedValue = param3;
    correctedBy = param4 || 'admin';
    correctionReason = param5 || 'অ্যাডমিন কর্তৃক ফিল্ড সংশোধন করা হয়েছে';
  }

  const drafts = serverDB.getCircularDrafts();
  const draft = drafts.find(d => d.id === draftId);
  if (!draft) {
    throw new Error(`খসড়া সার্কুলার ID "${draftId}" পাওয়া যায়নি`);
  }

  const previousValue = (draft as any)[fieldName] || 
    (draft.verificationResult?.fields[fieldName]?.normalizedValue);

  const correction: AdminCorrection = {
    id: `corr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    draftId: draft.id,
    field: fieldName,
    previousValue,
    correctedValue,
    correctedBy,
    correctedAt: new Date().toISOString(),
    reason: correctionReason
  };

  // Mutate draft property
  if (fieldName === 'vacancies') draft.vacancies = Number(correctedValue) || 0;
  if (fieldName === 'deadline') draft.deadline = String(correctedValue);
  if (fieldName === 'govtFee') draft.govtFee = Number(correctedValue) || 0;
  if (fieldName === 'minEducation') draft.minEducation = String(correctedValue);
  if (fieldName === 'salary') draft.salary = String(correctedValue);
  if (fieldName === 'title') draft.extractedTitle = String(correctedValue);
  if (fieldName === 'organizationName') draft.extractedOrg = String(correctedValue);

  if (!draft.adminCorrections) {
    draft.adminCorrections = [];
  }
  draft.adminCorrections.push(correction);

  // Sync with verificationResult if present
  if (draft.verificationResult?.fields[fieldName]) {
    const f = draft.verificationResult.fields[fieldName];
    f.normalizedValue = correctedValue;
    f.verificationStatus = 'VERIFIED';
    f.reviewRequired = false;
    f.sourceType = 'ADMIN';
  }

  if (draft.verificationResult) {
    if (fieldName === 'vacancies') draft.verificationResult.verifiedData.vacancies = Number(correctedValue) || 0;
    if (fieldName === 'deadline') draft.verificationResult.verifiedData.deadline = String(correctedValue);
    if (fieldName === 'govtFee') draft.verificationResult.verifiedData.govtFee = Number(correctedValue) || 0;
    if (fieldName === 'minEducation') draft.verificationResult.verifiedData.minEducation = String(correctedValue);
    if (fieldName === 'title') draft.verificationResult.verifiedData.title = String(correctedValue);
    if (fieldName === 'organizationName') draft.verificationResult.verifiedData.organization = String(correctedValue);

    serverDB.saveVerificationResult(draft.verificationResult);
  }

  serverDB.saveCircularDraft(draft);

  return { draft, correction };
}
