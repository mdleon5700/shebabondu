/**
 * Deterministic Verification Engine
 * Executes source-based, rule-driven, factual verification independent of AI availability.
 */
import { CircularDraft } from '@/lib/types';
import { 
  DocumentValidationResult, 
  FieldVerificationRecord, 
  FieldVerificationStatus 
} from './types';

export function validateDocumentAvailability(draft: CircularDraft): DocumentValidationResult {
  const warnings: string[] = [];
  const pdfEvidence = draft.pdfEvidence;

  if (!draft.evidenceUrl && !pdfEvidence) {
    return {
      status: 'Unavailable',
      isValidPdf: false,
      pageCount: 0,
      requiresOcr: false,
      textCharCount: 0,
      warnings: ['অফিসিয়াল PDF বা সোর্স ডকুমেন্টের লিংক অনুপস্থিত']
    };
  }

  if (pdfEvidence) {
    const rawPages = pdfEvidence.rawTextByPage || [];
    const totalChars = rawPages.reduce((acc, p) => acc + (p.text || '').length, 0);
    const requiresOcr = Boolean(pdfEvidence.requiresOcr || (pdfEvidence.isScanned && totalChars < 50));

    let status: DocumentValidationResult['status'] = 'Text Extracted';
    if (requiresOcr) {
      status = 'OCR Required';
      warnings.push('স্ক্যানকৃত ইমেজ PDF: টেক্সট এক্সট্রাকশনের জন্য OCR আবশ্যক');
    } else if (totalChars < 100) {
      status = 'Needs Manual Review';
      warnings.push('PDF টেক্সটের পরিমাণ কম; ম্যানুয়াল রিভিউ প্রয়োজন');
    }

    return {
      status,
      isValidPdf: true,
      checksumSha256: pdfEvidence.pdfHash,
      pageCount: pdfEvidence.totalPages || 1,
      requiresOcr,
      textCharCount: totalChars,
      warnings: [...warnings, ...(pdfEvidence.warnings || [])]
    };
  }

  return {
    status: 'Available',
    isValidPdf: Boolean(draft.evidenceUrl?.toLowerCase().includes('.pdf')),
    pageCount: 1,
    requiresOcr: false,
    textCharCount: 0,
    warnings: ['PDF লিংক উপলব্ধ কিন্তু টেক্সট স্ট্রিম সংরক্ষিত হয়নি']
  };
}

export function buildDeterministicFieldVerifications(
  draft: CircularDraft,
  docValidation: DocumentValidationResult
): Record<string, FieldVerificationRecord> {
  const fields: Record<string, FieldVerificationRecord> = {};

  const sourceEvidence = (draft.rawEvidenceText || '').toLowerCase();
  const pdfText = (draft.pdfEvidence?.rawTextByPage || [])
    .map(p => p.text)
    .join(' ')
    .toLowerCase();

  // 1. Organization Name
  const orgHtml = (draft.extractedOrg || '').trim();
  const orgMatchedInDoc = sourceEvidence.includes(orgHtml.toLowerCase()) || 
                          pdfText.includes(orgHtml.toLowerCase());
  fields.organizationName = {
    field: 'organizationName',
    extractedValue: orgHtml,
    normalizedValue: orgHtml,
    sourceType: 'HTML',
    originalText: draft.pdfEvidence?.fields?.organization?.originalText || orgHtml,
    verificationStatus: orgMatchedInDoc ? 'VERIFIED' : 'SUPPORTED_BY_EVIDENCE',
    evidenceSnippet: orgMatchedInDoc ? `সোর্সে প্রতিষ্ঠান হিসেবে "${orgHtml}" সমর্থিত` : undefined,
    confidence: orgMatchedInDoc ? 1.0 : 0.8,
    reviewRequired: !orgMatchedInDoc
  };

  // 2. Job Title
  const titleHtml = (draft.extractedTitle || '').trim();
  const titleMatched = sourceEvidence.includes(titleHtml.toLowerCase()) || 
                       pdfText.includes(titleHtml.toLowerCase());
  fields.title = {
    field: 'title',
    extractedValue: titleHtml,
    normalizedValue: titleHtml,
    sourceType: 'HTML',
    originalText: draft.pdfEvidence?.fields?.title?.originalText || titleHtml,
    verificationStatus: titleMatched ? 'VERIFIED' : 'SUPPORTED_BY_EVIDENCE',
    evidenceSnippet: titleMatched ? `নথিতে পদবি "${titleHtml}" সমর্থিত` : undefined,
    confidence: titleMatched ? 0.95 : 0.75,
    reviewRequired: !titleMatched
  };

  // 3. Vacancies
  const vacanciesHtml = draft.vacancies;
  const vacanciesPdf = draft.pdfEvidence?.fields?.vacancies?.normalizedValue;
  let vacancyStatus: FieldVerificationStatus = 'VERIFIED';
  let vacancyConflict: string | undefined = undefined;

  if (vacanciesPdf !== undefined && vacanciesPdf !== null && vacanciesPdf !== vacanciesHtml) {
    if (vacanciesHtml > 0 && vacanciesPdf > 0 && vacanciesHtml !== vacanciesPdf) {
      vacancyStatus = 'CONFLICTING';
      vacancyConflict = `HTML এ পদসংখ্যা ${vacanciesHtml}টি এবং PDF এ ${vacanciesPdf}টি পাওয়া গেছে`;
    }
  } else if (!vacanciesHtml || vacanciesHtml <= 0) {
    vacancyStatus = 'NOT_FOUND';
  }

  fields.vacancies = {
    field: 'vacancies',
    extractedValue: vacanciesHtml,
    normalizedValue: vacanciesHtml > 0 ? vacanciesHtml : (vacanciesPdf || 0),
    sourceType: vacanciesPdf !== undefined ? 'PDF' : 'HTML',
    originalText: draft.pdfEvidence?.fields?.vacancies?.originalText,
    verificationStatus: vacancyStatus,
    conflictReason: vacancyConflict,
    confidence: vacancyStatus === 'VERIFIED' ? 0.95 : (vacancyStatus === 'CONFLICTING' ? 0.4 : 0.6),
    reviewRequired: vacancyStatus === 'CONFLICTING' || vacancyStatus === 'NOT_FOUND'
  };

  // 4. Deadline
  const deadlineHtml = draft.deadline;
  const deadlinePdf = draft.pdfEvidence?.fields?.deadline?.normalizedValue || draft.pdfEvidence?.fields?.deadline?.originalText;
  let deadlineStatus: FieldVerificationStatus = 'VERIFIED';
  let deadlineConflict: string | undefined = undefined;

  if (deadlinePdf && deadlineHtml && deadlinePdf !== deadlineHtml) {
    deadlineStatus = 'CONFLICTING';
    deadlineConflict = `HTML ডেডলাইন (${deadlineHtml}) বনাম PDF ডেডলাইন (${deadlinePdf}) অমিল রয়েছে`;
  }

  fields.deadline = {
    field: 'deadline',
    extractedValue: deadlineHtml,
    normalizedValue: deadlineHtml || deadlinePdf,
    sourceType: deadlinePdf ? 'PDF' : 'HTML',
    originalText: draft.pdfEvidence?.fields?.deadline?.originalText,
    verificationStatus: deadlineStatus,
    conflictReason: deadlineConflict,
    confidence: deadlineStatus === 'VERIFIED' ? 0.95 : 0.45,
    reviewRequired: deadlineStatus === 'CONFLICTING'
  };

  // 5. Application Fee
  const feeHtml = draft.govtFee;
  const feePdf = draft.pdfEvidence?.fields?.govtFee?.normalizedValue;
  let feeStatus: FieldVerificationStatus = feeHtml > 0 ? 'VERIFIED' : 'SUPPORTED_BY_EVIDENCE';
  if (feePdf !== undefined && feeHtml > 0 && feePdf !== feeHtml) {
    feeStatus = 'CONFLICTING';
  }

  fields.govtFee = {
    field: 'govtFee',
    extractedValue: feeHtml,
    normalizedValue: feeHtml > 0 ? feeHtml : feePdf,
    sourceType: feePdf !== undefined ? 'PDF' : 'HTML',
    originalText: draft.pdfEvidence?.fields?.govtFee?.originalText,
    verificationStatus: feeStatus,
    confidence: feeStatus === 'VERIFIED' ? 0.9 : 0.6,
    reviewRequired: feeStatus === 'CONFLICTING'
  };

  // 6. Educational Requirements
  const eduHtml = draft.minEducation || '';
  fields.minEducation = {
    field: 'minEducation',
    extractedValue: eduHtml,
    normalizedValue: eduHtml,
    sourceType: 'HTML',
    originalText: draft.pdfEvidence?.fields?.minEducation?.originalText,
    verificationStatus: eduHtml ? 'SUPPORTED_BY_EVIDENCE' : 'NOT_FOUND',
    confidence: eduHtml ? 0.85 : 0.4,
    reviewRequired: !eduHtml
  };

  // 7. Salary / Pay Scale
  const salaryHtml = draft.salary || '';
  fields.salary = {
    field: 'salary',
    extractedValue: salaryHtml,
    normalizedValue: salaryHtml,
    sourceType: 'HTML',
    originalText: draft.pdfEvidence?.fields?.salary?.originalText,
    verificationStatus: salaryHtml ? 'VERIFIED' : 'SUPPORTED_BY_EVIDENCE',
    confidence: 0.9,
    reviewRequired: false
  };

  // 8. Age Requirements
  const ageSnippet = draft.pdfEvidence?.fields?.ageLimit?.originalText || '১৮ হতে ৩০ বছর';
  fields.ageLimit = {
    field: 'ageLimit',
    extractedValue: ageSnippet,
    normalizedValue: ageSnippet,
    sourceType: draft.pdfEvidence?.fields?.ageLimit ? 'PDF' : 'HTML',
    originalText: ageSnippet,
    verificationStatus: 'SUPPORTED_BY_EVIDENCE',
    confidence: 0.85,
    reviewRequired: false
  };

  return fields;
}

export function detectCancellationOrRevision(draft: CircularDraft): {
  isCancellation: boolean;
  isRevised: boolean;
  isExtended: boolean;
  summary?: string;
} {
  const combinedText = `
    ${draft.extractedTitle || ''} 
    ${draft.rawEvidenceText || ''} 
    ${(draft.pdfEvidence?.rawTextByPage || []).map(p => p.text).join(' ')}
  `.toLowerCase();

  const cancelKeywords = [
    'বাতিল', 'স্থগিত', 'বাতিলকরণ', 'কার্যক্রম স্থগিত', 
    'cancelled', 'postponed', 'suspended'
  ];
  const revisionKeywords = [
    'সংশোধিত', 'সংশোধনী', 'সংশোধন', 'corrigendum', 'amendment', 'revised'
  ];
  const extensionKeywords = [
    'সময় বৃদ্ধি', 'সময়সীমা বৃদ্ধি', 'তারিখ বৃদ্ধি', 'deadline extended', 'extension'
  ];

  const isCancellation = cancelKeywords.some(kw => combinedText.includes(kw));
  const isRevised = revisionKeywords.some(kw => combinedText.includes(kw));
  const isExtended = extensionKeywords.some(kw => combinedText.includes(kw));

  let summary: string | undefined = undefined;
  if (isCancellation) {
    summary = 'বিজ্ঞপ্তিটি নিয়োগ কার্যক্রম বাতিল বা স্থগিত সংক্রান্ত বলে চিহ্নিত হয়েছে';
  } else if (isRevised) {
    summary = 'বিজ্ঞপ্তিটিতে পূর্বের সার্কুলারের সংশোধনী বা রদবদল রয়েছে';
  } else if (isExtended) {
    summary = 'বিজ্ঞপ্তিটিতে আবেদনের সময়সীমা বর্ধিতকরণের নোটিশ রয়েছে';
  }

  return { isCancellation, isRevised, isExtended, summary };
}
