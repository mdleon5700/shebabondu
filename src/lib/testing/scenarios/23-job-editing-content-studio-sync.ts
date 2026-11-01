import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';

export async function runScenario23(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-23-JOB-EDITING-CONTENT-STUDIO-SYNC';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const adminKey = process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026';
  const jobId = 'SYNTH-JOB-DRAFT-001';

  try {
    const request = page.context().request;

    // Ensure initial job exists
    let existing = SyntheticJobManager.getJobById(jobId);
    if (!existing) {
      existing = SyntheticJobManager.saveJob({
        id: jobId,
        title: 'সহকারী প্রোগ্রামার (তথ্যপ্রযুক্তি) [TEST / NOT VALID / SYNTHETIC SAMPLE]',
        organization: 'পরীক্ষামূলক শিক্ষা তথ্য অধিদপ্তর [TEST / NOT VALID / SYNTHETIC SAMPLE]',
        category: 'govt',
        salary: '২২,০০০ - ৫৩,০৬০ টাকা',
        totalPosts: 5,
        status: 'DRAFT'
      });
    }

    // 1. Partial edit: Update salary, vacancies, and Content Studio rich content
    actions.push(`Admin updates job ${jobId} with new salary, vacancies, and rich description`);
    const updatePayload = {
      salary: '২৮,০০০ - ৬৫,০০০ টাকা (সংশোধিত স্কেল)',
      totalPosts: 8,
      bengaliDescription: '<h2>মূল দায়িত্ব ও কার্যাবলি</h2><ul><li>ওয়েব অ্যাপ্লিকেশন নিরাপত্তা মনিটরিং</li><li>ডাটাবেজ পারফরম্যান্স টিউনিং</li><li>সার্ভার আপটাইম নিশ্চিতকরণ</li></ul>',
      requirements: ['কম্পিউটার সায়েন্সে বিএসসি', 'ন্যূনতম ২ বছরের অভিজ্ঞতা', 'ডাটাবেজ ম্যানেজমেন্ট দক্ষতা']
    };

    const updateRes = await request.put(`${baseUrl}/api/admin/jobs/${jobId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        'x-admin-secret': adminKey
      },
      data: updatePayload
    });

    const updateStatus = updateRes.status();
    const updateBody = await updateRes.json().catch(() => ({}));

    assertions.push({
      assertion: 'Job PUT update endpoint succeeds with HTTP 200',
      expected: '200',
      actual: String(updateStatus),
      passed: updateStatus === 200 && Boolean(updateBody.success)
    });

    // 2. Fetch updated job and assert non-targeted fields were preserved
    actions.push('Fetching updated job from storage to verify partial update integrity');
    const updatedJob = SyntheticJobManager.getJobById(jobId);

    assertions.push({
      assertion: 'Targeted fields (salary, totalPosts, bengaliDescription) updated successfully',
      expected: 'true',
      actual: String(Boolean(
        updatedJob &&
        updatedJob.totalPosts === 8 &&
        updatedJob.salary === updatePayload.salary &&
        (updatedJob?.bengaliDescription || '').includes('মূল দায়িত্ব ও কার্যাবলি')
      )),
      passed: Boolean(
        updatedJob &&
        updatedJob.totalPosts === 8 &&
        updatedJob.salary === updatePayload.salary &&
        (updatedJob?.bengaliDescription || '').includes('মূল দায়িত্ব ও কার্যাবলি')
      )
    });

    assertions.push({
      assertion: 'Unedited fields (title, organization, category, grade) preserved without data loss',
      expected: 'true',
      actual: String(Boolean(
        updatedJob &&
        updatedJob.title === existing.title &&
        updatedJob.organization === existing.organization &&
        updatedJob.category === existing.category
      )),
      passed: Boolean(
        updatedJob &&
        updatedJob.title === existing.title &&
        updatedJob.organization === existing.organization &&
        updatedJob.category === existing.category
      )
    });

    // 3. Verify zero database pollution
    const isolation = SyntheticJobManager.verifyJobDataIsolation();
    assertions.push({
      assertion: 'Database isolation preserved during job edit (214 real jobs)',
      expected: 'true',
      actual: String(isolation.isIsolated && isolation.realJobsCount === 214),
      passed: isolation.isIsolated && isolation.realJobsCount === 214
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: `Scenario 23 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Job Editing, Partial Updates & Content Studio Rich Content Sync',
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
