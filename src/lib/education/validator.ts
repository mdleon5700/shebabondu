/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 12: ACADEMIC RESULT VALIDATOR
 * Strict Scale Validation (GPA 5.00 / CGPA 4.00), Bengali Numerals & Formatting
 */

import { AcademicResultType, AcademicStatus, EnhancedEducationRecord } from './types';

export interface ResultValidationResult {
  isValid: boolean;
  error?: string;
  normalizedGpa?: number;
  normalizedCgpa?: number;
  normalizedScale?: number;
  formattedDisplayBn: string;
}

export class AcademicResultValidator {
  /**
   * Converts Bengali digits to English ASCII digits
   */
  public static parseBnDigits(text: string | number): string {
    if (typeof text === 'number') return text.toString();
    if (!text) return '';
    const bnToEnMap: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    return text.toString().replace(/[০-৯]/g, (match) => bnToEnMap[match] || match);
  }

  /**
   * Converts English digits to Bengali digits
   */
  public static toBnDigits(num: string | number): string {
    if (num === undefined || num === null) return '';
    const enToBnMap: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return num.toString().replace(/[0-9]/g, (match) => enToBnMap[match] || match);
  }

  /**
   * Validates academic result according to selected result type and scale
   */
  public static validateResult(params: {
    academicStatus: AcademicStatus;
    resultType?: AcademicResultType;
    resultValue?: string | number;
    scale?: number;
    divisionOrClass?: string;
    expectedPassingYear?: string;
    passingYear?: string;
  }): ResultValidationResult {
    const { academicStatus, resultType, resultValue, scale, divisionOrClass, expectedPassingYear, passingYear } = params;

    // 1. Ongoing Education handling
    if (academicStatus === 'CURRENTLY_STUDYING') {
      const expYearClean = this.parseBnDigits(expectedPassingYear || '').trim();
      const currentYear = new Date().getFullYear();
      if (expYearClean && (isNaN(Number(expYearClean)) || Number(expYearClean) < currentYear - 1 || Number(expYearClean) > currentYear + 8)) {
        return {
          isValid: false,
          error: `সম্ভাব্য পাসের বছর সঠিক নয় (বর্তমান বা পরবর্তী বছরসমূহ প্রযোজ্য)`,
          formattedDisplayBn: 'অধ্যয়নরত (চলমান)'
        };
      }
      const yearLabel = expYearClean ? ` (সম্ভাব্য: ${this.toBnDigits(expYearClean)})` : '';
      return {
        isValid: true,
        formattedDisplayBn: `অধ্যয়নরত / চলমান${yearLabel}`
      };
    }

    if (academicStatus === 'RESULT_PENDING') {
      return {
        isValid: true,
        formattedDisplayBn: 'ফলাফল প্রতীক্ষিত (Result Pending)'
      };
    }

    if (academicStatus === 'DISCONTINUED') {
      return {
        isValid: true,
        formattedDisplayBn: 'অসম্পূর্ণ / ড্রপআউট'
      };
    }

    // 2. Completed Education Result Type Validation
    if (!resultType) {
      // If legacy raw string exists
      const rawClean = (resultValue || '').toString().trim();
      if (rawClean) {
        return {
          isValid: true,
          formattedDisplayBn: rawClean
        };
      }
      return {
        isValid: false,
        error: 'ফলাফলের ধরন (Result Type) নির্বাচন করা আবশ্যক',
        formattedDisplayBn: ''
      };
    }

    if (resultType === 'GPA' || resultType === 'CGPA') {
      const rawClean = this.parseBnDigits(resultValue || '').trim();
      if (!rawClean) {
        return {
          isValid: false,
          error: `${resultType} মান লিখুন`,
          formattedDisplayBn: ''
        };
      }

      const numVal = parseFloat(rawClean);
      if (isNaN(numVal)) {
        return {
          isValid: false,
          error: `${resultType} অবশ্যই সঠিক সংখ্যা হতে হবে (যেমন: ৩.৭৫ বা 3.75)`,
          formattedDisplayBn: ''
        };
      }

      const activeScale = scale ? Number(scale) : (resultType === 'GPA' ? 5.00 : 4.00);

      if (numVal < 0) {
        return {
          isValid: false,
          error: `${resultType} ঋণাত্মক বা শূন্যের কম হতে পারে না`,
          formattedDisplayBn: ''
        };
      }

      if (numVal > activeScale) {
        return {
          isValid: false,
          error: `${resultType} স্কেল (${activeScale.toFixed(2)})-এর চেয়ে বেশি হতে পারে না`,
          formattedDisplayBn: ''
        };
      }

      const formattedVal = numVal.toFixed(2);
      const displayScale = activeScale.toFixed(2);
      const label = resultType === 'GPA' ? 'জিপিএ' : 'সিজিপিএ';

      return {
        isValid: true,
        normalizedGpa: resultType === 'GPA' ? numVal : undefined,
        normalizedCgpa: resultType === 'CGPA' ? numVal : undefined,
        normalizedScale: activeScale,
        formattedDisplayBn: `${label} ${this.toBnDigits(formattedVal)} / ${this.toBnDigits(displayScale)} (${resultType} ${formattedVal}/${displayScale})`
      };
    }

    if (resultType === 'DIVISION') {
      const div = (divisionOrClass || (resultValue as string) || '').trim();
      const validDivisions = ['১ম বিভাগ', '২য় বিভাগ', '৩য় বিভাগ', '1st Division', '2nd Division', '3rd Division', 'FIRST', 'SECOND', 'THIRD'];
      const isDivValid = validDivisions.some(v => v.toLowerCase() === div.toLowerCase()) || div.includes('বিভাগ') || div.toLowerCase().includes('division');
      if (!div || !isDivValid) {
        return {
          isValid: false,
          error: '১ম বিভাগ, ২য় বিভাগ বা ৩য় বিভাগ নির্বাচন করুন',
          formattedDisplayBn: ''
        };
      }
      return {
        isValid: true,
        formattedDisplayBn: div.includes('বিভাগ') ? div : `${div} (Division)`
      };
    }

    if (resultType === 'CLASS') {
      const cls = (divisionOrClass || (resultValue as string) || '').trim();
      if (!cls) {
        return {
          isValid: false,
          error: 'শ্রেণী (1st Class / 2nd Class) উল্লেখ করুন',
          formattedDisplayBn: ''
        };
      }
      return {
        isValid: true,
        formattedDisplayBn: cls
      };
    }

    if (resultType === 'PERCENTAGE') {
      const numVal = parseFloat(this.parseBnDigits(resultValue || ''));
      if (isNaN(numVal) || numVal < 0 || numVal > 100) {
        return {
          isValid: false,
          error: 'শতাংশ অবশ্যই ০ থেকে ১০০ এর মধ্যে হতে হবে',
          formattedDisplayBn: ''
        };
      }
      return {
        isValid: true,
        formattedDisplayBn: `${this.toBnDigits(numVal)}% (${numVal}%)`
      };
    }

    if (resultType === 'PASS_FAIL') {
      const val = (resultValue || '').toString().toLowerCase();
      const isPass = val.includes('pass') || val.includes('পাস') || val.includes('উত্তীর্ণ');
      return {
        isValid: true,
        formattedDisplayBn: isPass ? 'উত্তীর্ণ (Pass)' : 'অনুত্তীর্ণ (Fail)'
      };
    }

    return {
      isValid: true,
      formattedDisplayBn: String(resultValue || 'গ্রেডপ্রাপ্ত')
    };
  }

  /**
   * Helper to format an education record for human-readable display in Bengali
   */
  public static formatEducationDisplay(record: EnhancedEducationRecord): string {
    if (record.result) return record.result;
    const validated = this.validateResult({
      academicStatus: record.academicStatus || 'COMPLETED',
      resultType: record.resultType,
      resultValue: record.gpa || record.cgpa || record.result,
      scale: record.scale,
      divisionOrClass: record.divisionOrClass,
      expectedPassingYear: record.expectedPassingYear,
      passingYear: record.year
    });
    return validated.formattedDisplayBn || 'উল্লেখ নেই';
  }
}
