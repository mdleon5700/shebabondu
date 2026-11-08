/**
 * CHAKRI SHEBA — DEEP SEVEN ENGINEERING APIs INDEPENDENT VERIFICATION
 * Tests auth, input validation, errors, and direct filesystem database persistence
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'CHAKRISEBA_SECURE_ADMIN_2026';
const DB_FILE = path.join(process.cwd(), 'src', 'db', 'local_store.json');

const adminHeaders = {
  'Content-Type': 'application/json',
  'x-admin-secret': ADMIN_SECRET
};

function readDiskTask(taskId) {
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  return db.engineeringTasks ? db.engineeringTasks[taskId] : null;
}

async function verifyAllSevenAPIs() {
  console.log('========================================================');
  console.log('SEVEN ENGINEERING APIS DEEP INDEPENDENT VERIFICATION');
  console.log('========================================================\n');

  // --- API 1: GET /api/admin/engineering/tasks ---
  console.log('[API 1] GET /api/admin/engineering/tasks');
  const res1Unauth = await fetch(`${BASE_URL}/api/admin/engineering/tasks`);
  if (res1Unauth.status !== 403) throw new Error(`Expected 403 on unauth GET, got ${res1Unauth.status}`);
  console.log('  -> Unauthenticated request rejected with HTTP 403 Forbidden.');

  const res1Auth = await fetch(`${BASE_URL}/api/admin/engineering/tasks`, { headers: adminHeaders });
  if (res1Auth.status !== 200) throw new Error(`Expected 200 on auth GET, got ${res1Auth.status}`);
  const json1 = await res1Auth.json();
  if (typeof json1.count !== 'number' || !Array.isArray(json1.tasks)) throw new Error('Invalid response structure');
  console.log(`  -> Authorized request succeeded with HTTP 200. Found ${json1.count} tasks.`);

  // --- API 2: POST /api/admin/engineering/tasks ---
  console.log('\n[API 2] POST /api/admin/engineering/tasks');
  const res2Unauth = await fetch(`${BASE_URL}/api/admin/engineering/tasks`, { method: 'POST', body: '{}' });
  if (res2Unauth.status !== 403) throw new Error(`Expected 403 on unauth POST, got ${res2Unauth.status}`);
  console.log('  -> Unauthenticated task creation rejected with HTTP 403 Forbidden.');

  const res2BadInput = await fetch(`${BASE_URL}/api/admin/engineering/tasks`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ title: 'Incomplete Task' }) // missing required fields
  });
  if (res2BadInput.status !== 400) throw new Error(`Expected 400 on bad input, got ${res2BadInput.status}`);
  console.log('  -> Incomplete payload rejected with HTTP 400 Bad Request.');

  const validPayload = {
    workstream: 'WORKSTREAM_B_BACKEND',
    taskType: 'CODE_AUDIT',
    title: 'Deep API Verification Probe',
    description: 'Verifying end-to-end task persistence and lease lifecycle',
    priority: 'P1_HIGH',
    affectedModules: ['src/app/api/admin/engineering/tasks/route.ts'],
    requiresHumanApproval: true,
    idempotencyKey: `deep_verify_${Date.now()}`
  };

  const res2Valid = await fetch(`${BASE_URL}/api/admin/engineering/tasks`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(validPayload)
  });
  if (res2Valid.status !== 201) throw new Error(`Expected 201 on valid POST, got ${res2Valid.status}`);
  const json2 = await res2Valid.json();
  const testTaskId = json2.task.taskId;
  console.log(`  -> Valid task created with HTTP 201: ${testTaskId}.`);

  // Verify persistence on disk
  const diskTask1 = readDiskTask(testTaskId);
  if (!diskTask1 || diskTask1.title !== validPayload.title) {
    throw new Error('Database persistence failed: task not found on disk!');
  }
  console.log('  -> Disk Verification: Record confirmed in local_store.json.');

  // --- API 3: GET /api/admin/engineering/tasks/[id] ---
  console.log('\n[API 3] GET /api/admin/engineering/tasks/[id]');
  const res3NotFound = await fetch(`${BASE_URL}/api/admin/engineering/tasks/NON_EXISTENT_999`, { headers: adminHeaders });
  if (res3NotFound.status !== 404) throw new Error(`Expected 404 for non-existent task, got ${res3NotFound.status}`);
  console.log('  -> Non-existent task returned HTTP 404 Not Found.');

  const res3Valid = await fetch(`${BASE_URL}/api/admin/engineering/tasks/${testTaskId}`, { headers: adminHeaders });
  if (res3Valid.status !== 200) throw new Error(`Expected 200 for valid task, got ${res3Valid.status}`);
  const json3 = await res3Valid.json();
  if (json3.task.taskId !== testTaskId) throw new Error('Task ID mismatch');
  console.log(`  -> Single task lookup succeeded with HTTP 200: ${json3.task.taskId}`);

  // --- API 4: POST /api/worker/tasks/acquire ---
  console.log('\n[API 4] POST /api/worker/tasks/acquire');
  const res4BadInput = await fetch(`${BASE_URL}/api/worker/tasks/acquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}) // missing workerId
  });
  if (res4BadInput.status !== 400) throw new Error(`Expected 400 when missing workerId, got ${res4BadInput.status}`);
  console.log('  -> Missing workerId rejected with HTTP 400 Bad Request.');

  const workerId = 'INDEPENDENT-AUDIT-WORKER-01';
  const res4Valid = await fetch(`${BASE_URL}/api/worker/tasks/acquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId, allowedWorkstreams: ['WORKSTREAM_B_BACKEND'] })
  });
  if (res4Valid.status !== 200) throw new Error(`Expected 200 on acquisition, got ${res4Valid.status}`);
  const json4 = await res4Valid.json();
  if (!json4.task || json4.task.taskId !== testTaskId) {
    throw new Error(`Expected task ${testTaskId}, got ${json4.task?.taskId}`);
  }
  console.log(`  -> Task acquired with HTTP 200. Leased by: ${json4.task.leasedByWorker}. Status: ${json4.task.status}.`);

  // Verify lease persistence on disk
  const diskTask2 = readDiskTask(testTaskId);
  if (diskTask2.leasedByWorker !== workerId || !diskTask2.leaseExpiresAt) {
    throw new Error('Database persistence failed: lease metadata not written to disk!');
  }
  console.log(`  -> Disk Verification: leaseExpiresAt confirmed (${diskTask2.leaseExpiresAt}).`);

  // --- API 5: POST /api/worker/tasks/[id]/heartbeat ---
  console.log('\n[API 5] POST /api/worker/tasks/[id]/heartbeat');
  const res5Rogue = await fetch(`${BASE_URL}/api/worker/tasks/${testTaskId}/heartbeat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId: 'UNAUTHORIZED-WORKER', extensionMinutes: 10 })
  });
  if (res5Rogue.status !== 403) throw new Error(`Expected 403 for unauthorized worker heartbeat, got ${res5Rogue.status}`);
  console.log('  -> Unauthorized worker heartbeat rejected with HTTP 403 Forbidden.');

  const res5Valid = await fetch(`${BASE_URL}/api/worker/tasks/${testTaskId}/heartbeat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId, extensionMinutes: 10 })
  });
  if (res5Valid.status !== 200) throw new Error(`Expected 200 for valid heartbeat, got ${res5Valid.status}`);
  console.log('  -> Legitimate worker heartbeat succeeded with HTTP 200.');

  // --- API 6: POST /api/worker/tasks/[id]/complete ---
  console.log('\n[API 6] POST /api/worker/tasks/[id]/complete');
  const res6BadInput = await fetch(`${BASE_URL}/api/worker/tasks/${testTaskId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId }) // missing summary
  });
  if (res6BadInput.status !== 400) throw new Error(`Expected 400 when missing summary, got ${res6BadInput.status}`);
  console.log('  -> Missing summary rejected with HTTP 400 Bad Request.');

  const res6Valid = await fetch(`${BASE_URL}/api/worker/tasks/${testTaskId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId,
      summary: 'Task independently verified with full input and persistence validation',
      evidence: ['scripts/verify_all_seven_apis_deep.js']
    })
  });
  if (res6Valid.status !== 200) throw new Error(`Expected 200 on complete, got ${res6Valid.status}`);
  const json6 = await res6Valid.json();
  if (json6.task.status !== 'AWAITING_APPROVAL') {
    throw new Error(`Expected AWAITING_APPROVAL (since requiresHumanApproval=true), got ${json6.task.status}`);
  }
  console.log(`  -> Task completion accepted with HTTP 200. Transitioned to: ${json6.task.status}.`);

  // Verify status persistence on disk
  const diskTask3 = readDiskTask(testTaskId);
  if (diskTask3.status !== 'AWAITING_APPROVAL' || diskTask3.leasedByWorker !== undefined) {
    throw new Error('Database persistence failed: task completion status not on disk!');
  }
  console.log('  -> Disk Verification: Status confirmed as AWAITING_APPROVAL and lease cleared on disk.');

  // --- API 7: POST /api/admin/engineering/tasks/[id]/approval ---
  console.log('\n[API 7] POST /api/admin/engineering/tasks/[id]/approval');
  const res7Unauth = await fetch(`${BASE_URL}/api/admin/engineering/tasks/${testTaskId}/approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approvedBy: 'LEON', decision: 'APPROVED' })
  });
  if (res7Unauth.status !== 403) throw new Error(`Expected 403 on unauth approval, got ${res7Unauth.status}`);
  console.log('  -> Unauthenticated approval call rejected with HTTP 403 Forbidden.');

  const res7BadDecision = await fetch(`${BASE_URL}/api/admin/engineering/tasks/${testTaskId}/approval`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ approvedBy: 'LEON', decision: 'MAYBE' }) // invalid decision
  });
  if (res7BadDecision.status !== 400) throw new Error(`Expected 400 for invalid decision, got ${res7BadDecision.status}`);
  console.log('  -> Invalid approval decision rejected with HTTP 400 Bad Request.');

  const res7Valid = await fetch(`${BASE_URL}/api/admin/engineering/tasks/${testTaskId}/approval`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      approvedBy: 'ADMIN-AUDITOR',
      decision: 'APPROVED',
      notes: 'Independently verified against live filesystem and serverDB state machine.'
    })
  });
  if (res7Valid.status !== 200) throw new Error(`Expected 200 on valid approval, got ${res7Valid.status}`);
  const json7 = await res7Valid.json();
  if (json7.task.status !== 'READY_FOR_RELEASE') {
    throw new Error(`Expected READY_FOR_RELEASE, got ${json7.task.status}`);
  }
  console.log(`  -> Human approval recorded with HTTP 200. Final status: ${json7.task.status}.`);

  // Verify disk state
  const diskTask4 = readDiskTask(testTaskId);
  if (diskTask4.status !== 'READY_FOR_RELEASE' || diskTask4.approvalStatus !== 'APPROVED') {
    throw new Error('Database persistence failed: approval decision not written to disk!');
  }
  console.log('  -> Disk Verification: Final READY_FOR_RELEASE and APPROVED state confirmed in local_store.json.');

  console.log('\n========================================================');
  console.log('ALL SEVEN ENGINEERING APIS VERIFIED WITH DISK PERSISTENCE');
  console.log('========================================================');
}

verifyAllSevenAPIs().catch(err => {
  console.error('\nFAILURE:', err.message);
  process.exit(1);
});

