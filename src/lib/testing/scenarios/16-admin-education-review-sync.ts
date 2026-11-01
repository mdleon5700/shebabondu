import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import fs from 'fs';
import path from 'path';

export async function runScenario16(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-16-ADMIN-EDUCATION-REVIEW-SYNC';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const candidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-KHULNA-001') || 
                    SyntheticUserManager.getAllSyntheticUsers()[2] || 
                    SyntheticUserManager.getAllSyntheticUsers()[0];
  if (!candidate) throw new Error('No candidate available');

  const adminSecret = process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026';

  try {
    const request = page.context().request;

    // 1. Prepare target education record for candidate
    const testEduId = 'edu_review_sync_' + Date.now().toString().slice(-6);
    actions.push(`Adding pending education record (${testEduId}) for candidate ${candidate.nameBn}`);
    
    SyntheticUserManager.addCandidateEducation((candidate.id || "SYNTH-USR-KHULNA-001"), {
      id: testEduId,
      level: 'HSC',
      degree: 'উচ্চ মাধ্যমিক সার্টিফিকেট (বিজ্ঞান)',
      boardOrUni: 'যশোর শিক্ষা বোর্ড',
      roll: '654321',
      reg: '9876543210',
      year: '2022',
      result: '5.00',
      resultType: 'GPA',
      scale: 5.0,
      majorSubject: 'বিজ্ঞান (Science)',
      institutionName: 'খুলনা সরকারি মজিদ মেমোরিয়াল সিটি কলেজ',
      academicStatus: 'COMPLETED',
      verificationStatus: 'PENDING_REVIEW'
    });

    // 2. Query Admin Certificate Review Queue
    actions.push('Querying GET /api/admin/certificates/queue with admin credentials');
    const queueRes = await request.get(`${baseUrl}/api/admin/certificates/queue`, {
      headers: { 'x-admin-secret': adminSecret }
    });

    const queueStatus = queueRes.status();
    const queueBody = await queueRes.json().catch(() => ({}));
    const queueHasItems = queueStatus === 200 && queueBody.success === true && Array.isArray(queueBody.queue);
    const targetInQueue = queueHasItems && queueBody.queue.some((item: any) => 
      item.candidateId === (candidate.id || "SYNTH-USR-KHULNA-001") && item.recordId === testEduId
    );

    assertions.push({
      assertion: 'Admin Certificate Queue returns HTTP 200 with queue list',
      expected: 'true',
      actual: String(queueHasItems),
      passed: queueHasItems
    });

    assertions.push({
      assertion: 'Target candidate education record appears in Admin Review Queue',
      expected: 'true',
      actual: String(targetInQueue),
      passed: Boolean(targetInQueue)
    });

    // 3. Admin applies verification decision (POST /api/admin/certificates/verify)
    actions.push(`Submitting administrative VERIFIED decision for record ${testEduId}`);
    const verifyRemark = 'সকল একাডেমিক মার্কশিট ও প্রশংসাপত্র সফলভাবে যাচাই এবং সত্যায়িত করা হয়েছে।';
    const verifyRes = await request.post(`${baseUrl}/api/admin/certificates/verify`, {
      headers: {
        'x-admin-secret': adminSecret,
        'Content-Type': 'application/json'
      },
      data: {
        candidateId: (candidate.id || "SYNTH-USR-KHULNA-001"),
        recordId: testEduId,
        recordType: 'education',
        status: 'VERIFIED',
        remarks: verifyRemark
      }
    });

    const verifyStatus = verifyRes.status();
    const verifyBody = await verifyRes.json().catch(() => ({}));
    const verifySucceeded = verifyStatus === 200 && verifyBody.success === true;

    assertions.push({
      assertion: 'Admin verification API accepts decision and returns HTTP 200',
      expected: 'true',
      actual: String(verifySucceeded),
      passed: verifySucceeded
    });

    // 4. Verify candidate backend state transition
    actions.push('Verifying candidate record transition in SyntheticUserManager store');
    const freshUser = SyntheticUserManager.getSyntheticUserById((candidate.id || "SYNTH-USR-KHULNA-001"));
    const updatedEdu = freshUser?.education?.find((e: any) => e.id === testEduId);
    const isBackendVerified = updatedEdu?.verificationStatus === 'VERIFIED' && 
                              updatedEdu?.verificationRemarks === verifyRemark;

    assertions.push({
      assertion: 'Candidate education record updated to VERIFIED with admin remarks in store',
      expected: 'true',
      actual: String(isBackendVerified),
      passed: Boolean(isBackendVerified)
    });

    // 5. Browser UI Synchronization: Log in as candidate and inspect Education tab
    actions.push(`Logging in candidate (${candidate.phone}) in Playwright browser to inspect UI sync`);
    await page.context().clearCookies();
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const phoneInput = page.locator('input[placeholder*="017XXXXXXXX"], form input[type="text"]').first();
    await phoneInput.fill(candidate.phone);
    const passInput = page.locator('input[type="password"]').first();
    await passInput.fill(candidate.testPasswordPlain);
    const submitBtn = page.locator('form button[type="submit"]:has-text("লগইন করুন")').first();
    await submitBtn.click();
    await Promise.race([
      page.waitForURL('**/dashboard**', { timeout: 8000 }).catch(() => {}),
      page.waitForTimeout(3000)
    ]);

    actions.push('Navigating to Candidate Profile Education Tab');
    await page.goto(`${baseUrl}/dashboard/profile`, { waitUntil: 'domcontentloaded' });
    await Promise.race([
      page.waitForResponse(resp => resp.url().includes('/api/profile') && resp.status() === 200, { timeout: 8000 }).catch(() => {}),
      page.waitForTimeout(3000)
    ]);
    await page.waitForTimeout(1000);

    const eduTabBtn = page.locator('button:has-text("শিক্ষাগত যোগ্যতা")').first();
    await eduTabBtn.waitFor({ state: 'visible', timeout: 12000 });
    await eduTabBtn.click();
    await page.waitForTimeout(1500);

    // Look for verified badge on the candidate profile
    const verifiedBadge = page.locator('span:has-text("যাচাইকৃত"), span:has-text("✓ যাচাইকৃত")').first();
    const isBadgeVisible = await verifiedBadge.isVisible().catch(() => false);

    assertions.push({
      assertion: 'Verified status badge (✓ যাচাইকৃত) renders on candidate profile Education card',
      expected: 'true',
      actual: String(isBadgeVisible),
      passed: isBadgeVisible
    });

    // Clean up test education record from candidate
    SyntheticUserManager.deleteCandidateEducation((candidate.id || "SYNTH-USR-KHULNA-001"), testEduId);

    // 6. Assert production database local_store.json candidates count === 41
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
      message: `Scenario 16 runtime error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Admin Education Review Queue & Candidate Profile Synchronization',
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
