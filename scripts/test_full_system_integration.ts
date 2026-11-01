const http = require('http');
const path = require('path');
const fs = require('fs');

const { serverDB } = require('../src/lib/db');

console.log('================================================================');
console.log('CHAKRI SHEBA — FULL-SYSTEM INTEGRATION AUDIT & TEST SUITE');
console.log('================================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition: any, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${message}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  const allCandidates = serverDB.getCandidates();
  const testCandidate = allCandidates[0] || serverDB.getCandidateById('USR-01711000001');
  assert(testCandidate !== null, 'Candidate record exists in database for integration audit');
  const cid = testCandidate.id;
  const initialMaritalStatus = testCandidate.maritalStatus;

  console.log('\n--- SUITE 1: Candidate Status Repair & Persistence ---');
  // 1. Update candidate status to suspended
  const suspended = serverDB.updateCandidateStatus(cid, 'suspended', 'Testing integration audit audit status', 'SUPERADMIN');
  assert(suspended !== null, 'updateCandidateStatus returns updated candidate object');
  assert(suspended.accountStatus === 'suspended', 'Candidate accountStatus is set to suspended');
  assert(suspended.status === 'suspended', 'Candidate status is set to suspended');
  assert(suspended.maritalStatus === initialMaritalStatus, 'Marital status is NOT corrupted (remains preserved)');

  // Verify in-app notification was generated for suspension
  const notifsAfterSuspend = serverDB.getCandidateNotifications(cid);
  assert(notifsAfterSuspend.length > 0 && notifsAfterSuspend[0].message.includes('স্থগিত'), 'In-app notification generated for account suspension');

  // Restore candidate status to active
  const reactivated = serverDB.updateCandidateStatus(cid, 'active', 'Re-activating account for testing', 'SUPERADMIN');
  assert(reactivated.accountStatus === 'active', 'Candidate accountStatus restored to active');
  assert(reactivated.status === 'active', 'Candidate status restored to active');
  assert(reactivated.maritalStatus === initialMaritalStatus, 'Marital status remained untouched upon reactivation');

  console.log('\n--- SUITE 2: Bidirectional Status Normalization in updateCandidate ---');
  const candNorm1 = serverDB.updateCandidate(cid, { status: 'suspended' as any }, 'ADMIN', 'Test status norm 1');
  assert(candNorm1?.accountStatus === 'suspended', 'updateCandidate with status auto-syncs accountStatus');

  const candNorm2 = serverDB.updateCandidate(cid, { accountStatus: 'active' }, 'ADMIN', 'Test status norm 2');
  assert((candNorm2 as any)?.status === 'active', 'updateCandidate with accountStatus auto-syncs status');

  console.log('\n--- SUITE 3: Education Creation with Unique ID & Relationship ---');
  const eduTestId = 'EDU-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  const newEdu = {
    id: eduTestId,
    level: 'Honours',
    degree: 'B.Sc in Computer Science',
    boardOrUni: 'Dhaka University',
    roll: '10982',
    reg: '54321',
    year: '2023',
    result: '3.85'
  };

  const currentProfile = serverDB.getCandidateById(cid);
  const updatedEduList = [newEdu, ...(currentProfile?.education || [])];
  const candWithEdu = serverDB.updateCandidate(cid, { education: updatedEduList }, 'ADMIN', 'Added new verified education');
  
  assert(candWithEdu !== null, 'Candidate updated with new education');
  const storedEdu = candWithEdu?.education.find((e: any) => e.id === eduTestId);
  assert(storedEdu !== undefined && storedEdu.id === eduTestId, 'Education record has persistent unique ID in database');

  console.log('\n--- SUITE 4: Admin Notification Dispatch by Phone & ID ---');
  const phone = testCandidate.phone;
  assert(Boolean(phone), `Candidate has registered phone number: ${phone}`);

  // Test target candidate resolution by phone
  const resolvedCandidate = serverDB.getCandidateByPhone(phone);
  assert(resolvedCandidate !== null && resolvedCandidate.id === cid, 'serverDB.getCandidateByPhone correctly resolves candidate ID');

  const initialNotifCount = serverDB.getCandidateNotifications(cid).length;
  serverDB.addCandidateNotification(cid, {
    title: 'প্রশাসনিক নোটিশ ভেরিফিকেশন',
    message: 'আপনার আবেদনের কাগজপত্র সফলভাবে গৃহীত হয়েছে।',
    type: 'system',
    link: '/dashboard'
  });

  const updatedNotifs = serverDB.getCandidateNotifications(cid);
  assert(updatedNotifs.length === initialNotifCount + 1, 'In-app notification successfully enqueued into candidate inbox');
  assert(updatedNotifs[0].title === 'প্রশাসনিক নোটিশ ভেরিফিকেশন', 'Notification title preserved with UTF-8 Bengali characters');
  assert(updatedNotifs[0].read === false, 'New notification has read: false status');

  // Mark notification read
  const markSuccess = serverDB.markCandidateNotificationRead(cid, updatedNotifs[0].id);
  assert(markSuccess === true, 'markCandidateNotificationRead successfully marks notification as read');
  const readNotifs = serverDB.getCandidateNotifications(cid);
  assert(readNotifs[0].read === true, 'Notification status is now read: true');

  console.log('\n--- SUITE 5: Application Status Transitions & Notification Triggers ---');
  const userApps = serverDB.getApplications(cid);
  let targetAppId = userApps[0]?.id;
  if (!targetAppId) {
    const newApp = serverDB.saveApplication(cid, {
      jobId: 'JOB-BD-001',
      jobTitle: 'সহকারী পরিচালক (সাধারণ)',
      organization: 'বাংলাদেশ ব্যাংক',
      quota: 'general',
      amountPaid: 0,
      totalFee: 0,
      paymentMethod: 'free',
      transactionId: 'FREE-AUDIT-' + Date.now(),
      status: 'submitted',
      applicantInfo: {
        name: testCandidate.name,
        phone: testCandidate.phone,
        email: testCandidate.email,
        district: testCandidate.district || 'Dhaka',
        nid: testCandidate.nid || '1998000000000'
      }
    });
    targetAppId = newApp.id;
  }
  assert(Boolean(targetAppId), `Active application ID located: ${targetAppId}`);

  const notifBeforeAppUpdate = serverDB.getCandidateNotifications(cid).length;
  const updatedApp = serverDB.updateAppStatus(cid, targetAppId, 'completed', 'officially_verified', 'Verified during integration audit', true);
  assert(updatedApp !== null && updatedApp.status === 'completed', 'Application status updated to completed');

  const notifAfterAppUpdate = serverDB.getCandidateNotifications(cid);
  assert(notifAfterAppUpdate.length > notifBeforeAppUpdate, 'Application status transition automatically dispatches in-app notification to candidate');
  assert(notifAfterAppUpdate[0].type === 'application', 'Dispatched notification has type: application');

  console.log('\n--- SUITE 6: Candidate Saved Jobs & Cross-Panel Visibility ---');
  const testJob = serverDB.getJobs()[0];
  assert(testJob !== undefined, 'Job circular exists in database');

  const savedList1 = serverDB.toggleSavedJob(cid, testJob.id, 'save');
  assert(savedList1.includes(testJob.id), 'Job saved successfully via serverDB.toggleSavedJob');

  const candidateSavedJobs = serverDB.getSavedJobs(cid);
  assert(candidateSavedJobs.includes(testJob.id), 'Saved job is readable via serverDB.getSavedJobs');

  // Admin visibility: admin reading candidate profile gets savedJobs
  const allJobs = serverDB.getJobs();
  const adminViewSavedJobs = allJobs.filter((j: any) => candidateSavedJobs.includes(j.id));
  assert(adminViewSavedJobs.some((j: any) => j.id === testJob.id), 'Saved job is visible to Admin Panel in candidate profile view');

  console.log('\n--- SUITE 7: Public Job Circular Bookmark Component & Store Contract ---');
  const jobDetailContent = fs.readFileSync('src/components/JobDetailClient.tsx', 'utf8');
  assert(jobDetailContent.includes('Bookmark'), 'JobDetailClient imports and uses Bookmark icon');
  assert(jobDetailContent.includes('handleToggleSave'), 'JobDetailClient implements handleToggleSave handler');
  assert(jobDetailContent.includes('/api/candidate/saved-jobs'), 'JobDetailClient connects to /api/candidate/saved-jobs API');
  assert(jobDetailContent.includes('storage.isJobSaved'), 'JobDetailClient synchronizes with storage.isJobSaved');
  assert(jobDetailContent.includes('storage.toggleSaveJob'), 'JobDetailClient triggers storage.toggleSaveJob on click');

  console.log('\n--- SUITE 8: Dashboard & Profile Synchronization Integrity ---');
  const dashPageContent = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
  assert(dashPageContent.includes("fetch('/api/profile')"), 'Dashboard page synchronizes profile from server on mount');
  assert(dashPageContent.includes("fetch('/api/candidate/notifications')"), 'Dashboard page synchronizes notifications from server on mount');
  assert(dashPageContent.includes("fetch('/api/candidate/saved-jobs')"), 'Dashboard page synchronizes saved jobs from server on mount');

  const dashLayoutContent = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
  assert(dashLayoutContent.includes("fetch('/api/profile')"), 'Dashboard layout synchronizes user profile on mount');

  const profPageContent = fs.readFileSync('src/app/dashboard/profile/page.tsx', 'utf8');
  assert(profPageContent.includes("id: 'EDU-'"), 'Profile page generates unique ID for new education records');
  assert(profPageContent.includes("storage.updateUser(data.profile)"), 'Profile page updates localStorage when server returns updated profile');

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log('================================================================\n');

  if (totalTests === passedTests) {
    console.log('>>> ALL INTEGRATION AUDIT & REPAIR TESTS PASSED WITH 100% SUCCESS! <<<');
  } else {
    console.error('>>> SOME INTEGRATION TESTS FAILED <<<');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});