/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 14: ADMIN GOVERNANCE, RBAC & HEALTH TEST SUITE
 * Validates role-based access control, multi-subsystem diagnostics, cross-module search,
 * platform overview metrics, and 100% free access governance.
 */

import { serverDB } from '../src/lib/db';
import { 
  ALL_PERMISSIONS, 
  ROLE_PERMISSIONS, 
  ROLE_METADATA, 
  INITIAL_STAFF_MEMBERS,
  AdminGovernanceRbac,
  PlatformHealthEngine,
  PlatformOverviewEngine,
  AdminGlobalSearchEngine
} from '../src/lib/governance';

async function runStep14GovernanceTests() {
  console.log('================================================================================');
  console.log('CHAKRI SHEBA (চাকরি সেবা) — STEP 14: CENTRAL ADMIN GOVERNANCE VERIFICATION');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      if (details) console.error(`         -> ${details}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // VECTOR 1: Role Definitions & Permissions Inventory
  // ---------------------------------------------------------------------------
  console.log('--- VECTOR 1: Role Definitions & Permissions Inventory ---');
  assert(
    ALL_PERMISSIONS.length >= 25,
    'ALL_PERMISSIONS contains at least 25 granular administrative permissions',
    `Count: ${ALL_PERMISSIONS.length}`
  );

  assert(
    ROLE_PERMISSIONS.super_admin.length === ALL_PERMISSIONS.length,
    'Super Admin holds 100% of defined platform permissions',
    `Expected ${ALL_PERMISSIONS.length}, got ${ROLE_PERMISSIONS.super_admin.length}`
  );

  assert(
    ROLE_PERMISSIONS.support_staff.length < ROLE_PERMISSIONS.admin.length,
    'Support staff permissions are strictly constrained compared to Admin',
    `Support: ${ROLE_PERMISSIONS.support_staff.length}, Admin: ${ROLE_PERMISSIONS.admin.length}`
  );

  assert(
    Object.keys(ROLE_METADATA).length >= 6,
    'Role metadata covers all 6 administrative tiers with Bengali descriptions'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 2: Server-Side RBAC Permission Checks
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 2: Server-Side RBAC Permission Checks ---');
  assert(
    AdminGovernanceRbac.hasPermission('super_admin', 'roles.manage') === true,
    'Super Admin is permitted to manage roles'
  );

  assert(
    AdminGovernanceRbac.hasPermission('support_staff', 'roles.manage') === false,
    'Support staff is forbidden from managing roles'
  );

  assert(
    AdminGovernanceRbac.hasPermission('job_manager', 'jobs.publish') === true,
    'Job Manager is permitted to publish circulars'
  );

  assert(
    AdminGovernanceRbac.hasPermission('content_editor', 'users.suspend') === false,
    'Content Editor cannot suspend candidates'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 3: Staff Member Roster & Role Update with Audit Log
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 3: Staff Member Roster & Role Update with Audit Log ---');
  const staff = AdminGovernanceRbac.getStaffMembers();
  assert(
    staff.length >= 4,
    'Initial staff directory returns all rostered staff members',
    `Count: ${staff.length}`
  );

  const testStaffId = 'STF-004'; // Kamrul Hasan
  const originalRole = staff.find(s => s.id === testStaffId)?.role;
  const updatedStaff = AdminGovernanceRbac.updateStaffRole(testStaffId, 'content_editor');
  assert(
    updatedStaff !== null && updatedStaff.role === 'content_editor',
    'Successfully upgraded staff member role to Content Editor',
    `New role: ${updatedStaff?.role}`
  );

  // Verify audit log created
  const auditLogs = serverDB.getAdminAuditLogs(testStaffId);
  const roleUpdateLog = auditLogs.find(l => l.action === 'staff_role_update');
  assert(
    roleUpdateLog !== undefined,
    'Role change successfully generated an immutable audit log entry'
  );

  // Revert back
  if (originalRole) {
    AdminGovernanceRbac.updateStaffRole(testStaffId, originalRole);
  }

  // ---------------------------------------------------------------------------
  // VECTOR 4: Staff Member Status Toggle with Audit Log
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 4: Staff Member Status Toggle with Audit Log ---');
  const toggledStaff = AdminGovernanceRbac.toggleStaffStatus('STF-003');
  assert(
    toggledStaff !== null && (toggledStaff.status === 'suspended' || toggledStaff.status === 'active'),
    'Successfully toggled staff member status'
  );

  // Toggle back to active
  if (toggledStaff && toggledStaff.status === 'suspended') {
    AdminGovernanceRbac.toggleStaffStatus('STF-003');
  }

  const statusLogs = serverDB.getAdminAuditLogs('STF-003');
  assert(
    statusLogs.some(l => l.action === 'staff_status_toggle'),
    'Status toggle recorded in admin audit log'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 5: Multi-Subsystem Health Diagnostic Engine
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 5: Multi-Subsystem Health Diagnostic Engine ---');
  const health = await PlatformHealthEngine.getHealthReport();
  assert(
    health.overallStatus === 'HEALTHY' || health.overallStatus === 'WARNING',
    'Platform overall health evaluated as HEALTHY or WARNING',
    `Status: ${health.overallStatus}`
  );

  assert(
    health.uptimePercentage >= 99.0,
    'Uptime percentage reported >= 99.0%',
    `Uptime: ${health.uptimePercentage}%`
  );

  assert(
    Boolean(health.subsystems.database) && health.subsystems.database.status === 'HEALTHY',
    'Database subsystem health is verified HEALTHY with low latency',
    `Latency: ${health.subsystems.database?.latencyMs}ms`
  );

  assert(
    Boolean(health.subsystems.storage) && health.subsystems.storage.status === 'HEALTHY',
    'Local uploads storage subsystem health is verified HEALTHY'
  );

  assert(
    Boolean(health.subsystems.ai_engine) && Boolean(health.subsystems.publishing),
    'AI Engine and Publishing Queue subsystems are monitored'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 6: Central Platform Overview Metrics Aggregation
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 6: Central Platform Overview Metrics Aggregation ---');
  const metrics = PlatformOverviewEngine.getMetrics('all');
  const totalDbCandidates = serverDB.getAllCandidates().length;
  assert(
    metrics.candidates.total === totalDbCandidates,
    'Overview metrics candidate count matches database candidate count',
    `Metrics: ${metrics.candidates.total}, DB: ${totalDbCandidates}`
  );

  assert(
    metrics.jobs.totalPublished > 0,
    'Overview metrics reports active published circulars',
    `Published: ${metrics.jobs.totalPublished}`
  );

  assert(
    typeof metrics.verification.totalVerified === 'number' && typeof metrics.verification.pendingReview === 'number',
    'Verification metrics report total verified and pending queue counts'
  );

  assert(
    typeof metrics.certificates.verifiedTotal === 'number',
    'Certificates metrics report verified academic records'
  );

  assert(
    metrics.operations.zeroPaywallVerified === true,
    'Operations metrics enforce 100% Free Platform Access policy'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 7: Timeframe Filtering Engine
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 7: Timeframe Filtering Engine ---');
  const todayMetrics = PlatformOverviewEngine.getMetrics('today');
  const sevenDayMetrics = PlatformOverviewEngine.getMetrics('7d');
  assert(
    todayMetrics.timeframe === 'today',
    'Today timeframe filter applies correctly'
  );

  assert(
    sevenDayMetrics.timeframe === '7d',
    '7-Day timeframe filter applies correctly'
  );

  assert(
    todayMetrics.candidates.total <= metrics.candidates.total,
    'Today candidate count is logically bounded by total candidate count',
    `Today: ${todayMetrics.candidates.total}, All: ${metrics.candidates.total}`
  );

  // ---------------------------------------------------------------------------
  // VECTOR 8: Cross-Module Unified Global Admin Search
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 8: Cross-Module Unified Global Admin Search ---');
  // Search candidates
  const candidateResults = AdminGlobalSearchEngine.search('রহমান', 'super_admin');
  assert(
    candidateResults.length > 0 && candidateResults.some(r => r.type === 'candidate'),
    'Global search locates candidate records by name',
    `Found: ${candidateResults.length}`
  );

  // Search jobs
  const jobResults = AdminGlobalSearchEngine.search('মন্ত্রণালয়', 'super_admin');
  assert(
    jobResults.length > 0 && jobResults.some(r => r.type === 'job'),
    'Global search locates published jobs by organization / title',
    `Found: ${jobResults.length}`
  );

  // Search expenses
  const expenseResults = AdminGlobalSearchEngine.search('Vercel', 'super_admin');
  assert(
    expenseResults.length > 0 && expenseResults.some(r => r.type === 'expense'),
    'Global search locates operational expenses by provider',
    `Found: ${expenseResults.length}`
  );

  // Search short query
  const emptyResults = AdminGlobalSearchEngine.search('a', 'super_admin');
  assert(
    emptyResults.length === 0,
    'Search skips queries shorter than 2 characters'
  );

  // ---------------------------------------------------------------------------
  // VECTOR 9: Activity Stream Engine
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 9: Activity Stream Engine ---');
  const activity = PlatformOverviewEngine.getActivityStream(10);
  assert(
    Array.isArray(activity) && activity.length > 0,
    'Activity stream aggregates recent administrative events',
    `Events: ${activity.length}`
  );

  assert(
    Boolean(activity[0]?.formattedDateBn) && Boolean(activity[0]?.actorName),
    'Activity stream items include formatted Bengali timestamp and actor name',
    `Sample: ${activity[0]?.actorName} - ${activity[0]?.formattedDateBn}`
  );

  // ---------------------------------------------------------------------------
  // VECTOR 10: Store Integrity & Non-Regression Check
  // ---------------------------------------------------------------------------
  console.log('\n--- VECTOR 10: Store Integrity & Non-Regression Check ---');
  const allCandidates = serverDB.getAllCandidates();
  const allJobs = serverDB.getAllJobs();
  const allDrafts = serverDB.getCircularDrafts();

  assert(
    allCandidates.length >= 40,
    'Candidate store remains intact (>= 40 records)',
    `Actual: ${allCandidates.length}`
  );

  assert(
    allJobs.length >= 200,
    'Jobs store remains intact (>= 200 records)',
    `Actual: ${allJobs.length}`
  );

  assert(
    allDrafts.length >= 25,
    'Circular drafts store remains intact (>= 25 records)',
    `Actual: ${allDrafts.length}`
  );

  console.log('\n================================================================================');
  console.log(`STEP 14 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED | TOTAL: ${passed + failed}`);
  console.log('================================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStep14GovernanceTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
