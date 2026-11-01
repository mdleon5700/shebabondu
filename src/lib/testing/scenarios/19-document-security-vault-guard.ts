import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import crypto from 'crypto';

export async function runScenario19(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-19-DOCUMENT-SECURITY-VAULT-GUARD';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const candidateA = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-001') ||
                     SyntheticUserManager.getAllSyntheticUsers()[0];
  const candidateB = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-RAJSHAHI-001') ||
                     SyntheticUserManager.getAllSyntheticUsers()[1];

  const adminKey = process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026';

  try {
    const request = page.context().request;

    // 1. Upload a test document for Candidate A to test protection
    actions.push('Uploading protected test document for Candidate A');
    const testFileBuffer = Buffer.from('%PDF-1.4 TEST / NOT VALID / SYNTHETIC SAMPLE WATERMARK %EOF');
    const expectedSha256 = crypto.createHash('sha256').update(testFileBuffer).digest('hex');

    const uploadRes = await request.post(`${baseUrl}/api/candidate/upload-document`, {
      headers: {
        cookie: `cs_session_token=${candidateA?.id}; session_token=${candidateA?.id}`,
        'x-candidate-id': candidateA?.id || ''
      },
      multipart: {
        file: {
          name: 'secure_sample_nid.pdf',
          mimeType: 'application/pdf',
          buffer: testFileBuffer
        },
        docType: 'nid_front',
        docTitle: 'জাতীয় পরিচয়পত্র [TEST / NOT VALID / SYNTHETIC SAMPLE]',
        category: 'identification'
      }
    });

    const uploadBody = await uploadRes.json().catch(() => ({}));
    const uploadedFileName = uploadBody.fileName;

    assertions.push({
      assertion: 'Candidate A document upload successful with SHA-256 computation',
      expected: 'true',
      actual: String(Boolean(uploadedFileName && uploadBody.checksumSha256)),
      passed: Boolean(uploadedFileName && uploadBody.checksumSha256 === expectedSha256)
    });

    if (uploadedFileName) {
      // 2. Unauthenticated direct download probe -> must receive HTTP 403 Forbidden
      actions.push('Probing unauthenticated direct download of Candidate A document');
      const unauthCtx = await page.context().browser()!.newContext();
      const unauthRes = await unauthCtx.request.get(`${baseUrl}/api/uploads/candidate-documents/${uploadedFileName}`);
      const unauthStatus = unauthRes.status();
      await unauthCtx.close();
      assertions.push({
        assertion: 'Unauthenticated visitor is blocked with HTTP 403 Forbidden on direct file URL',
        expected: '403',
        actual: String(unauthStatus),
        passed: unauthStatus === 403
      });

      // 3. Unauthorized cross-user probe: Candidate B attempting to access Candidate A's file -> HTTP 403
      actions.push('Probing unauthorized cross-user download (Candidate B trying to access Candidate A file)');
      const crossUserRes = await request.get(`${baseUrl}/api/uploads/candidate-documents/${uploadedFileName}`, {
        headers: {
          cookie: `cs_session_token=${candidateB?.id}; session_token=${candidateB?.id}`,
          'x-candidate-id': candidateB?.id || ''
        }
      });
      assertions.push({
        assertion: 'Cross-candidate unauthorized download attempt is blocked with HTTP 403 Forbidden',
        expected: '403',
        actual: String(crossUserRes.status()),
        passed: crossUserRes.status() === 403
      });

      // 4. Directory traversal probe -> HTTP 400 Bad Request
      actions.push('Probing directory traversal attempt (../../package.json)');
      const traversalRes = await request.get(`${baseUrl}/api/uploads/candidate-documents/..%2f..%2fpackage.json`);
      assertions.push({
        assertion: 'Path traversal attack is rejected with HTTP 400 Bad Request',
        expected: '400',
        actual: String(traversalRes.status()),
        passed: traversalRes.status() === 400
      });

      // 5. Authorized Candidate A access -> HTTP 200 with nosniff and matching SHA-256
      actions.push('Candidate A downloading their own document with authentication');
      const authRes = await request.get(`${baseUrl}/api/uploads/candidate-documents/${uploadedFileName}`, {
        headers: {
          cookie: `cs_session_token=${candidateA?.id}; session_token=${candidateA?.id}`,
          'x-candidate-id': candidateA?.id || ''
        }
      });

      const authStatus = authRes.status();
      const authNosniff = authRes.headers()['x-content-type-options'];
      const authBuffer = await authRes.body();
      const downloadedSha256 = crypto.createHash('sha256').update(authBuffer).digest('hex');

      assertions.push({
        assertion: 'Candidate A successfully downloads document with HTTP 200 and nosniff header',
        expected: 'true',
        actual: String(authStatus === 200 && authNosniff === 'nosniff'),
        passed: authStatus === 200 && authNosniff === 'nosniff'
      });

      assertions.push({
        assertion: 'Downloaded document buffer matches SHA-256 checksum perfectly',
        expected: expectedSha256,
        actual: downloadedSha256,
        passed: downloadedSha256 === expectedSha256
      });

      // 6. Authorized Admin download -> HTTP 200 with x-admin-key
      actions.push('Admin authorized download via x-admin-key');
      const adminRes = await request.get(`${baseUrl}/api/uploads/candidate-documents/${uploadedFileName}`, {
        headers: {
          'x-admin-key': adminKey
        }
      });
      assertions.push({
        assertion: 'Authorized admin successfully accesses candidate document with HTTP 200',
        expected: '200',
        actual: String(adminRes.status()),
        passed: adminRes.status() === 200
      });
    }

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: `Scenario 19 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Document Security Vault Guard, Cross-User Isolation & SHA-256 Verification',
    category: 'security',
    status: passed ? 'PASS' : 'FAIL',
    startTime,
    endTime,
    durationMs: new Date(endTime).getTime() - new Date(startTime).getTime(),
    actionsPerformed: actions,
    assertions,
    errors
  };
}
