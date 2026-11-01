import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import fs from 'fs';
import path from 'path';

export async function runScenario15(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-15-ACADEMIC-DOCUMENT-SECURITY';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const candidateA = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-RAJSHAHI-001') || 
                     SyntheticUserManager.getAllSyntheticUsers()[0];
  const candidateB = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-001') || 
                     SyntheticUserManager.getAllSyntheticUsers()[1];

  let uploadedDocId: string | null = null;
  let uploadedFileUrl: string | null = null;

  try {
    const request = page.context().request;

    // 1. Probe upload with disallowed extension (.exe)
    actions.push('Probing /api/candidate/upload-document with disallowed executable file (.exe)');
    const disallowedRes = await request.post(`${baseUrl}/api/candidate/upload-document`, {
      multipart: {
        file: {
          name: 'exploit_script.exe',
          mimeType: 'application/x-msdownload',
          buffer: Buffer.from('MZ00000000FAKEBINARYTESTCONTENT')
        },
        docType: 'certificate_test',
        docTitle: 'Disallowed Executable'
      }
    });

    const disallowedStatus = disallowedRes.status();
    const disallowedBody = await disallowedRes.json().catch(() => ({}));
    const disallowedRejected = disallowedStatus === 400 && String(disallowedBody.error || '').includes('PDF');

    assertions.push({
      assertion: 'Disallowed extension (.exe) is rejected with HTTP 400',
      expected: 'true',
      actual: String(disallowedRejected),
      passed: disallowedRejected
    });

    // 2. Probe upload with oversized file (> 10MB)
    actions.push('Probing /api/candidate/upload-document with oversized file (> 10MB)');
    const oversizedBuffer = Buffer.alloc(10.5 * 1024 * 1024, 'A');
    const oversizedRes = await request.post(`${baseUrl}/api/candidate/upload-document`, {
      multipart: {
        file: {
          name: 'large_scanned_certificate.pdf',
          mimeType: 'application/pdf',
          buffer: oversizedBuffer
        },
        docType: 'certificate_test',
        docTitle: 'Oversized Certificate'
      }
    });

    const oversizedStatus = oversizedRes.status();
    const oversizedBody = await oversizedRes.json().catch(() => ({}));
    const oversizedRejected = oversizedStatus === 400 && String(oversizedBody.error || '').includes('১০ মেগাবাইট');

    assertions.push({
      assertion: 'Oversized file (> 10MB) is rejected with HTTP 400',
      expected: 'true',
      actual: String(oversizedRejected),
      passed: oversizedRejected
    });

    // 3. Authenticate Candidate A and upload valid watermarked certificate
    actions.push(`Logging in Candidate A (${candidateA.nameBn}) to test valid document upload`);
    await page.context().clearCookies();
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const phoneInput = page.locator('input[placeholder*="017XXXXXXXX"], form input[type="text"]').first();
    await phoneInput.fill(candidateA.phone);
    const passInput = page.locator('input[type="password"]').first();
    await passInput.fill(candidateA.testPasswordPlain);
    const submitBtn = page.locator('form button[type="submit"]:has-text("লগইন করুন")').first();
    await submitBtn.click();
    await Promise.race([
      page.waitForURL('**/dashboard**', { timeout: 8000 }).catch(() => {}),
      page.waitForTimeout(3000)
    ]);

    // Perform valid PDF upload as Candidate A
    actions.push('Uploading valid synthetic academic certificate as Candidate A');
    const validPdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n193\n%%EOF`;
    const validRes = await request.post(`${baseUrl}/api/candidate/upload-document`, {
      multipart: {
        file: {
          name: 'synthetic_ssc_certificate_test.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from(validPdfContent)
        },
        docType: 'ssc_certificate',
        docTitle: 'এসএসসি পরীক্ষার সনদপত্র (টেস্ট কপি)',
        category: 'academic'
      }
    });

    const validStatus = validRes.status();
    const validBody = await validRes.json().catch(() => ({}));
    const uploadSucceeded = validStatus === 200 && validBody.success === true && !!validBody.docRecord?.id;
    uploadedDocId = validBody.docRecord?.id || null;
    uploadedFileUrl = validBody.fileUrl || null;

    assertions.push({
      assertion: 'Valid synthetic certificate upload succeeds and returns document ID',
      expected: 'true',
      actual: String(uploadSucceeded),
      passed: uploadSucceeded
    });

    if (uploadedDocId) {
      // 4. Probe secure document download without authentication
      actions.push(`Probing secure document download route without credentials`);
      const unauthContext = await page.context().browser()?.newContext();
      const unauthRequest = unauthContext ? unauthContext.request : request;
      const unauthRes = await unauthRequest.get(`${baseUrl}/api/candidate/documents/secure/${uploadedDocId}`, {
        headers: { Cookie: '' }
      });
      const unauthStatus = unauthRes.status();
      if (unauthContext) await unauthContext.close();

      const unauthBlocked = unauthStatus === 403 || unauthStatus === 401;
      assertions.push({
        assertion: 'Unauthenticated access to secure document is blocked with HTTP 403/401',
        expected: 'true',
        actual: String(unauthBlocked),
        passed: unauthBlocked
      });

      // 5. Probe cross-candidate unauthorized access (Candidate B requesting Candidate A's document)
      actions.push(`Probing cross-candidate access: Candidate B requesting Candidate A document`);
      await page.context().clearCookies();
      await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      const phoneInputB = page.locator('input[placeholder*="017XXXXXXXX"], form input[type="text"]').first();
      await phoneInputB.fill(candidateB.phone);
      const passInputB = page.locator('input[type="password"]').first();
      await passInputB.fill(candidateB.testPasswordPlain);
      const submitBtnB = page.locator('form button[type="submit"]:has-text("লগইন করুন")').first();
      await submitBtnB.click();
      await Promise.race([
        page.waitForURL('**/dashboard**', { timeout: 8000 }).catch(() => {}),
        page.waitForTimeout(3000)
      ]);

      const crossCandRes = await request.get(`${baseUrl}/api/candidate/documents/secure/${uploadedDocId}`);
      const crossCandStatus = crossCandRes.status();
      const crossCandBlocked = crossCandStatus === 403;

      assertions.push({
        assertion: 'Cross-candidate unauthorized access is blocked with HTTP 403',
        expected: 'true',
        actual: String(crossCandBlocked),
        passed: crossCandBlocked
      });

      // 6. Probe authorized access by Owner (Candidate A)
      actions.push(`Probing authorized download by owner Candidate A`);
      await page.context().clearCookies();
      await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      const phoneInputA = page.locator('input[placeholder*="017XXXXXXXX"], form input[type="text"]').first();
      await phoneInputA.fill(candidateA.phone);
      const passInputA = page.locator('input[type="password"]').first();
      await passInputA.fill(candidateA.testPasswordPlain);
      const submitBtnA = page.locator('form button[type="submit"]:has-text("লগইন করুন")').first();
      await submitBtnA.click();
      await Promise.race([
        page.waitForURL('**/dashboard**', { timeout: 8000 }).catch(() => {}),
        page.waitForTimeout(3000)
      ]);

      const ownerRes = await request.get(`${baseUrl}/api/candidate/documents/secure/${uploadedDocId}`);
      const ownerStatus = ownerRes.status();
      const ownerAllowed = ownerStatus === 200;

      assertions.push({
        assertion: 'Owner (Candidate A) is authorized to access document with HTTP 200',
        expected: 'true',
        actual: String(ownerAllowed),
        passed: ownerAllowed
      });

      // 7. Probe authorized access by Admin (x-admin-secret)
      actions.push('Probing authorized download by Admin via x-admin-secret');
      const adminSecret = process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026';
      const adminRes = await request.get(`${baseUrl}/api/candidate/documents/secure/${uploadedDocId}`, {
        headers: { 'x-admin-secret': adminSecret }
      });
      const adminStatus = adminRes.status();
      const adminAllowed = adminStatus === 200;

      assertions.push({
        assertion: 'Admin is authorized to inspect candidate document with HTTP 200',
        expected: 'true',
        actual: String(adminAllowed),
        passed: adminAllowed
      });
    }

    // 8. Assert production database local_store.json candidates count === 41
    const localStorePath = path.join(process.cwd(), 'src', 'db', 'local_store.json');
    const dbRaw = fs.readFileSync(localStorePath, 'utf8');
    const parsed = JSON.parse(dbRaw);
    const candidateCount = Object.keys(parsed.candidates || {}).length;
    const isIsoPass = candidateCount === 41;

    assertions.push({
      assertion: 'Production store local_store.json candidates count preserved strictly at 41',
      expected: '41',
      actual: String(candidateCount),
      passed: isIsoPass
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: `Scenario 15 runtime error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  // Cleanup: delete uploaded test file if on disk
  if (uploadedFileUrl) {
    try {
      const fileName = path.basename(uploadedFileUrl);
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'candidate-documents', fileName);
      if (fs.existsSync(uploadPath)) {
        fs.unlinkSync(uploadPath);
      }
    } catch {}
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Academic Document Security, Upload Validation & Permission Guard',
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
