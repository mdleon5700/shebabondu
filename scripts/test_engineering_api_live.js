/**
 * CHAKRI SHEBA — ENGINEERING TASK API LIVE VERIFICATION
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'CHAKRISEBA_SECURE_ADMIN_2026';

const adminHeaders = {
  'Content-Type': 'application/json',
  'x-admin-secret': ADMIN_SECRET
};

async function run() {
  console.log('--- STARTING LIVE ENGINEERING API VERIFICATION ---');
  console.log('Target Base URL:', BASE_URL);

  // 1. Security Check: Unauthorized call must be rejected with 403
  console.log('\n[TEST 1] Security Check: GET /api/admin/engineering/tasks without auth');
  const resForbidden = await fetch(`${BASE_URL}/api/admin/engineering/tasks`);
  if (resForbidden.status === 403) {
    console.log('PASS: Correctly rejected with HTTP 403 Forbidden.');
  } else {
    throw new Error(`Expected HTTP 403, got HTTP ${resForbidden.status}`);
  }

  // 2. Initial Task Listing with Admin Secret
  console.log('\n[TEST 2] Authorized GET /api/admin/engineering/tasks');
  const res1 = await fetch(`${BASE_URL}/api/admin/engineering/tasks`, {
    headers: adminHeaders
  });
  if (!res1.ok) throw new Error(`GET tasks failed: HTTP ${res1.status}`);
  const json1 = await res1.json();
  console.log(`PASS: Found ${json1.count} existing engineering tasks.`);

  // 3. Create New Engineering Task
  console.log('\n[TEST 3] POST /api/admin/engineering/tasks');
  const testPayload = {
    workstream: 'WORKSTREAM_A_FRONTEND',
    taskType: 'BROWSER_QA',
    title: 'Automated Bengali Typography & Impersonation Verification',
    description: 'Verify SolaimanLipi fallback rendering and candidate impersonation portal button',
    priority: 'P1_HIGH',
    affectedModules: ['/dashboard/profile', 'UniversalUserWorkspace.tsx', 'globals.css'],
    assignedAgent: 'Agent 4: Browser QA',
    requiresHumanApproval: true,
    idempotencyKey: `audit_typography_${Date.now()}`
  };

  const res2 = await fetch(`${BASE_URL}/api/admin/engineering/tasks`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(testPayload)
  });
  if (!res2.ok) throw new Error(`POST task failed: HTTP ${res2.status}`);
  const json2 = await res2.json();
  const taskId = json2.task.taskId;
  console.log(`PASS: Created task ${taskId} with status ${json2.task.status}.`);

  // 4. Worker Lease Acquisition (Outbound polling from worker - no admin secret required)
  console.log('\n[TEST 4] POST /api/worker/tasks/acquire');
  const workerId = 'LOCAL-AMD-WORKER-01';
  const res3 = await fetch(`${BASE_URL}/api/worker/tasks/acquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId,
      allowedWorkstreams: ['WORKSTREAM_A_FRONTEND', 'WORKSTREAM_E_SYNC']
    })
  });
  if (!res3.ok) throw new Error(`Acquire failed: HTTP ${res3.status}`);
  const json3 = await res3.json();
  if (!json3.task || json3.task.taskId !== taskId) {
    throw new Error(`Expected acquired task ${taskId}, got ${json3.task?.taskId}`);
  }
  console.log(`PASS: Task ${taskId} acquired by ${workerId}. Status is now ${json3.task.status}, lease expires at ${json3.task.leaseExpiresAt}.`);

  // 5. Worker Heartbeat
  console.log('\n[TEST 5] POST /api/worker/tasks/[id]/heartbeat');
  const res4 = await fetch(`${BASE_URL}/api/worker/tasks/${taskId}/heartbeat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId, extensionMinutes: 10 })
  });
  if (!res4.ok) throw new Error(`Heartbeat failed: HTTP ${res4.status}`);
  const json4 = await res4.json();
  console.log(`PASS: Heartbeat acknowledged: ${json4.message}`);

  // 6. Worker Task Completion
  console.log('\n[TEST 6] POST /api/worker/tasks/[id]/complete');
  const res5 = await fetch(`${BASE_URL}/api/worker/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId,
      summary: 'Playwright rendered page with zero console errors. SolaimanLipi font computed perfectly.',
      evidence: ['artifacts/98_user_profile_instant_update_live.png']
    })
  });
  if (!res5.ok) throw new Error(`Complete failed: HTTP ${res5.status}`);
  const json5 = await res5.json();
  console.log(`PASS: Task completed. Status is ${json5.task.status} (Requires human approval: ${json5.task.requiresHumanApproval}).`);

  // 7. Admin Human Approval Gate
  console.log('\n[TEST 7] POST /api/admin/engineering/tasks/[id]/approval');
  const res6 = await fetch(`${BASE_URL}/api/admin/engineering/tasks/${taskId}/approval`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      approvedBy: 'ADMIN-LEON',
      decision: 'APPROVED',
      notes: 'Verified screenshots and Playwright audit log. Approved for release.'
    })
  });
  if (!res6.ok) throw new Error(`Approval failed: HTTP ${res6.status}`);
  const json6 = await res6.json();
  console.log(`PASS: Human approval recorded: ${json6.task.approvalStatus}. Final status: ${json6.task.status}`);

  console.log('\n========================================');
  console.log('ALL 7 LIVE ENGINEERING API TESTS PASSED!');
  console.log('========================================');
}

run().catch(err => {
  console.error('\nFAILURE:', err.message);
  process.exit(1);
});
