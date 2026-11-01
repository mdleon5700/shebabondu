import { SyntheticUserManager } from '../src/lib/testing/synthetic/synthetic-user-manager';

console.log('=== RUNNING RE-TEST 4: SYNTHETIC AUTHENTICATION & SESSION RESOLUTION ===');

async function testAuthForPersona(id: string) {
  const persona = SyntheticUserManager.getSyntheticUserById(id);
  if (!persona) throw new Error(`Persona ${id} not found`);

  console.log(`\nTesting Auth for [${persona.id}] - District: ${persona.district}, Phone: ${persona.phone}`);

  // 1. Hit /api/auth/login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: persona.phone,
      password: persona.testPasswordPlain
    })
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success) {
    throw new Error(`FAIL: Login failed for ${id}: ${JSON.stringify(loginData)}`);
  }

  console.log(`- Login HTTP ${loginRes.status} OK: User ${loginData.user.name} (${loginData.user.id})`);

  // Extract session cookie
  const cookieHeader = loginRes.headers.get('set-cookie');
  if (!cookieHeader) {
    throw new Error(`FAIL: No set-cookie header returned on login for ${id}`);
  }

  const tokenMatch = cookieHeader.match(/cs_session_token=([^;]+)/);
  if (!tokenMatch) {
    throw new Error(`FAIL: cs_session_token not found in cookie`);
  }
  const sessionCookie = `cs_session_token=${tokenMatch[1]}`;

  // 2. Hit /api/auth/me with session cookie
  const meRes = await fetch('http://localhost:3000/api/auth/me', {
    headers: { 'Cookie': sessionCookie }
  });

  const meData = await meRes.json();
  if (!meRes.ok || !meData.isLoggedIn) {
    throw new Error(`FAIL: /api/auth/me failed for ${id}: ${JSON.stringify(meData)}`);
  }

  console.log(`- /api/auth/me HTTP ${meRes.status} OK: Verified logged in as ${meData.user.nameBn}, District: ${meData.user.district}`);

  if (meData.user.district !== persona.district) {
    throw new Error(`FAIL: District mismatch! Expected ${persona.district}, got ${meData.user.district}`);
  }
}

async function run() {
  // Test across 4 distinct divisions
  await testAuthForPersona('SYNTH-USR-DHAKA-001');
  await testAuthForPersona('SYNTH-USR-CHATTOGRAM-001');
  await testAuthForPersona('SYNTH-USR-RANGPUR-001');
  await testAuthForPersona('SYNTH-USR-SYLHET-001');

  // Verify real database isolation again
  const isolation = SyntheticUserManager.verifyDataIsolation();
  console.log(`\nPost-Auth Isolation Check: Real Candidates = ${isolation.realCandidatesCount} (Must be 41)`);
  if (isolation.realCandidatesCount !== 41) {
    throw new Error(`CRITICAL: Real database altered during auth tests!`);
  }

  console.log('\n✅ RE-TEST 4 PASSED: Synthetic Candidate Authentication, Session Cookies, and /api/auth/me Profile resolution are 100% verified across divisions!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});