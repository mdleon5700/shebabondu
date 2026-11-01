const path = require('path');
const DiagnosticsEngine = require('../core/DiagnosticsEngine');

async function runMilestone5Tests() {
  console.log('--- STARTING MILESTONE 5 VERIFICATION ---');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failCount++;
    }
  }

  const diagnostics = new DiagnosticsEngine();
  const dbFile = path.resolve(__dirname, '..', '..', 'src', 'db', 'local_store.json');

  // Test 1: Real Database File Integrity Diagnosis
  const dbDiag = diagnostics.diagnoseDataIntegrity(dbFile);
  assert(dbDiag.status === 'PASS', `Database integrity verified without errors (status: ${dbDiag.status})`);
  assert(dbDiag.totalCollections >= 11, `All 11 required collections exist (found: ${dbDiag.totalCollections})`);
  assert(dbDiag.issuesCount === 0, `Zero integrity issues found (count: ${dbDiag.issuesCount})`);

  // Test 2: Concurrency & Atomic Read-Modify-Write
  const concDiag = diagnostics.simulateConcurrentUpdates(dbFile, 10);
  assert(concDiag.status === 'PASS', 'Concurrent read-modify-write test passed');
  assert(concDiag.recordedUpdates === 10, `All 10 updates were atomically recorded (count: ${concDiag.recordedUpdates})`);

  // Test 3: API Cache Header Security
  const cacheDiag = await diagnostics.verifyCacheHeaders('http://localhost:3000/api/applications');
  assert(cacheDiag.isSecure === true, 'Cache header diagnostic successfully queried API');

  console.log(`--- MILESTONE 5 COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
  if (failCount > 0) process.exit(1);
}

runMilestone5Tests();
