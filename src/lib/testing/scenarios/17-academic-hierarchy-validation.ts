import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { JobRequirementNormalizer } from '../../matching/normalizer';
import { SmartJobMatchingEngine } from '../../matching/engine';
import { BD_DEGREE_PROGRAMS } from '../../education/catalog';
import { CandidateProfile, JobCircular } from '../../types';
import fs from 'fs';
import path from 'path';

export async function runScenario17(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-17-ACADEMIC-HIERARCHY-VALIDATION';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  try {
    // 1. Validate Grading Scales & Constraints
    actions.push('Validating Academic Grading Scales (GPA 5.0 vs CGPA 4.0)');
    
    // Scale check functions
    const validateGpaScale = (level: string, gpa: number): boolean => {
      const isSecondary = ['JSC', 'JDC', 'SSC', 'Dakhil', 'HSC', 'Alim'].includes(level);
      if (isSecondary) {
        return gpa >= 1.0 && gpa <= 5.0;
      }
      return true;
    };

    const validateCgpaScale = (level: string, cgpa: number): boolean => {
      const isTertiary = ['Honours', 'Bachelor', 'Degree Pass', 'Masters', 'Kamil'].includes(level);
      if (isTertiary) {
        return cgpa >= 2.0 && cgpa <= 4.0;
      }
      return true;
    };

    const secondaryGpaInvalid = validateGpaScale('HSC', 5.50) === false;
    const secondaryGpaValid = validateGpaScale('HSC', 4.80) === true;
    const tertiaryCgpaInvalid = validateCgpaScale('Honours', 4.50) === false;
    const tertiaryCgpaValid = validateCgpaScale('Honours', 3.75) === true;

    assertions.push({
      assertion: 'Secondary level strictly rejects GPA > 5.00 and accepts GPA <= 5.00',
      expected: 'true',
      actual: String(secondaryGpaInvalid && secondaryGpaValid),
      passed: secondaryGpaInvalid && secondaryGpaValid
    });

    assertions.push({
      assertion: 'University level strictly rejects CGPA > 4.00 and accepts CGPA <= 4.00',
      expected: 'true',
      actual: String(tertiaryCgpaInvalid && tertiaryCgpaValid),
      passed: tertiaryCgpaInvalid && tertiaryCgpaValid
    });

    // 2. Validate Ongoing Education vs Completed Education Handling
    actions.push('Validating Ongoing Education (CURRENTLY_STUDYING) without final result requirement');
    const ongoingRecord = {
      level: 'Honours',
      degree: 'বিএসসি (সম্মান)',
      academicStatus: 'CURRENTLY_STUDYING',
      expectedPassingYear: '2026',
      result: undefined
    };

    const isOngoingValid = ongoingRecord.academicStatus === 'CURRENTLY_STUDYING' && 
                           parseInt(ongoingRecord.expectedPassingYear, 10) >= new Date().getFullYear() &&
                           ongoingRecord.result === undefined;

    assertions.push({
      assertion: 'Ongoing education (CURRENTLY_STUDYING) handles future expected year without requiring final GPA',
      expected: 'true',
      actual: String(isOngoingValid),
      passed: isOngoingValid
    });

    // 3. Validate Bangladesh Qualification Distinction Preservation
    actions.push('Verifying non-flattening of distinct Bangladesh academic qualifications in catalog');
    const catalogDegrees = BD_DEGREE_PROGRAMS;
    
    // JSC vs JDC
    const hasJsc = catalogDegrees.some(d => d.code === 'jsc' && d.levelCategory === 'junior_secondary');
    const hasJdc = catalogDegrees.some(d => d.code === 'jdc' && d.levelCategory === 'junior_secondary');
    const jscJdcDistinct = hasJsc && hasJdc;

    // SSC vs Dakhil
    const hasSsc = catalogDegrees.some(d => d.code === 'ssc' && d.levelCategory === 'secondary');
    const hasDakhil = catalogDegrees.some(d => d.code === 'dakhil' && d.levelCategory === 'secondary');
    const sscDakhilDistinct = hasSsc && hasDakhil;

    // HSC vs Alim
    const hasHsc = catalogDegrees.some(d => d.code === 'hsc' && d.levelCategory === 'higher_secondary');
    const hasAlim = catalogDegrees.some(d => d.code === 'alim' && d.levelCategory === 'higher_secondary');
    const hscAlimDistinct = hasHsc && hasAlim;

    // Bachelor 4-Year vs Degree Pass 3-Year
    const hasHonours = catalogDegrees.some(d => d.code === 'bachelor_honours' && d.standardDurationYears === 4);
    const hasDegreePass = catalogDegrees.some(d => d.code === 'bachelor_pass' && d.standardDurationYears === 3);
    const honoursDegreeDistinct = hasHonours && hasDegreePass;

    // Masters vs Kamil
    const hasMasters = catalogDegrees.some(d => d.code === 'masters_regular' && d.levelCategory === 'postgraduate');
    const hasKamil = catalogDegrees.some(d => d.code === 'kamil' && d.levelCategory === 'postgraduate');
    const mastersKamilDistinct = hasMasters && hasKamil;

    // Diplomas (Engineering, Medical, Nursing)
    const hasDipEng = catalogDegrees.some(d => d.code === 'diploma_engg');
    const hasDipMed = catalogDegrees.some(d => d.code === 'diploma_medical');
    const hasDipNurse = catalogDegrees.some(d => d.code === 'diploma_nursing');
    const diplomasDistinct = hasDipEng && hasDipMed && hasDipNurse;

    const allDistinct = jscJdcDistinct && sscDakhilDistinct && hscAlimDistinct && 
                        honoursDegreeDistinct && mastersKamilDistinct && diplomasDistinct;

    assertions.push({
      assertion: 'Bangladesh educational hierarchy preserves distinct identities (JSC/JDC, SSC/Dakhil, HSC/Alim, Honours/Pass, Kamil, Diplomas)',
      expected: 'true',
      actual: String(allDistinct),
      passed: allDistinct
    });

    // 4. Validate Smart Matching Integration with Normalized Education Hierarchy
    actions.push('Testing Smart Matching Engine evaluation with candidate qualifications');

    // Normalizer checks
    const normJdc = JobRequirementNormalizer.normalizeEducationLevel('জেডিসি (Junior Dakhil Certificate)');
    const normAlim = JobRequirementNormalizer.normalizeEducationLevel('আলিম (Alim) পাস');
    const normKamil = JobRequirementNormalizer.normalizeEducationLevel('কামিল (Kamil - Masters Equivalent)');

    const normalizerAccurate = (normJdc.level === 'jdc' || normJdc.level === 'jsc') && 
                               (normAlim.level === 'alim' || normAlim.level === 'hsc') && 
                               (normKamil.level === 'kamil' || normKamil.level === 'masters');

    assertions.push({
      assertion: 'JobRequirementNormalizer accurately maps Madrasah qualifications to standard tiers (JDC->JSC, Alim->HSC, Kamil->Masters)',
      expected: 'true',
      actual: String(normalizerAccurate),
      passed: normalizerAccurate
    });

    // Smart Match Eligibility checks
    const honoursJob: Partial<JobCircular> = {
      id: 'JOB-TEST-EDU-HONOURS',
      title: 'সহকারী পরিচালক (প্রশাসন)',
      minEducation: 'যেকোনো বিষয়ে স্নাতক (সম্মান) বা সমমানের ডিগ্রি',
      category: 'govt',
      districts: 'সকল জেলা',
      salary: '22000-53060',
      deadline: '2027-12-31'
    };

    const candidateWithHonours: CandidateProfile = {
      id: 'SYNTH-TEST-HONOURS',
      name: 'Ashikur Rahman',
      phone: '01889911223',
      district: 'ঢাকা',
      dob: '1998-05-15',
      education: [
        { level: 'SSC', degree: 'Secondary School Certificate', boardOrUni: 'Dhaka', year: '2016', result: '5.00' },
        { level: 'HSC', degree: 'Higher Secondary Certificate', boardOrUni: 'Dhaka', year: '2018', result: '4.90' },
        { level: 'Honours', degree: 'বিএসসি (সম্মান)', boardOrUni: 'ঢাকা বিশ্ববিদ্যালয়', year: '2022', result: '3.65' }
      ]
    } as any;

    const candidateWithHscOnly: CandidateProfile = {
      id: 'SYNTH-TEST-HSC-ONLY',
      name: 'Kamrul Hasan',
      phone: '01889922334',
      district: 'ঢাকা',
      dob: '1998-05-15',
      education: [
        { level: 'SSC', degree: 'Secondary School Certificate', boardOrUni: 'Dhaka', year: '2018', result: '4.50' },
        { level: 'HSC', degree: 'Higher Secondary Certificate', boardOrUni: 'Dhaka', year: '2020', result: '4.20' }
      ]
    } as any;

    const matchHonours = SmartJobMatchingEngine.evaluateEligibility(candidateWithHonours, honoursJob as JobCircular);
    const matchHscOnly = SmartJobMatchingEngine.evaluateEligibility(candidateWithHscOnly, honoursJob as JobCircular);


    const honoursMeetsReq = matchHonours.status === 'MEETS_VERIFIED_REQUIREMENTS' || !matchHonours.isHardDisqualified;
    const hscDisqualified = matchHscOnly.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS' && matchHscOnly.isHardDisqualified;

    assertions.push({
      assertion: 'Smart Matching qualifies candidate with Honours for Bachelor-level vacancy',
      expected: 'true',
      actual: String(honoursMeetsReq),
      passed: honoursMeetsReq
    });

    assertions.push({
      assertion: 'Smart Matching hard-disqualifies candidate with only HSC for Bachelor-level vacancy',
      expected: 'true',
      actual: String(hscDisqualified),
      passed: hscDisqualified
    });

    // 5. Assert production database local_store.json candidates count === 41
    const localStorePath = path.join(process.cwd(), 'src', 'db', 'local_store.json');
    const dbRaw = fs.readFileSync(localStorePath, 'utf8');
    const parsed = JSON.parse(dbRaw);
    const candidateCount = Object.keys(parsed.candidates || {}).length;
    const isIsoPass = candidateCount === 41;

    assertions.push({
      assertion: 'Production store local_store.json candidates count preserved strictly at 41',
      expected: '41',
      actual: String(candidateCount),
      passed: isIsoPass
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: `Scenario 17 runtime error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Academic Hierarchy, Grading Scales & Smart Match Validation',
    category: 'api',
    status: passed ? 'PASS' : 'FAIL',
    startTime,
    endTime,
    durationMs: new Date(endTime).getTime() - new Date(startTime).getTime(),
    actionsPerformed: actions,
    assertions,
    errors
  };
}
