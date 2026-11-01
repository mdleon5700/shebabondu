import {
  NormalizedCircularCandidate,
  PdfExtractedCircular,
  HtmlPdfComparison,
  HtmlPdfFieldComparison
} from './types';
import { JobCircular, CircularDraft } from '@/lib/types';
import { sanitizeText } from './normalizer';

export function compareHtmlAndPdfCandidate(
  htmlCandidate: NormalizedCircularCandidate,
  pdfCircular: PdfExtractedCircular
): HtmlPdfComparison {
  const fieldComparisons: Record<string, HtmlPdfFieldComparison> = {};
  const conflictSummary: string[] = [];

  const isDeadlineExtensionNotice = Boolean(pdfCircular.isDeadlineExtended);
  const isCorrectionNotice = Boolean(pdfCircular.isCorrectionNotice);

  // 1. Title Comparison
  if (pdfCircular.fields.title?.normalizedValue) {
    const htmlT = sanitizeText(htmlCandidate.title).toLowerCase();
    const pdfT = sanitizeText(pdfCircular.fields.title.normalizedValue).toLowerCase();
    const hasConflict = !htmlT.includes(pdfT) && !pdfT.includes(htmlT) && htmlT !== pdfT;

    fieldComparisons.title = {
      field: 'title',
      htmlValue: htmlCandidate.title,
      pdfValue: pdfCircular.fields.title.normalizedValue,
      hasConflict,
      conflictReason: hasConflict ? `HTML শিরোনাম "${htmlCandidate.title}" এবং PDF শিরোনাম "${pdfCircular.fields.title.normalizedValue}" এর মধ্যে অমিল` : undefined,
      resolution: hasConflict ? 'needs_manual_review' : 'use_html'
    };
    if (hasConflict) conflictSummary.push(fieldComparisons.title.conflictReason!);
  }

  // 2. Organization Comparison
  if (pdfCircular.fields.organization?.normalizedValue) {
    const htmlOrg = sanitizeText(htmlCandidate.organization).toLowerCase();
    const pdfOrg = sanitizeText(pdfCircular.fields.organization.normalizedValue).toLowerCase();
    const hasConflict = !htmlOrg.includes(pdfOrg) && !pdfOrg.includes(htmlOrg) && htmlOrg !== pdfOrg;

    fieldComparisons.organization = {
      field: 'organization',
      htmlValue: htmlCandidate.organization,
      pdfValue: pdfCircular.fields.organization.normalizedValue,
      hasConflict,
      conflictReason: hasConflict ? `HTML প্রতিষ্ঠান "${htmlCandidate.organization}" এবং PDF প্রতিষ্ঠান "${pdfCircular.fields.organization.normalizedValue}" অমিল` : undefined,
      resolution: hasConflict ? 'needs_manual_review' : 'use_html'
    };
    if (hasConflict) conflictSummary.push(fieldComparisons.organization.conflictReason!);
  }

  // 3. Deadline Comparison
  if (pdfCircular.fields.deadline?.normalizedValue) {
    const htmlDead = sanitizeText(htmlCandidate.deadline);
    const pdfDead = sanitizeText(pdfCircular.fields.deadline.normalizedValue);

    if (isDeadlineExtensionNotice) {
      fieldComparisons.deadline = {
        field: 'deadline',
        htmlValue: htmlCandidate.deadline,
        pdfValue: pdfDead,
        hasConflict: true,
        conflictReason: `আবেদনের সময়সীমা বৃদ্ধির নোটিশ: মূল ডেডলাইন "${htmlCandidate.deadline}" -> বর্ধিত ডেডলাইন "${pdfDead}"`,
        resolution: 'use_pdf'
      };
      conflictSummary.push(fieldComparisons.deadline.conflictReason!);
    } else {
      const isHtmlPlaceholder = htmlDead.includes('শীঘ্রই') || htmlDead.includes('অপেক্ষমাণ');
      const hasConflict = !isHtmlPlaceholder && htmlDead !== pdfDead;

      fieldComparisons.deadline = {
        field: 'deadline',
        htmlValue: htmlCandidate.deadline,
        pdfValue: pdfDead,
        hasConflict,
        conflictReason: hasConflict ? `HTML ডেডলাইন "${htmlCandidate.deadline}" এবং PDF ডেডলাইন "${pdfDead}" ভিন্ন` : undefined,
        resolution: isHtmlPlaceholder ? 'use_pdf' : (hasConflict ? 'needs_manual_review' : 'use_html')
      };
      if (hasConflict) conflictSummary.push(fieldComparisons.deadline.conflictReason!);
    }
  }

  // 4. Vacancies Comparison
  if (pdfCircular.fields.vacancies?.normalizedValue !== undefined) {
    const pdfVac = pdfCircular.fields.vacancies.normalizedValue;
    const htmlVac = htmlCandidate.vacancies;

    if (htmlVac === 0 && pdfVac > 0) {
      // HTML had missing vacancies; PDF provides explicit vacancies!
      fieldComparisons.vacancies = {
        field: 'vacancies',
        htmlValue: htmlVac,
        pdfValue: pdfVac,
        hasConflict: false,
        resolution: 'use_pdf'
      };
    } else if (htmlVac > 0 && htmlVac !== pdfVac) {
      fieldComparisons.vacancies = {
        field: 'vacancies',
        htmlValue: htmlVac,
        pdfValue: pdfVac,
        hasConflict: true,
        conflictReason: `HTML পদসংখ্যা (${htmlVac}) এবং PDF পদসংখ্যা (${pdfVac}) অমিল`,
        resolution: 'needs_manual_review'
      };
      conflictSummary.push(fieldComparisons.vacancies.conflictReason!);
    }
  }

  // 5. Govt Fee Comparison
  if (pdfCircular.fields.govtFee?.normalizedValue !== undefined) {
    const pdfFee = pdfCircular.fields.govtFee.normalizedValue;
    const htmlFee = htmlCandidate.govtFee;

    if (htmlFee === 0 && pdfFee > 0) {
      // HTML had missing fee; PDF provides explicit fee!
      fieldComparisons.govtFee = {
        field: 'govtFee',
        htmlValue: htmlFee,
        pdfValue: pdfFee,
        hasConflict: false,
        resolution: 'use_pdf'
      };
    } else if (htmlFee > 0 && htmlFee !== pdfFee) {
      fieldComparisons.govtFee = {
        field: 'govtFee',
        htmlValue: htmlFee,
        pdfValue: pdfFee,
        hasConflict: true,
        conflictReason: `HTML আবেদন ফি (BDT ${htmlFee}) এবং PDF আবেদন ফি (BDT ${pdfFee}) অমিল`,
        resolution: 'needs_manual_review'
      };
      conflictSummary.push(fieldComparisons.govtFee.conflictReason!);
    }
  }

  // Determine proposed action
  let proposedAction: HtmlPdfComparison['proposedAction'] = 'keep_html';
  const hasConflicts = conflictSummary.length > 0;

  if (isDeadlineExtensionNotice || isCorrectionNotice) {
    proposedAction = 'create_update_proposal';
  } else if (hasConflicts) {
    proposedAction = 'manual_review_required';
  } else if (
    (htmlCandidate.govtFee === 0 && (pdfCircular.fields.govtFee?.normalizedValue ?? 0) > 0) ||
    (htmlCandidate.vacancies === 0 && (pdfCircular.fields.vacancies?.normalizedValue ?? 0) > 0) ||
    (htmlCandidate.deadline.includes('অপেক্ষমাণ') && pdfCircular.fields.deadline?.normalizedValue)
  ) {
    proposedAction = 'update_from_pdf';
  }

  return {
    hasConflicts,
    conflictSummary,
    isDeadlineExtensionNotice,
    isCorrectionNotice,
    proposedAction,
    fieldComparisons
  };
}

/**
 * Enriches a NormalizedCircularCandidate using evidence extracted from an official PDF.
 */
export function enrichCandidateWithPdfEvidence(
  candidate: NormalizedCircularCandidate,
  pdfCircular: PdfExtractedCircular
): { enrichedCandidate: NormalizedCircularCandidate; comparison: HtmlPdfComparison } {
  const comparison = compareHtmlAndPdfCandidate(candidate, pdfCircular);
  const updated = { ...candidate };

  updated.pdfEvidence = pdfCircular;
  updated.htmlPdfComparison = comparison;

  // Enrich missing fields from PDF where safe
  if (updated.govtFee === 0 && pdfCircular.fields.govtFee?.normalizedValue) {
    updated.govtFee = pdfCircular.fields.govtFee.normalizedValue;
    // Remove unstated fee warning if present
    if (updated.extractionWarnings) {
      updated.extractionWarnings = updated.extractionWarnings.filter(w => !w.includes('আবেদন ফি অনুল্লিখিত'));
    }
  }

  if (updated.vacancies === 0 && pdfCircular.fields.vacancies?.normalizedValue) {
    updated.vacancies = pdfCircular.fields.vacancies.normalizedValue;
    // Remove unstated vacancy warning if present
    if (updated.extractionWarnings) {
      updated.extractionWarnings = updated.extractionWarnings.filter(w => !w.includes('পদসংখ্যা অনুল্লিখিত'));
    }
  }

  if (
    (updated.deadline.includes('অপেক্ষমাণ') || updated.deadline.includes('শীঘ্রই')) &&
    pdfCircular.fields.deadline?.normalizedValue
  ) {
    updated.deadline = pdfCircular.fields.deadline.normalizedValue;
    if (updated.extractionWarnings) {
      updated.extractionWarnings = updated.extractionWarnings.filter(w => !w.includes('শেষ তারিখ অনুপস্থিত'));
    }
  }

  if (pdfCircular.fields.grade?.normalizedValue && (!updated.grade || updated.grade === 'অনির্ধারিত')) {
    updated.grade = pdfCircular.fields.grade.normalizedValue;
  }

  if (pdfCircular.fields.minEducation?.normalizedValue && (!updated.minEducation || updated.minEducation === 'বিজ্ঞপ্তি অনুযায়ী')) {
    updated.minEducation = pdfCircular.fields.minEducation.normalizedValue;
  }

  if (pdfCircular.fields.salary?.normalizedValue && (!updated.salary || updated.salary === 'নিয়মানুযায়ী')) {
    updated.salary = pdfCircular.fields.salary.normalizedValue;
  }

  // If there are conflicts or deadline extensions, enforce manual review
  if (comparison.hasConflicts || comparison.isDeadlineExtensionNotice || comparison.isCorrectionNotice) {
    updated.needsReview = true;
    const reasons = [...(comparison.conflictSummary || [])];
    if (comparison.isDeadlineExtensionNotice) {
      reasons.push('সময়সীমা বৃদ্ধির সার্কুলার শনাক্ত');
    }
    if (comparison.isCorrectionNotice) {
      reasons.push('সংশোধনী সার্কুলার শনাক্ত');
    }
    updated.reviewReason = reasons.join('; ');
  }

  // If PDF requires OCR, flag with warning
  if (pdfCircular.requiresOcr) {
    updated.needsReview = true;
    updated.extractionWarnings = [
      ...(updated.extractionWarnings || []),
      'ডকুমেন্টটি স্ক্যান করা ইমেজ PDF; সম্পূর্ণ টেক্সট এক্সট্রাকশনের জন্য OCR আবশ্যক (সিস্টেমে OCR ইঞ্জিন অনুপস্থিত)'
    ];
  }

  return {
    enrichedCandidate: updated,
    comparison
  };
}
