/**
 * CHAKRI SHEBA (\u099a\u09be\u0995\u09b0\u09bf \u09b8\u09c7\u09ac\u09be) \u2014 STEP 09: JOB REQUIREMENT NORMALIZER
 * Extracts & Standardizes Verified Requirements from Canonical Job Records
 */

import { JobCircular } from '../types';
import { 
  NormalizedJobRequirements, 
  NormalizedEducationLevel, 
  OrganizationTypePreference,
  EmploymentTypePreference 
} from './types';
import { SkillsTaxonomyManager, CANONICAL_SKILLS } from './skills-taxonomy';

export class JobRequirementNormalizer {
  /**
   * Normalizes education level from Bengali/English text
   */
  public static normalizeEducationLevel(text?: string | null): { level: NormalizedEducationLevel; labelBn: string } {
    if (!text) return { level: 'any', labelBn: 'শিক্ষাগত যোগ্যতা প্রযোজ্য নয়' };
    const lower = text.toLowerCase();

    // 1. PhD / Doctorate
    if (lower.includes('ডক্টরেট') || lower.includes('phd') || lower.includes('পিএইচডি') || lower.includes('doctorate')) {
      return { level: 'phd', labelBn: 'পিএইচডি / ডক্টরেট' };
    }

    // 2. MPhil
    if (lower.includes('এমফিল') || lower.includes('mphil') || lower.includes('m.phil')) {
      return { level: 'mphil', labelBn: 'এমফিল' };
    }

    // 3. Kamil (Madrasah Master's equivalent)
    if (lower.includes('কামিল') || lower.includes('kamil')) {
      return { level: 'kamil', labelBn: 'কামিল (মাস্টার্স সমমান)' };
    }

    // 4. Master's
    if (lower.includes('স্নাতকোত্তর') || lower.includes('মাস্টার্স') || lower.includes('masters') || lower.includes('msc') || lower.includes('mba') || lower.includes('mss') || lower.includes('m.com')) {
      return { level: 'masters', labelBn: 'স্নাতকোত্তর / মাস্টার্স' };
    }

    // 5. Degree (Pass 3-year) — Check BEFORE 4-year Honours/Bachelor
    if (lower.includes('ডিগ্রি (পাস)') || lower.includes('স্নাতক (পাস)') || lower.includes('pass degree') || lower.includes('3 years') || lower.includes('৩ বছর') || lower.includes('ডিগ্রী')) {
      return { level: 'degree', labelBn: 'স্নাতক (পাস) / ডিগ্রি' };
    }

    // 6. Bachelor's (Honours 4-year)
    if (lower.includes('অনার্স') || lower.includes('সম্মান') || lower.includes('honours') || lower.includes('honors') || lower.includes('b.sc') || lower.includes('bsc') || lower.includes('bba') || lower.includes('b.a') || lower.includes('bachelor') || lower.includes('স্নাতক') || lower.includes('বিএসসি') || lower.includes('বি.এসসি') || lower.includes('বিবিএ') || lower.includes('বিএসএস') || lower.includes('বিএ')) {
      return { level: 'bachelor', labelBn: 'স্নাতক (সম্মান) বা সমমান' };
    }

    // 7. Diploma
    if (lower.includes('ডিপ্লোমা') || lower.includes('diploma') || lower.includes('পলিটেকনিক') || lower.includes('polytechnic')) {
      return { level: 'diploma', labelBn: 'ডিপ্লোমা ইন ইঞ্জিনিয়ারিং / সমমান' };
    }

    // 8. Alim (Madrasah HSC equivalent)
    if (lower.includes('আলিম') || lower.includes('alim')) {
      return { level: 'alim', labelBn: 'আলিম (এইচএসসি সমমান)' };
    }

    // 9. HSC (Higher Secondary)
    if (lower.includes('এইচএসসি') || lower.includes('উচ্চ মাধ্যমিক') || lower.includes('hsc')) {
      return { level: 'hsc', labelBn: 'এইচএসসি / উচ্চ মাধ্যমিক' };
    }

    // 10. JDC (Junior Dakhil) — Check BEFORE Dakhil!
    if (lower.includes('জেডিসি') || lower.includes('jdc') || lower.includes('জুনিয়র দাখিল')) {
      return { level: 'jdc', labelBn: 'জেডিসি (জুনিয়র দাখিল সার্টিফিকেট)' };
    }

    // 11. Dakhil (Madrasah SSC equivalent)
    if (lower.includes('দাখিল') || lower.includes('dakhil')) {
      return { level: 'dakhil', labelBn: 'দাখিল (এসএসসি সমমান)' };
    }

    // 12. SSC (Secondary School Certificate)
    if (lower.includes('এসএসসি') || lower.includes('মাধ্যমিক') || lower.includes('ssc')) {
      return { level: 'ssc', labelBn: 'এসএসসি / মাধ্যমিক' };
    }

    // 13. JSC (Junior School Certificate) / 8th Pass
    if (lower.includes('অষ্টম') || lower.includes('৮ম') || lower.includes('জেএসসি') || lower.includes('jsc') || lower.includes('জুনিয়র স্কুল')) {
      return { level: 'jsc', labelBn: '৮ম শ্রেণি / জেএসসি' };
    }

    return { level: 'any', labelBn: 'শিক্ষাগত যোগ্যতা প্রযোজ্য নয়' };
  }

  /**
   * Extracts required subjects from requirement strings
   */
  public static extractSubjects(text: string): string[] {
    const subjects: string[] = [];
    const lower = text.toLowerCase();

    // If circular explicitly allows any subject ("যেকোনো বিষয়ে" / "any discipline")
    if (lower.includes('যেকোনো বিষয়') || lower.includes('যে কোন বিষয়') || lower.includes('যেকোনো ডিসিপ্লিন') || lower.includes('any discipline') || lower.includes('any subject')) {
      return [];
    }

    const subjectEntries: [string[], string][] = [
      [['cse', 'সিএসই', 'কম্পিউটার সায়েন্স', 'computer science'], 'Computer Science & Engineering'],
      [['আইসিটি', 'ict', 'তথ্য ও যোগাযোগ প্রযুক্তি'], 'Information & Communication Technology'],
      [['বিজ্ঞান', 'science', 'বিএসসি'], 'Science'],
      [['বাণিজ্য', 'commerce', 'হিসাববিজ্ঞান', 'ব্যবসা', 'bba', 'business'], 'Business Administration'],
      [['ফাইন্যান্স', 'finance'], 'Finance'],
      [['অর্থনীতি', 'economics'], 'Economics'],
      [['কৃষি', 'agriculture'], 'Agriculture'],
      [['আইন', 'llb', 'll.b', 'law'], 'Law'],
      [['ইংরেজি সাহিত্য', 'ইংরেজি বিষয়ে', 'english literature'], 'English'],
      [['বাংলা সাহিত্য', 'বাংলা বিষয়ে', 'bengali literature'], 'Bengali'],
      [['পরিসংখ্যান', 'statistics'], 'Statistics'],
      [['গণিত', 'mathematics'], 'Mathematics'],
      [['তড়িৎ', 'ইলেকট্রিক্যাল', 'eee', 'electrical'], 'Electrical Engineering'],
      [['সিভিল', 'civil engineering'], 'Civil Engineering'],
      [['যান্ত্রিক', 'মেকানিক্যাল', 'mechanical engineering'], 'Mechanical Engineering'],
      [['এমবিবিএস', 'mbbs', 'বিডিএস', 'bds', 'চিকিৎসা'], 'Medical / MBBS']
    ];

    for (const [keywords, label] of subjectEntries) {
      if (keywords.some(kw => lower.includes(kw))) {
        subjects.push(label);
      }
    }
    return Array.from(new Set(subjects));
  }

  /**
   * Extracts required and preferred skills from requirement strings
   */
  public static extractSkills(requirements: string[]): { required: string[]; preferred: string[] } {
    const required: string[] = [];
    const preferred: string[] = [];

    for (const req of requirements) {
      const lower = req.toLowerCase();
      const isPref = lower.includes('অগ্রাধিকার') || lower.includes('\u0985\u0997\u09cd\u09b0\u09be\u09a7\u09bf\u0995\u09be\u09b0') || lower.includes('prefer');

      for (const skill of CANONICAL_SKILLS) {
        const isMatched = skill.aliases.some(a => lower.includes(a.toLowerCase())) ||
          lower.includes(skill.id.toLowerCase()) ||
          lower.includes(skill.nameEn.toLowerCase()) ||
          lower.includes(skill.nameBn);

        if (isMatched) {
          if (isPref) preferred.push(skill.id);
          else required.push(skill.id);
        }
      }
    }

    return {
      required: Array.from(new Set(required)),
      preferred: Array.from(new Set(preferred))
    };
  }

  /**
   * Extracts required experience in years from requirements
   */
  public static extractExperienceYears(requirements: string[]): number {
    for (const req of requirements) {
      const lower = req.toLowerCase();
      // Skip age statements
      if (lower.includes('বয়স') || lower.includes('age') || lower.includes('জন্ম')) {
        continue;
      }
      // Must explicitly mention experience
      if (!lower.includes('অভিজ্ঞতা') && !lower.includes('experience')) {
        continue;
      }

      const match = req.match(/([0-9০-৯]{1,2})\s*\u09ac\u099b\u09b0/);
      if (match) {
        const rawNum = match[1];
        const bnDigits = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
        let enNum = rawNum;
        for (let i = 0; i < 10; i++) {
          enNum = enNum.split(bnDigits[i]).join(String(i));
        }
        const parsed = parseInt(enNum, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 30) {
          return parsed;
        }
      }
    }
    return 0;
  }

  /**
   * Classifies organization type based on org name and category
   */
  public static classifyOrgType(job: JobCircular): OrganizationTypePreference {
    const org = (job.organization || '').toLowerCase();
    const cat = (job.category || '').toLowerCase();

    if (cat === 'govt' || org.includes('\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09be\u09b2\u09af\u09bc') || org.includes('\u0985\u09a7\u09bf\u09a6\u09aa\u09cd\u09a4\u09b0') || org.includes('\u09ac\u09bf\u09ad\u09be\u0997') || org.includes('\u0995\u09ae\u09bf\u09b6\u09a8')) {
      return 'government';
    }
    if (cat === 'bank' || org.includes('\u09ac\u09cd\u09af\u09be\u0982\u0995') || org.includes('bank') || org.includes('\u0986\u09b0\u09cd\u09a5\u09bf\u0995')) {
      return 'bank';
    }
    if (org.includes('\u09ac\u09bf\u09b6\u09cd\u09ac\u09ac\u09bf\u09a6\u09cd\u09af\u09be\u09b2\u09af\u09bc') || org.includes('\u0995\u09b0\u09cd\u09a4\u09c3\u09aa\u0995\u09cd\u09b7') || org.includes('\u0995\u09b0\u09aa\u09cb\u09b0\u09c7\u09b6\u09a8') || org.includes('\u09ac\u09cb\u09b0\u09cd\u09a1')) {
      return 'autonomous';
    }
    if (org.includes('\u098f\u09a8\u099c\u09bf\u0993') || org.includes('ngo') || org.includes('\u09ab\u09be\u0989\u09a8\u09cd\u09a1\u09c7\u09b6\u09a8')) {
      return 'ngo';
    }
    return 'private_company';
  }

  /**
   * Parses numerical salary range if disclosed in salary text
   */
  public static parseSalaryRange(salaryStr?: string | null): { min?: number; max?: number; isUndisclosed: boolean; isNegotiable: boolean } {
    if (!salaryStr || !salaryStr.trim()) {
      return { isUndisclosed: true, isNegotiable: false };
    }
    const clean = salaryStr.trim();
    if (clean.includes('\u0986\u09b2\u09cb\u099a\u09a8\u09be') || clean.includes('negotiable')) {
      return { isUndisclosed: false, isNegotiable: true };
    }

    const bnDigits = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
    let enStr = clean.replace(/,/g, '');
    for (let i = 0; i < 10; i++) {
      enStr = enStr.split(bnDigits[i]).join(String(i));
    }

    const numbers = enStr.match(/\d{4,7}/g);
    if (numbers && numbers.length >= 2) {
      return {
        min: parseInt(numbers[0], 10),
        max: parseInt(numbers[1], 10),
        isUndisclosed: false,
        isNegotiable: false
      };
    } else if (numbers && numbers.length === 1) {
      return {
        min: parseInt(numbers[0], 10),
        max: parseInt(numbers[0], 10),
        isUndisclosed: false,
        isNegotiable: false
      };
    }

    return { isUndisclosed: true, isNegotiable: false };
  }

  /**
   * Normalizes full canonical JobCircular into structured NormalizedJobRequirements
   */
  public static normalize(job: JobCircular): NormalizedJobRequirements {
    return this.normalizeJob(job);
  }

  public static normalizeJob(job: JobCircular): NormalizedJobRequirements {
    const allReqs = [...(job.requirements || [])];
    if (job.minEducation) allReqs.push(job.minEducation);

    const fullReqText = allReqs.join(' ');
    const edu = this.normalizeEducationLevel(job.minEducation || fullReqText);
    const eduReqLines = allReqs.filter(r => {
      const lower = r.toLowerCase();
      return lower.includes('স্নাতক') || lower.includes('ডিগ্রি') || lower.includes('মাস্টার্স') || 
             lower.includes('বিএসসি') || lower.includes('বিভাগ') || lower.includes('বিষয়') ||
             lower.includes('ডিপ্লোমা') || lower.includes('এইচএসসি') || lower.includes('এসএসসি') || 
             lower.includes('সম্মান') || lower.includes('অনার্স');
    });
    const eduReqText = (job.minEducation ? [job.minEducation, ...eduReqLines] : (eduReqLines.length > 0 ? eduReqLines : allReqs)).join(' ');
    const subjects = this.extractSubjects(eduReqText);
    const { required: reqSkills, preferred: prefSkills } = this.extractSkills(allReqs);
    const expYears = this.extractExperienceYears(allReqs);
    const orgType = this.classifyOrgType(job);
    const salary = this.parseSalaryRange(job.salary);

    const districtsStr = (job.districts || '').trim();
    const isAllBD = districtsStr.includes('সকল জেলা') || districtsStr.includes('সমগ্র বাংলাদেশ') || districtsStr.includes('\u09b8\u0995\u09b2') || districtsStr.includes('\u09b8\u09ae\u0997\u09cd\u09b0') || districtsStr.toLowerCase().includes('all') || !districtsStr;
    const districtsList = isAllBD 
      ? ['\u09b8\u0995\u09b2 \u099c\u09c7\u09b2\u09be'] 
      : districtsStr.split(/[,\/]+/).map(d => d.trim()).filter(Boolean);

    return {
      jobId: job.id,
      requiredEducationLevel: edu.level,
      requiredEducationLevelBn: edu.labelBn,
      requiredDegrees: [edu.labelBn],
      requiredSubjects: subjects,
      requiredSkills: reqSkills,
      preferredSkills: prefSkills,
      requiredExperienceYears: expYears,
      minAge: job.minAge,
      maxAge: job.maxAge,
      districts: districtsList,
      allBangladesh: isAllBD,
      category: job.category || 'govt',
      organizationType: orgType,
      employmentType: 'full_time',
      salaryMin: salary.min,
      salaryMax: salary.max,
      isSalaryNegotiable: salary.isNegotiable,
      isSalaryUndisclosed: salary.isUndisclosed,
      verificationStatuses: {
        education: job.minEducation ? 'REQUIRED' : 'NOT_SPECIFIED',
        skills: reqSkills.length > 0 ? 'REQUIRED' : 'NOT_SPECIFIED',
        experience: expYears > 0 ? 'REQUIRED' : 'NOT_SPECIFIED',
        location: isAllBD ? 'NOT_SPECIFIED' : 'REQUIRED',
        age: (job.minAge || job.maxAge) ? 'REQUIRED' : 'NOT_SPECIFIED'
      }
    };
  }
}
