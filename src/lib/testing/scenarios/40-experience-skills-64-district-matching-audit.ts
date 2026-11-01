import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import { SmartJobMatchingEngine } from '../../matching/engine';
import { JobCircular, CandidateProfile } from '../../types';

export async function runScenario40(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-40-EXPERIENCE-SKILLS-64-DISTRICT-MATCHING-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const testJobIds: string[] = [];

  try {
    actionsPerformed.push('Testing Mandatory Experience vs Fresher Friendly Matching');

    const baseEdu = [
      {
        id: 'edu-exp-test',
        level: 'Honours',
        degree: 'B.Sc in Computer Science',
        majorSubject: 'CSE',
        institutionName: 'University',
        boardOrUni: 'Public University',
        year: '2020',
        result: '3.60',
        resultType: 'CGPA',
        academicStatus: 'COMPLETED' as const
      }
    ];

    // 1. Mandatory Experience Job
    const expJob: JobCircular = ({ 
      id: 'SYNTH-JOB-EXP-MANDATORY-3YR',
      title: 'সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার (৩ বছরের অভিজ্ঞতা আবশ্যক)',
      organization: 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
      minEducation: 'সিএসই বিষয়ে স্নাতক ডিগ্রি',
      requirements: [
        'সিএসই বিষয়ে স্নাতক ডিগ্রি',
        'সফটওয়্যার ডেভেলপমেন্টে ন্যূনতম ৩ বছরের বাস্তব অভিজ্ঞতা'
      ],
      status: 'PUBLISHED'
    } as unknown as JobCircular);
    testJobIds.push(expJob.id);
    SyntheticJobManager.saveJob(expJob);

    const fresherCand: CandidateProfile = ({
      id: 'SYNTH-EXP-FRESHER',
      name: 'Fresher Candidate',
      dob: '2000-01-01',
      district: 'ঢাকা',
      education: baseEdu,
      experiences: []
    } as unknown as CandidateProfile);

    const expCand: CandidateProfile = ({
      id: 'SYNTH-EXP-4YR',
      name: 'Experienced Candidate',
      dob: '1996-01-01',
      district: 'ঢাকা',
      education: baseEdu,
      experiences: [
        {
          id: 'exp-1',
          company: 'Tech Solutions Ltd',
          designation: 'Software Engineer',
          startDate: '2021-01-01',
          endDate: '2025-01-01',
          isCurrent: false,
          responsibilities: 'Full stack development'
        }
      ]
    } as unknown as CandidateProfile);

    const fresherResult = SmartJobMatchingEngine.evaluateEligibility(fresherCand, expJob);
    const experiencedResult = SmartJobMatchingEngine.evaluateEligibility(expCand, expJob);

    assertions.push({
      assertion: 'Candidate with 0 years experience is disqualified for 3-year experience required job',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: fresherResult.status,
      passed: fresherResult.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS' && fresherResult.isHardDisqualified
    });

    assertions.push({
      assertion: 'Candidate with 4 years experience satisfies mandatory experience requirement',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: experiencedResult.status,
      passed: experiencedResult.status === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    // 2. Mandatory Skills vs Optional Preferred Skills
    actionsPerformed.push('Testing Mandatory Skills and Preferred Skills Evaluation');
    const skillJob: JobCircular = ({ 
      id: 'SYNTH-JOB-SKILL-PYTHON-REQ',
      title: 'ডাটা অ্যানালিস্ট (Python দক্ষতা আবশ্যক)',
      organization: 'পরিসংখ্যান ব্যুরো',
      minEducation: 'যেকোনো বিষয়ে স্নাতক',
      requirements: [
        'যেকোনো বিষয়ে স্নাতক',
        'Python প্রোগ্রামিংয়ে বাস্তব দক্ষতা',
        'অগ্রাধিকার: SQL ও Tableau জানা প্রার্থীদের অগ্রাধিকার দেওয়া হবে'
      ],
      status: 'PUBLISHED'
    } as unknown as JobCircular);
    testJobIds.push(skillJob.id);
    SyntheticJobManager.saveJob(skillJob);

    const candWithPython: CandidateProfile = ({
      id: 'SYNTH-SKILL-PYTHON-USER',
      name: 'Python Skilled User',
      dob: '1998-01-01',
      district: 'ঢাকা',
      education: baseEdu,
      skills: ['Python', 'Data Analysis']
    } as unknown as CandidateProfile);

    const candWithoutPython: CandidateProfile = ({
      id: 'SYNTH-SKILL-NO-PYTHON-USER',
      name: 'No Python User',
      dob: '1998-01-01',
      district: 'ঢাকা',
      education: baseEdu,
      skills: ['Office Assistance', 'Communication']
    } as unknown as CandidateProfile);

    const pythonEligResult = SmartJobMatchingEngine.evaluateEligibility(candWithPython, skillJob);
    const noPythonEligResult = SmartJobMatchingEngine.evaluateEligibility(candWithoutPython, skillJob);

    assertions.push({
      assertion: 'Candidate with mandatory Python skill is ELIGIBLE',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: pythonEligResult.status,
      passed: pythonEligResult.status === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: 'Candidate missing mandatory Python skill is DISQUALIFIED',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: noPythonEligResult.status,
      passed: noPythonEligResult.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS'
    });

    // 3. Location & 64 Districts Matching: District Quota vs Work Location Preference
    actionsPerformed.push('Testing District Quota vs Preferred Work Location separation');
    const districtRestrictedJob: JobCircular = ({ 
      id: 'SYNTH-JOB-DISTRICT-RESTRICTED',
      title: 'সহকারী ভূমি কর্মকর্তা (গাজীপুর ও নরসিংদী জেলার জন্য)',
      organization: 'ভূমি মন্ত্রণালয়',
      minEducation: 'যেকোনো বিষয়ে স্নাতক',
      requirements: ['যেকোনো বিষয়ে স্নাতক বা সমমান'],
      districts: 'গাজীপুর, নরসিংদী',
      status: 'PUBLISHED'
    } as unknown as JobCircular);
    testJobIds.push(districtRestrictedJob.id);
    SyntheticJobManager.saveJob(districtRestrictedJob);

    const gazipurResident: CandidateProfile = ({
      id: 'SYNTH-LOC-GAZIPUR-USER',
      name: 'Gazipur Resident',
      dob: '1998-01-01',
      district: 'গাজীপুর',
      division: 'ঢাকা',
      education: baseEdu
    } as unknown as CandidateProfile);

    const sylhetResident: CandidateProfile = ({
      id: 'SYNTH-LOC-SYLHET-USER',
      name: 'Sylhet Resident',
      dob: '1998-01-01',
      district: 'সিলেট',
      division: 'সিলেট',
      education: baseEdu,
      careerPreferences: {
        preferredDistricts: ['গাজীপুর'], // prefers Gazipur, but permanent home district is Sylhet
        preferredCategories: [],
        preferredOrgTypes: [],
        preferredJobTitles: [],
        preferredEmploymentTypes: [],
        preferredDivisions: [],
        remotePreference: 'any'
      }
    } as unknown as CandidateProfile);

    const gazipurResult = SmartJobMatchingEngine.evaluateEligibility(gazipurResident, districtRestrictedJob);
    const sylhetResult = SmartJobMatchingEngine.evaluateEligibility(sylhetResident, districtRestrictedJob);

    assertions.push({
      assertion: 'Resident of designated district (Gazipur) is ELIGIBLE for district-restricted job',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: gazipurResult.status,
      passed: gazipurResult.status === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: 'Non-resident candidate is DISQUALIFIED for district-restricted job despite preferred location',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: sylhetResult.status,
      passed: sylhetResult.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS'
    });

    // 4. Nationwide 64-District Audit Coverage
    actionsPerformed.push('Verifying all 64 districts in synthetic user registry');
    const districtStatuses = SyntheticUserManager.getDistrictBatchAudit().districtSummary;
    const all64Represented = districtStatuses.length === 64 && districtStatuses.every(d => d.createdCount >= 20);

    assertions.push({
      assertion: 'All 64 districts have at least 20 synthetic user personas represented',
      expected: 'true',
      actual: String(all64Represented),
      passed: all64Represented
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
    assertion: 'Experience and District test matrix leaves database unpolluted',
    expected: 'true',
    actual: String(isolation.isIsolated),
    passed: isolation.isIsolated
  });

  const passed = assertions.every(a => a.passed) && errors.length === 0;
  return {
    scenarioId,
    name: 'Experience, Skills & 64-District Location Matching Audit',
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
