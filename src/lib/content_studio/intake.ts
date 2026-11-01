import { CircularDraft } from '@/lib/types';
import { VerificationResult } from '@/lib/verification/types';

export interface VerifiedJobFacts {
  draftId: string;
  organization: string;
  jobTitle: string;
  category: string;
  vacancies: string;
  numericVacancies: number;
  salary: string;
  payGrade?: string;
  minEducation: string;
  educationalDetails: string[];
  ageLimits: string;
  minAge?: number;
  maxAge?: number;
  ageCutOffDate?: string;
  quotaRelaxation?: string;
  govtFee: string;
  numericGovtFee: number;
  applicationDeadline: string;
  applicationStartDate?: string;
  applicationMethod: string;
  applicationUrl: string;
  referenceNo?: string;
  officialSourceUrl: string;
  pdfUrl?: string;
  isCancellationNotice: boolean;
  isUpdateNotice: boolean;
  verificationStatus: string;
  confidenceScore: number;
  unresolvedWarnings: string[];
  missingFields: string[];
  intakeTimestamp: string;
}

export interface IntakeGateResult {
  canProceedToGeneration: boolean;
  canPublishDirectly: boolean;
  facts: VerifiedJobFacts;
  blockers: string[];
  warnings: string[];
  bengaliIntakeSummary: string;
}

/**
 * Extracts and strictly normalizes verified facts from Step 03 CircularDraft
 * Missing data is explicitly normalized to "বিজ্ঞপ্তিতে উল্লেখ নেই"
 */
export function intakeVerifiedJobData(draft: CircularDraft): IntakeGateResult {
  const vResult = draft.verificationResult;
  const warnings: string[] = [];
  const blockers: string[] = [];
  const missingFields: string[] = [];

  // 1. Organization & Title
  const organization = draft.extractedOrg?.trim() || 'বিজ্ঞপ্তিতে উল্লেখ নেই';
  const jobTitle = draft.extractedTitle?.trim() || 'নিয়োগ বিজ্ঞপ্তি';
  if (organization === 'বিজ্ঞপ্তিতে উল্লেখ নেই') {
    missingFields.push('organization');
    warnings.push('প্রতিষ্ঠানের নাম স্পষ্টভাবে পাওয়া যায়নি।');
  }

  // 2. Vacancies
  let vacancies = 'বিজ্ঞপ্তিতে উল্লেখ নেই';
  let numericVacancies = 0;
  if (typeof draft.vacancies === 'number' && draft.vacancies > 0) {
    numericVacancies = draft.vacancies;
    vacancies = `${draft.vacancies}টি পদ`;
  } else if (vResult?.fields?.vacancies) {
    const val = vResult.fields.vacancies.extractedValue || vResult.fields.vacancies.normalizedValue;
    numericVacancies = Number(val) || 0;
    vacancies = numericVacancies > 0 ? `${numericVacancies}টি পদ` : 'বিজ্ঞপ্তিতে উল্লেখ নেই';
  } else {
    missingFields.push('vacancies');
  }

  // 3. Salary & Grade
  let salary = draft.salary?.trim() || '';
  if (vResult?.fields?.salary) {
    const val = vResult.fields.salary.extractedValue || vResult.fields.salary.normalizedValue;
    if (val) salary = String(val).trim();
  }
  if (!salary || salary === '0' || salary === 'null' || salary.toLowerCase() === 'n/a') {
    salary = 'বিজ্ঞপ্তিতে উল্লেখ নেই';
    missingFields.push('salary');
  }

  const payGrade = draft.grade || (vResult?.fields?.grade ? vResult.fields.grade.extractedValue : undefined);

  // 4. Educational Qualifications
  let minEducation = draft.minEducation?.trim() || '';
  if (vResult?.fields?.minEducation) {
    const val = vResult.fields.minEducation.extractedValue || vResult.fields.minEducation.normalizedValue;
    if (val) minEducation = String(val).trim();
  }
  if (!minEducation || minEducation.toLowerCase() === 'n/a') {
    minEducation = 'বিজ্ঞপ্তিতে উল্লেখ নেই';
    missingFields.push('minEducation');
  }

  const educationalDetails: string[] = [];
  if (minEducation !== 'বিজ্ঞপ্তিতে উল্লেখ নেই') {
    educationalDetails.push(minEducation);
  }
  if (vResult?.eligibility?.education?.degree) {
    educationalDetails.push(`ডিগ্রি: ${vResult.eligibility.education.degree}`);
  }
  if (vResult?.eligibility?.education?.division) {
    educationalDetails.push(`বিভাগ/শ্রেণি: ${vResult.eligibility.education.division}`);
  }

  // 5. Age Limits & Quotas
  let ageLimits = 'বিজ্ঞপ্তিতে উল্লেখ নেই';
  let minAge = (draft as any).minAge;
  let maxAge = (draft as any).maxAge;
  let quotaRelaxation: string | undefined = undefined;

  if (vResult?.eligibility?.age) {
    if (vResult.eligibility.age.minAge && vResult.eligibility.age.maxAge) {
      minAge = vResult.eligibility.age.minAge;
      maxAge = vResult.eligibility.age.maxAge;
      ageLimits = `${minAge} থেকে ${maxAge} বছর`;
    }
    if (vResult.eligibility.age.relaxationCondition) {
      quotaRelaxation = vResult.eligibility.age.relaxationCondition;
    }
  } else if (minAge && maxAge) {
    ageLimits = `${minAge} থেকে ${maxAge} বছর`;
  } else {
    missingFields.push('age');
  }

  // 6. Application Fee
  let govtFee = 'বিজ্ঞপ্তিতে উল্লেখ নেই';
  let numericGovtFee = 0;
  if (typeof draft.govtFee === 'number' && draft.govtFee >= 0) {
    numericGovtFee = draft.govtFee;
    govtFee = numericGovtFee === 0 ? 'আবেদন ফি প্রয়োজন নেই (বিনামূল্যে)' : `${numericGovtFee} টাকা`;
  } else if (vResult?.fields?.govtFee) {
    const val = vResult.fields.govtFee.extractedValue || vResult.fields.govtFee.normalizedValue;
    if (val !== undefined) {
      numericGovtFee = Number(val) || 0;
      govtFee = numericGovtFee === 0 ? 'বিনামূল্যে' : `${numericGovtFee} টাকা`;
    }
  } else {
    missingFields.push('govtFee');
  }

  // 7. Application Deadline
  let applicationDeadline = draft.deadline?.trim() || '';
  if (vResult?.fields?.deadline) {
    const val = vResult.fields.deadline.extractedValue || vResult.fields.deadline.normalizedValue;
    if (val) applicationDeadline = String(val).trim();
  }
  if (!applicationDeadline) {
    applicationDeadline = 'বিজ্ঞপ্তিতে উল্লেখ নেই';
    missingFields.push('deadline');
    warnings.push('আবেদনের শেষ সময় সার্কুলারে শনাক্ত করা যায়নি।');
  }

  // 8. Application URL & Method
  const applicationUrl = draft.sourceUrl || draft.evidenceUrl || 'বিজ্ঞপ্তিতে উল্লেখ নেই';
  const applicationMethod = applicationUrl.includes('teletalk.com.bd')
    ? 'টেলিটক অনলাইন আবেদন পোর্টাল'
    : applicationUrl.startsWith('http')
    ? 'অনলাইন পোর্টাল'
    : 'বিজ্ঞপ্তিতে বর্ণিত নির্দেশিকা অনুযায়ী';

  // 9. Gatekeeper checks
  const isCancellation = Boolean(draft.isCancellationNotice || vResult?.isCancellationNotice);
  if (isCancellation) {
    blockers.push('সার্কুলারটি নিয়োগ বাতিল বা স্থগিত সংক্রান্ত নোটিশ। সম্পাদকীয় প্রকাশ স্থগিত রাখা হয়েছে।');
  }

  if (vResult?.status === 'REJECTED') {
    blockers.push('সার্কুলারটি ভেরিফিকেশন ধাপে বাতিল (REJECTED) করা হয়েছিল।');
  }

  const existingWarnings = vResult?.unresolvedWarnings || draft.conflictSummary || [];
  if (existingWarnings.length > 0) {
    warnings.push(...existingWarnings);
  }

  const canProceedToGeneration = !isCancellation;
  const canPublishDirectly = blockers.length === 0 && warnings.length === 0;

  const facts: VerifiedJobFacts = {
    draftId: draft.id,
    organization,
    jobTitle,
    category: draft.category || 'govt',
    vacancies,
    numericVacancies,
    salary,
    payGrade,
    minEducation,
    educationalDetails,
    ageLimits,
    minAge,
    maxAge,
    ageCutOffDate: (draft as any).ageCutOffDate || vResult?.eligibility?.age?.referenceDate,
    quotaRelaxation,
    govtFee,
    numericGovtFee,
    applicationDeadline,
    applicationMethod,
    applicationUrl,
    referenceNo: draft.refNo,
    officialSourceUrl: draft.sourceUrl,
    pdfUrl: (draft as any).pdfUrl || draft.evidenceUrl,
    isCancellationNotice: isCancellation,
    isUpdateNotice: Boolean(vResult?.isUpdateProposal),
    verificationStatus: vResult?.status || 'PENDING',
    confidenceScore: vResult?.confidenceScore || draft.confidenceScore || 70,
    unresolvedWarnings: warnings,
    missingFields,
    intakeTimestamp: new Date().toISOString()
  };

  const bengaliIntakeSummary = `প্রতিষ্ঠান: ${organization} | পদ: ${jobTitle} | পদসংখ্যা: ${vacancies} | শেষ সময়: ${applicationDeadline} | বেতন: ${salary} | ফি: ${govtFee}`;

  return {
    canProceedToGeneration,
    canPublishDirectly,
    facts,
    blockers,
    warnings,
    bengaliIntakeSummary
  };
}
