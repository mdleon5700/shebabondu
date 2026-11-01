import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';
import { SmartJobMatchingEngine } from '../../matching/engine';
import { JobCircular, CandidateProfile } from '../../types';

export async function runScenario39(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-39-AGE-BOUNDARIES-REFERENCE-DATE-QUOTA-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const testJobId = 'SYNTH-JOB-TEST-AGE-BOUNDARIES-01';
  const cutoffDate = '2026-11-01';

  try {
    actionsPerformed.push('Defining synthetic job with age limit 18-30 and circular cutoff date 2026-11-01');

    const ageTestJob: JobCircular = ({ 
      id: testJobId,
      title: 'উপ-সহকারী প্রকৌশলী (বয়সসীমা ও কোটা অডিট)',
      organization: 'বাংলাদেশ রেলওয়ে',
      minEducation: 'ডিপ্লোমা ইন ইঞ্জিনিয়ারিং',
      requirements: ['ডিপ্লোমা ইন ইঞ্জিনিয়ারিং', 'বয়সসীমা: ১৮ হতে ৩০ বছর'],
      minAge: 18,
      maxAge: 30,
      ageCutOffDate: cutoffDate,
      status: 'PUBLISHED'
    } as unknown as JobCircular);
    SyntheticJobManager.saveJob(ageTestJob);

    const baseEdu = [
      {
        id: 'edu-test-dip',
        level: 'Diploma',
        degree: 'Diploma in Engineering',
        institutionName: 'Polytechnic Institute',
        boardOrUni: 'BTEB',
        year: '2020',
        result: '3.50',
        resultType: 'CGPA',
        academicStatus: 'COMPLETED' as const
      }
    ];

    // 1. Exact Minimum Boundary: exactly 18 years 0 days on 2026-11-01 -> Born 2008-11-01
    actionsPerformed.push('Testing exact minimum age boundary: exactly 18 years 0 days');
    const exact18User: CandidateProfile = ({
      id: 'SYNTH-AGE-EXACT-18',
      name: 'Exact 18 Candidate',
      dob: '2008-11-01',
      district: 'ঢাকা',
      education: baseEdu
    } as unknown as CandidateProfile);
    const exact18Result = SmartJobMatchingEngine.evaluateEligibility(exact18User, ageTestJob);
    assertions.push({
      assertion: 'Candidate exactly 18 years 0 days on cutoff date is ELIGIBLE',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: exact18Result.status,
      passed: exact18Result.status === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    // 2. One Day Below Minimum Boundary: 17 years 364 days on 2026-11-01 -> Born 2008-11-02
    actionsPerformed.push('Testing one day below minimum age boundary');
    const oneDayYoungUser: CandidateProfile = ({
      id: 'SYNTH-AGE-YOUNG-17',
      name: 'One Day Young Candidate',
      dob: '2008-11-02',
      district: 'ঢাকা',
      education: baseEdu
    } as unknown as CandidateProfile);
    const youngResult = SmartJobMatchingEngine.evaluateEligibility(oneDayYoungUser, ageTestJob);
    assertions.push({
      assertion: 'Candidate one day younger than 18 is disqualified for age under minimum',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: youngResult.status,
      passed: youngResult.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS' && youngResult.isHardDisqualified
    });

    // 3. Exact Maximum Boundary: exactly 30 years 0 days on 2026-11-01 -> Born 1996-11-01
    actionsPerformed.push('Testing exact maximum age boundary: exactly 30 years 0 days');
    const exact30User: CandidateProfile = ({
      id: 'SYNTH-AGE-EXACT-30',
      name: 'Exact 30 Candidate',
      dob: '1996-11-01',
      district: 'ঢাকা',
      education: baseEdu
    } as unknown as CandidateProfile);
    const exact30Result = SmartJobMatchingEngine.evaluateEligibility(exact30User, ageTestJob);
    assertions.push({
      assertion: 'Candidate exactly 30 years 0 days on cutoff date is ELIGIBLE',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: exact30Result.status,
      passed: exact30Result.status === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    // 4. One Day Above Maximum Boundary: 30 years 0 months 1 day -> Born 1996-10-31
    actionsPerformed.push('Testing one day above maximum age boundary');
    const oneDayOldUser: CandidateProfile = ({
      id: 'SYNTH-AGE-OLD-30-PLUS',
      name: 'One Day Old Candidate',
      dob: '1996-10-31',
      district: 'ঢাকা',
      education: baseEdu
    } as unknown as CandidateProfile);
    const oldResult = SmartJobMatchingEngine.evaluateEligibility(oneDayOldUser, ageTestJob);
    assertions.push({
      assertion: 'Candidate one day older than 30 is disqualified for age limit exceeded',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: oldResult.status,
      passed: oldResult.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS' && oldResult.isHardDisqualified
    });

    // 5. Quota Relaxation: Candidate aged 31 years 5 months (Born 1995-05-15)
    actionsPerformed.push('Testing quota age relaxation (+2 years up to 32 for freedom_fighter quota)');
    const quotaUser: CandidateProfile = ({
      id: 'SYNTH-AGE-QUOTA-31',
      name: 'Quota Candidate 31yr',
      dob: '1995-05-15',
      district: 'ঢাকা',
      quota: 'freedom_fighter',
      education: baseEdu
    } as unknown as CandidateProfile);
    const nonQuotaUser: CandidateProfile = ({
      ...quotaUser,
      id: 'SYNTH-AGE-NON-QUOTA-31',
      quota: 'none'
    } as unknown as CandidateProfile);

    const quotaResult = SmartJobMatchingEngine.evaluateEligibility(quotaUser, ageTestJob);
    const nonQuotaResult = SmartJobMatchingEngine.evaluateEligibility(nonQuotaUser, ageTestJob);

    assertions.push({
      assertion: 'Candidate aged 31.5 years with freedom_fighter quota is ELIGIBLE (extended to 32)',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: quotaResult.status,
      passed: quotaResult.status === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: 'General candidate aged 31.5 years without quota is DISQUALIFIED',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: nonQuotaResult.status,
      passed: nonQuotaResult.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS'
    });

    // 6. Missing Date of Birth
    actionsPerformed.push('Testing candidate with missing date of birth');
    const missingDobUser: CandidateProfile = ({
      id: 'SYNTH-AGE-MISSING-DOB',
      name: 'Missing DOB Candidate',
      district: 'ঢাকা',
      education: baseEdu
    } as unknown as CandidateProfile);
    const missingDobResult = SmartJobMatchingEngine.evaluateEligibility(missingDobUser, ageTestJob);

    assertions.push({
      assertion: 'Candidate with missing DOB returns NEEDS_MORE_INFORMATION',
      expected: 'NEEDS_MORE_INFORMATION',
      actual: missingDobResult.status,
      passed: missingDobResult.status === 'NEEDS_MORE_INFORMATION'
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    SyntheticJobManager.deleteJob(testJobId);
  }

  const isolation = SyntheticJobManager.verifyJobDataIsolation();
  assertions.push({
    assertion: 'Age boundaries audit leaves database unpolluted',
    expected: 'true',
    actual: String(isolation.isIsolated),
    passed: isolation.isIsolated
  });

  const passed = assertions.every(a => a.passed) && errors.length === 0;
  return {
    scenarioId,
    name: 'Age Boundaries, Reference Cutoff Date & Quota Relaxation Audit',
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
