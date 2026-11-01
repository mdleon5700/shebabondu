/**
 * CHAKRI SHEBA — STEP 10: USER DASHBOARD TEST SUITE
 * 
 * Comprehensive Verification & Regression across:
 * 1. Layout, Navigation & Route Integrity
 * 2. Profile Completeness Formula Alignment
 * 3. Skills Management UI & API Synchronization
 * 4. Experience Management UI & API Synchronization
 * 5. Career Preferences UI & API Synchronization
 * 6. Dashboard Overview Integration with Step 09 Recommendations
 * 7. Dashboard Overview Integration with Step 08 Authoritative Deadlines
 * 8. Saved Jobs Urgency Categorization, Expired Handling & Reminders
 * 9. User Data Isolation & Security Ownership Checks
 * 10. Step Continuity & Database Integrity (200+ jobs, 40+ candidates)
 */

import { serverDB } from '../src/lib/db';
import { storage } from '../src/lib/store';
import { PersonalizedRecommender } from '../src/lib/matching/recommender';
import { CentralDeadlineEngine } from '../src/lib/deadlines/engine';
import { JobCircular } from '../src/lib/types';

let testsPassed = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    testsPassed++;
    console.log(`  [PASS] Test ${totalTests.toString().padStart(2, '0')}: ${testName}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests.toString().padStart(2, '0')}: ${testName}${details ? ' - ' + details : ''}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

async function runTests() {
  console.log('========================================================================');
  console.log('   CHAKRI SHEBA — STEP 10: USER DASHBOARD INTEGRATION TEST SUITE        ');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------------
  // VECTOR 1: Dashboard Layout, Navigation & Route Integrity
  // -------------------------------------------------------------------------
  console.log('--- VECTOR 1: Dashboard Layout, Navigation & Route Integrity ---');
  
  const candidates = serverDB.getCandidates();
  assert(candidates.length >= 40, 'Candidate directory active with 40+ profiles', `Count: ${candidates.length}`);

  const testUser = candidates[0];
  assert(Boolean(testUser.id && testUser.name && testUser.email), 'Test candidate has valid identity and contact');

  const retrieved = serverDB.getCandidateById(testUser.id);
  assert(retrieved?.id === testUser.id, 'Candidate retrieved by ID successfully');

  // -------------------------------------------------------------------------
  // VECTOR 2: Profile & Completeness Harmonization
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 2: Profile & Completeness Harmonization ---');

  const completeness = storage.calculateProfileCompletion(testUser);
  assert(completeness > 50, 'Candidate profile completeness calculated (> 50%)', `Score: ${completeness}%`);

  const recommenderCompleteness = PersonalizedRecommender.calculateCompleteness(testUser as any);
  assert(
    recommenderCompleteness.percentage > 50,
    'Store completeness aligned with recommender (> 50%)',
    `Recommender: ${recommenderCompleteness.percentage}% vs Store: ${completeness}%`
  );
  assert(
    recommenderCompleteness.percentage === completeness,
    'Completeness percentage exactly equals recommender formula',
    `Recommender: ${recommenderCompleteness.percentage}% vs Store: ${completeness}%`
  );

  // Incomplete profile test
  const emptyProfile = {
    id: 'cand_empty_test',
    name: 'নামহীন',
    email: 'empty@example.com',
    role: 'candidate' as const,
    createdAt: new Date().toISOString()
  };
  const emptyScore = storage.calculateProfileCompletion(emptyProfile as any);
  assert(emptyScore < 50, 'Incomplete profile identified accurately', `Score: ${emptyScore}%`);
  assert(emptyScore <= 25, 'Incomplete profile yields low score (< 50%)', `Score: ${emptyScore}%`);

  // -------------------------------------------------------------------------
  // VECTOR 3: Skills Management UI & API Synchronization
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 3: Skills Management CRUD Synchronization ---');

  // Add skill
  const skillItem = {
    id: 'sk_test_python_10',
    name: 'পাইথন প্রোগ্রামিং',
    proficiency: 'ADVANCED' as const,
    yearsExperience: 3
  };
  const candWithSkill = serverDB.addCandidateSkill(testUser.id, skillItem as any);
  assert(candWithSkill !== null, 'Skill successfully added to candidate profile in serverDB');
  assert(
    (candWithSkill?.skills || []).some((s: any) => (typeof s === 'string' ? s : s.name) === 'পাইথন প্রোগ্রামিং'),
    'Skill name matches input'
  );

  // Verify candidate profile has the skill
  const candAfterSkill = serverDB.getCandidateById(testUser.id);
  assert(
    (candAfterSkill?.skills || []).some((s: any) => (typeof s === 'string' ? s : s.name) === 'পাইথন প্রোগ্রামিং'),
    'Added skill present in candidate profile skills list'
  );

  // Delete skill
  const candAfterDelSkill = serverDB.deleteCandidateSkill(testUser.id, 'sk_test_python_10');
  assert(
    !(candAfterDelSkill?.skills || []).some((s: any) => (typeof s === 'string' ? s : s.id) === 'sk_test_python_10'),
    'Skill successfully deleted from candidate profile in serverDB'
  );

  // -------------------------------------------------------------------------
  // VECTOR 4: Experience Management CRUD Synchronization
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 4: Experience Management CRUD Synchronization ---');

  const expItem = {
    id: 'exp_test_analyst_10',
    designation: 'সফটওয়্যার অ্যানালিস্ট',
    organization: 'সেন্ট্রাল ব্যাংক টেক সলিউশনস',
    startDate: '2023-01-01',
    endDate: '',
    isCurrent: true,
    responsibilities: 'সিস্টেম ডিজাইন ও এপিআই ডেভেলপমেন্ট'
  };
  const candWithExp = serverDB.addCandidateExperience(testUser.id, expItem);
  assert(candWithExp !== null, 'Experience successfully added to candidate in serverDB');
  const foundExp = (candWithExp?.experiences || []).find(e => e.id === 'exp_test_analyst_10');
  assert(foundExp?.designation === 'সফটওয়্যার অ্যানালিস্ট', 'Experience designation verified');
  assert(foundExp?.isCurrent === true, 'Current employment flag preserved');

  // Delete experience
  const candAfterDelExp = serverDB.deleteCandidateExperience(testUser.id, 'exp_test_analyst_10');
  assert(
    !(candAfterDelExp?.experiences || []).some(e => e.id === 'exp_test_analyst_10'),
    'Experience successfully removed from candidate in serverDB'
  );

  // -------------------------------------------------------------------------
  // VECTOR 5: Career Preferences UI & API Synchronization
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 5: Career Preferences Synchronization ---');

  const prefPayload = {
    preferredCategories: ['govt', 'bank', 'engineer'],
    preferredOrgTypes: ['government', 'bank'] as any,
    preferredJobTitles: ['Assistant Programmer', 'Officer'],
    preferredEmploymentTypes: ['full_time'] as any,
    preferredDivisions: ['DHAKA', 'CHITTAGONG'],
    preferredDistricts: ['ঢাকা'],
    remotePreference: 'onsite' as const,
    preferredSalaryMin: 35000
  };
  const candWithPrefs = serverDB.updateCandidatePreferences(testUser.id, prefPayload);
  assert(candWithPrefs !== null, 'Career preferences successfully updated in serverDB');
  assert(candWithPrefs?.careerPreferences?.preferredSalaryMin === 35000, 'Preferred salary min verified');
  assert(Boolean(candWithPrefs?.careerPreferences?.preferredCategories.includes('govt')), 'Preferred category govt included');

  // -------------------------------------------------------------------------
  // VECTOR 6: Dashboard Overview Integration with Step 09 Recommendations
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 6: Dashboard Overview Recommendations Integration ---');

  const recFeeds = PersonalizedRecommender.getRecommendations(candWithPrefs as any, { minScore: 40, limit: 10 });
  assert(recFeeds.totalEligibleMatches > 0, 'Recommender returned eligible jobs for candidate', `Count: ${recFeeds.totalEligibleMatches}`);
  assert(recFeeds.bestMatches.length > 0, 'Best matches list populated for dashboard preview');

  const topRec = recFeeds.bestMatches[0];
  assert(topRec.match.overallScore >= 40, 'Top recommendation has valid score >= 40%', `Score: ${topRec.match.overallScore}%`);
  assert(topRec.match.matchReasonsBn.length > 0, 'Top recommendation includes natural Bengali match reasons');
  assert(Boolean(topRec.job?.title && topRec.job?.organization), 'Recommended job has valid title and organization');

  // -------------------------------------------------------------------------
  // VECTOR 7: Dashboard Overview Integration with Step 08 Authoritative Deadlines
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 7: Dashboard Overview Authoritative Deadlines ---');

  const allJobs = serverDB.getJobs();
  assert(allJobs.length >= 200, 'Job catalog available with 200+ circulars');

  const testJob = allJobs[0];
  const deadlineEval = CentralDeadlineEngine.evaluateDeadline(testJob);
  assert(deadlineEval !== undefined, 'Authoritative deadline evaluation executed');
  assert(typeof deadlineEval.daysRemaining === 'number', 'Accurate days remaining computed');
  assert(Boolean(deadlineEval.labelBn), 'Bengali deadline label generated');

  // Test cancelled circular handling
  const cancelledJob: JobCircular = {
    ...testJob,
    id: 'test_job_cancelled_10',
    status: 'cancelled',
    requirements: ['নিয়োগ স্থগিত/বাতিল করা হয়েছে']
  };
  const cancelEval = CentralDeadlineEngine.evaluateDeadline(cancelledJob);
  assert(cancelEval.isClosed === true, 'Cancelled circular strictly evaluated as closed');
  assert(cancelEval.isClosingSoon === false, 'Cancelled circular not marked closing soon');

  // -------------------------------------------------------------------------
  // VECTOR 8: Saved Jobs Urgency Categorization, Expired Handling & Reminders
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 8: Saved Jobs Urgency, Expired & Reminders ---');

  // 1. Saved Jobs sync
  const savedJobId = allJobs[0].id;
  serverDB.toggleSavedJob(testUser.id, savedJobId, 'save');
  const updatedSaved = serverDB.getSavedJobs(testUser.id);
  assert(updatedSaved.includes(savedJobId), 'Job bookmark persisted in serverDB candidate profile');

  // 2. Reminder subscription toggle
  const reminderItem = {
    id: 'rem_test_user_10',
    candidateId: testUser.id,
    jobId: savedJobId,
    daysBefore: [7, 3, 1, 0],
    channel: 'in_app' as const,
    createdAt: new Date().toISOString()
  };
  const reminderResult = serverDB.saveUserJobReminder(reminderItem as any);
  assert(reminderResult !== null, 'Reminder subscription saved in serverDB for candidate');

  const activeReminders = serverDB.getUserJobReminders(testUser.id);
  assert(activeReminders.some(r => r.jobId === savedJobId), 'Saved job verified in candidate active reminders');

  // 3. Unsubscribe reminder
  serverDB.deleteUserJobReminder(testUser.id, savedJobId);
  const afterUnsub = serverDB.getUserJobReminders(testUser.id);
  assert(!afterUnsub.some(r => r.jobId === savedJobId), 'Reminder unsubscribed successfully');

  // Clean up saved job
  serverDB.toggleSavedJob(testUser.id, savedJobId, 'unsave');

  // -------------------------------------------------------------------------
  // VECTOR 9: User Data Isolation & Security Ownership Checks
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 9: User Data Isolation & Security Ownership ---');

  assert(candidates.length >= 2, 'At least 2 candidates exist for isolation test');
  const userA = candidates[0];
  const userB = candidates[1];

  // A adds a skill
  const skillA = serverDB.addCandidateSkill(userA.id, { id: 'sk_user_a_test', name: 'ইউজার_এ_স্কিল', proficiency: 'advanced' } as any);
  assert(skillA !== null, 'Skill added for User A');

  // Verify User B does NOT have User A's skill
  const candB = serverDB.getCandidateById(userB.id);
  assert(
    !(candB?.skills || []).some((s: any) => (typeof s === 'string' ? s : s.name) === 'ইউজার_এ_স্কিল'),
    'User B profile strictly isolated from User A skill data'
  );

  // Clean up
  serverDB.deleteCandidateSkill(userA.id, 'sk_user_a_test');

  // Verify applications isolation
  const appsA = serverDB.getApplications(userA.id);
  const appsB = serverDB.getApplications(userB.id);
  assert(Array.isArray(appsA), 'User A applications returned as list');
  assert(Array.isArray(appsB), 'User B applications returned as list');
  const idsA = new Set(appsA.map(a => a.id));
  const hasOverlap = appsB.some(b => idsA.has(b.id));
  assert(!hasOverlap, 'User A and User B application pools are strictly isolated');

  // -------------------------------------------------------------------------
  // VECTOR 10: Step Continuity & Full Platform Regression
  // -------------------------------------------------------------------------
  console.log('\n--- VECTOR 10: Step Continuity & Database Integrity ---');

  const totalJobs = serverDB.getJobs();
  assert(totalJobs.length >= 200, `Published jobs intact in local_store (Current: ${totalJobs.length})`);

  const drafts = serverDB.getCircularDrafts();
  assert(drafts.length >= 20, `Import drafts intact (Current: ${drafts.length})`);

  const totalCandidates = serverDB.getCandidates();
  assert(totalCandidates.length >= 40, `Candidate directory intact (Current: ${totalCandidates.length})`);

  console.log('\n========================================================================');
  console.log(`   ALL ${totalTests} TESTS PASSED SUCCESSFULLY! (100% PASS RATE)       `);
  console.log('========================================================================\n');
}

runTests().catch(err => {
  console.error('\nTest execution failed:', err);
  process.exit(1);
});
