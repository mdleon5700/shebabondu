const http = require('http');
const crypto = require('crypto');

console.log("================================================================");
console.log("   CHAKRISEBA BD — PHASE 7 BACKEND SECURITY & API TEST SUITE   ");
console.log("================================================================\n");

let passCount = 0; let failCount = 0;
function assert(cond, name, details) {
  if (cond) {
    console.log(" [PASS] " + name);
    if (details) console.log("        -> " + details);
    passCount++;
  } else {
    console.error(" [FAIL] " + name);
    if (details) console.error("        -> " + details);
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

async function runSuite() {
  try {
    console.log("--- 1. UNAUTHORIZED ACCESS PROTECTION (401 GUARDS) ---");
    const pRes = await makeReq('/api/profile', 'GET');
    assert(pRes.status === 401, "Guard 1: GET /api/profile requires session cookie", "Status: " + pRes.status);

    const dRes = await makeReq('/api/documents', 'GET');
    assert(dRes.status === 401, "Guard 2: GET /api/documents requires session cookie", "Status: " + dRes.status);

    const aRes = await makeReq('/api/applications', 'GET');
    assert(aRes.status === 401, "Guard 3: GET /api/applications requires session cookie", "Status: " + aRes.status);

    const wRes = await makeReq('/api/wallet/transactions', 'GET');
    assert(wRes.status === 401, "Guard 4: GET /api/wallet/transactions requires session cookie", "Status: " + wRes.status);

    console.log("\n--- 2. AUTHENTICATION, PASSWORD & HTTPONLY SESSIONS ---");
    const badLogin = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, { phone: '01712-345678', password: 'WrongPassword!' });
    assert(badLogin.status === 401, "Auth Test 1: Invalid password rejected with HTTP 401", badLogin.body?.error);

    const goodLogin = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, { phone: '01712-345678', password: '123456' });
    assert(goodLogin.status === 200, "Auth Test 2: Valid credentials accepted with HTTP 200");
    const setCookie = goodLogin.headers['set-cookie'];
    const sessionCookieStr = setCookie ? setCookie[0] : '';
    assert(sessionCookieStr.includes('cs_session_token') && sessionCookieStr.includes('HttpOnly'), "Auth Test 3: HttpOnly session cookie issued");
    const cookieHeader = sessionCookieStr.split(';')[0];

    console.log("\n--- 3. AUTHENTICATED CANDIDATE API OPERATIONS ---");
    const authMe = await makeReq('/api/auth/me', 'GET', { 'Cookie': cookieHeader });
    assert(authMe.status === 200 && authMe.body.user?.phone === '01712-345678', "API Test 1: GET /api/auth/me returned authenticated user", authMe.body.user?.name);

    const authProfile = await makeReq('/api/profile', 'GET', { 'Cookie': cookieHeader });
    assert(authProfile.status === 200 && authProfile.body.profile?.name, "API Test 2: GET /api/profile returned candidate profile");

    const updateProf = await makeReq('/api/profile', 'PUT', { 'Cookie': cookieHeader, 'Content-Type': 'application/json' }, { district: 'ঢাকা' });
    assert(updateProf.status === 200 && updateProf.body.profile?.district === 'ঢাকা', "API Test 3: PUT /api/profile updated district successfully");

    console.log("\n--- 4. WALLET LEDGER ATOMICITY & RECHARGE API ---");
    const rechRes = await makeReq('/api/wallet/transactions', 'POST', { 'Cookie': cookieHeader, 'Content-Type': 'application/json' }, { amount: 300, type: 'recharge', trxId: 'BKL_LIVE_' + Date.now(), idempotencyKey: 'IDEM_' + Date.now() });
    assert(rechRes.status === 200 && rechRes.body.newBalance > 0, "Wallet API Test 1: Recharge transaction accepted", "New Balance: ৳" + rechRes.body.newBalance);

    console.log("\n--- 5. ELIGIBILITY ENGINE SERVER-SIDE CHECK API ---");
    const mockJob = { id: 'bb-ad-2026', title: 'Assistant Director', minAge: 21, maxAge: 30, minEducation: 'স্নাতক', districts: 'সকল জেলা', ageCutOffDate: '2026-11-01' };
    const eligRes = await makeReq('/api/eligibility/check', 'POST', { 'Cookie': cookieHeader, 'Content-Type': 'application/json' }, { job: mockJob });
    assert(eligRes.status === 200 && eligRes.body.evaluation, "Eligibility API Test: Server verified eligibility", eligRes.body.evaluation?.statusLabel);

    console.log("\n--- 6. LOGOUT & SESSION REVOCATION ---");
    const logoutRes = await makeReq('/api/auth/logout', 'POST', { 'Cookie': cookieHeader });
    assert(logoutRes.status === 200, "Logout Test 1: POST /api/auth/logout revoked session");

    const afterLogoutMe = await makeReq('/api/auth/me', 'GET', { 'Cookie': cookieHeader });
    assert(afterLogoutMe.status === 401, "Logout Test 2: Revoked session immediately returns HTTP 401");

    console.log("\n================================================================");
    console.log("   PHASE 7 API SUITE: " + passCount + " PASSED, " + failCount + " FAILED");
    console.log("================================================================\n");
    process.exit(failCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('Suite execution error:', err);
    process.exit(1);
  }
}

runSuite();
