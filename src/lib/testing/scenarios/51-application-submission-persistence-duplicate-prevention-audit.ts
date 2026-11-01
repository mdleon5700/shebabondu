import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { serverDB } from '../../db';

export async function runScenario51(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-51-APPLICATION-SUBMISSION-PERSISTENCE-DUPLICATE-PREVENTION-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    const candidateId = 'SYNTH-USR-KHULNA-003';
    actionsPerformed.push(`Testing duplicate prevention and persistence for candidate ${candidateId}`);

    const authHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `session_token=${candidateId}`,
      'x-candidate-id': candidateId
    };

    const targetJobId = 'SYNTH-JOB-POST-KHULNA-' + Date.now();
    const targetPostName = 'প্রশাসনিক কর্মকর্তা';

    const basePayload = {
      jobId: targetJobId,
      jobTitle: 'খুলনা উন্নয়ন কর্তৃপক্ষ প্রশাসনিক নিয়োগ',
      organization: 'খুলনা উন্নয়ন কর্তৃপক্ষ (KDA)',
      postName: targetPostName,
      candidateName: 'তানভীর আহমেদ',
      candidatePhone: '01889300003',
      candidateDistrict: 'খুলনা',
      paymentMethod: 'bKash',
      totalAmount: 200
    };

    // 1. Initial Application Submission
    actionsPerformed.push('Submitting initial application for candidate');
    const firstSub = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(basePayload)
    });
    
    assertions.push({
      assertion: 'First application submission succeeds with HTTP 200',
      expected: '200',
      actual: String(firstSub.status),
      passed: firstSub.status === 200
    });

    const firstAppId = firstSub.data?.createdApp?.id;
    assertions.push({
      assertion: 'Application generates valid application ID',
      expected: 'true',
      actual: String(Boolean(firstAppId && firstAppId.length > 3)),
      passed: Boolean(firstAppId && firstAppId.length > 3)
    });

    // 2. Immediate Duplicate Submission (Same candidate, same jobId, same postName)
    actionsPerformed.push('Submitting duplicate application for exact same job and post');
    const duplicateSub = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(basePayload)
    });

    assertions.push({
      assertion: 'Duplicate application is rejected with HTTP 409 Conflict',
      expected: '409',
      actual: String(duplicateSub.status),
      passed: duplicateSub.status === 409
    });

    assertions.push({
      assertion: 'Duplicate response returns DUPLICATE_APPLICATION error code',
      expected: 'true',
      actual: String(duplicateSub.data?.error?.includes('DUPLICATE_APPLICATION')),
      passed: Boolean(duplicateSub.data?.error?.includes('DUPLICATE_APPLICATION'))
    });

    // 3. Different job submission by same candidate should succeed
    actionsPerformed.push('Submitting application to a different job for same candidate');
    const differentJobPayload = {
      ...basePayload,
      jobId: 'SYNTH-JOB-POST-KHULNA-DIFF-' + Date.now(),
      postName: 'সহকারী একাউন্টেন্ট'
    };
    const differentSub = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(differentJobPayload)
    });

    assertions.push({
      assertion: 'Candidate can legitimately apply to a different job',
      expected: '200',
      actual: String(differentSub.status),
      passed: differentSub.status === 200
    });

    // 4. Different candidate applying to the original job should succeed
    actionsPerformed.push('Submitting application to original job by a different candidate');
    const candidate2Id = 'SYNTH-USR-KHULNA-004';
    const authHeadersCand2 = {
      'Content-Type': 'application/json',
      'Cookie': `session_token=${candidate2Id}`,
      'x-candidate-id': candidate2Id
    };
    const cand2Payload = {
      ...basePayload,
      candidateName: 'ফারহানা ইয়াসমিন',
      candidatePhone: '01889300004'
    };
    const cand2Sub = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'POST',
      headers: authHeadersCand2,
      body: JSON.stringify(cand2Payload)
    });

    assertions.push({
      assertion: 'Different candidate applying to same job succeeds with HTTP 200',
      expected: '200',
      actual: String(cand2Sub.status),
      passed: cand2Sub.status === 200
    });

    const endTime = new Date().toISOString();
    return {
      scenarioId,
      startTime,
      name: 'Application Submission Persistence & Duplicate Prevention Audit',
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
      name: 'Application Submission Persistence & Duplicate Prevention Audit',
      category: 'api',
      status: 'FAIL',
      durationMs: 0,
      actionsPerformed,
      assertions,
      errors
    };
  }
}
