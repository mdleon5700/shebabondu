/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 09: CENTRAL SMART MATCHING ENGINE
 * Deterministic, Explainable Multi-Dimensional Job Matching & Hard Eligibility Evaluator
 */

import { CandidateProfile, JobCircular } from '../types';
import { 
  JobMatchResult, 
  MatchingDimensionBreakdown, 
  MandatoryEligibilityStatus, 
  MatchDisplayBand,
  MatchingEngineConfig,
  NormalizedEducationLevel,
  NormalizedJobRequirements,
  EducationDimensionScore,
  SkillsDimensionScore,
  ExperienceDimensionScore,
  LocationDimensionScore,
  DimensionScore,
  CareerPreferences
} from './types';
import { JobRequirementNormalizer } from './normalizer';
import { MatchExplainer } from './explainer';
import { SkillsTaxonomyManager } from './skills-taxonomy';

export const DEFAULT_MATCHING_CONFIG: MatchingEngineConfig = {
  version: 'v1.0.0',
  enabled: true,
  weights: {
    education: 25,
    skills: 25,
    experience: 15,
    category: 10,
    location: 10,
    employmentType: 5,
    organizationType: 5,
    salary: 5
  },
  minScoreToRecommend: 40,
  excellentThreshold: 90,
  strongThreshold: 75,
  goodThreshold: 60,
  partialThreshold: 40,
  allowOverqualification: true,
  quotaAgeRelaxationYears: 2,
  updatedAt: new Date().toISOString(),
  updatedBy: 'SYSTEM_DEFAULT'
};

const EDU_HIERARCHY: Record<NormalizedEducationLevel, number> = {
  jsc: 1,
  jdc: 1,
  ssc: 2,
  dakhil: 2,
  hsc: 3,
  alim: 3,
  diploma: 3.5,
  degree: 4,      // 3-year pass degree
  bachelor: 4.5,  // 4-year honours / professional degree
  masters: 5,
  kamil: 5,
  mphil: 5.5,
  phd: 6,
  any: 0
};

export class SmartJobMatchingEngine {
  /**
   * Calculates candidate age at reference date
   */
  public static calculateExactAge(dobStr?: string, cutOffDateStr?: string): { years: number; months: number; days: number; totalYearsExact: number } | null {
    if (!dobStr || !dobStr.trim()) return null;
    let birthDate: Date;
    const parts = dobStr.split(/[\-\/\.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        birthDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    } else {
      birthDate = new Date(dobStr);
    }
    if (isNaN(birthDate.getTime())) return null;

    let cutOff: Date;
    if (cutOffDateStr) {
      const cParts = cutOffDateStr.split(/[\-\/\.]/);
      if (cParts.length === 3 && cParts[0].length === 4) {
        cutOff = new Date(Number(cParts[0]), Number(cParts[1]) - 1, Number(cParts[2]));
      } else {
        cutOff = new Date(cutOffDateStr);
      }
    } else {
      cutOff = new Date();
    }
    if (isNaN(cutOff.getTime())) return null;

    if (birthDate > cutOff) return { years: 0, months: 0, days: 0, totalYearsExact: 0 };

    let years = cutOff.getFullYear() - birthDate.getFullYear();
    let months = cutOff.getMonth() - birthDate.getMonth();
    let days = cutOff.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthDays = new Date(cutOff.getFullYear(), cutOff.getMonth(), 0).getDate();
      days += prevMonthDays;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalYearsExact = years + (months / 12) + (days / 365.25);
    return { years, months, days, totalYearsExact };
  }

  public static calculateAge(dobStr?: string, refDate: Date = new Date()): number | null {
    if (!dobStr || !dobStr.trim()) return null;
    const parts = dobStr.split(/[\-\/\.]/);
    let birthDate: Date;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        // DD/MM/YYYY
        birthDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    } else {
      birthDate = new Date(dobStr);
    }
    if (isNaN(birthDate.getTime())) return null;

    let age = refDate.getFullYear() - birthDate.getFullYear();
    const m = refDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Resolves candidate's highest normalized education level
   */
  public static getCandidateHighestEducation(candidate: CandidateProfile): { level: NormalizedEducationLevel; degreeName: string; subject?: string } | null {
    if (!candidate.education || candidate.education.length === 0) return null;

    let highestLevel: NormalizedEducationLevel = 'any';
    let highestRank = -1;
    let highestDegree = '';
    let highestSubject: string | undefined = undefined;

    for (const edu of candidate.education) {
      const parsed = JobRequirementNormalizer.normalizeEducationLevel(edu.level + ' ' + (edu.degree || ''));
      const rank = EDU_HIERARCHY[parsed.level] || 0;
      if (rank > highestRank) {
        highestRank = rank;
        highestLevel = parsed.level;
        highestDegree = edu.degree || edu.level;
        highestSubject = edu.majorSubject;
      }
    }

    return {
      level: highestLevel,
      degreeName: highestDegree,
      subject: highestSubject
    };
  }

  /**
   * Resolves total candidate experience in years from experience records
   */
  public static getCandidateTotalExperienceYears(candidate: CandidateProfile): number {
    if (!candidate.experiences || candidate.experiences.length === 0) return 0;

    let totalMonths = 0;
    for (const exp of candidate.experiences) {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent ? new Date() : new Date(exp.endDate || new Date());
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, diffMonths);
      }
    }
    return Math.round((totalMonths / 12) * 10) / 10;
  }

  /**
   * Resolves list of candidate skill tokens
   */
  public static getCandidateSkillTokens(candidate: CandidateProfile): string[] {
    const tokens: string[] = [];
    if (!candidate.skills) return tokens;

    for (const s of candidate.skills) {
      const raw = typeof s === 'string' ? s : (s as any).name || (s as any).id || '';
      if (!raw) continue;
      const clean = raw.trim().toLowerCase();
      tokens.push(clean);

      const canonical = SkillsTaxonomyManager.normalizeSkill(raw);
      if (canonical) {
        tokens.push(canonical.id.toLowerCase());
        tokens.push(canonical.nameEn.toLowerCase());
        canonical.aliases.forEach(a => tokens.push(a.toLowerCase()));
      }
    }
        // Technical candidates implicitly possess basic computer operation
    const hasTechnicalSkill = tokens.some(t => t.includes('python') || t.includes('javascript') || t.includes('excel') || t.includes('programming') || t.includes('software') || t.includes('data'));
    const hasTechnicalEdu = (candidate.education || []).some(e => {
      const txt = ((e.degree || '') + ' ' + (e.majorSubject || '')).toLowerCase();
      return txt.includes('cse') || txt.includes('computer') || txt.includes('engineering') || txt.includes('science');
    });
    if (hasTechnicalSkill || hasTechnicalEdu) {
      tokens.push('computer_operation');
      tokens.push('কম্পিউটার চালনা');
      tokens.push('কম্পিউটার পরিচালনা');
    }
    return Array.from(new Set(tokens));
  }

  /**
   * Evaluates Hard Mandatory Eligibility vs Preference Discrepancies
   */
  public static evaluateEligibility(
    candidate: CandidateProfile,
    job: JobCircular | NormalizedJobRequirements,
    normalizedReqs?: ReturnType<typeof JobRequirementNormalizer.normalizeJob>,
    refDate: Date = new Date()
  ): { status: MandatoryEligibilityStatus; labelBn: string; missingFields: string[]; isHardDisqualified: boolean } {
    const effectiveReqs: NormalizedJobRequirements = normalizedReqs || (
      'requiredEducationLevel' in (job as any)
        ? (job as any)
        : JobRequirementNormalizer.normalizeJob(job as JobCircular)
    );
    const missingFields: string[] = [];

    // Reference Date & Cut-off Date
    const cutOffDateStr = (job as any).ageCutOffDate || (job as any).applicationDeadline || (typeof refDate === 'string' ? refDate : refDate.toISOString().split('T')[0]);

    // Check Candidate DOB
    const dobStr = candidate.dob || (candidate as any).dateOfBirth;
    const ageResult = this.calculateExactAge(dobStr, cutOffDateStr);
    if (!ageResult) {
      missingFields.push('জন্মতারিখ (DOB)');
    }

    // Check Candidate Education
    const highestEdu = this.getCandidateHighestEducation(candidate);
    if (!highestEdu && effectiveReqs.requiredEducationLevel !== 'any') {
      missingFields.push('শিক্ষাগত যোগ্যতা');
    }

    // If critical fields are missing, mark NEEDS_MORE_INFORMATION
    if (missingFields.length > 0) {
      return {
        status: 'NEEDS_MORE_INFORMATION',
        labelBn: `প্রোফাইল তথ্য অসম্পূর্ণ (অনুপস্থিত: ${missingFields.join(', ')})`,
        missingFields,
        isHardDisqualified: false
      };
    }

    // 1. Mandatory Age Check
    if (ageResult && (effectiveReqs.minAge || effectiveReqs.maxAge)) {
      const hasQuota = candidate.quota && (candidate.quota === 'freedom_fighter' || candidate.quota === 'disabled');
      const quotaRelaxation = hasQuota ? DEFAULT_MATCHING_CONFIG.quotaAgeRelaxationYears : 0;
      const effectiveMaxAge = (effectiveReqs.maxAge || 100) + quotaRelaxation;
      const effectiveMinAge = effectiveReqs.minAge || 18;

      const isTooYoung = ageResult.years < effectiveMinAge;
      const isTooOld = ageResult.years > effectiveMaxAge || (ageResult.years === effectiveMaxAge && (ageResult.months > 0 || ageResult.days > 0));

      if (isTooYoung) {
        return {
          status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
          labelBn: `বয়সসীমার নিচে (বয়স ${ageResult.years} বছর ${ageResult.months} মাস, আবশ্যক সর্বনিম্ন ${effectiveMinAge} বছর)`,
          missingFields: [],
          isHardDisqualified: true
        };
      }

      if (isTooOld) {
        return {
          status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
          labelBn: `বয়সসীমা অতিক্রান্ত (বয়স ${ageResult.years} বছর ${ageResult.months} মাস ${ageResult.days} দিন, সর্বোচ্চ অনুমোদিত ${effectiveMaxAge} বছর${hasQuota ? ' [কোটা সুবিধাসহ]' : ''})`,
          missingFields: [],
          isHardDisqualified: true
        };
      }
    }

    // 2. Mandatory Education Level Check
    if (highestEdu) {
      if (effectiveReqs.requiredEducationLevel !== 'any') {
        const candidateRank = EDU_HIERARCHY[highestEdu.level as NormalizedEducationLevel] || 0;
        const requiredRank = EDU_HIERARCHY[effectiveReqs.requiredEducationLevel] || 0;

        if (candidateRank < requiredRank) {
          return {
            status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
            labelBn: `শিক্ষাগত যোগ্যতা পূরণ হয়নি (প্রয়োজন ${effectiveReqs.requiredEducationLevelBn}, প্রার্থীর যোগ্যতা ${highestEdu.degreeName})`,
            missingFields: [],
            isHardDisqualified: true
          };
        }
      }

      // Check subject if job strictly requires specific subjects
      if (effectiveReqs.requiredSubjects && effectiveReqs.requiredSubjects.length > 0) {
        const userSubject = (highestEdu.subject || '').trim().toLowerCase();
        const userDeg = (highestEdu.degreeName || '').toLowerCase();
        if (!userSubject && !userDeg) {
          return {
            status: 'NEEDS_MORE_INFORMATION',
            labelBn: `ডিগ্রির মূল বিষয়ের তথ্য অনুপস্থিত (আবশ্যক: ${effectiveReqs.requiredSubjects.join(', ')})`,
            missingFields: ['ডিগ্রির মূল বিষয় (Major Subject)'],
            isHardDisqualified: false
          };
        }
        const matchesSubject = effectiveReqs.requiredSubjects.some(reqSub => {
          const s = reqSub.toLowerCase();
          if (userSubject.includes(s) || s.includes(userSubject)) return true;
          if (userDeg.includes(s) || s.includes(userDeg)) return true;
          if ((userSubject.includes('cse') || userSubject.includes('computer') || userDeg.includes('computer')) && s.includes('computer')) return true;
          if ((userSubject.includes('science') || userSubject.includes('বিজ্ঞান')) && s.includes('science')) return true;
          if ((userSubject.includes('commerce') || userSubject.includes('business') || userSubject.includes('bba')) && (s.includes('business') || s.includes('commerce') || s.includes('finance') || s.includes('accounting'))) return true;
          return false;
        });
        if (!matchesSubject) {
          return {
            status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
            labelBn: `আবশ্যক বিষয় পূরণ হয়নি (প্রয়োজন: ${effectiveReqs.requiredSubjects.join(', ')}, প্রার্থীর বিষয়: ${highestEdu.subject || highestEdu.degreeName})`,
            missingFields: [],
            isHardDisqualified: true
          };
        }
      }
    }

    // 3. Mandatory Experience Check
    const userExperienceYears = this.getCandidateTotalExperienceYears(candidate);
    if (effectiveReqs.requiredExperienceYears > 0 && userExperienceYears < effectiveReqs.requiredExperienceYears) {
      return {
        status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
        labelBn: `অভিজ্ঞতার শর্ত পূরণ হয়নি (আবশ্যক ${effectiveReqs.requiredExperienceYears} বছর, প্রার্থীর আছে ${userExperienceYears} বছর)`,
        missingFields: [],
        isHardDisqualified: true
      };
    }

    // 4. Mandatory Skills Check
    if (effectiveReqs.requiredSkills && effectiveReqs.requiredSkills.length > 0) {
      const candSkills = this.getCandidateSkillTokens(candidate);
      const missingMandatory = effectiveReqs.requiredSkills.filter(reqSkill => {
        const lower = reqSkill.toLowerCase();
        return !candSkills.some(cs => cs.includes(lower) || lower.includes(cs));
      });
      if (missingMandatory.length > 0) {
        return {
          status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
          labelBn: `আবশ্যক দক্ষতা অনুপস্থিত (ঘাটতি: ${missingMandatory.join(', ')})`,
          missingFields: [],
          isHardDisqualified: true
        };
      }
    }

    // 5. Mandatory District Quota Check
    if (!effectiveReqs.allBangladesh && effectiveReqs.districts && effectiveReqs.districts.length > 0) {
      const candDistrict = (candidate.district || '').trim();
      if (!candDistrict) {
        return {
          status: 'NEEDS_MORE_INFORMATION',
          labelBn: 'স্থায়ী জেলার তথ্য অনুপস্থিত',
          missingFields: ['স্থায়ী জেলা'],
          isHardDisqualified: false
        };
      }
      const isAllowed = effectiveReqs.districts.some((d: string) => d.includes(candDistrict) || candDistrict.includes(d));
      if (!isAllowed) {
        return {
          status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
          labelBn: `জেলা কোটা বহির্ভূত (বিজ্ঞপ্তিটি শুধুমাত্র ${effectiveReqs.districts.join(', ')} জেলার প্রার্থীদের জন্য)`,
          missingFields: [],
          isHardDisqualified: true
        };
      }
    }

    return {
      status: 'MEETS_VERIFIED_REQUIREMENTS',
      labelBn: 'সকল যাচাইকৃত শর্তাবলি পূরণ হয়েছে',
      missingFields: [],
      isHardDisqualified: false
    };
  }

  /**
   * Main Matching Computation: Evaluates dimensions and computes weighted score
   */
  public static evaluateMatch(
    candidate: CandidateProfile,
    job: JobCircular,
    config: MatchingEngineConfig = DEFAULT_MATCHING_CONFIG,
    refDate: Date = new Date()
  ): JobMatchResult {
    const normalizedReqs = JobRequirementNormalizer.normalizeJob(job);
    const eligibility = this.evaluateEligibility(candidate, job, normalizedReqs, refDate);

    // 1. Education Dimension
    const highestEdu = this.getCandidateHighestEducation(candidate);
    let eduScore = 0;
    let eduMatchedDegree = highestEdu?.degreeName;
    let subjectMatch = false;

    if (highestEdu) {
      const candRank = EDU_HIERARCHY[highestEdu.level as NormalizedEducationLevel] || 0;
      const reqRank = EDU_HIERARCHY[normalizedReqs.requiredEducationLevel] || 0;

      if (candRank === reqRank) {
        eduScore = 100;
      } else if (candRank > reqRank) {
        eduScore = config.allowOverqualification ? 95 : 70;
      } else {
        eduScore = 0;
      }

      if (normalizedReqs.requiredSubjects.length > 0 && highestEdu.subject) {
        const candSub = highestEdu.subject.toLowerCase();
        subjectMatch = normalizedReqs.requiredSubjects.some(s => s.toLowerCase().includes(candSub) || candSub.includes(s.toLowerCase()));
        if (!subjectMatch && candRank === reqRank) {
          eduScore = Math.max(50, eduScore - 20);
        }
      }
    } else {
      eduScore = normalizedReqs.requiredEducationLevel === 'any' ? 100 : 0;
    }

    const educationDim: EducationDimensionScore = {
      score: eduScore,
      effectiveWeight: config.weights.education,
      weightedContribution: (eduScore * config.weights.education) / 100,
      status: eduScore >= 90 ? 'EXACT_MATCH' : eduScore >= 60 ? 'ACCEPTABLE_MATCH' : 'MISMATCH',
      detailsBn: normalizedReqs.requiredEducationLevelBn,
      candidateLevel: highestEdu?.level,
      requiredLevel: normalizedReqs.requiredEducationLevel,
      matchedDegree: eduMatchedDegree,
      subjectMatch
    };

    // 2. Skills Dimension
    const candSkills = this.getCandidateSkillTokens(candidate);
    const matchedSkills: string[] = [];
    const missingReq: string[] = [];
    const missingPref: string[] = [];

    for (const reqSkill of normalizedReqs.requiredSkills) {
      if (candSkills.some(cs => cs.includes(reqSkill) || reqSkill.includes(cs))) {
        matchedSkills.push(reqSkill);
      } else {
        missingReq.push(reqSkill);
      }
    }

    for (const prefSkill of normalizedReqs.preferredSkills) {
      if (candSkills.some(cs => cs.includes(prefSkill) || prefSkill.includes(cs))) {
        matchedSkills.push(prefSkill);
      } else {
        missingPref.push(prefSkill);
      }
    }

    let skillsScore = 100;
    if (normalizedReqs.requiredSkills.length > 0) {
      const reqRatio = (normalizedReqs.requiredSkills.length - missingReq.length) / normalizedReqs.requiredSkills.length;
      skillsScore = Math.round(reqRatio * 85);
      if (normalizedReqs.preferredSkills.length > 0) {
        const prefRatio = (normalizedReqs.preferredSkills.length - missingPref.length) / normalizedReqs.preferredSkills.length;
        skillsScore = Math.min(100, skillsScore + Math.round(prefRatio * 15));
      }
    } else if (candSkills.length > 0) {
      skillsScore = 90;
    }

    const skillsDim: SkillsDimensionScore = {
      score: skillsScore,
      effectiveWeight: config.weights.skills,
      weightedContribution: (skillsScore * config.weights.skills) / 100,
      status: skillsScore >= 80 ? 'EXACT_MATCH' : skillsScore >= 50 ? 'PARTIAL_MATCH' : 'MISMATCH',
      detailsBn: matchedSkills.length > 0 ? `${matchedSkills.length}টি দক্ষতা মিলেছে` : 'দক্ষতা প্রযোজ্য নয়',
      matchedSkills,
      missingRequired: missingReq,
      missingPreferred: missingPref
    };

    // 3. Experience Dimension
    const userYears = this.getCandidateTotalExperienceYears(candidate);
    const reqYears = normalizedReqs.requiredExperienceYears;
    let expScore = 100;

    if (reqYears > 0) {
      if (userYears >= reqYears) {
        expScore = 100;
      } else if (userYears > 0) {
        expScore = Math.round((userYears / reqYears) * 75);
      } else {
        expScore = 20;
      }
    } else {
      expScore = 100;
    }

    const experienceDim: ExperienceDimensionScore = {
      score: expScore,
      effectiveWeight: config.weights.experience,
      weightedContribution: (expScore * config.weights.experience) / 100,
      status: expScore >= 80 ? 'EXACT_MATCH' : expScore >= 50 ? 'PARTIAL_MATCH' : 'MISMATCH',
      detailsBn: reqYears === 0 ? 'ফ্রেশারদের জন্য উন্মুক্ত' : `প্রয়োজন ${reqYears} বছর (আপনার আছে ${userYears} বছর)`,
      userYears,
      requiredYears: reqYears,
      isFresherFriendly: reqYears === 0
    };

    // 4. Category Dimension
    const prefs: CareerPreferences = (candidate as any).careerPreferences || {
      preferredCategories: [],
      preferredOrgTypes: [],
      preferredJobTitles: [],
      preferredEmploymentTypes: [],
      preferredDivisions: [],
      preferredDistricts: [],
      remotePreference: 'any'
    };

    let catScore = 100;
    if (prefs.preferredCategories && prefs.preferredCategories.length > 0) {
      const jobCat = (job.category || '').toLowerCase();
      const isMatched = prefs.preferredCategories.some(c => c.toLowerCase() === jobCat || (job.categoryLabel && job.categoryLabel.includes(c)));
      catScore = isMatched ? 100 : 30;
    }

    const categoryDim: DimensionScore = {
      score: catScore,
      effectiveWeight: config.weights.category,
      weightedContribution: (catScore * config.weights.category) / 100,
      status: catScore >= 80 ? 'EXACT_MATCH' : 'PARTIAL_MATCH',
      detailsBn: job.categoryLabel || job.category || 'সাধারণ'
    };

    // 5. Location Dimension
    let locScore = 100;
    let matchedDistrict: string | undefined = undefined;

    if (normalizedReqs.allBangladesh) {
      locScore = 100;
      matchedDistrict = 'সমগ্র বাংলাদেশ';
    } else {
      const candDist = (candidate.district || '').trim();
      const prefDistricts = prefs.preferredDistricts || [];
      const isCandidateDistrictMatch = normalizedReqs.districts.some(d => d.includes(candDist) || candDist.includes(d));
      const isPreferredDistrictMatch = prefDistricts.some(pd => normalizedReqs.districts.some(d => d.includes(pd) || pd.includes(d)));

      if (isCandidateDistrictMatch || isPreferredDistrictMatch) {
        locScore = 100;
        matchedDistrict = isCandidateDistrictMatch ? candDist : prefDistricts[0];
      } else {
        locScore = 50;
      }
    }

    const locationDim: LocationDimensionScore = {
      score: locScore,
      effectiveWeight: config.weights.location,
      weightedContribution: (locScore * config.weights.location) / 100,
      status: locScore >= 80 ? 'EXACT_MATCH' : 'PARTIAL_MATCH',
      detailsBn: normalizedReqs.allBangladesh ? 'সমগ্র বাংলাদেশ' : normalizedReqs.districts.join(', '),
      isAllBangladesh: normalizedReqs.allBangladesh,
      userDistrict: candidate.district,
      matchedDistrict
    };

    // 6. Employment Type Dimension
    let empScore = 100;
    if (prefs.preferredEmploymentTypes && prefs.preferredEmploymentTypes.length > 0) {
      const match = prefs.preferredEmploymentTypes.includes('any') || prefs.preferredEmploymentTypes.includes(normalizedReqs.employmentType);
      empScore = match ? 100 : 50;
    }
    const employmentTypeDim: DimensionScore = {
      score: empScore,
      effectiveWeight: config.weights.employmentType,
      weightedContribution: (empScore * config.weights.employmentType) / 100,
      status: empScore >= 80 ? 'EXACT_MATCH' : 'PARTIAL_MATCH',
      detailsBn: 'ফুল-টাইম'
    };

    // 7. Organization Type Dimension
    let orgScore = 100;
    if (prefs.preferredOrgTypes && prefs.preferredOrgTypes.length > 0) {
      const match = prefs.preferredOrgTypes.includes('any') || prefs.preferredOrgTypes.includes(normalizedReqs.organizationType);
      orgScore = match ? 100 : 40;
    }
    const organizationTypeDim: DimensionScore = {
      score: orgScore,
      effectiveWeight: config.weights.organizationType,
      weightedContribution: (orgScore * config.weights.organizationType) / 100,
      status: orgScore >= 80 ? 'EXACT_MATCH' : 'PARTIAL_MATCH',
      detailsBn: normalizedReqs.organizationType
    };

    // 8. Salary Dimension
    let salScore = 100;
    if (prefs.preferredSalaryMin && normalizedReqs.salaryMax) {
      if (normalizedReqs.salaryMax >= prefs.preferredSalaryMin) {
        salScore = 100;
      } else {
        salScore = Math.max(30, Math.round((normalizedReqs.salaryMax / prefs.preferredSalaryMin) * 80));
      }
    }
    const salaryDim: DimensionScore = {
      score: salScore,
      effectiveWeight: config.weights.salary,
      weightedContribution: (salScore * config.weights.salary) / 100,
      status: salScore >= 80 ? 'EXACT_MATCH' : 'PARTIAL_MATCH',
      detailsBn: job.salary || 'নির্ধারিত নয়'
    };

    const breakdown: MatchingDimensionBreakdown = {
      education: educationDim,
      skills: skillsDim,
      experience: experienceDim,
      category: categoryDim,
      location: locationDim,
      employmentType: employmentTypeDim,
      organizationType: organizationTypeDim,
      salary: salaryDim
    };

    let totalScore = 0;
    totalScore += educationDim.weightedContribution;
    totalScore += skillsDim.weightedContribution;
    totalScore += experienceDim.weightedContribution;
    totalScore += categoryDim.weightedContribution;
    totalScore += locationDim.weightedContribution;
    totalScore += employmentTypeDim.weightedContribution;
    totalScore += organizationTypeDim.weightedContribution;
    totalScore += salaryDim.weightedContribution;

    if (eligibility.isHardDisqualified) {
      totalScore = Math.min(30, totalScore);
    }

    const overallScore = Math.min(100, Math.max(0, Math.round(totalScore)));

    let displayBand: MatchDisplayBand = 'LOW';
    let displayBandBn = 'কম ম্যাচ (Low Match)';
    let displayBandColor = 'bg-slate-100 text-slate-700 border-slate-200';

    if (overallScore >= config.excellentThreshold) {
      displayBand = 'EXCELLENT';
      displayBandBn = 'উৎকৃষ্ট ম্যাচ (Excellent Match)';
      displayBandColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (overallScore >= config.strongThreshold) {
      displayBand = 'STRONG';
      displayBandBn = 'দৃঢ় ম্যাচ (Strong Match)';
      displayBandColor = 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (overallScore >= config.goodThreshold) {
      displayBand = 'GOOD';
      displayBandBn = 'ভালো ম্যাচ (Good Match)';
      displayBandColor = 'bg-teal-100 text-teal-800 border-teal-300';
    } else if (overallScore >= config.partialThreshold) {
      displayBand = 'PARTIAL';
      displayBandBn = 'আংশিক ম্যাচ (Partial Match)';
      displayBandColor = 'bg-amber-100 text-amber-800 border-amber-300';
    }

    let eligibilityBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (eligibility.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS') {
      eligibilityBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (eligibility.status === 'NEEDS_MORE_INFORMATION') {
      eligibilityBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    const matchReasonsBn = MatchExplainer.generateMatchReasons(job, breakdown, eligibility.status);
    const qualificationGapsBn = MatchExplainer.generateQualificationGaps(breakdown, eligibility.status);

    return {
      jobId: job.id,
      candidateId: candidate.id || '',
      overallScore,
      displayBand,
      displayBandBn,
      displayBandColor,
      eligibilityStatus: eligibility.status,
      eligibilityLabelBn: eligibility.labelBn,
      eligibilityBadgeColor,
      breakdown,
      matchReasonsBn,
      qualificationGapsBn,
      missingProfileFields: eligibility.missingFields,
      scoringVersion: config.version,
      calculatedAt: new Date().toISOString()
    };
  }
}
