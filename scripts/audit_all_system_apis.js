const http = require('http');

function testEndpoint(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: encodeURI(path),
      method: method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AuditRunner/1.0',
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
          path,
          method,
          status: res.statusCode,
          headers: res.headers,
          dataLength: data.length,
          isJson: json !== null,
          json
        });
      });
    });
    req.on('error', (err) => {
      resolve({ path, method, status: 'ERROR', error: err.message });
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runAudit() {
  console.log('=== SYSTEM API ENDPOINTS AUDIT ===\n');

  const tests = [
    // Public APIs
    ['GET', '/api/jobs', null, {}],
    ['GET', '/api/jobs?category=govt', null, {}],
    ['GET', '/api/jobs?status=open', null, {}],
    ['GET', '/api/jobs?search=পেট্রোবাংলা', null, {}],
    ['GET', '/api/jobs/job-ai-gov-fcfec3', null, {}],
    ['GET', '/api/jobs/job-ai-bogmc-14989', null, {}],
    ['GET', '/api/jobs/job-ai-bcic-14936', null, {}],
    ['GET', '/api/jobs/non-existent-circular-id', null, {}],
    ['GET', '/api/categories', null, {}],
    
    // Admin APIs (with Admin Secret Header)
    ['GET', '/api/admin/stats', null, { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }],
    ['GET', '/api/admin/jobs', null, { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }],
    ['GET', '/api/admin/jobs/job-ai-gov-fcfec3', null, { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }],
    ['GET', '/api/admin/jobs/job-ai-bogmc-14989', null, { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }],
    ['GET', '/api/admin/candidates', null, { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }],
    ['GET', '/api/admin/applications', null, { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' }]
  ];

  const results = [];
  for (const [method, p, body, headers] of tests) {
    const res = await testEndpoint(method, p, body, headers);
    const pass = (p.includes('non-existent') ? res.status === 404 : res.status === 200);
    results.push({
      Method: method,
      Endpoint: p,
      Status: res.status,
      Passed: pass ? 'YES' : 'NO',
      Summary: res.json 
        ? (res.json.total !== undefined ? `total: ${res.json.total}` : (Array.isArray(res.json) ? `count: ${res.json.length}` : (res.json.id ? `id: ${res.json.id}` : (res.json.error || 'OK'))))
        : `bytes: ${res.dataLength}`
    });
  }

  console.table(results);
  const failed = results.filter(r => r.Passed === 'NO');
  console.log(`\nTotal Tested: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log('Failed Endpoints:', failed);
  }
}

runAudit().catch(console.error);
