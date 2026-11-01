const fs = require('fs');
const path = require('path');

// 1. Patch engine.ts
const enginePath = path.join(__dirname, '../src/lib/matching/engine.ts');
let engineContent = fs.readFileSync(enginePath, 'utf8');

// Update EDU_HIERARCHY
const oldHierarchy = /const EDU_HIERARCHY: Record<NormalizedEducationLevel, number> = \{[\s\S]*?\};/;
const newHierarchy = `const EDU_HIERARCHY: Record<NormalizedEducationLevel, number> = {
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
};`;

engineContent = engineContent.replace(oldHierarchy, newHierarchy);

// Add calculateExactAge if not present or replace calculateAge
const oldCalcAge = /public static calculateAge\([^\)]*\): number \| null \{[\s\S]*?return age;\s*\}/;
const newCalcAge = `public static calculateAge(dobStr?: string, refDate: Date = new Date()): number | null {
    const res = this.calculateExactAge(dobStr, refDate.toISOString().split('T')[0]);
    return res ? res.years : null;
  }

  public static calculateExactAge(dobStr?: string, cutOffDateStr?: string): { years: number; months: number; days: number; totalYearsExact: number } | null {
    if (!dobStr || !dobStr.trim()) return null;
    let birthDate: Date;
    const parts = dobStr.split(/[\\-\\/\\.]/);
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
      const cParts = cutOffDateStr.split(/[\\-\\/\\.]/);
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
  }`;

engineContent = engineContent.replace(oldCalcAge, newCalcAge);

// Replace evaluateEligibility
const oldEvalElig = /public static evaluateEligibility\([\s\S]*?return \{\s*status: 'MEETS_VERIFIED_REQUIREMENTS',[\s\S]*?\};\s*\}/;
const newEvalElig = `public static evaluateEligibility(
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
        labelBn: \`প্রোফাইল তথ্য অসম্পূর্ণ (অনুপস্থিত: \${missingFields.join(', ')})\`,
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
          labelBn: \`বয়সসীমার নিচে (বয়স \${ageResult.years} বছর \${ageResult.months} মাস, আবশ্যক সর্বনিম্ন \${effectiveMinAge} বছর)\`,
          missingFields: [],
          isHardDisqualified: true
        };
      }

      if (isTooOld) {
        return {
          status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
          labelBn: \`বয়সসীমা অতিক্রান্ত (বয়স \${ageResult.years} বছর \${ageResult.months} মাস \${ageResult.days} দিন, সর্বোচ্চ অনুমোদিত \${effectiveMaxAge} বছর\${hasQuota ? ' [কোটা সুবিধাসহ]' : ''})\`,
          missingFields: [],
          isHardDisqualified: true
        };
      }
    }

    // 2. Mandatory Education Level & Subject Check
    if (highestEdu && effectiveReqs.requiredEducationLevel !== 'any') {
      const candidateRank = EDU_HIERARCHY[highestEdu.level as NormalizedEducationLevel] || 0;
      const requiredRank = EDU_HIERARCHY[effectiveReqs.requiredEducationLevel] || 0;

      if (candidateRank < requiredRank) {
        return {
          status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
          labelBn: \`শিক্ষাগত যোগ্যতা পূরণ হয়নি (প্রয়োজন \${effectiveReqs.requiredEducationLevelBn}, প্রার্থীর যোগ্যতা \${highestEdu.degreeName})\`,
          missingFields: [],
          isHardDisqualified: true
        };
      }

      // Check subject if job strictly requires specific subjects
      if (effectiveReqs.requiredSubjects && effectiveReqs.requiredSubjects.length > 0) {
        const userSubject = (highestEdu.subject || '').trim().toLowerCase();
        if (!userSubject) {
          return {
            status: 'NEEDS_MORE_INFORMATION',
            labelBn: \`ডিগ্রির মূল বিষয়ের তথ্য অনুপস্থিত (আবশ্যক: \${effectiveReqs.requiredSubjects.join(', ')})\`,
            missingFields: ['ডিগ্রির মূল বিষয় (Major Subject)'],
            isHardDisqualified: false
          };
        }
        const matchesSubject = effectiveReqs.requiredSubjects.some(reqSub => {
          const s = reqSub.toLowerCase();
          return userSubject.includes(s) || s.includes(userSubject);
        });
        if (!matchesSubject) {
          return {
            status: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
            labelBn: \`আবশ্যক বিষয় পূরণ হয়নি (প্রয়োজন: \${effectiveReqs.requiredSubjects.join(', ')}, প্রার্থীর বিষয়: \${highestEdu.subject})\`,
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
        labelBn: \`অভিজ্ঞতার শর্ত পূরণ হয়নি (আবশ্যক \${effectiveReqs.requiredExperienceYears} বছর, প্রার্থীর আছে \${userExperienceYears} বছর)\`,
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
          labelBn: \`আবশ্যক দক্ষতা অনুপস্থিত (ঘাটতি: \${missingMandatory.join(', ')})\`,
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
          labelBn: \`জেলা কোটা বহির্ভূত (বিজ্ঞপ্তিটি শুধুমাত্র \${effectiveReqs.districts.join(', ')} জেলার প্রার্থীদের জন্য)\`,
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
  }`;

engineContent = engineContent.replace(oldEvalElig, newEvalElig);
fs.writeFileSync(enginePath, engineContent, 'utf8');
console.log('✅ engine.ts updated');

// 2. Patch recommender.ts
const recommenderPath = path.join(__dirname, '../src/lib/matching/recommender.ts');
let recContent = fs.readFileSync(recommenderPath, 'utf8');

const oldNotify = /public static notifyCandidateOnTopMatches\(candidateId: string\): number \{[\s\S]*?return sentCount;\s*\}/;
const newNotify = `public static notifyCandidateOnTopMatches(candidateId: string): number {
    const candidate = serverDB.getCandidateById(candidateId);
    if (!candidate) return 0;
    const feeds = this.getRecommendations(candidate, { minScore: 90 });
    const existingNotifs = serverDB.getCandidateNotifications(candidateId) || [];
    let sentCount = 0;

    for (const rec of feeds.bestMatches.slice(0, 3)) {
      if (rec.match.eligibilityStatus !== 'MEETS_VERIFIED_REQUIREMENTS') {
        continue; // Never notify ineligible candidates!
      }
      const alreadyNotified = existingNotifs.some(n => 
        (n.message && n.message.includes(rec.job.id)) || 
        (n.link && n.link.includes(rec.job.id)) ||
        (n.title && n.title.includes(rec.job.title))
      );
      if (!alreadyNotified) {
        serverDB.addCandidateNotification(candidateId, {
          title: \`উৎকৃষ্ট চাকরির সুযোগ: \${rec.job.title}\`,
          message: \`আপনার শিক্ষাগত যোগ্যতা ও স্কিলের সাথে সরাসরি সামঞ্জস্যপূর্ণ চাকরি প্রকাশিত হয়েছে। প্রতিষ্ঠান: \${rec.job.organization}\`,
          type: 'system',
          link: \`/jobs/\${rec.job.slug || rec.job.id}\`
        });
        sentCount++;
      }
    }
    return sentCount;
  }`;

recContent = recContent.replace(oldNotify, newNotify);
fs.writeFileSync(recommenderPath, recContent, 'utf8');
console.log('✅ recommender.ts updated');
