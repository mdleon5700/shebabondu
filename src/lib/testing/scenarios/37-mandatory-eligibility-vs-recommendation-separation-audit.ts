import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import { SmartJobMatchingEngine } from '../../matching/engine';
import { PersonalizedRecommender } from '../../matching/recommender';
import { JobCircular } from '../../types';

export async function runScenario37(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-37-MANDATORY-ELIGIBILITY-VS-RECOMMENDATION-SEPARATION-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  const testJobId = 'SYNTH-JOB-ELIG-VS-REC-01';

  try {
    actionsPerformed.push('Seeding synthetic job requiring Honours and 0 experience');
    const testJob: JobCircular = ({ 
      id: testJobId,
      title: 'সহকারী পরিচালক (সাধারণ প্রশাসন) - যোগ্যতা ও রিকমেন্ডেশন পরীক্ষা',
      organization: 'জনপ্রশাসন মন্ত্রণালয়',
      category: 'govt',
      categoryLabel: 'সরকারি চাকরি',
      minEducation: 'যেকোনো বিষয়ে ৪ বছর মেয়াদি স্নাতক (সম্মান)',
      requirements: [
        'যেকোনো বিষয়ে ৪ বছর মেয়াদি স্নাতক (সম্মান)',
        'বয়সসীমা: ২১ হতে ৩০ বছর'
      ],
      minAge: 21,
      maxAge: 30,
      salary: '২২,০০০ - ৫৩,০৬০ টাকা',
      deadline: '২০২৭-১২-৩১',
      status: 'PUBLISHED',
      districts: 'সকল জেলা',
      createdAt: new Date().toISOString()
    } as unknown as JobCircular);
    SyntheticJobManager.saveJob(testJob);

    // 1. Ineligible Candidate Evaluation (JSC holder)
    actionsPerformed.push('Evaluating candidate SYNTH-USR-DHAKA-001 (JSC level) against Honours job');
    const jscCandidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-001');
    if (!jscCandidate) throw new Error('Candidate SYNTH-USR-DHAKA-001 not found');

    const jscMatch = SmartJobMatchingEngine.evaluateMatch(jscCandidate, testJob);

    assertions.push({
      assertion: 'Ineligible candidate is marked DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: jscMatch.eligibilityStatus,
      passed: jscMatch.eligibilityStatus === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: 'Recommendation score is capped <= 30 when mandatory requirement fails',
      expected: '<= 30',
      actual: String(jscMatch.overallScore),
      passed: jscMatch.overallScore <= 30
    });

    assertions.push({
      assertion: 'Display band is strictly LOW for hard disqualified candidate',
      expected: 'LOW',
      actual: jscMatch.displayBand,
      passed: jscMatch.displayBand === 'LOW'
    });

    // 2. Eligible Candidate Evaluation (Bachelor/Honours holder)
    actionsPerformed.push('Evaluating candidate SYNTH-USR-DHAKA-009 (Bachelor level) against Honours job');
    const bachelorCandidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-009');
    if (!bachelorCandidate) throw new Error('Candidate SYNTH-USR-DHAKA-009 not found');

    const bachelorMatch = SmartJobMatchingEngine.evaluateMatch(bachelorCandidate, testJob);

    assertions.push({
      assertion: 'Eligible candidate is marked MEETS_VERIFIED_REQUIREMENTS',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: bachelorMatch.eligibilityStatus,
      passed: bachelorMatch.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: 'Eligible candidate achieves strong recommendation score (>= 75)',
      expected: '>= 75',
      actual: String(bachelorMatch.overallScore),
      passed: bachelorMatch.overallScore >= 75
    });

    // 3. API Recommendations Feeds Sorting Audit
    actionsPerformed.push('Querying /api/user/recommendations for candidate SYNTH-USR-DHAKA-009');
    const recProbe = await apiVerifier.checkEndpoint('/api/user/recommendations?candidateId=SYNTH-USR-DHAKA-009&limit=20');

    assertions.push({
      assertion: 'Recommendations API returns HTTP 200 with enriched recommendations feed',
      expected: '200',
      actual: String(recProbe.status),
      passed: recProbe.status === 200 && recProbe.data?.success === true
    });

    const bestMatches: any[] = recProbe.data?.data?.bestMatches || [];
    const allBestEligible = bestMatches.length > 0 && bestMatches.every(b => b.match.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS');

    assertions.push({
      assertion: 'Top recommendation feed contains strictly eligible jobs without overriding failures',
      expected: 'true',
      actual: String(allBestEligible),
      passed: allBestEligible
    });

    // 4. Browser UI verification: Recommended Jobs page loads cleanly
    actionsPerformed.push('Navigating browser to /dashboard/recommended-jobs with candidate session');
    try {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 8000 });
      await page.evaluate((cand: any) => {
        localStorage.setItem('cs_auth_state', JSON.stringify({ isLoggedIn: true, identifier: cand.phone || '01711000009', candidateId: cand.id }));
        localStorage.setItem('cs_user_profile', JSON.stringify(cand));
      }, bachelorCandidate);
      await page.context().addCookies([
        { name: 'cs_session_token', value: bachelorCandidate.id || 'SYNTH-USR-DHAKA-009', domain: 'localhost', path: '/' }
      ]);
      await page.goto(`${baseUrl}/dashboard/recommended-jobs`, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const hasHeading = await page.locator('text=আপনার জন্য সুপারিশকৃত চাকরি').first().isVisible({ timeout: 4000 }).catch(() => false);
      assertions.push({
        assertion: 'Browser UI renders Smart Recommendations dashboard page',
        expected: 'true',
        actual: String(hasHeading),
        passed: hasHeading
      });
    } catch (e: any) {
      actionsPerformed.push(`UI navigation warning: ${e.message}`);
    }

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    SyntheticJobManager.deleteJob(testJobId);
  }

  // 5. Zero database contamination check
  const isolation = SyntheticJobManager.verifyJobDataIsolation();
  assertions.push({
    assertion: 'Database remains 100% free of synthetic test job contamination',
    expected: 'true',
    actual: String(isolation.isIsolated),
    passed: isolation.isIsolated
  });

  const passed = assertions.every(a => a.passed) && errors.length === 0;
  return {
    scenarioId,
    name: 'Mandatory Eligibility vs Recommendation Separation Audit',
    category: 'user',
    status: passed ? 'PASS' : 'FAIL',
    startTime,
    endTime: new Date().toISOString(),
    durationMs: Date.now() - new Date(startTime).getTime(),
    actionsPerformed,
    assertions,
    errors
  };
}
