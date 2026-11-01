const http = require('http');
console.log('=== PHASE 7 EXTENDED SUITE (MULTI-USER & STATUS GUARDS) ===');
function makeReq(p, m, h = {}, b = null) {
  return new Promise((res, rej) => {
    const req = http.request('http://localhost:3000' + p, { method: m, headers: h }, (r) => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => {
        let j; try { j = JSON.parse(d); } catch { j = d; }
        res({ status: r.statusCode, headers: r.headers, body: j });
      });
    });
    req.on('error', rej);
    if (b) req.write(JSON.stringify(b));
    req.end();
  });
}
async function run() {
  let pass = 0;
  const candB = await makeReq('/api/auth/register', 'POST', { 'Content-Type': 'application/json' }, { phone: '01811-999888', password: 'Password999!', name: 'Candidate B', nid: '9998887776' });
  const cookieB = candB.headers['set-cookie'] ? candB.headers['set-cookie'][0].split(';')[0] : '';
  const profB = await makeReq('/api/profile', 'GET', { 'Cookie': cookieB });
  if (profB.status === 200 && profB.body.profile) {
    console.log('[PASS] Cross-user registration and isolated profile verified: ' + profB.body.profile.name);
    pass++;
  }
  const appsB = await makeReq('/api/applications', 'GET', { 'Cookie': cookieB });
  if (appsB.body.applications && appsB.body.applications.length === 0) {
    console.log('[PASS] Candidate B cannot see Candidate A applications (0 found)');
    pass++;
  }
  const goodLogin = await makeReq('/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, { phone: '01712-345678', password: '123456' });
  const cookieA = goodLogin.headers['set-cookie'] ? goodLogin.headers['set-cookie'][0].split(';')[0] : '';
  const appsA = await makeReq('/api/applications', 'GET', { 'Cookie': cookieA });
  const firstApp = appsA.body.applications && appsA.body.applications[0];
  if (firstApp) {
    const p403 = await makeReq('/api/applications/' + firstApp.id, 'PATCH', { 'Cookie': cookieA, 'Content-Type': 'application/json' }, { status: 'completed', verificationType: 'officially_verified' });
    if (p403.status === 403) {
      console.log('[PASS] Forbidden guard: Non-admin cannot set officially_verified status');
      pass++;
    }
    const p200 = await makeReq('/api/applications/' + firstApp.id, 'PATCH', { 'Cookie': cookieA, 'Content-Type': 'application/json' }, { status: 'completed', verificationType: 'user_reported' });
    if (p200.status === 200) {
      console.log('[PASS] Candidate can update own status as user_reported');
      pass++;
    }
  }
  console.log('\nExtended Tests Passed: ' + pass + '/4');
  process.exit(pass === 4 ? 0 : 1);
}
run();