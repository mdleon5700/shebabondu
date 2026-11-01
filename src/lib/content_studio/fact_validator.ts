import { FactValidationResult, FactValidationRecord } from './types';
import { VerifiedJobFacts } from './intake';

/**
 * Validates generated Bengali article text against verified job facts
 * Strictly flags unsupported claims, fabricated numbers, or conflicting deadlines.
 */
export function validateArticleFacts(
  articleText: string,
  facts: VerifiedJobFacts
): FactValidationResult {
  const normText = (articleText || '').toLowerCase();
  const validatedFields: Record<string, FactValidationRecord> = {};
  const unsupportedClaims: string[] = [];
  const conflictingClaims: string[] = [];
  const omittedFields: string[] = [];
  const warnings: string[] = [];

  // 1. Organization Check
  const org = facts.organization.toLowerCase().trim();
  if (org !== 'বিজ্ঞপ্তিতে উল্লেখ নেই') {
    const orgFound = normText.includes(org);
    validatedFields['organization'] = {
      field: 'organization',
      expectedVerifiedValue: facts.organization,
      mentionedInText: orgFound ? facts.organization : 'অনুপস্থিত',
      status: orgFound ? 'supported' : 'unsupported',
      note: orgFound ? 'প্রতিষ্ঠানের নাম সঠিকভাবে উল্লেখিত আছে।' : 'প্রতিষ্ঠানের নাম আর্টিকেলে পাওয়া যায়নি।'
    };
    if (!orgFound) {
      unsupportedClaims.push('প্রতিষ্ঠানের নাম আর্টিকেলে নিশ্চিত করা যায়নি।');
    }
  }

  // 2. Vacancies Check
  if (facts.numericVacancies > 0) {
    const vacBn = String(facts.numericVacancies);
    // Convert to Bengali digits for check
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const vacBnDigits = String(facts.numericVacancies).split('').map(d => bnDigits[Number(d)] || d).join('');
    const vacFound = normText.includes(vacBn) || normText.includes(vacBnDigits) || normText.includes(facts.vacancies.toLowerCase());

    validatedFields['vacancies'] = {
      field: 'vacancies',
      expectedVerifiedValue: facts.vacancies,
      mentionedInText: vacFound ? facts.vacancies : 'অনুপস্থিত বা ভিন্ন সংখ্যা',
      status: vacFound ? 'supported' : 'conflicting',
      note: vacFound ? 'পদসংখ্যা যাচাইকৃত তথ্যের সাথে শতভাগ মিলেছে।' : 'পদসংখ্যা সার্কুলারের সাথে মিলছে না।'
    };
    if (!vacFound) {
      conflictingClaims.push(`পদসংখ্যা সার্কুলারের ${facts.vacancies}-এর সাথে মিলছে না।`);
    }
  } else {
    // Vacancy was not mentioned in circular
    const statesNotMentioned = normText.includes('বিজ্ঞপ্তিতে উল্লেখ নেই') || normText.includes('নির্দিষ্ট নয়') || !normText.match(/\d+\s*টি\s*পদ/);
    validatedFields['vacancies'] = {
      field: 'vacancies',
      expectedVerifiedValue: 'বিজ্ঞপ্তিতে উল্লেখ নেই',
      mentionedInText: statesNotMentioned ? 'বিজ্ঞপ্তিতে উল্লেখ নেই' : 'অননুমোদিত সংখ্যা দাবি',
      status: statesNotMentioned ? 'omitted_valid' : 'unsupported',
      note: statesNotMentioned ? 'পদসংখ্যা বিজ্ঞপ্তিতে নেই বলে সঠিকভাবে জানানো হয়েছে।' : 'বিজ্ঞপ্তিতে পদসংখ্যা না থাকা সত্ত্বেও মনগড়া সংখ্যা উল্লেখ করা হয়েছে।'
    };
    if (!statesNotMentioned) {
      unsupportedClaims.push('বিজ্ঞপ্তিতে পদসংখ্যা না থাকা সত্ত্বেও টেক্সটে পদসংখ্যা দাবি করা হয়েছে।');
    }
  }

  // 3. Application Deadline Check
  if (facts.applicationDeadline && facts.applicationDeadline !== 'বিজ্ঞপ্তিতে উল্লেখ নেই') {
    const dl = facts.applicationDeadline.toLowerCase().trim();
    const deadlineFound = normText.includes(dl);
    validatedFields['deadline'] = {
      field: 'deadline',
      expectedVerifiedValue: facts.applicationDeadline,
      mentionedInText: deadlineFound ? facts.applicationDeadline : 'ভিন্ন বা অনুপস্থিত তারিখ',
      status: deadlineFound ? 'supported' : 'conflicting',
      note: deadlineFound ? 'আবেদনের শেষ সময় সার্কুলারের সাথে নিখুঁতভাবে মিলেছে।' : 'আবেদনের শেষ সময় সার্কুলারের তারিখের সাথে মিলছে না।'
    };
    if (!deadlineFound) {
      conflictingClaims.push(`আবেদনের শেষ সময় সার্কুলারের মূল তারিখ (${facts.applicationDeadline})-এর সাথে মিলছে না।`);
    }
  } else {
    omittedFields.push('deadline');
  }

  // 4. Application Fee Check
  if (facts.numericGovtFee > 0) {
    const feeBn = String(facts.numericGovtFee);
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const feeBnDigits = String(facts.numericGovtFee).split('').map(d => bnDigits[Number(d)] || d).join('');
    const feeFound = normText.includes(feeBn) || normText.includes(feeBnDigits) || normText.includes(facts.govtFee.toLowerCase());

    validatedFields['govtFee'] = {
      field: 'govtFee',
      expectedVerifiedValue: facts.govtFee,
      mentionedInText: feeFound ? facts.govtFee : 'ভিন্ন ফি',
      status: feeFound ? 'supported' : 'conflicting',
      note: feeFound ? 'আবেদন ফি সার্কুলারের সাথে যথাযথ।' : 'আবেদন ফি সার্কুলারের মূল অংকের সাথে সাংঘর্ষিক।'
    };
    if (!feeFound) {
      warnings.push(`আবেদন ফি (${facts.govtFee}) টেক্সটে স্পষ্ট পাওয়া যায়নি।`);
    }
  }

  // 5. Salary Check
  if (facts.salary && facts.salary !== 'বিজ্ঞপ্তিতে উল্লেখ নেই') {
    const salaryFound = normText.includes(facts.salary.toLowerCase()) || normText.includes('বেতন স্কেল');
    validatedFields['salary'] = {
      field: 'salary',
      expectedVerifiedValue: facts.salary,
      mentionedInText: salaryFound ? facts.salary : 'অনুপস্থিত',
      status: salaryFound ? 'supported' : 'omitted_valid',
      note: salaryFound ? 'বেতন কাঠামো সার্কুলারের সাথে মিলেছে।' : 'বেতন আর্টিকেলে উল্লেখ করা হয়নি।'
    };
  }

  // 6. Application URL / Method Check
  if (facts.applicationUrl && facts.applicationUrl.startsWith('http')) {
    const urlFound = normText.includes(facts.applicationUrl.toLowerCase()) || normText.includes(facts.applicationUrl.replace(/https?:\/\//, '').toLowerCase());
    validatedFields['applicationUrl'] = {
      field: 'applicationUrl',
      expectedVerifiedValue: facts.applicationUrl,
      mentionedInText: urlFound ? facts.applicationUrl : 'অনুপস্থিত',
      status: urlFound ? 'supported' : 'unsupported',
      note: urlFound ? 'অফিশিয়াল আবেদন লিংক সঠিকভাবে বিদ্যমান।' : 'অফিশিয়াল আবেদন লিংক অনুপস্থিত।'
    };
    if (!urlFound) {
      warnings.push('অফিশিয়াল অনলাইন আবেদন লিংক স্পষ্টভাবে সংযুক্ত করা হয়নি।');
    }
  }

  // Overall status evaluation
  let status: FactValidationResult['status'] = 'FACTUALLY_SUPPORTED';
  if (conflictingClaims.length > 0) {
    status = 'CONFLICTING_INFORMATION';
  } else if (unsupportedClaims.length > 0) {
    status = 'UNSUPPORTED_CLAIM';
  } else if (warnings.length > 0) {
    status = 'NEEDS_REVIEW';
  }

  const canProceedToApproval = conflictingClaims.length === 0 && unsupportedClaims.length === 0;

  return {
    status,
    validatedFields,
    unsupportedClaims,
    conflictingClaims,
    omittedFields,
    warnings,
    canProceedToApproval
  };
}
