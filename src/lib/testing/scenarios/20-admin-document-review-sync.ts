import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import crypto from 'crypto';

export async function runScenario20(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-20-ADMIN-DOCUMENT-REVIEW-SYNC';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const candidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-001') ||
                    SyntheticUserManager.getAllSyntheticUsers()[0];

  const adminKey = process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026';

  try {
    const request = page.context().request;

    // 1. Upload a synthetic career document for Candidate
    actions.push('Candidate uploads a career document for administrative review');
    const testBuffer = Buffer.from('%PDF-1.4 TEST / NOT VALID / SYNTHETIC SAMPLE WATERMARK %EOF');
    const uploadRes = await request.post(`${baseUrl}/api/candidate/upload-document`, {
      headers: {
        cookie: `session_token=${(candidate?.id || 'SYNTH-USR-DHAKA-001')}`
      },
      multipart: {
        file: {
          name: 'project_training_cert.pdf',
          mimeType: 'application/pdf',
          buffer: testBuffer
        },
        docType: 'training_cert',
        docTitle: 'প্রকল্প প্রশিক্ষণ সনদ [TEST / NOT VALID / SYNTHETIC SAMPLE]',
        category: 'training'
      }
    });

    const uploadBody = await uploadRes.json().catch(() => ({}));
    const docId = uploadBody.docRecord?.id;

    assertions.push({
      assertion: 'Candidate successfully uploaded review-pending document',
      expected: 'true',
      actual: String(Boolean(docId)),
      passed: Boolean(docId)
    });

    if (docId) {
      // 2. Admin verifies document with VERIFIED status
      actions.push(`Admin reviews and verifies document ${docId} with status VERIFIED`);
      const verifyRes = await request.post(`${baseUrl}/api/admin/certificates/verify`, {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
          'x-admin-id': 'ADMIN-TEST-SUPER'
        },
        data: {
          candidateId: (candidate?.id || 'SYNTH-USR-DHAKA-001'),
          recordId: docId,
          recordType: 'document',
          status: 'VERIFIED',
          remarks: 'সকল কাগজপত্র সঠিক ও সত্যায়িত করা হয়েছে।'
        }
      });

      const verifyStatus = verifyRes.status();
      const verifyBody = await verifyRes.json().catch(() => ({}));

      assertions.push({
        assertion: 'Admin review API approves document with HTTP 200',
        expected: '200',
        actual: String(verifyStatus),
        passed: verifyStatus === 200 && Boolean(verifyBody.success)
      });

      // 3. Verify status update inside candidate document store
      const updatedDocs = SyntheticUserManager.getDocuments((candidate?.id || 'SYNTH-USR-DHAKA-001'));
      const verifiedDoc = updatedDocs.find(d => d.id === docId);

      assertions.push({
        assertion: 'Candidate document verification status updated to VERIFIED in store',
        expected: 'VERIFIED',
        actual: String(verifiedDoc?.verificationStatus),
        passed: verifiedDoc?.verificationStatus === 'VERIFIED' && verifiedDoc?.isVerified === true
      });

      // 4. Verify candidate notification was triggered
      actions.push('Checking candidate notification delivery');
      const candidateNotifs = SyntheticUserManager.getCandidateNotifications((candidate?.id || 'SYNTH-USR-DHAKA-001'));
      const hasApprovalNotif = candidateNotifs.some(n =>
        n.title.includes('অনুমোদিত') || n.title.includes('ভেরিফিকেশন')
      );

      assertions.push({
        assertion: 'Candidate received in-app notification for document approval',
        expected: 'true',
        actual: String(hasApprovalNotif),
        passed: hasApprovalNotif
      });

      // 5. Admin tests NEEDS_CORRECTION decision
      actions.push(`Admin issues NEEDS_CORRECTION decision for document ${docId}`);
      const correctionRes = await request.post(`${baseUrl}/api/admin/certificates/verify`, {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
          'x-admin-id': 'ADMIN-TEST-SUPER'
        },
        data: {
          candidateId: (candidate?.id || 'SYNTH-USR-DHAKA-001'),
          recordId: docId,
          recordType: 'document',
          status: 'NEEDS_CORRECTION',
          remarks: 'স্বাক্ষর অস্পষ্ট, পুনরায় স্পষ্ট কপি আপলোড করুন।'
        }
      });

      assertions.push({
        assertion: 'Admin review API successfully issues correction request (HTTP 200)',
        expected: '200',
        actual: String(correctionRes.status()),
        passed: correctionRes.status() === 200
      });

      const docsAfterCorrection = SyntheticUserManager.getDocuments((candidate?.id || 'SYNTH-USR-DHAKA-001'));
      const correctedDoc = docsAfterCorrection.find(d => d.id === docId);

      assertions.push({
        assertion: 'Candidate document reflects NEEDS_CORRECTION status',
        expected: 'NEEDS_CORRECTION',
        actual: String(correctedDoc?.verificationStatus),
        passed: correctedDoc?.verificationStatus === 'NEEDS_CORRECTION'
      });
    }

    // 6. Verify zero database pollution
    const isolation = SyntheticUserManager.verifyDataIsolation();
    assertions.push({
      assertion: 'Database remains 100% unpolluted during document review (41 candidates)',
      expected: 'true',
      actual: String(isolation.isIsolated && isolation.realCandidatesCount === 41),
      passed: isolation.isIsolated && isolation.realCandidatesCount === 41
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: `Scenario 20 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Admin Document Review, Status Transition & Candidate Notification Sync',
    category: 'admin',
    status: passed ? 'PASS' : 'FAIL',
    startTime,
    endTime,
    durationMs: new Date(endTime).getTime() - new Date(startTime).getTime(),
    actionsPerformed: actions,
    assertions,
    errors
  };
}
