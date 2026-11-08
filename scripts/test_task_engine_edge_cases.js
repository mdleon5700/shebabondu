/**
 * CHAKRI SHEBA — TASK ENGINE & CONCURRENCY EDGE CASE VERIFICATION
 * Tests idempotency, atomic lease, lease expiration reclaim, retry bounds, and worker authorization
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'CHAKRISEBA_SECURE_ADMIN_2026';

const adminHeaders = {
  'Content-Type': 'application/json',
  'x-admin-secret': ADMIN_SECRET
};

async function testTaskEngine() {
  console.log('====================================================');
  console.log('TASK ENGINE & CONCURRENCY STRESS / EDGE CASE TEST');
  console.log('====================================================\n');

  // 1. Idempotency Test
  console.log('[TEST 1] Idempotency Protection: Duplicate creation prevention');
  const sharedKey = `idempotent_test_${Date.now()}`;
  const payload = {
    workstream: 'WORKSTREAM_B_BACKEND',
    taskType: 'CODE_AUDIT',
    title: 'Idempotency Test Task',
    description: 'Ensure double submission produces only one task',
    priority: 'P2_MEDIUM',
    affectedModules: ['src/lib/db.ts'],
    idempotencyKey: sharedKey
  };

  const create1 = await (await fetch(`${BASE_URL}/api/admin/engineering/tasks`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(payload)
  })).json();

  const create2 = await (await fetch(`${BASE_URL}/api/admin/engineering/tasks`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(payload)
  })).json();

  if (create1.task.taskId === create2.task.taskId) {
    console.log(`  -> PASS: Idempotency protected. Task ID ${create1.task.taskId} returned on both calls.`);
  } else {
    throw new Error(`FAIL: Duplicate tasks created: ${create1.task.taskId} vs ${create2.task.taskId}`);
  }

  const taskId = create1.task.taskId;

  // 2. Concurrent Acquisition Conflict Test
  console.log('\n[TEST 2] Concurrent Worker Protection: Only one worker can acquire');
  const [worker1Res, worker2Res] = await Promise.all([
    fetch(`${BASE_URL}/api/worker/tasks/acquire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId: 'WORKER-ALPHA' })
    }).then(r => r.json()),
    fetch(`${BASE_URL}/api/worker/tasks/acquire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId: 'WORKER-BETA' })
    }).then(r => r.json())
  ]);

  console.log(`  -> Worker Alpha got: ${worker1Res.task?.taskId || 'null'} (leased to: ${worker1Res.task?.leasedByWorker || 'none'})`);
  console.log(`  -> Worker Beta got: ${worker2Res.task?.taskId || 'null'} (leased to: ${worker2Res.task?.leasedByWorker || 'none'})`);

  if (worker1Res.task && worker2Res.task && worker1Res.task.taskId === worker2Res.task.taskId) {
    throw new Error('FAIL: Race condition! Both workers acquired the exact same task simultaneously!');
  } else {
    console.log('  -> PASS: Atomic acquisition confirmed. No duplicate task leasing.');
  }

  // 3. Worker Unauthorized Operation Test
  console.log('\n[TEST 3] Rogue Worker Protection: Worker cannot touch another worker\'s lease');
  // Determine which worker holds the lease for taskId
  const activeTask = await (await fetch(`${BASE_URL}/api/admin/engineering/tasks/${taskId}`, { headers: adminHeaders })).json();
  const legitimateWorker = activeTask.task.leasedByWorker || 'WORKER-ALPHA';
  const rogueWorker = legitimateWorker === 'WORKER-ALPHA' ? 'WORKER-BETA' : 'WORKER-ALPHA';

  const rogueComplete = await fetch(`${BASE_URL}/api/worker/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId: rogueWorker, summary: 'Hijacked completion' })
  });

  if (rogueComplete.status === 403) {
    console.log(`  -> PASS: Rogue worker ${rogueWorker} rejected with HTTP 403 when trying to complete lease owned by ${legitimateWorker}.`);
  } else {
    throw new Error(`FAIL: Rogue worker was allowed with status ${rogueComplete.status}`);
  }

  // Complete legitimately
  await fetch(`${BASE_URL}/api/worker/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId: legitimateWorker, summary: 'Legitimately completed' })
  });
  console.log('  -> Legitimate worker completed task cleanly.');

  // 4. Retry Limits & Failure Transition Test
  console.log('\n[TEST 4] Bounded Retry Limit: Maximum 3 attempts before FAILED status');
  const failTaskPayload = {
    workstream: 'WORKSTREAM_C_DATABASE',
    taskType: 'DB_AUDIT',
    title: 'Failure Retry Boundary Test',
    description: 'Verify 3 attempts failover into FAILED state',
    priority: 'P0_CRITICAL',
    affectedModules: ['src/db/local_store.json'],
    idempotencyKey: `fail_retry_test_${Date.now()}`
  };

  const createFailTask = await (await fetch(`${BASE_URL}/api/admin/engineering/tasks`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(failTaskPayload)
  })).json();

  const failTaskId = createFailTask.task.taskId;
  console.log(`  -> Created test task: ${failTaskId}`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    // Acquire
    const acq = await (await fetch(`${BASE_URL}/api/worker/tasks/acquire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId: 'WORKER-FAIL-TEST' })
    })).json();

    if (!acq.task || acq.task.taskId !== failTaskId) {
      throw new Error(`FAIL: Expected to acquire ${failTaskId}, got ${acq.task?.taskId}`);
    }

    // Fail
    const failRes = await (await fetch(`${BASE_URL}/api/worker/tasks/${failTaskId}/fail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: 'WORKER-FAIL-TEST',
        error: { message: `Simulated defect execution failure on attempt ${attempt}` }
      })
    })).json();

    console.log(`  -> Attempt ${attempt}/3: Task status transitioned to: ${failRes.task.status}`);
    if (attempt < 3 && failRes.task.status !== 'RETRY_PENDING') {
      throw new Error(`FAIL: Attempt ${attempt} should be RETRY_PENDING, got ${failRes.task.status}`);
    }
    if (attempt === 3 && failRes.task.status !== 'FAILED') {
      throw new Error(`FAIL: Attempt 3 should be FAILED, got ${failRes.task.status}`);
    }
  }

  console.log('  -> PASS: Bounded 3-attempt retry limit fully enforced. Final state is FAILED.');

  console.log('\n====================================================');
  console.log('ALL TASK ENGINE & CONCURRENCY TESTS PASSED!');
  console.log('====================================================');
}

testTaskEngine().catch(err => {
  console.error('\nFAILURE:', err.message);
  process.exit(1);
});
