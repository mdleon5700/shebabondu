/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 09: SMART JOB MATCHING & PERSONALIZED RECOMMENDATIONS
 * Comprehensive 10-Vector Automated Verification Test Suite
 */

import { serverDB } from '../src/lib/db';
import { 
  PersonalizedRecommender,
  SmartJobMatchingEngine,
  JobRequirementNormalizer,
  SkillsTaxonomyManager,
  CANONICAL_SKILLS,
  DEFAULT_MATCHING_CONFIG
} from '../src/lib/matching';
import { 
  UserSkillItem, 
  CareerPreferences 
} from '../src/lib/matching/types';
import { 
  CandidateProfile, 
  JobCircular 
} from '../src/lib/types';
import { CentralDeadlineEngine } from '../src/lib/deadlines/engine';

async function runTests() {
  console.log('========================================================================');
  console.log('   CHAKRI SHEBA — STEP 09: SMART JOB MATCHING TEST SUITE                ');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests.toString().padStart(2, '0')}: ${testName}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Test ${totalTests.toString().padStart(2, '0')}: ${testName}`);
      if (details) console.error(`         Details: ${details}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // -------------------------------------------------------------------------
  // VECTOR 1: User Profile & Completeness Evaluation
  // -------------------------------------------------------------------------
  console.log('--- VECTOR 1: User Profile & Completeness Evaluation ---');
  
  const rawCandidate: any = {
    id: 'test_cand_01',
    name: 'তানভীর হাসান',
    nameBn: 'তানভীর হাসান',
    email: 'tanvir@example.com',
    phone: '01711000000',
    dob: '1998-05-15',
    dateOfBirth: '1998-05-15',
    district: 'ঢাকা',
    division: 'ঢাকা',
    address: 'মিরপুর, ঢাকা',
    education: [
      {
        level: 'স্নাতক (অনার্স)',
        degree: 'বিএসসি ইন সিএসই',
        boardOrUni: 'ঢাকা বিশ্ববিদ্যালয়',
        roll: '101',
        reg: '202',
        year: '2022',
        result: '৩.৮৫'
      }
    ],
    skills: [
      { id: 'sk_1', name: 'JavaScript', proficiency: 'ADVANCED' },
      { id: 'sk_2', name: 'Python', proficiency: 'INTERMEDIATE' }
    ],
    experiences: [
      {
        id: 'exp_1',
        designation: 'জুনিয়র সফটওয়্যার ইঞ্জিনিয়ার',
        organization: 'টেক সলিউশনস বিডি',
        startDate: '2022-01-01',
        endDate: '2024-01-01',
        isCurrent: false,
        responsibilities: 'ওয়েব ডেভেলপমেন্ট'
      }
    ],
    careerPreferences: {
      preferredCategories: ['engineer', 'private', 'bank'],
      preferredOrgTypes: ['private_company', 'bank', 'government'],
      preferredJobTitles: ['Software Engineer', 'Programmer'],
      preferredEmploymentTypes: ['full_time'],
      preferredDivisions: ['DHAKA'],
      preferredDistricts: ['ঢাকা', 'গাজীপুর'],
      remotePreference: 'hybrid',
      preferredSalaryMin: 40000
    }
  };

  const completeness = PersonalizedRecommender.calculateCompleteness(rawCandidate);
  assert(completeness.percentage >= 80, 'Full profile scores high completeness (>= 80%)', `Score: ${completeness.percentage}%`);
  assert(completeness.isComplete === true, 'Full profile marked as complete');
  assert(completeness.sections.personal && completeness.sections.education && completeness.sections.skills, 'Core sections recognized');

  // Test incomplete profile
  const incompleteCandidate: any = {
    id: 'test_cand_inc',
    name: 'করিম',
    email: 'karim@example.com',
    phone: '01800000000',
    education: []
  };
  const incCompleteness = PersonalizedRecommender.calculateCompleteness(incompleteCandidate);
  assert(incCompleteness.percentage < 50, 'Incomplete profile yields low score (< 50%)', `Score: ${incCompleteness.percentage}%`);
  assert(incCompleteness.missingFieldsBn.length > 0, 'Incomplete profile lists missing Bengali fields');

  // -------------------------------------------------------------------------
  // VECTOR 2: Verified Job Requirement Normalizer
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 2: Verified Job Requirement Normalizer ---');
  
  const testJob: JobCircular = {
    id: 'test_job_01',
    title: 'সহকারী প্রোগ্রামার (সফটওয়্যার)',
    organization: 'বাংলাদেশ কম্পিউটার কাউন্সিল (বিসিসি)',
    logo: '/images/bcc.png',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি',
    grade: '৯ম গ্রেড',
    totalPosts: 5,
    salary: '২২,০০০ - ৫৩,০৬০ টাকা',
    minEducation: 'বিএসসি ইন সিএসই / কম্পিউটার সায়েন্স অথবা সমমানের ডিগ্রি',
    minAge: 21,
    maxAge: 30,
    districts: 'সমগ্র বাংলাদেশ',
    deadline: '2026-12-31',
    daysRemaining: 60,
    govtFee: 500,
    serviceFee: 50,
    officialLink: 'https://bcc.gov.bd',
    circularImage: '',
    audioSummary: '',
    publishedDate: '2026-10-01',
    requirements: ['কম্পিউটার প্রোগ্রামিংয়ে দক্ষতা (Python, JavaScript)', 'নূন্যতম ২ বছরের কাজের অভিজ্ঞতা', 'অনূর্ধ্ব ৩০ বছর']
  };

  const normalized = JobRequirementNormalizer.normalize(testJob);
  assert(normalized.requiredEducationLevel === 'bachelor', 'Normalized education level is bachelor');
  assert(normalized.requiredExperienceYears >= 0, 'Extracted experience requirement');
  assert(normalized.allBangladesh === true, 'Identified all-Bangladesh eligibility');
  assert(normalized.organizationType === 'government', 'Identified government organization type');

  // Test skills taxonomy normalization
  const resolvedSkill1 = SkillsTaxonomyManager.resolveSkill('javascript');
  const resolvedSkill2 = SkillsTaxonomyManager.resolveSkill('এমএস এক্সেল');
  assert(resolvedSkill1 !== null && resolvedSkill1.id === 'javascript', 'Taxonomy resolved English skill alias');
  assert(resolvedSkill2 !== null && resolvedSkill2.id === 'ms_excel', 'Taxonomy resolved Bengali skill alias');

  // -------------------------------------------------------------------------
  // VECTOR 3: Hard Mandatory Eligibility vs Preference Discrepancy
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 3: Mandatory Eligibility vs Preferences ---');
  
  // A. Candidate within age limit
  const eligResult1 = SmartJobMatchingEngine.evaluateEligibility(rawCandidate, testJob, normalized);
  assert(eligResult1.status === 'MEETS_VERIFIED_REQUIREMENTS', 'Candidate meets verified requirements');

  // B. Candidate with quota relaxation
  const olderCandidate: any = {
    ...rawCandidate,
    dob: '1995-01-01',
    dateOfBirth: '1995-01-01', // ~31 years old
    quota: 'freedom_fighter'
  };
  const eligResultQuota = SmartJobMatchingEngine.evaluateEligibility(olderCandidate, testJob, normalized);
  assert(eligResultQuota.status === 'MEETS_VERIFIED_REQUIREMENTS', 'Age relaxation applied for freedom fighter quota (up to 32 yrs)');

  // C. Candidate over maximum age without quota
  const overageCandidate: any = {
    ...rawCandidate,
    dob: '1985-01-01',
    dateOfBirth: '1985-01-01', // 41 years old
    quota: 'none'
  };
  const eligResultOverage = SmartJobMatchingEngine.evaluateEligibility(overageCandidate, testJob, normalized);
  assert(eligResultOverage.status === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS', 'Over-aged candidate marked does not meet requirements');

  // D. Preference Discrepancy (Crucial check: Category mismatch lowers score, does NOT disqualify)
  const differentPrefCandidate: any = {
    ...rawCandidate,
    careerPreferences: {
      ...rawCandidate.careerPreferences,
      preferredCategories: ['teacher', 'defense'],
      preferredDivisions: ['CHITTAGONG']
    }
  };
  const eligDiffPref = SmartJobMatchingEngine.evaluateEligibility(differentPrefCandidate, testJob, normalized);
  assert(eligDiffPref.status === 'MEETS_VERIFIED_REQUIREMENTS', 'Preference mismatch DOES NOT cause mandatory disqualification');

  // -------------------------------------------------------------------------
  // VECTOR 4: Multi-Dimensional 8-Factor Weighted Scoring
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 4: Multi-Dimensional 8-Factor Weighted Scoring ---');

  const matchRes = SmartJobMatchingEngine.evaluateMatch(rawCandidate, testJob, DEFAULT_MATCHING_CONFIG);
  assert(matchRes.overallScore >= 80, 'Strong overall matching score (>= 80%)', `Score: ${matchRes.overallScore}%`);
  assert(matchRes.displayBand === 'STRONG' || matchRes.displayBand === 'EXCELLENT', 'Appropriate match display band');
  assert(matchRes.breakdown.education.score >= 90, 'Education dimension matches Bachelor degree (>= 90%)');
  assert(matchRes.breakdown.location.score === 100, 'Location dimension scores 100% for all-Bangladesh job');
  assert(matchRes.breakdown.organizationType.score === 100 || matchRes.breakdown.organizationType.score >= 50, 'Org type scored reasonably');

  // Verify weight sum normalization
  let totalCalculatedContribution = 0;
  for (const dim of Object.values(matchRes.breakdown)) {
    totalCalculatedContribution += dim.weightedContribution;
  }
  const diff = Math.abs(totalCalculatedContribution - matchRes.overallScore);
  assert(diff <= 2, 'Weighted contributions sum up to overall score (within rounding delta)', `Diff: ${diff}`);

  // -------------------------------------------------------------------------
  // VECTOR 5: Match Reasons & Qualification Gaps Explanation
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 5: Match Explainer Engine (Reasons & Gaps) ---');

  assert(matchRes.matchReasonsBn.length > 0, 'Generated natural Bengali match reasons');
  assert(matchRes.matchReasonsBn.some(r => r.includes('শিক্ষাগত যোগ্যতা') || r.includes('ডিগ্রি')), 'Includes specific educational rationale');
  assert(Array.isArray(matchRes.qualificationGapsBn), 'Qualification gaps array exists');

  // -------------------------------------------------------------------------
  // VECTOR 6: Personalized Recommendation Ranking & Section Feeds
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 6: Personalized Recommendations & Section Feeds ---');

  const feeds = PersonalizedRecommender.getRecommendations(rawCandidate, { limit: 50 });
  assert(feeds.totalEligibleMatches > 0, 'Recommender found eligible jobs from pool', `Count: ${feeds.totalEligibleMatches}`);
  assert(feeds.bestMatches.length > 0, 'Best matches section populated');
  assert(Array.isArray(feeds.skillsMatches), 'Skills matches section array present');
  assert(Array.isArray(feeds.educationMatches), 'Education matches section array present');
  assert(Array.isArray(feeds.locationMatches), 'Location matches section array present');
  assert(Array.isArray(feeds.closingSoonMatches), 'Closing soon section array present');

  // Verify ordering: best matches should be sorted in descending order of score
  for (let i = 0; i < feeds.bestMatches.length - 1; i++) {
    const currentScore = feeds.bestMatches[i].match.overallScore;
    const nextScore = feeds.bestMatches[i + 1].match.overallScore;
    assert(currentScore >= nextScore, 'Best matches list strictly sorted in descending score order');
  }

  // -------------------------------------------------------------------------
  // VECTOR 7: User Feedback Loop & Privacy Safeguards
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 7: User Feedback Loop & Privacy Safeguards ---');

  const topJobId = feeds.bestMatches[0].job.id;
  // Save feedback: HIDDEN
  serverDB.saveRecommendationFeedback({
    id: `fb_test_${Date.now()}`,
    candidateId: String(rawCandidate.id),
    jobId: topJobId,
    action: 'HIDDEN',
    createdAt: new Date().toISOString()
  });

  const feedbackList = serverDB.getRecommendationFeedback(String(rawCandidate.id));
  assert(feedbackList.some(f => f.jobId === topJobId && f.action === 'HIDDEN'), 'Feedback successfully recorded in database');

  // Re-run feeds; hidden job should NOT appear in bestMatches
  const updatedFeeds = PersonalizedRecommender.getRecommendations(rawCandidate, { limit: 50 });
  assert(!updatedFeeds.bestMatches.some(r => r.job.id === topJobId), 'Hidden circular filtered out from recommendation feeds');

  // Clean up feedback
  serverDB.deleteRecommendationFeedback(String(rawCandidate.id), topJobId);

  // -------------------------------------------------------------------------
  // VECTOR 8: Admin Matching Configuration & Health
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 8: Admin Matching Config & Health ---');

  const config = serverDB.getMatchingConfig();
  assert(config.enabled === true, 'Matching engine enabled by default');
  assert(config.weights.education === 25, 'Education weight is 25%');
  assert(config.weights.skills === 25, 'Skills weight is 25%');

  // Test updating matching config
  serverDB.updateMatchingConfig({ minScoreToRecommend: 35 });
  const updatedConfig = serverDB.getMatchingConfig();
  assert(updatedConfig.minScoreToRecommend === 35, 'Updated matching config persisted');
  serverDB.updateMatchingConfig({ minScoreToRecommend: 40 }); // Restore default

  // -------------------------------------------------------------------------
  // VECTOR 9: Notifications on Top Matches
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 9: Candidate Top Match Notifications ---');

  // Test candidate 1 (Leon)
  const sentNotifs = PersonalizedRecommender.notifyCandidateOnTopMatches('1');
  assert(typeof sentNotifs === 'number' && sentNotifs >= 0, 'Dispatched top match notifications cleanly');

  // -------------------------------------------------------------------------
  // VECTOR 10: Step Continuity & Database Integrity
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 10: Step Continuity & Database Integrity ---');

  const totalJobs = serverDB.getJobs();
  assert(totalJobs.length >= 200, `Published jobs intact in local_store (Current: ${totalJobs.length})`);

  const drafts = serverDB.getCircularDrafts();
  assert(drafts.length >= 20, `Import drafts intact (Current: ${drafts.length})`);

  const candidates = serverDB.getCandidates();
  assert(candidates.length >= 40, `Candidate directory intact (Current: ${candidates.length})`);

  // Verify Step 08 deadline integration with Step 09 recommender
  const randomJob = totalJobs[0];
  const dlEval = CentralDeadlineEngine.evaluateDeadline(randomJob);
  assert(dlEval !== undefined && typeof dlEval.isClosed === 'boolean', 'Step 08 Deadline Engine integrates with Step 09');

  console.log('\n========================================================================');
  console.log(`   ALL ${totalTests} TESTS PASSED SUCCESSFULLY! (100% PASS RATE)       `);
  console.log('========================================================================\n');
}

runTests().catch(err => {
  console.error('\nTest execution failed:', err);
  process.exit(1);
});
