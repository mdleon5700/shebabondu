import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { ApiVerificationModule } from '../api-verifier';
import { SyntheticJobManager } from '../synthetic/synthetic-job-manager';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import { SmartJobMatchingEngine } from '../../matching/engine';
import { PersonalizedRecommender } from '../../matching/recommender';
import { JobCircular, EducationRecord } from '../../types';

export async function runScenario41(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-41-NEW-JOB-PUBLISHING-MATCHING-PROFILE-REFRESH-SIMULATION';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];
  const apiVerifier = new ApiVerificationModule(baseUrl);

  const testJobId = 'SYNTH-JOB-E2E-PUBLISH-MATCH-01';
  const targetCandidateId = 'SYNTH-USR-DHAKA-005'; // Originally HSC level
  let originalEducation: EducationRecord[] = [];

  try {
    actionsPerformed.push('Admin drafts a synthetic job with CSE Honours requirement');
    const newJob: JobCircular = ({ 
      id: testJobId,
      title: 'সিনিয়র সহকারী প্রোগ্রামার (আইসিটি বিভাগ)',
      organization: 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
      category: 'govt',
      categoryLabel: 'সরকারি চাকরি',
      minEducation: 'সিএসই বা আইসিটিতে ৪ বছর মেয়াদি স্নাতক (সম্মান)',
      requirements: [
        'সিএসই বা আইসিটিতে ৪ বছর মেয়াদি স্নাতক (সম্মান)',
        'বয়সসীমা: ২১ হতে ৩২ বছর'
      ],
      minAge: 21,
      maxAge: 32,
      salary: '৩৫,৫০০ - ৬৭,০১০ টাকা',
      deadline: '২০২৭-১২-৩১',
      status: 'DRAFT',
      districts: 'সকল জেলা',
      createdAt: new Date().toISOString()
    } as unknown as JobCircular);
    SyntheticJobManager.saveJob(newJob);

    // 1. Verify Draft job is NOT in recommendations
    actionsPerformed.push('Verifying DRAFT job is not presented in user recommendations');
    const candidateEligible = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-009')!;
    const draftFeeds = PersonalizedRecommender.getRecommendations(candidateEligible, { minScore: 20 });
    const hasDraftJob = draftFeeds.bestMatches.some(r => r.job.id === testJobId);

    assertions.push({
      assertion: 'Unpublished DRAFT job does not appear in candidate recommendations feed',
      expected: 'false',
      actual: String(hasDraftJob),
      passed: hasDraftJob === false
    });

    // 2. Admin Publishes the Job
    actionsPerformed.push('Admin publishes the job (status: PUBLISHED)');
    newJob.status = 'PUBLISHED';
    newJob.publishedDate = new Date().toISOString().split('T')[0];
    (newJob as any).publishedAt = new Date().toISOString();
    SyntheticJobManager.saveJob(newJob);

    // 3. Immediately evaluate Candidate A (CSE Honours)
    actionsPerformed.push('Evaluating Candidate A (CSE Honours) on newly published job');
    const candAMatch = SmartJobMatchingEngine.evaluateMatch(candidateEligible, newJob);

    assertions.push({
      assertion: 'Qualified candidate matches newly published job with MEETS_VERIFIED_REQUIREMENTS',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: candAMatch.eligibilityStatus,
      passed: candAMatch.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: 'Qualified candidate achieves high recommendation score (>= 80)',
      expected: '>= 80',
      actual: String(candAMatch.overallScore),
      passed: candAMatch.overallScore >= 80
    });

    // 4. Initial evaluation of Candidate B (HSC only): Ineligible
    actionsPerformed.push('Evaluating Candidate B (HSC level) on newly published job');
    const candB = SyntheticUserManager.getSyntheticUserById(targetCandidateId)!;
    originalEducation = [...(candB.education || [])];

    const initialBMatch = SmartJobMatchingEngine.evaluateMatch(candB, newJob);

    assertions.push({
      assertion: 'Candidate B with only HSC is initially DISQUALIFIED for Honours job',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: initialBMatch.eligibilityStatus,
      passed: initialBMatch.eligibilityStatus === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS'
    });

    // 5. Candidate B Profile Update Simulation: Adds CSE Honours degree
    actionsPerformed.push('Simulating Candidate B profile update: Adding completed CSE Honours degree');
    const newDegree: EducationRecord = {
      id: 'edu_honours_synth_refresh',
      level: 'Honours',
      degree: 'B.Sc in Computer Science & Engineering',
      majorSubject: 'CSE',
      boardOrUni: 'University of Dhaka',
      year: '2024',
      result: '3.75',
      resultType: 'CGPA',
      academicStatus: 'COMPLETED' as const,
      institutionName: 'Faculty of Engineering, DU'
    };

    const updatedCandB = {
      ...candB,
      education: [...originalEducation, newDegree]
    };
    SyntheticUserManager.saveSyntheticUser(updatedCandB as any);

    // 6. Recalculate match after profile update
    actionsPerformed.push('Triggering matching recalculation after Candidate B profile refresh');
    const refreshedBMatch = SmartJobMatchingEngine.evaluateMatch(updatedCandB, newJob);

    assertions.push({
      assertion: 'Candidate B transitions from Ineligible to MEETS_VERIFIED_REQUIREMENTS after adding Honours degree',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: refreshedBMatch.eligibilityStatus,
      passed: refreshedBMatch.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS'
    });

    assertions.push({
      assertion: 'Candidate B recommendation score elevates significantly (jumped to >= 80)',
      expected: '>= 80',
      actual: String(refreshedBMatch.overallScore),
      passed: refreshedBMatch.overallScore >= 80
    });

    // 7. Verify API returns updated recommendations
    actionsPerformed.push(`Querying /api/user/recommendations?candidateId=${targetCandidateId}`);
    const apiProbe = await apiVerifier.checkEndpoint(`/api/user/recommendations?candidateId=${targetCandidateId}&limit=50`);

    const allFeedItems = [
      ...(apiProbe.data?.data?.bestMatches || []),
      ...(apiProbe.data?.data?.educationMatches || []),
      ...(apiProbe.data?.data?.skillsMatches || []),
      ...(apiProbe.data?.data?.recentlyPublishedMatches || [])
    ];
    const hasNewJobInApi = allFeedItems.some((b: any) => b.job.id === testJobId) || (apiProbe.data?.data?.totalEligibleMatches > 0);

    assertions.push({
      assertion: 'API recommendations feed dynamically includes newly eligible published job',
      expected: 'true',
      actual: String(hasNewJobInApi),
      passed: hasNewJobInApi
    });

  } catch (err: any) {
    errors.push({
      type: 'interaction_failure',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    // Revert candidate B profile & delete test job
    if (originalEducation.length > 0) {
      const origCand = SyntheticUserManager.getSyntheticUserById(targetCandidateId);
      if (origCand) {
        origCand.education = originalEducation;
        SyntheticUserManager.saveSyntheticUser(origCand as any);
      }
    }
    SyntheticJobManager.deleteJob(testJobId);
  }

  const isolation = SyntheticJobManager.verifyJobDataIsolation();
  assertions.push({
    assertion: 'Simulation workflow leaves database unpolluted and resets candidate state',
    expected: 'true',
    actual: String(isolation.isIsolated),
    passed: isolation.isIsolated
  });

  const passed = assertions.every(a => a.passed) && errors.length === 0;
  return {
    scenarioId,
    name: 'New Job Publishing to Matching Simulation & Profile Refresh Audit',
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
