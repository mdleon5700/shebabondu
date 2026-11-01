import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { serverDB } from '../../db';

export async function runScenario50(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-50-APPLICATION-FORM-VALIDATION-CV-DOCUMENT-ATTACHMENT-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    const candidateId = 'SYNTH-USR-BARISHAL-002';
    actionsPerformed.push(`Setting up synthetic documents in candidate vault for ${candidateId}`);

    const sampleDoc = {
      id: 'SYNTH-DOC-CV-BARISHAL-002',
      candidateId,
      title: 'Curriculum Vitae (Synthetic)',
      name: 'Curriculum Vitae (Synthetic).pdf',
      fileName: 'barishal_cv.pdf',
      type: 'resume',
      fileType: 'application/pdf',
      size: '240 KB',
      fileSize: '240 KB',
      uploadedAt: new Date().toISOString(),
      uploadDate: new Date().toLocaleDateString('bn-BD'),
      url: '/uploads/synthetic/barishal_cv.pdf',
      verificationStatus: 'VERIFIED' as const,
      extractedData: {
        candidateName: 'হাসান মাহমুদ',
        district: 'বরিশাল',
        isSynthetic: true,
        watermark: 'TEST / NOT VALID / SYNTHETIC SAMPLE'
      }
    };
    serverDB.saveDocument(candidateId, sampleDoc);

    const authHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `session_token=${candidateId}`,
      'x-candidate-id': candidateId
    };

    actionsPerformed.push('Testing phone validation for application without existing candidate record');
    const invalidPhoneRes = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: 'JOB-TEST-VALIDATION-01',
        postName: 'সহকারী পরিচালক',
        candidatePhone: '123'
      })
    });

    assertions.push({
      assertion: 'Short/invalid phone number rejected with HTTP 400',
      expected: '400',
      actual: String(invalidPhoneRes.status),
      passed: invalidPhoneRes.status === 400
    });

    actionsPerformed.push('Submitting application with attached documents from Document Vault');
    const validAppPayload = {
      jobId: 'JOB-TEST-DOCS-' + Date.now(),
      jobTitle: 'হিসাবরক্ষক কর্মকর্তা',
      organization: 'বরিশাল সিটি কর্পোরেশন',
      postName: 'হিসাবরক্ষক',
      candidateName: 'হাসান মাহমুদ',
      candidatePhone: '01889200002',
      candidateDistrict: 'বরিশাল',
      paymentMethod: 'bKash',
      totalAmount: 150,
      attachedDocuments: [
        {
          id: sampleDoc.id,
          title: sampleDoc.name,
          type: sampleDoc.type,
          url: sampleDoc.url,
          uploadDate: sampleDoc.uploadedAt,
          fileSize: sampleDoc.size
        }
      ]
    };

    const submitRes = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(validAppPayload)
    });

    assertions.push({
      assertion: 'Application with attached synthetic documents successfully submitted',
      expected: '200',
      actual: String(submitRes.status),
      passed: submitRes.status === 200
    });

    const createdApp = submitRes.data?.createdApp;
    assertions.push({
      assertion: 'Attached document is preserved in submitted application record',
      expected: 'SYNTH-DOC-CV-BARISHAL-002',
      actual: createdApp?.attachedDocuments?.[0]?.id || '',
      passed: createdApp?.attachedDocuments?.[0]?.id === 'SYNTH-DOC-CV-BARISHAL-002'
    });

    assertions.push({
      assertion: 'Attached document URL is non-public synthetic safe path',
      expected: 'true',
      actual: String(createdApp?.attachedDocuments?.[0]?.url?.includes('synthetic')),
      passed: Boolean(createdApp?.attachedDocuments?.[0]?.url?.includes('synthetic'))
    });

    const endTime = new Date().toISOString();
    return {
      scenarioId,
      startTime,
      name: 'Application Form Validation & CV Document Attachment Audit',
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
      name: 'Application Form Validation & CV Document Attachment Audit',
      category: 'api',
      status: 'FAIL',
      durationMs: 0,
      actionsPerformed,
      assertions,
      errors
    };
  }
}
