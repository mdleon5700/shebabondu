import { Page } from 'playwright';
import { ScenarioResult } from '../types';
import { BrowserController } from '../browser-controller';
import { SyntheticUserManager } from '../synthetic/synthetic-user-manager';
import { SmartJobMatchingEngine } from '../../matching/engine';
import { PersonalizedRecommender } from '../../matching/recommender';
import { JobCircular } from '../../types';
import fs from 'fs';
import path from 'path';

export async function runScenario44(
  page: Page,
  baseUrl: string,
  browserCtrl: BrowserController
): Promise<ScenarioResult> {
  const scenarioId = 'SCENARIO-44-64-DISTRICT-PERSONALIZED-JOB-ALERTS-ELIGIBILITY-AUDIT';
  const startTime = new Date().toISOString();
  const actionsPerformed: string[] = [];
  const assertions: ScenarioResult['assertions'] = [];
  const errors: ScenarioResult['errors'] = [];

  try {
    actionsPerformed.push('Loading 64-district synthetic candidates for alert recipient simulation');
    const allSyntheticUsers = SyntheticUserManager.getAllSyntheticUsers();
    
    assertions.push({
      assertion: 'Nationwide synthetic candidate pool contains at least 1,280 accounts across 64 districts',
      expected: '>= 1280',
      actual: String(allSyntheticUsers.length),
      passed: allSyntheticUsers.length >= 1280
    });

    // Case 1: Strict Eligibility vs Alert Notification Separation
    actionsPerformed.push('Auditing mandatory eligibility gate against alert dispatch');
    const testCircularAD: any = {
      id: 'JOB-ALERT-SIM-AD-001',
      title: 'সহকারী পরিচালক (অর্থ ও হিসাব)',
      organization: 'পল্লী সঞ্চয় ব্যাংক',
      category: 'bank',
      minEducation: 'স্নাতক (সম্মান)',
      subjects: ['অর্থনীতি', 'ফিন্যান্স', 'হিসাববিজ্ঞান'],
      ageLimit: '১৮-৩০ বছর',
      experienceYears: '0',
      publishedDate: new Date().toISOString(),
      deadline: '2026-12-31'
    };

    // User B: Ineligible (JSC profile category, under-educated for Bachelor post)
    const userB = allSyntheticUsers.find(u => u.profileCategory === 'jsc_jdc') || allSyntheticUsers[0];

    // Evaluate matching engine directly for User B
    const matchUserB = SmartJobMatchingEngine.evaluateMatch(userB as any, testCircularAD as any);
    assertions.push({
      assertion: 'Ineligible candidate (under-educated) is hard-disqualified by eligibility engine',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: matchUserB.eligibilityStatus,
      passed: matchUserB.eligibilityStatus === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS' && matchUserB.overallScore <= 30
    });

    // Test notifyCandidateOnTopMatches for User B: Must NOT send any notification
    const sentForUserB = PersonalizedRecommender.notifyCandidateOnTopMatches(userB.id || '');
    assertions.push({
      assertion: 'Personalized alert dispatcher strictly sends ZERO notifications to ineligible candidate',
      expected: '0',
      actual: String(sentForUserB),
      passed: sentForUserB === 0
    });

    // Case 2: District-Targeted Job Circular (Sylhet Local Body)
    actionsPerformed.push('Simulating district-targeted job alert for Sylhet district');
    const sylhetCandidates = SyntheticUserManager.getSyntheticUsersByDistrict('SYLHET');
    const khulnaCandidates = SyntheticUserManager.getSyntheticUsersByDistrict('KHULNA');

    assertions.push({
      assertion: 'Sylhet and Khulna synthetic cohorts are populated with distinct candidates',
      expected: '>= 20 candidates each',
      actual: `Sylhet: ${sylhetCandidates.length}, Khulna: ${khulnaCandidates.length}`,
      passed: sylhetCandidates.length >= 20 && khulnaCandidates.length >= 20
    });

    const sylhetCandidate = sylhetCandidates[0];
    const khulnaCandidate = khulnaCandidates[0];

    const sylhetDistrictJob: any = {
      id: 'JOB-ALERT-SIM-SYL-002',
      title: 'উপজেলা সমাজসেবা কর্মকর্তা (সিলেট জেলা কোটা)',
      organization: 'সমাজসেবা অধিদপ্তর',
      category: 'govt',
      minEducation: 'যেকোনো বিষয়',
      location: 'সিলেট',
      districts: 'সিলেট',
      ageLimit: '১৮-৩০ বছর',
      publishedDate: new Date().toISOString(),
      deadline: '2026-12-31'
    };

    const sylhetMatch = SmartJobMatchingEngine.evaluateMatch(sylhetCandidate as any, sylhetDistrictJob as any);
    const khulnaMatch = SmartJobMatchingEngine.evaluateMatch(khulnaCandidate as any, sylhetDistrictJob as any);

    assertions.push({
      assertion: 'Sylhet candidate passes district quota check for Sylhet position',
      expected: 'MEETS_VERIFIED_REQUIREMENTS',
      actual: sylhetMatch.eligibilityStatus,
      passed: sylhetMatch.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS' && sylhetMatch.breakdown.location.status === 'EXACT_MATCH'
    });

    assertions.push({
      assertion: 'Khulna candidate fails district quota check when job is restricted to Sylhet',
      expected: 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS',
      actual: khulnaMatch.eligibilityStatus,
      passed: khulnaMatch.eligibilityStatus === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS'
    });

    // Case 3: Nationwide Job Circular (Eligible across all 8 divisions)
    actionsPerformed.push('Evaluating nationwide job alert eligibility across all 8 divisions');
    const nationwideJob: any = {
      id: 'JOB-ALERT-SIM-NAT-003',
      title: 'সহকারী রাজস্ব কর্মকর্তা (এআরও)',
      organization: 'জাতীয় রাজস্ব বোর্ড (এনবিআর)',
      category: 'govt',
      minEducation: 'যেকোনো বিষয়',
      location: 'সারাদেশ',
      districts: 'সকল জেলা',
      publishedDate: new Date().toISOString(),
      deadline: '2026-12-31'
    };

    const sampleDivisions = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];
    let passedDivisionsCount = 0;

    for (const div of sampleDivisions) {
      const cand = allSyntheticUsers.find(u => u.division === div);
      if (cand) {
        const match = SmartJobMatchingEngine.evaluateMatch(cand as any, nationwideJob as any);
        if (match.breakdown.location.isAllBangladesh) {
          passedDivisionsCount++;
        }
      }
    }

    assertions.push({
      assertion: 'Nationwide circular location criteria satisfied across all 8 administrative divisions',
      expected: '8',
      actual: String(passedDivisionsCount),
      passed: passedDivisionsCount === 8
    });

    // Verify zero database pollution
    const dbPath = path.join(process.cwd(), 'src', 'db', 'local_store.json');
    const rawDB = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const candidatesCount = Object.keys(rawDB.candidates || {}).length;
    const jobsCount = Object.keys(rawDB.jobs || {}).length;

    assertions.push({
      assertion: 'Production store local_store.json strictly preserved at 41 candidates and 214 jobs',
      expected: '41 candidates, 214 jobs',
      actual: `${candidatesCount} candidates, ${jobsCount} jobs`,
      passed: candidatesCount === 41 && jobsCount === 214
    });

    const passed = assertions.every(a => a.passed);
    return {
      scenarioId,
      name: '64-District Personalized Job Alerts & Strict Eligibility Separation Audit',
      category: 'user',
      status: passed ? 'PASS' : 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors,
      evidenceNotes: 'District targeting, nationwide distribution, and zero notifications for ineligible users verified.'
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
      name: '64-District Personalized Job Alerts & Strict Eligibility Separation Audit',
      category: 'user',
      status: 'FAIL',
      startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(startTime).getTime(),
      pageUrl: page.url(),
      actionsPerformed,
      assertions,
      errors
    };
  }
}
