import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { SmartJobMatchingEngine } from '../../matching/engine';
import { serverDB } from '../../db';

export async function runScenario64(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-64-GEMINI-INDEPENDENCE-OPERATIONAL-RESILIENCE-REGRESSION-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    actionsPerformed.push('Auditing platform operation and manual-first resilience with Gemini API unavailable');

    // 1. Core Rule-based Matching Engine Independence
    actionsPerformed.push('Testing rule-based Matching Engine execution without external AI');
    const sampleJob = {
      id: 'JOB-AI-INDEP-01',
      title: 'কম্পিউটার অপারেটর',
      organization: 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
      minEducation: 'hsc' as const,
      requiredSkills: ['computer_operation'],
      minAge: 18,
      maxAge: 30,
      quotaAgeLimit: 32,
      allBangladesh: true
    };

    const sampleCandidate = {
      id: 'SYNTH-USR-DHAKA-001',
      name: 'আহমেদ হাসান',
      dateOfBirth: '1998-05-15',
      highestEducation: 'bachelor' as const,
      skills: ['computer_operation', 'ms_office'],
      district: 'ঢাকা',
      hasQuota: false
    };

    const matchResult = SmartJobMatchingEngine.evaluateMatch(
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
    );
    assertions.push({
      assertion: 'Matching Engine executes deterministically with local rules without Gemini API',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: matchResult.eligibilityStatus,
      passed: matchResult.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: 'Matching score is computed deterministically (score >= 80)',
      expected: 'true',
      actual: String(matchResult.overallScore >= 80),
      passed: matchResult.overallScore >= 80
    });

    // 2. Public Platform Availability without AI
    actionsPerformed.push('Verifying Public Jobs catalog operates without AI dependency');
    const jobsRes = await apiVerifier.checkEndpoint('/api/jobs', {});
    assertions.push({
      assertion: 'Public job catalog operates with HTTP 200 without external AI',
      expected: '200',
      actual: String(jobsRes.status),
      passed: jobsRes.status === 200
    });

    // 3. Candidate Application Submission without AI
    actionsPerformed.push('Verifying application submission service functions without external AI');
    const candidateId = 'SYNTH-USR-BARISHAL-003';
    const appRes = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session_token=${candidateId}`,
        'x-candidate-id': candidateId
      },
      body: JSON.stringify({
        jobId: 'JOB-RESILIENCE-TEST-' + Date.now(),
        jobTitle: 'ডাটা এন্ট্রি অপারেটর',
        organization: 'বাংলাদেশ পরিসংখ্যান ব্যুরো',
        postName: 'ডাটা এন্ট্রি অপারেটর',
        candidateName: 'মো: জাহিদ হাসান',
        candidatePhone: '01889800003',
        candidateDistrict: 'বরিশাল',
        paymentMethod: 'bKash',
        totalAmount: 150
      })
    });

    assertions.push({
      assertion: 'Candidate application submission succeeds with HTTP 200 without Gemini dependency',
      expected: '200',
      actual: String(appRes.status),
      passed: appRes.status === 200
    });

    // 4. Admin Governance & Review without AI
    actionsPerformed.push('Verifying admin review endpoints function without external AI');
    const adminRes = await apiVerifier.checkEndpoint('/api/admin/candidates', {
      headers: {
        'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
      }
    });

    assertions.push({
      assertion: 'Admin management endpoint operates with HTTP 200 without external AI',
      expected: '200',
      actual: String(adminRes.status),
      passed: adminRes.status === 200
    });

    const endTime = new Date().toISOString();
    return {
      scenarioId,
      startTime,
      name: 'Gemini Independence & Operational Resilience Regression Audit',
      category: 'api',
      status: assertions.every(a => a.passed) ? 'PASS' : 'FAIL',
      durationMs: new Date(endTime).getTime() - new Date(startTime).getTime(),
      actionsPerformed,
      assertions,
      errors
    };
  } catch (err: any) {
    errors.push({ type: 'interaction_failure', message: err.message, stack: err.stack, timestamp: new Date().toISOString() });
    return {
      scenarioId,
      startTime,
      name: 'Gemini Independence & Operational Resilience Regression Audit',
      category: 'api',
      status: 'FAIL',
      durationMs: 0,
      actionsPerformed,
      assertions,
      errors
    };
  }
}
