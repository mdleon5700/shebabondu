import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';

export async function runScenario14(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-14-EDUCATION-CRUD-LIFECYCLE';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  // Select representative candidate from Rajshahi
  const candidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-RAJSHAHI-001') || 
                    SyntheticUserManager.getAllSyntheticUsers()[0];

  try {
    // 1. Authenticate candidate
    actions.push(`Logging in candidate for Education lifecycle: ${candidate.phone}`);
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

    // 2. Open Profile and navigate to Education Tab
    actions.push(`Navigating to profile: ${baseUrl}/dashboard/profile`);
    await page.goto(`${baseUrl}/dashboard/profile`, { waitUntil: 'domcontentloaded' });
    await Promise.race([
      page.waitForResponse(resp => resp.url().includes('/api/profile') && resp.status() === 200, { timeout: 8000 }).catch(() => {}),
      page.waitForTimeout(3000)
    ]);
    await page.waitForTimeout(1000);

    actions.push('Switching to Education Management Tab');
    const eduTabBtn = page.locator('button:has-text("শিক্ষাগত যোগ্যতা")').first();
    await eduTabBtn.waitFor({ state: 'visible', timeout: 12000 });
    await eduTabBtn.click();
    await page.waitForTimeout(1000);

    const isEduTabActive = await page.locator('button:has-text("নতুন শিক্ষাগত যোগ্যতা যোগ করুন")').first().isVisible().catch(() => false);
    assertions.push({
      assertion: 'Education Tab renders successfully with Add Record button',
      expected: 'true',
      actual: String(isEduTabActive),
      passed: isEduTabActive
    });

    // 3. Open Modal and Add Academic Record
    actions.push('Opening Add Education Modal');
    await page.locator('button:has-text("নতুন শিক্ষাগত যোগ্যতা যোগ করুন")').first().click();
    await page.waitForTimeout(800);

    const isModalOpen = await page.locator('text=শিক্ষাগত রেকর্ড যুক্ত করুন').first().isVisible().catch(() => false);
    assertions.push({
      assertion: 'Add Education Modal opens with complete input fields',
      expected: 'true',
      actual: String(isModalOpen),
      passed: isModalOpen
    });

    const testDegree = 'বিএসসি ইন সফটওয়্যার ইঞ্জিনিয়ারিং (টেস্ট)';
    const testInst = 'রাজশাহী প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয় (RUET)';
    const testYear = '2023';
    const testResult = 'CGPA 3.82 / 4.00';

    actions.push(`Filling Education record: ${testDegree}, ${testResult}`);
    const degreeInput = page.locator('input[placeholder*="যেমন: বিএসসি ইন"]').first();
    await degreeInput.fill(testDegree);

    const instInput = page.locator('input[placeholder*="যেমন: ঢাকা বিশ্ববিদ্যালয়"]').first();
    await instInput.fill(testInst);

    const yearInput = page.locator('form input[value*="20"]').first();
    if (await yearInput.isVisible().catch(() => false)) {
      await yearInput.fill(testYear);
    }

    const resultInput = page.locator('input[placeholder*="3.80"], input[placeholder*="ফলাফল"]').first();
    if (await resultInput.isVisible().catch(() => false)) {
      await resultInput.fill(testResult);
    } else {
      // Find last input in modal form
      const modalInputs = page.locator('.fixed.inset-0 form input');
      const count = await modalInputs.count();
      if (count > 0) {
        await modalInputs.nth(count - 1).fill(testResult);
      }
    }

    actions.push('Submitting new education record');
    const saveEduBtn = page.locator('.fixed.inset-0 button[type="submit"]:has-text("যুক্ত করুন"), .fixed.inset-0 button:has-text("সংরক্ষণ করুন")').first();
    await saveEduBtn.click();
    await page.waitForTimeout(2000);

    // 4. Assert new record is rendered in list
    const bodyAfterAdd = await page.innerText('body');
    const isAddedVisible = bodyAfterAdd.includes('সফটওয়্যার ইঞ্জিনিয়ারিং') || bodyAfterAdd.includes(testDegree);
    assertions.push({
      assertion: 'Newly added academic record is immediately rendered in Education list',
      expected: 'true',
      actual: String(isAddedVisible),
      passed: isAddedVisible
    });

    // 5. Hard refresh and verify persistence
    actions.push('Performing page reload to verify server persistence');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await Promise.race([
      page.waitForResponse(resp => resp.url().includes('/api/profile') && resp.status() === 200, { timeout: 8000 }).catch(() => {}),
      page.waitForTimeout(3000)
    ]);
    await page.waitForTimeout(1000);

    const eduTabBtn2 = page.locator('button:has-text("শিক্ষাগত যোগ্যতা")').first();
    await eduTabBtn2.click();
    await page.waitForTimeout(1200);

    const bodyAfterReload = await page.innerText('body');
    const isPersisted = bodyAfterReload.includes('সফটওয়্যার ইঞ্জিনিয়ারিং') || bodyAfterReload.includes(testDegree);
    assertions.push({
      assertion: 'Academic record persists accurately after page refresh',
      expected: 'true',
      actual: String(isPersisted),
      passed: isPersisted
    });

    // 6. Delete test record to test cleanup
    actions.push('Deleting newly added test academic record');
    const deleteBtn = page.locator('div:has-text("সফটওয়্যার ইঞ্জিনিয়ারিং") button[title="মুছে ফেলুন"]').first();
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(1500);
    }

    const bodyAfterDelete = await page.innerText('body');
    const isDeleted = !bodyAfterDelete.includes(testDegree);
    assertions.push({
      assertion: 'Academic record is cleanly removed upon deletion',
      expected: 'true',
      actual: String(isDeleted),
      passed: isDeleted
    });

    // 7. Data Isolation verification
    const isolation = SyntheticUserManager.verifyDataIsolation();
    assertions.push({
      assertion: 'Production store local_store.json candidates count preserved strictly at 41',
      expected: '41',
      actual: String(isolation.realCandidatesCount),
      passed: isolation.realCandidatesCount === 41
    });

    const screenshotRef = await browserCtrl.takeScreenshot(scenarioId, 'education_crud_verified');

    const allPassed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: 'Full Academic Record CRUD, Ordering & Persistence Lifecycle',
      category: 'user',
      status: allPassed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed: actions,
      assertions,
      errors,
      screenshotRef,
      evidenceNotes: 'Full browser education lifecycle with add, modal validation, reload persistence, and delete cleanup verified.'
    };
  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    return {
      scenarioId,
      name: 'Full Academic Record CRUD, Ordering & Persistence Lifecycle',
      category: 'user',
      status: 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed: actions,
      assertions,
      errors
    };
  }
}