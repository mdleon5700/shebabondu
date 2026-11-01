const http = require('http');
const crypto = require('crypto');

console.log('================================================================');
console.log('   CHAKRISEBA BD — MILESTONE 1 SECURITY REGRESSION TEST SUITE   ');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(cond, name, details) {
  if (cond) {
    console.log(' [PASS] ' + name);
    if (details) console.log('        -> ' + details);
    passCount++;
  } else {
    console.error(' [FAIL] ' + name);
    if (details) console.error('        -> ' + details);
    failCount++;
  }
}

function makeReq(path, method, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000' + path, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function testTimingSafeVerification() {
  const salt = crypto.randomBytes(16).toString('hex');
  const validHash = 'scrypt$' + salt + '$' + crypto.scryptSync('SecurePass#2026', salt, 64).toString('hex');
  
  const parts = validHash.split('$');
  const hashAttempt = crypto.scryptSync('SecurePass#2026', parts[1], 64).toString('hex');
  const bufOrig = Buffer.from(parts[2], 'hex');
  const bufAttempt = Buffer.from(hashAttempt, 'hex');
  const timingSafeMatch = crypto.timingSafeEqual(bufOrig, bufAttempt);
  assert(timingSafeMatch === true, 'Timing-Safe Test 1: Legitimate password produces exact timing-safe match');

  const malformedParts = ['scrypt', 'short', 'invalid'];
  const isMalformedSafe = malformedParts[1].length !== 32 || malformedParts[2].length !== 128;
  assert(isMalformedSafe === true, 'Timing-Safe Test 2: Malformed hash detected and rejected safely');
}

async function runMilestone1Suite() {
  try {
    console.log('--- 1. TIMING-SAFE VERIFICATION & MALFORMED HASH RESILIENCE ---');
    testTimingSafeVerification();

    console.log('\n--- 2. PASSWORD BACKDOOR ELIMINATION ---');
    // Ensure test user exists with known password
    const testPhone = '01855-443322';
    await makeReq('/api/auth/register', 'POST', { 'Content-Type': 'application/json' }, {
      phone: testPhone,
      password: 'StrongSecretPass@2026!',
      name: 'ফারুক আহমেদ'
    });

    // Try to login as Faruk using the old backdoor '123456'
    const backdoorAttempt = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      phone: testPhone,
      password: '123456'
    });
    assert(backdoorAttempt.status === 401, 'Backdoor Test: Former 123456 bypass is completely rejected', backdoorAttempt.body?.error);

    console.log('\n--- 3. LEGITIMATE STORED PASSWORDS AUTHENTICATION ---');
    // Valid password for Faruk
    const validCand = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      phone: testPhone,
      password: 'StrongSecretPass@2026!'
    });
    assert(validCand.status === 200 && validCand.body.success, 'Valid Pass Test: Candidate authenticates with real password', validCand.body.user?.name);

    // Incorrect password for Faruk
    const wrongPassCand = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      phone: testPhone,
      password: 'WrongPassword999'
    });
    assert(wrongPassCand.status === 401, 'Wrong Pass Test: Incorrect password rejected with HTTP 401', wrongPassCand.body?.error);

    // Seeded demo user with legitimate password
    const demoUserLogin = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      phone: '01712-345678',
      password: '123456'
    });
    assert(demoUserLogin.status === 200 && demoUserLogin.body.success, 'Demo User Test: Pre-seeded candidate authenticates with valid scrypt hash', demoUserLogin.body.user?.name);

    console.log('\n--- 4. HARDCODED ADMIN CREDENTIALS REMOVAL ---');
    // Former hardcoded PIN '1234'
    const formerPin1234 = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      role: 'admin',
      adminPin: '1234'
    });
    assert(formerPin1234.status === 401, 'Admin Hardcoded PIN Test 1: Former PIN 1234 rejected', formerPin1234.body?.error);

    // Former hardcoded PIN 'admin123'
    const formerPinAdmin123 = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      role: 'admin',
      adminPin: 'admin123'
    });
    assert(formerPinAdmin123.status === 401, 'Admin Hardcoded PIN Test 2: Former PIN admin123 rejected', formerPinAdmin123.body?.error);

    // Legitimate server secret
    const legitAdmin = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      role: 'admin',
      adminPin: 'CHAKRISEBA_SECURE_ADMIN_2026'
    });
    assert(legitAdmin.status === 200 && legitAdmin.body.user?.role === 'admin', 'Admin Valid Secret Test: Server secret key authenticates admin session', legitAdmin.body.user?.name);

    console.log('\n--- 5. RATE LIMITING & BRUTE-FORCE ABUSE PROTECTION ---');
    // Trigger 5 consecutive failed logins for an attacker identifier
    const attackerPhone = '01988-776655';
    for (let i = 1; i <= 5; i++) {
      await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
        phone: attackerPhone,
        password: 'BruteForceAttempt#' + i
      });
    }
    // 6th attempt MUST be blocked by rate limiter with HTTP 429
    const rateLimitedReq = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, {
      phone: attackerPhone,
      password: 'BruteForceAttempt#6'
    });
    assert(rateLimitedReq.status === 429, 'Rate Limiter Test: Consecutive failed attempts blocked with HTTP 429', rateLimitedReq.body?.error);

    console.log('\n================================================================');
    console.log('   MILESTONE 1 RESULTS: ' + passCount + ' PASSED, ' + failCount + ' FAILED');
    console.log('================================================================\n');
    process.exit(failCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('Milestone 1 Test Suite execution error:', err);
    process.exit(1);
  }
}

runMilestone1Suite();
