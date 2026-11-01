const path = require('path');
const SecurityPerformanceDiagnostics = require('../core/SecurityPerformanceDiagnostics');

async function runMilestone6Tests() {
  console.log('--- STARTING MILESTONE 6 VERIFICATION ---');
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

  const secPerf = new SecurityPerformanceDiagnostics();
  const workspacePath = path.resolve(__dirname, '..', '..');

  // Test 1: Secret leak scanner
  const leakReport = secPerf.scanSecrets(workspacePath);
  assert(leakReport.leaksFound === 0, `No hardcoded private keys or tokens found in source code (${leakReport.filesScanned} files scanned)`);

  // Test 2: Latency & Response Time
  const latency = await secPerf.measureApiLatency('http://localhost:3000/', 3);
  assert(latency.status === 'PASS', `Homepage HTTP latency measured successfully (average: ${latency.averageMs}ms)`);
  assert(latency.fast === true, `Response time is sub-300ms (actual: ${latency.averageMs}ms)`);

  // Test 3: Slow Network Retry with Exponential Backoff
  let attemptCounter = 0;
  const retrySim = await secPerf.simulateSlowNetworkWithRetries(async (att) => {
    attemptCounter++;
    if (attemptCounter < 2) {
      throw new Error('Simulated transient network timeout');
    }
    return 'RECOVERED_DATA_PACKET';
  }, 3, 10);

  assert(retrySim.success === true, 'Slow-network transient failure successfully recovered via retry');
  assert(retrySim.attemptsNeeded === 2, 'Required exactly 2 attempts to recover');
  assert(retrySim.result === 'RECOVERED_DATA_PACKET', 'Returned expected payload upon recovery');

  // Test 4: Rate Limit Verification
  const rateLimitRes = await secPerf.testLoginRateLimiting('http://localhost:3000/api/auth/login');
  assert(rateLimitRes.rateLimitTriggered === true, 'Rate limiter correctly triggered 429 status on consecutive invalid attempts');

  console.log(`--- MILESTONE 6 COMPLETE: ${passCount} PASSED, ${failCount} FAILED ---`);
  if (failCount > 0) process.exit(1);
}

runMilestone6Tests();
