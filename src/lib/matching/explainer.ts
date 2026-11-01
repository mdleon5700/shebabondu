/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 09: MATCH EXPLAINER ENGINE
 * Generates Traceable, Fact-Based Bengali Match Explanations & Gaps
 */

import { MatchingDimensionBreakdown, MandatoryEligibilityStatus } from './types';
import { JobCircular } from '../types';

export class MatchExplainer {
  /**
   * Generates natural Bengali bullet points of why the circular is recommended
   */
  public static generateMatchReasons(
    job: JobCircular, 
    breakdown: MatchingDimensionBreakdown,
    eligibility: MandatoryEligibilityStatus
  ): string[] {
    const reasons: string[] = [];

    // 1. Education Match Reason
    if (breakdown.education.score >= 80) {
      if (breakdown.education.matchedDegree) {
        reasons.push(`আপনার অর্জিত ডিগ্রি "${breakdown.education.matchedDegree}" বিজ্ঞপ্তির নির্ধারিত শিক্ষাগত যোগ্যতার সাথে সরাসরি সামঞ্জস্যপূর্ণ।`);
      } else {
        reasons.push('আপনার সর্বোচ্চ শিক্ষাগত যোগ্যতা বিজ্ঞপ্তির ন্যূনতম যোগ্যতার শর্ত পূরণ করেছে।');
      }
    }

    // 2. Skills Match Reason
    if (breakdown.skills.matchedSkills.length > 0) {
      const skillsBn = breakdown.skills.matchedSkills.join(', ');
      reasons.push(`আপনার প্রোফাইলে যুক্ত দক্ষতা (${skillsBn}) বিজ্ঞপ্তিতে চাওয়া দক্ষতার সাথে মিলেছে।`);
    }

    // 3. Experience Match Reason
    if (breakdown.experience.score >= 90) {
      if (breakdown.experience.requiredYears === 0) {
        reasons.push('পদটিতে নতুন গ্র্যাজুয়েট বা ফ্রেশারদের আবেদনের পূর্ণ সুযোগ রয়েছে।');
      } else {
        reasons.push(`বিজ্ঞপ্তিতে প্রয়োজনীয় ${breakdown.experience.requiredYears} বছরের অভিজ্ঞতা আপনার প্রোফাইল অনুযায়ী বিদ্যমান।`);
      }
    }

    // 4. Location Match Reason
    if (breakdown.location.score >= 90) {
      if (breakdown.location.isAllBangladesh) {
        reasons.push('বিজ্ঞপ্তিটি সমগ্র বাংলাদেশের সকল জেলার প্রার্থীদের জন্য উন্মুক্ত।');
      } else if (breakdown.location.matchedDistrict) {
        reasons.push(`চাকরিটি আপনার পছন্দের জেলা/বিভাগ (${breakdown.location.matchedDistrict})-এর অন্তর্ভুক্ত।`);
      }
    }

    // 5. Category Match Reason
    if (breakdown.category.score >= 90) {
      reasons.push(`বিজ্ঞপ্তিটি আপনার পছন্দের কর্মক্ষেত্র/ক্যাটাগরি (${job.categoryLabel || job.category})-এর অন্তর্ভুক্ত।`);
    }

    // 6. Organization Type Match Reason
    if (breakdown.organizationType.score >= 90) {
      reasons.push(`প্রতিষ্ঠানটি (${job.organization}) আপনার পছন্দের প্রতিষ্ঠানের ধরনের সাথে মিলেছে।`);
    }

    if (reasons.length === 0) {
      reasons.push('বিজ্ঞপ্তিটির অধিকাংশ প্রাথমিক শর্তাবলি আপনার প্রোফাইলের সাথে সামঞ্জস্যপূর্ণ।');
    }

    return reasons;
  }

  /**
   * Generates traceable Bengali explanations for identified qualification gaps
   */
  public static generateQualificationGaps(
    breakdown: MatchingDimensionBreakdown,
    eligibility: MandatoryEligibilityStatus
  ): string[] {
    const gaps: string[] = [];

    // 1. Education Gap
    if (breakdown.education.score < 50) {
      gaps.push(`শিক্ষাগত যোগ্যতা: বিজ্ঞপ্তির ন্যূনতম শিক্ষাগত যোগ্যতা (${breakdown.education.detailsBn}) আপনার প্রোফাইল তথ্যের সাথে পূর্ণ মিল পাওয়া যায়নি।`);
    }

    // 2. Missing Required Skills
    if (breakdown.skills.missingRequired.length > 0) {
      const missing = breakdown.skills.missingRequired.join(', ');
      gaps.push(`প্রয়োজনীয় দক্ষতা ঘাটতি: বিজ্ঞপ্তিতে বিশেষ দক্ষতা (${missing}) চাওয়া হয়েছে, যা আপনার প্রোফাইলে এখনও যুক্ত নেই।`);
    }

    // 3. Experience Gap
    if (breakdown.experience.score < 75 && breakdown.experience.requiredYears > breakdown.experience.userYears) {
      gaps.push(`কাজের অভিজ্ঞতা ঘাটতি: বিজ্ঞপ্তিতে ন্যূনতম ${breakdown.experience.requiredYears} বছরের অভিজ্ঞতা প্রয়োজন (আপনার প্রোফাইলে ${breakdown.experience.userYears} বছর উল্লেখিত)।`);
    }

    // 4. Location Gap
    if (!breakdown.location.isAllBangladesh && breakdown.location.score < 60) {
      gaps.push('কর্মস্থল: পদটির পদায়ন আপনার নির্বাচিত পছন্দের জেলা সমূহের বাইরে নির্ধারিত হতে পারে।');
    }

    return gaps;
  }
}
