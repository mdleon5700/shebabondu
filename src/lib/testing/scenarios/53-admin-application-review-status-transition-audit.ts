import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { serverDB } from '../../db';

export async function runScenario53(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-53-ADMIN-APPLICATION-REVIEW-STATUS-TRANSITION-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  try {
    const candidateId = 'SYNTH-USR-RANGPUR-002';
    actionsPerformed.push(`Seeding candidate application for admin review test: ${candidateId}`);

    const targetApp = {
      id: 'SYNTH-APP-REVIEW-RANGPUR-201',
      jobId: 'JOB-RANGPUR-OFFICER-01',
      jobTitle: 'উপজেলা সমাজসেবা কর্মকর্তা',
      organization: 'সমাজসেবা অধিদপ্তর',
      postName: 'সমাজসেবা কর্মকর্তা',
      candidateName: 'মো: রফিকুল ইসলাম',
      candidatePhone: '01889500002',
      candidateDistrict: 'রংপুর',
      candidateId,
      date: new Date().toLocaleDateString('bn-BD'),
      totalAmount: 200,
      paymentMethod: 'bKash' as const,
      status: 'pending_payment' as const,
      statusHistory: [
        {
          status: 'pending_payment' as const,
          date: new Date().toISOString(),
          notes: 'অনলাইন আবেদন দাখিল হয়েছে। ফি পরিশোধ অপেক্ষমাণ।'
        }
      ]
    };
    serverDB.addApplication(candidateId, targetApp);

    // 1. Candidate Privilege Escalation Prevention (Candidate tries to mark status: completed)
    actionsPerformed.push('Testing candidate privilege escalation prevention on PATCH /api/applications');
    const candHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `session_token=${candidateId}`,
      'x-candidate-id': candidateId
    };

    const candPatchRes = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'PATCH',
      headers: candHeaders,
      body: JSON.stringify({
        applicationId: targetApp.id,
        status: 'completed',
        notes: 'I self-approved my application'
      })
    });

    assertions.push({
      assertion: 'Candidate attempting to mark application completed is blocked with HTTP 403 Forbidden',
      expected: '403',
      actual: String(candPatchRes.status),
      passed: candPatchRes.status === 403
    });

    // 2. Admin View All Applications
    actionsPerformed.push('Admin fetches all applications via /api/applications');
    const adminHeaders = {
      'Content-Type': 'application/json',
      'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
    };

    const adminGetRes = await apiVerifier.checkEndpoint('/api/applications', {
      headers: adminHeaders
    });
    const adminApps = adminGetRes.data?.applications || [];
    const foundTarget = adminApps.find((a: any) => a.id === targetApp.id);

    assertions.push({
      assertion: 'Admin receives cross-candidate applications list and finds target application',
      expected: 'true',
      actual: String(Boolean(foundTarget)),
      passed: Boolean(foundTarget)
    });

    // 3. Admin Authorized Status Transition: pending_payment -> processing
    actionsPerformed.push('Admin performs authorized state transition to processing');
    const adminTransition1 = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        applicationId: targetApp.id,
        status: 'processing',
        notes: 'বিকাশ পেমেন্ট যাচাই সম্পন্ন। আবেদনটি প্রক্রিয়াকরণ শুরু হলো।'
      })
    });

    assertions.push({
      assertion: 'Admin transition to processing succeeds with HTTP 200',
      expected: '200',
      actual: String(adminTransition1.status),
      passed: adminTransition1.status === 200
    });

    // 4. Admin Final Transition: processing -> completed with applicant copy reference
    actionsPerformed.push('Admin performs authorized state transition to completed with PDF tracking');
    const adminTransition2 = await apiVerifier.checkEndpoint('/api/applications', {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        applicationId: targetApp.id,
        status: 'completed',
        applicantCopyPdfUrl: '/uploads/synthetic/applicant_copy_rangpur_201.pdf',
        teleTalkTrackingId: 'TT-RP-998822',
        notes: 'আবেদন সফলভাবে গৃহীত হয়েছে এবং প্রবেশপত্র/প্রাপ্তি স্লিপ প্রস্তুত।'
      })
    });

    assertions.push({
      assertion: 'Admin transition to completed succeeds with HTTP 200',
      expected: '200',
      actual: String(adminTransition2.status),
      passed: adminTransition2.status === 200
    });

    const updatedApp = adminTransition2.data?.application;
    assertions.push({
      assertion: 'Application status history accurately records state transitions',
      expected: '>= 2',
      actual: String(updatedApp?.statusHistory?.length || 0),
      passed: (updatedApp?.statusHistory?.length || 0) >= 2
    });

    assertions.push({
      assertion: 'Application final status is completed',
      expected: 'completed',
      actual: updatedApp?.status || '',
      passed: updatedApp?.status === 'completed'
    });

    const endTime = new Date().toISOString();
    return {
      scenarioId,
      startTime,
      name: 'Admin Application Review & Status Transition State Machine Audit',
      category: 'admin',
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
      name: 'Admin Application Review & Status Transition State Machine Audit',
      category: 'admin',
      status: 'FAIL',
      durationMs: 0,
      actionsPerformed,
      assertions,
      errors
    };
  }
}
