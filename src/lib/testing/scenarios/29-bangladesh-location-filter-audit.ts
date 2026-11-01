import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';

export async function runScenario29(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-29-BANGLADESH-LOCATION-FILTER-AUDIT';
  const startTime = new Date().toISOString();
  const actions: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  const tempJobId = 'SYNTH-JOB-LOC-TEST-001';

  try {
    const request = page.context().request;

    // 1. Audit all 8 Bangladesh Administrative Divisions
    actions.push('Auditing search response across all 8 Bangladesh divisions');
    const divisions = ['DHAKA', 'CHATTOGRAM', 'RAJSHAHI', 'KHULNA', 'BARISHAL', 'SYLHET', 'RANGPUR', 'MYMENSINGH'];
    let allDivisionsPassed = true;

    for (const div of divisions) {
      const divRes = await request.get(`${baseUrl}/api/jobs/search?division=${div}&limit=5`);
      if (divRes.status() !== 200) {
        allDivisionsPassed = false;
        break;
      }
    }

    assertions.push({
      assertion: 'All 8 Bangladesh administrative divisions return HTTP 200 without error',
      expected: 'true',
      actual: String(allDivisionsPassed),
      passed: allDivisionsPassed
    });

    // 2. Publish synthetic job with specific district assignment: Dhaka, Rajshahi, Sylhet only
    actions.push(`Registering temporary synthetic job ${tempJobId} assigned to Dhaka, Rajshahi, Sylhet`);
    SyntheticJobManager.saveJob({
      id: tempJobId,
      title: 'জেলা ভিত্তিক পরীক্ষামূলক প্রকৌশলী [TEST / NOT VALID / SYNTHETIC SAMPLE]',
      organization: 'বাংলাদেশ পরিসংখ্যান ব্যুরো [TEST / NOT VALID / SYNTHETIC SAMPLE]',
      category: 'engineer',
      categoryLabel: 'প্রকৌশলী ও প্রযুক্তি',
      grade: '৯ম গ্রেড',
      totalPosts: 2,
      salary: '২২,০০০ - ৫৩,০৬০ টাকা',
      minEducation: 'বিএসসি ইন ইঞ্জিনিয়ারিং',
      districts: 'ঢাকা, রাজশাহী, সিলেট',
      division: 'ঢাকা',
      district: 'ঢাকা',
      deadline: '২০২৭-১২-৩১',
      daysRemaining: 400,
      status: 'PUBLISHED',
      // publicationStatus removed
    });

    // 3. Verify inclusion in designated district (Rajshahi)
    actions.push('Querying search for designated district "রাজশাহী"');
    const rajRes = await request.get(`${baseUrl}/api/jobs/search?q=${encodeURIComponent('পরীক্ষামূলক')}&district=${encodeURIComponent('রাজশাহী')}`);
    const rajBody = await rajRes.json().catch(() => ({}));
    const rajJobs: any[] = rajBody.jobs || [];
    const isPresentInRajshahi = rajJobs.some(j => j.id === tempJobId);

    assertions.push({
      assertion: 'Job assigned to Rajshahi is present in Rajshahi district filter results',
      expected: 'true',
      actual: String(isPresentInRajshahi),
      passed: isPresentInRajshahi
    });

    // 4. Verify exclusion in non-designated district (Khulna)
    actions.push('Querying search for non-designated district "খুলনা" (leakage guard)');
    const khuRes = await request.get(`${baseUrl}/api/jobs/search?q=${encodeURIComponent('পরীক্ষামূলক')}&district=${encodeURIComponent('খুলনা')}`);
    const khuBody = await khuRes.json().catch(() => ({}));
    const khuJobs: any[] = khuBody.jobs || [];
    const isLeakedToKhulna = khuJobs.some(j => j.id === tempJobId);

    assertions.push({
      assertion: 'District-exclusive job does NOT leak into unassigned district (Khulna)',
      expected: 'false',
      actual: String(isLeakedToKhulna),
      passed: !isLeakedToKhulna
    });

    // 5. Clean up temporary test job
    SyntheticJobManager.deleteJob(tempJobId);
    actions.push(`Cleaned up temporary job ${tempJobId}`);

    // 6. Zero Database Contamination assertion
    const isolation = SyntheticJobManager.verifyJobDataIsolation();
    assertions.push({
      assertion: 'Real database local_store.json remains 100% unpolluted (214 real jobs)',
      expected: 'true',
      actual: String(isolation.isIsolated && isolation.realJobsCount === 214),
      passed: isolation.isIsolated && isolation.realJobsCount === 214
    });

  } catch (err: any) {
    SyntheticJobManager.deleteJob(tempJobId);
    errors.push({
      type: 'interaction_failure',
      message: `Scenario 29 error: ${err.message || String(err)}`,
      timestamp: new Date().toISOString()
    });
  }

  const endTime = new Date().toISOString();
  const passed = assertions.length > 0 && assertions.every(a => a.passed) && errors.length === 0;

  return {
    scenarioId,
    name: 'Bangladesh Location & 64-District Filter Isolation Audit',
    category: 'public',
    status: passed ? 'PASS' : 'FAIL',
    startTime,
    endTime,
    durationMs: new Date(endTime).getTime() - new Date(startTime).getTime(),
    actionsPerformed: actions,
    assertions,
    errors
  };
}
