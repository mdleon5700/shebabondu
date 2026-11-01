import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import { SmartJobMatchingEngine } from '../../matching/engine';
import { JobRequirementNormalizer } from '../../matching/normalizer';
import { JobCircular, CandidateProfile } from '../../types';

export async function runScenario38(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-38-COMPLETE-EDUCATION-MATRIX-SUBJECT-MATCH-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const testJobIds: string[] = [];

  try {
    actionsPerformed.push('Auditing Education Normalizer across General and Madrasah qualifications');

    // 1. Normalizer Unit Assertions
    const jscNorm = JobRequirementNormalizer.normalizeEducationLevel('৮ম শ্রেণি / জেএসসি পাস');
    const jdcNorm = JobRequirementNormalizer.normalizeEducationLevel('জেডিসি (জুনিয়র দাখিল)');
    const sscNorm = JobRequirementNormalizer.normalizeEducationLevel('এসএসসি বা সমমান');
    const dakhilNorm = JobRequirementNormalizer.normalizeEducationLevel('দাখিল পাস');
    const hscNorm = JobRequirementNormalizer.normalizeEducationLevel('এইচএসসি পাস');
    const alimNorm = JobRequirementNormalizer.normalizeEducationLevel('আলিম পাস');
    const diplomaNorm = JobRequirementNormalizer.normalizeEducationLevel('ডিপ্লোমা ইন ইঞ্জিনিয়ারিং');
    const degreeNorm = JobRequirementNormalizer.normalizeEducationLevel('স্নাতক (পাস) / ডিগ্রি');
    const honoursNorm = JobRequirementNormalizer.normalizeEducationLevel('স্নাতক (সম্মান) / অনার্স');
    const mastersNorm = JobRequirementNormalizer.normalizeEducationLevel('স্নাতকোত্তর / মাস্টার্স');
    const kamilNorm = JobRequirementNormalizer.normalizeEducationLevel('কামিল পাস');
    const phdNorm = JobRequirementNormalizer.normalizeEducationLevel('পিএইচডি / ডক্টরেট');

    assertions.push({
      assertion: 'Normalizer correctly identifies JSC and JDC distinctly',
      expected: 'jsc & jdc',
      actual: `${jscNorm.level} & ${jdcNorm.level}`,
      passed: jscNorm.level === 'jsc' && jdcNorm.level === 'jdc'
    });

    assertions.push({
      assertion: 'Normalizer correctly identifies SSC and Dakhil distinctly',
      expected: 'ssc & dakhil',
      actual: `${sscNorm.level} & ${dakhilNorm.level}`,
      passed: sscNorm.level === 'ssc' && dakhilNorm.level === 'dakhil'
    });

    assertions.push({
      assertion: 'Normalizer correctly identifies Pass Degree vs Honours distinctly',
      expected: 'degree & bachelor',
      actual: `${degreeNorm.level} & ${honoursNorm.level}`,
      passed: degreeNorm.level === 'degree' && honoursNorm.level === 'bachelor'
    });

    assertions.push({
      assertion: 'Normalizer correctly identifies Madrasah Alim and Kamil distinctly',
      expected: 'alim & kamil',
      actual: `${alimNorm.level} & ${kamilNorm.level}`,
      passed: alimNorm.level === 'alim' && kamilNorm.level === 'kamil'
    });

    // 2. Synthetic Profiles Testing Matrix
    actionsPerformed.push('Testing Hierarchy Engine across Personas');

    // Synthetic Personas from Store:
    // SYNTH-USR-DHAKA-001 has JSC
    // SYNTH-USR-DHAKA-003 has SSC
    // SYNTH-USR-DHAKA-005 has HSC
    // SYNTH-USR-DHAKA-009 has Honours in CSE
    const jscUser = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-001')!;
    const sscUser = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-003')!;
    const hscUser = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-005')!;
    const cseHonoursUser = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-009')!;

    // A. Job requiring SSC: JSC user is Ineligible, SSC user is Eligible
    const sscJob: JobCircular = ({ 
      id: 'SYNTH-JOB-TEST-EDU-SSC',
      title: 'অফিস সহকারী (এসএসসি যোগ্যতা)',
      organization: 'ডাক বিভাগ',
      minEducation: 'এসএসসি বা সমমান পাস',
      requirements: ['এসএসসি বা সমমান পাস', 'বয়স: ১৮-৩০ বছর'],
      minAge: 18,
      maxAge: 30,
      status: 'PUBLISHED'
    } as unknown as JobCircular);
    testJobIds.push(sscJob.id);
    SyntheticJobManager.saveJob(sscJob);

    const jscOnSsc = SmartJobMatchingEngine.evaluateEligibility(jscUser, sscJob);
    const sscOnSsc = SmartJobMatchingEngine.evaluateEligibility(sscUser, sscJob);

    assertions.push({
      assertion: 'JSC candidate is marked DOES_NOT_MEET_VERIFIED_REQUIREMENTS for SSC job',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: jscOnSsc.status,
      passed: jscOnSsc.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: 'SSC candidate is marked MEETS_VERIFIED_REQUIREMENTS for SSC job',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: sscOnSsc.status,
      passed: sscOnSsc.status === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    // B. Job requiring 4-year Honours: Pass Degree candidate is Ineligible, Honours is Eligible
    const passDegreeUser: CandidateProfile = ({
      id: 'SYNTH-TEST-PASS-DEGREE-USER',
      name: 'Test Pass Degree Candidate',
      district: 'ঢাকা',
      dob: '1998-05-10',
      education: [
        {
          id: 'edu-deg-pass',
          level: 'Degree',
          degree: 'Bachelor of Arts (Pass Degree 3 Years)',
          institutionName: 'Govt College',
          boardOrUni: 'National University',
          year: '2020',
          result: '2.80',
          resultType: 'CGPA',
          academicStatus: 'COMPLETED' as const
        }
      ]
    } as unknown as CandidateProfile);

    const honoursJob: JobCircular = ({ 
      id: 'SYNTH-JOB-TEST-EDU-HONOURS',
      title: 'সহকারী পরিচালক (অনার্স ৪ বছর মেয়াদি)',
      organization: 'অর্থ মন্ত্রণালয়',
      minEducation: 'যেকোনো বিষয়ে ৪ বছর মেয়াদি স্নাতক (সম্মান)',
      requirements: ['যেকোনো বিষয়ে ৪ বছর মেয়াদি স্নাতক (সম্মান) বা সমমান', 'বয়স: ২১-৩০ বছর'],
      minAge: 21,
      maxAge: 30,
      status: 'PUBLISHED'
    } as unknown as JobCircular);
    testJobIds.push(honoursJob.id);
    SyntheticJobManager.saveJob(honoursJob);

    const passDegreeOnHonours = SmartJobMatchingEngine.evaluateEligibility(passDegreeUser, honoursJob);
    const honoursOnHonours = SmartJobMatchingEngine.evaluateEligibility(cseHonoursUser, honoursJob);

    assertions.push({
      assertion: 'Pass Degree (3-year) candidate is disqualified for 4-year Honours job',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: passDegreeOnHonours.status,
      passed: passDegreeOnHonours.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: '4-year Honours candidate is eligible for Honours job',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: honoursOnHonours.status,
      passed: honoursOnHonours.status === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    // C. Subject-Specific Requirement: Job requiring CSE vs Bengali
    const cseJob: JobCircular = ({ 
      id: 'SYNTH-JOB-TEST-EDU-CSE-ONLY',
      title: 'সহকারী প্রোগ্রামার (কম্পিউটার সায়েন্স আবশ্যক)',
      organization: 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
      minEducation: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (সিএসই) বা আইসিটি বিষয়ে বিএসসি',
      requirements: [
        'স্বীকৃত বিশ্ববিদ্যালয় হতে সিএসই বা আইসিটি বিষয়ে স্নাতক ডিগ্রি',
        'বয়স: ২১-৩০ বছর'
      ],
      minAge: 21,
      maxAge: 30,
      status: 'PUBLISHED'
    } as unknown as JobCircular);
    testJobIds.push(cseJob.id);
    SyntheticJobManager.saveJob(cseJob);

    const bengaliHonoursUser: CandidateProfile = ({
      id: 'SYNTH-TEST-BENGALI-HONOURS-USER',
      name: 'Test Bengali Honours Candidate',
      district: 'ঢাকা',
      dob: '1998-05-10',
      education: [
        {
          id: 'edu-hon-bn',
          level: 'Honours',
          degree: 'B.A in Bengali Literature',
          majorSubject: 'Bengali Literature',
          institutionName: 'University of Dhaka',
          year: '2020',
          result: '3.60',
          resultType: 'CGPA',
          academicStatus: 'COMPLETED' as const
        }
      ]
    } as unknown as CandidateProfile);

    const cseOnCseJob = SmartJobMatchingEngine.evaluateEligibility(cseHonoursUser, cseJob);
    const bengaliOnCseJob = SmartJobMatchingEngine.evaluateEligibility(bengaliHonoursUser, cseJob);

    assertions.push({
      assertion: 'CSE graduate satisfies CSE subject requirement',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: cseOnCseJob.status,
      passed: cseOnCseJob.status === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: 'Bengali graduate is disqualified when job strictly requires CSE subject',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: bengaliOnCseJob.status,
      passed: bengaliOnCseJob.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS'
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    testJobIds.forEach(id => SyntheticJobManager.deleteJob(id));
  }

  const isolation = SyntheticJobManager.verifyJobDataIsolation();
  assertions.push({
    assertion: 'Education test matrix leaves database unpolluted',
    expected: 'true',
    actual: String(isolation.isIsolated),
    passed: isolation.isIsolated
  });

  const passed = assertions.every(a => a.passed) && errors.length === 0;
  return {
    scenarioId,
    name: 'Complete Education Qualification Matrix & Subject Match Audit',
    category: 'user',
    status: passed ? 'PASS' : 'FAIL',
    startTime,
    endTime: new Date().toISOString(),
    durationMs: Date.now() - new Date(startTime).getTime(),
    actionsPerformed,
    assertions,
    errors
  };
}
