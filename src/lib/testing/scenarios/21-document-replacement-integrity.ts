import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import crypto from 'crypto';

export async function runScenario21(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-21-DOCUMENT-REPLACEMENT-INTEGRITY';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const candidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-001') ||
                    SyntheticUserManager.getAllSyntheticUsers()[0];

  try {
    const request = page.context().request;

    // 1. Initial Document Upload (Version 1)
    actions.push('Candidate uploads Version 1 of Resume/CV');
    const v1Content = Buffer.from('%PDF-1.4 RESUME V1 TEST / NOT VALID / SYNTHETIC SAMPLE WATERMARK %EOF');
    const v1Sha256 = crypto.createHash('sha256').update(v1Content).digest('hex');

    const v1Res = await request.post(`${baseUrl}/api/candidate/upload-document`, {
      headers: {
        cookie: `session_token=${(candidate?.id || 'SYNTH-USR-DHAKA-001')}`
      },
      multipart: {
        file: {
          name: 'candidate_resume_v1.pdf',
          mimeType: 'application/pdf',
          buffer: v1Content
        },
        docType: 'cv',
        docTitle: 'জীবনবৃত্তান্ত [TEST / NOT VALID / SYNTHETIC SAMPLE]',
        category: 'career'
      }
    });

    const v1Body = await v1Res.json().catch(() => ({}));
    const docId = v1Body.docRecord?.id;
    const v1FileName = v1Body.fileName;

    assertions.push({
      assertion: 'Version 1 document uploaded successfully with version: 1',
      expected: 'true',
      actual: String(Boolean(docId && v1Body.docRecord?.version === 1)),
      passed: Boolean(docId && v1Body.docRecord?.version === 1)
    });

    if (docId) {
      // 2. Upload Replacement Version 2 referencing replaceDocId
      actions.push(`Candidate uploads replacement Version 2 for document ${docId}`);
      const v2Content = Buffer.from('%PDF-1.4 RESUME V2 REVISED TEST / NOT VALID / SYNTHETIC SAMPLE WATERMARK %EOF');
      const v2Sha256 = crypto.createHash('sha256').update(v2Content).digest('hex');

      const v2Res = await request.post(`${baseUrl}/api/candidate/upload-document`, {
        headers: {
          cookie: `session_token=${(candidate?.id || 'SYNTH-USR-DHAKA-001')}`
        },
        multipart: {
          file: {
            name: 'candidate_resume_v2.pdf',
            mimeType: 'application/pdf',
            buffer: v2Content
          },
          docType: 'cv',
          docTitle: 'জীবনবৃত্তান্ত (হালনাগাদ) [TEST / NOT VALID / SYNTHETIC SAMPLE]',
          category: 'career',
          replaceDocId: docId
        }
      });

      const v2Body = await v2Res.json().catch(() => ({}));
      const v2DocRecord = v2Body.docRecord;

      assertions.push({
        assertion: 'Replacement upload responds with HTTP 200 and version incremented to 2',
        expected: 'true',
        actual: String(Boolean(v2DocRecord && v2DocRecord.version === 2)),
        passed: Boolean(v2DocRecord && v2DocRecord.version === 2)
      });

      assertions.push({
        assertion: 'Replacement preserves previous version filename reference',
        expected: 'true',
        actual: String(Boolean(v2DocRecord?.previousVersionId === v1FileName)),
        passed: Boolean(v2DocRecord?.previousVersionId === v1FileName)
      });

      assertions.push({
        assertion: 'New SHA-256 checksum reflects replaced file content',
        expected: v2Sha256,
        actual: String(v2DocRecord?.checksumSha256),
        passed: v2DocRecord?.checksumSha256 === v2Sha256
      });

      // 3. Verify store state after replacement
      const docsInStore = SyntheticUserManager.getDocuments((candidate?.id || 'SYNTH-USR-DHAKA-001'));
      const activeDoc = docsInStore.find(d => d.id === docId);

      assertions.push({
        assertion: 'Candidate document store holds Version 2 with PENDING_REVIEW status',
        expected: '2',
        actual: String(activeDoc?.version),
        passed: activeDoc?.version === 2 && activeDoc?.verificationStatus === 'PENDING_REVIEW'
      });

      // 4. Verify replacement notification delivered
      const candidateNotifs = SyntheticUserManager.getCandidateNotifications((candidate?.id || 'SYNTH-USR-DHAKA-001'));
      const hasReplacementNotif = candidateNotifs.some(n =>
        n.title.includes('প্রতিস্থাপন') || n.message.includes('প্রতিস্থাপিত')
      );

      assertions.push({
        assertion: 'Candidate notification triggered for document replacement',
        expected: 'true',
        actual: String(hasReplacementNotif),
        passed: hasReplacementNotif
      });
    }

    // 5. Zero database pollution assertion
    const isolation = SyntheticUserManager.verifyDataIsolation();
    assertions.push({
      assertion: 'Zero pollution in real database local_store.json (41 candidates)',
      expected: 'true',
      actual: String(isolation.isIsolated && isolation.realCandidatesCount === 41),
      passed: isolation.isIsolated && isolation.realCandidatesCount === 41
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: `Scenario 21 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Document Replacement, Versioning Increment & Integrity Tracking',
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
