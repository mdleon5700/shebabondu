import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';

export async function runScenario24(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-24-JOB-VALIDATION-APPROVAL-WORKFLOW';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const adminKey = process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026';
  const jobId = 'SYNTH-JOB-DRAFT-001';

  try {
    const request = page.context().request;

    // 1. Validation test: Empty title rejection
    actions.push('Testing job creation validation with empty title');
    const emptyTitleRes = await request.post(`${baseUrl}/api/admin/jobs`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        'x-admin-secret': adminKey
      },
      data: {
        title: '',
        organization: 'পরীক্ষামূলক অধিদপ্তর',
        category: 'govt'
      }
    });

    const emptyTitleStatus = emptyTitleRes.status();
    const emptyTitleBody = await emptyTitleRes.json().catch(() => ({}));
    const rejectedEmptyTitle = emptyTitleStatus === 400 && String(emptyTitleBody.error || '').includes('শিরোনাম');

    assertions.push({
      assertion: 'Job creation without title is rejected with HTTP 400',
      expected: 'true',
      actual: String(rejectedEmptyTitle),
      passed: rejectedEmptyTitle
    });

    // 2. Validation test: Invalid malicious URL (XSS probe)
    actions.push('Testing URL validation with javascript: URL scheme');
    const xssLinkRes = await request.post(`${baseUrl}/api/admin/jobs`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        'x-admin-secret': adminKey
      },
      data: {
        title: 'নিরাপত্তা পরীক্ষামূলক বিজ্ঞপ্তি',
        organization: 'নিরাপত্তা দপ্তর',
        category: 'govt',
        officialLink: 'javascript:alert(document.cookie)'
      }
    });

    const xssStatus = xssLinkRes.status();
    const xssBody = await xssLinkRes.json().catch(() => ({}));
    const rejectedXss = xssStatus === 400 && String(xssBody.error || '').includes('সঠিক নয়');

    assertions.push({
      assertion: 'Malicious javascript: URL scheme is blocked with HTTP 400',
      expected: 'true',
      actual: String(rejectedXss),
      passed: rejectedXss
    });

    // 3. Status Transition: DRAFT -> PENDING_REVIEW -> APPROVED
    actions.push(`Updating job ${jobId} status to PENDING_REVIEW`);
    await request.put(`${baseUrl}/api/admin/jobs/${jobId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        'x-admin-secret': adminKey
      },
      data: {
        status: 'PENDING_REVIEW'
      }
    });

    let jobInStore = SyntheticJobManager.getJobById(jobId);
    assertions.push({
      assertion: 'Job status transitioned to PENDING_REVIEW',
      expected: 'PENDING_REVIEW',
      actual: String(jobInStore?.status),
      passed: jobInStore?.status === 'PENDING_REVIEW'
    });

    // 4. Admin Approval: APPROVED with Verification Status
    actions.push(`Admin approves job ${jobId} with status APPROVED and verification evidence`);
    const approveRes = await request.put(`${baseUrl}/api/admin/jobs/${jobId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        'x-admin-secret': adminKey
      },
      data: {
        status: 'APPROVED',
        verificationStatus: 'VERIFIED',
        verificationConfidence: 100,
        verifiedBy: 'ADMIN-SUPER',
        verificationNotes: 'অফিসিয়াল গেজেট ও সার্কুলার যাচাইপূর্বক অনুমোদিত।'
      }
    });

    const approveStatus = approveRes.status();
    jobInStore = SyntheticJobManager.getJobById(jobId);

    assertions.push({
      assertion: 'Job status successfully approved (status: APPROVED, verificationStatus: VERIFIED)',
      expected: 'true',
      actual: String(Boolean(
        approveStatus === 200 &&
        jobInStore?.status === 'APPROVED' &&
        jobInStore?.verificationStatus === 'VERIFIED'
      )),
      passed: Boolean(
        approveStatus === 200 &&
        jobInStore?.status === 'APPROVED' &&
        jobInStore?.verificationStatus === 'VERIFIED'
      )
    });

    // 5. Zero database pollution assertion
    const isolation = SyntheticJobManager.verifyJobDataIsolation();
    assertions.push({
      assertion: 'Zero database pollution maintained (214 real jobs)',
      expected: 'true',
      actual: String(isolation.isIsolated && isolation.realJobsCount === 214),
      passed: isolation.isIsolated && isolation.realJobsCount === 214
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: `Scenario 24 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Job Validation & Administrative Approval Workflow',
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
