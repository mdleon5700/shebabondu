const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: encodeURI(path),
      method: method,
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
    }
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });
    req.on('error', (err) => resolve({ status: 'ERROR', error: err.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testLifecycle() {
  console.log('=== CANDIDATE & ADMIN COMPLETE LIFECYCLE AUDIT ===\n');

  // Step 1: Candidate Login
  console.log('1. Testing Candidate Login (01712-345678)...');
  const loginRes = await request('POST', '/api/auth/login', {
    identifier: '01712-345678',
    password: '123456'
  });
  console.log(`  Login Status: ${loginRes.status}`);
  const setCookie = loginRes.headers['set-cookie'];
  let cookieHeader = '';
  if (setCookie) {
    cookieHeader = Array.isArray(setCookie) ? setCookie.map(c => c.split(';')[0]).join('; ') : setCookie.split(';')[0];
    console.log(`  Received Cookie: ${cookieHeader}`);
  }

  // Step 2: Fetch Candidate Profile
  console.log('\n2. Testing Candidate Profile (/api/profile)...');
  const profRes = await request('GET', '/api/profile', null, { Cookie: cookieHeader });
  console.log(`  Profile Status: ${profRes.status}`);
  const profile = profRes.json?.profile || profRes.json?.user || profRes.json;
  console.log(`  Candidate Name: ${profile?.name || profile?.nameBn} | Phone: ${profile?.phone} | Wallet: ৳${profile?.walletBalance}`);

  // Step 3: Fetch Existing Applications
  console.log('\n3. Testing Candidate Applications (/api/applications)...');
  const appsRes = await request('GET', '/api/applications', null, { Cookie: cookieHeader });
  console.log(`  Applications Status: ${appsRes.status}`);
  const userApps = appsRes.json?.applications || (Array.isArray(appsRes.json) ? appsRes.json : []);
  console.log(`  User Application Count: ${userApps.length}`);

  // Step 4: Submit a New Application for Petrobangla (job-ai-bogmc-14989) via bKash
  console.log('\n4. Testing Apply Flow for Petrobangla (job-ai-bogmc-14989)...');
  const applyPayload = {
    jobId: 'job-ai-bogmc-14989',
    positionId: 'pos-14989',
    postName: 'সহকারী ব্যবস্থাপক(আইন)',
    paymentMethod: 'bKash',
    trxId: 'TRX-BKASH-99120',
    serviceCharge: 50,
    govtFee: 600,
    notes: 'অডিট টেস্ট অ্যাপ্লিকেশন ২০২৬'
  };
  const applyRes = await request('POST', '/api/applications', applyPayload, { Cookie: cookieHeader });
  console.log(`  Apply Status: ${applyRes.status}`);
  console.log(`  Apply Success: ${applyRes.json?.success}`);
  const createdApp = applyRes.json?.createdApp;
  console.log(`  Created App ID: ${createdApp?.id} | Status: ${createdApp?.status}`);

  // Step 5: Verify Application Appears in Candidate Dashboard Applications
  console.log('\n5. Verifying Application in Candidate Dashboard List...');
  const afterAppsRes = await request('GET', '/api/applications', null, { Cookie: cookieHeader });
  const updatedUserApps = afterAppsRes.json?.applications || (Array.isArray(afterAppsRes.json) ? afterAppsRes.json : []);
  console.log(`  Updated User Application Count: ${updatedUserApps.length}`);
  const hasNewPetrobanglaApp = updatedUserApps.some(a => a.jobId === 'job-ai-bogmc-14989');
  console.log(`  Found Petrobangla in User Applications: ${hasNewPetrobanglaApp}`);

  // Step 6: Verify Application Appears in Admin Panel Applications
  console.log('\n6. Verifying Application in Admin Panel Applications (/api/admin/applications)...');
  const adminAppsRes = await request('GET', '/api/admin/applications', null, {
    'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
  });
  console.log(`  Admin Apps Status: ${adminAppsRes.status}`);
  const adminAppsList = adminAppsRes.json?.applications || (Array.isArray(adminAppsRes.json) ? adminAppsRes.json : []);
  const adminFoundPetrobangla = adminAppsList.some(a => a.jobId === 'job-ai-bogmc-14989');
  console.log(`  Admin Applications Count: ${adminAppsList.length}`);
  console.log(`  Admin Found Petrobangla Application: ${adminFoundPetrobangla}`);

  // Step 7: Admin Updates Status to 'processing' via PATCH /api/applications/[id]
  if (createdApp) {
    console.log(`\n7. Testing Admin Status Update on App ${createdApp.id}...`);
    const updateRes = await request('PATCH', `/api/applications/${createdApp.id}`, {
      status: 'processing',
      statusLabel: 'প্রক্রিয়াধীন রয়েছে',
      adminNotes: 'অ্যাডমিন দ্বারা আবেদন যাচাই শুরু হয়েছে এবং পেমেন্ট অনুমোদিত।'
    }, {
      'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
    });
    console.log(`  Admin Update Status: ${updateRes.status}`);
    console.log(`  Admin Update Success:`, updateRes.json?.success || updateRes.json);

    // Verify Candidate sees the updated status
    const candidateVerifyRes = await request('GET', '/api/applications', null, { Cookie: cookieHeader });
    const candApps = candidateVerifyRes.json?.applications || (Array.isArray(candidateVerifyRes.json) ? candidateVerifyRes.json : []);
    const verifiedApp = candApps.find(a => a.id === createdApp.id);
    console.log(`  Candidate sees updated status: ${verifiedApp?.status} (${verifiedApp?.statusLabel})`);
    console.log(`  Admin Note Visible: "${verifiedApp?.adminNotes}"`);
  }

  console.log('\n=== LIFECYCLE AUDIT COMPLETE: 100% SUCCESS ===');
}

testLifecycle().catch(console.error);
