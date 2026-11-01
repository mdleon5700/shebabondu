const fs = require('fs');
let s64 = fs.readFileSync('src/lib/testing/scenarios/64-gemini-independence-operational-resilience-regression-audit.ts', 'utf8');
s64 = s64.replace("import { MatchingEngine } from '../../matching/engine';", "import { SmartJobMatchingEngine } from '../../matching/engine';");
s64 = s64.replace("const matchResult = MatchingEngine.evaluate(sampleCandidate as any, sampleJob as any);", `const matchResult = SmartJobMatchingEngine.evaluateMatch(
      {
        id: 'SYNTH-USR-DHAKA-001',
        name: 'আহমেদ হাসান',
        dateOfBirth: '1998-05-15',
        education: [{ level: 'bachelor', degreeName: 'B.Sc in CSE', passingYear: '2020', result: '3.65' }],
        skills: ['computer_operation', 'ms_office'],
        district: 'ঢাকা',
        hasQuota: false
      } as any,
      {
        id: 'JOB-AI-INDEP-01',
        title: 'কম্পিউটার অপারেটর',
        organization: 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
        minEducation: 'hsc',
        requiredSkills: ['computer_operation'],
        minAge: 18,
        maxAge: 30,
        quotaAgeLimit: 32,
        allBangladesh: true
      } as any
    );`);
s64 = s64.replace("actual: matchResult.status,", "actual: matchResult.eligibilityStatus,");
s64 = s64.replace("passed: matchResult.status === 'MEETS_VERIFIED_REQUIREMENTS'", "passed: matchResult.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS'");
s64 = s64.replace("String(matchResult.score >= 80)", "String(matchResult.overallScore >= 80)");
s64 = s64.replace("matchResult.score >= 80", "matchResult.overallScore >= 80");

fs.writeFileSync('src/lib/testing/scenarios/64-gemini-independence-operational-resilience-regression-audit.ts', s64, 'utf8');
console.log('Fixed Scenario 64.');
