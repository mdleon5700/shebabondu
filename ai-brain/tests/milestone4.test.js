const path = require('path');
const TestOrchestrator = require('../core/TestOrchestrator');

async function runMilestone4Tests() {
  console.log('--- STARTING MILESTONE 4 VERIFICATION ---');
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

  const orchestrator = new TestOrchestrator();
  const workspacePath = path.resolve(__dirname, '..', '..');

  // Test 1: TypeScript command check
  const tscResult = orchestrator.runCommandTest(workspacePath, 'TSC-CHECK', 'npx tsc --noEmit');
  assert(tscResult.status === 'PASS', `TypeScript compilation verified (status: ${tscResult.status})`);
  assert(tscResult.exitCode === 0, 'Exit code is 0');

  // Test 2: Failing command handling
  const failCmdResult = orchestrator.runCommandTest(workspacePath, 'NON-EXISTENT-CMD', 'node -e "process.exit(42)"');
  assert(failCmdResult.status === 'FAIL', 'Failing process properly classified as FAIL');
  assert(failCmdResult.exitCode === 42, `Captured exact exit code (expected 42, got ${failCmdResult.exitCode})`);

  // Test 3: HTTP Route Tests against local running server (http://localhost:3000)
  const homeHttp = await orchestrator.runHttpRouteTest('http://localhost:3000', '/', {
    expectedStatus: 200,
    shouldIncludeText: 'চাকরি'
  });
  assert(homeHttp.status === 'PASS', `HTTP / verification passed with status 200 (actual: ${homeHttp.actualStatus})`);

  const adminHttp = await orchestrator.runHttpRouteTest('http://localhost:3000', '/admin', {
    expectedStatus: 200,
    shouldIncludeText: 'অ্যাডমিন',
    shouldExcludeText: '???'
  });
  assert(adminHttp.status === 'PASS', 'HTTP /admin verification passed with zero ??? corruption');

  // Test 4: Suite Orchestration (Checking public API & Security Boundary)
  const suite = await orchestrator.runSuite(workspacePath, 'http://localhost:3000', {
    commands: [
      { id: 'NODE-VERSION-CHECK', command: 'node -v' }
    ],
    httpRoutes: [
      { path: '/api/applications', expectedStatus: 401 }, // Confirms candidate auth protection
      { path: '/api/admin/stats', expectedStatus: 403 }    // Confirms admin auth protection
    ]
  });

  assert(suite.allPassed === true, `Full test suite passed (${suite.passed}/${suite.total})`);

  console.log(`--- MILESTONE 4 COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
  if (failCount > 0) process.exit(1);
}

runMilestone4Tests();
