const http = require('http');

function testParseUrl(url) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ pdfUrl: url });
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/gemini/parse-circular',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(d) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: d.substring(0, 200) });
        }
      });
    });
    req.on('error', err => resolve({ status: 'ERROR', error: err.message }));
    req.write(body);
    req.end();
  });
}

async function runTests() {
  const urls = [
    'https://alljobs.teletalk.com.bd/jobs/government/15176',
    'https://alljobs.teletalk.com.bd/jobs/government/459?jobId=15127',
    'https://alljobs.teletalk.com.bd/jobs/all/14989',
    'https://bogmc.teletalk.com.bd/',
    'https://alljobs.teletalk.com.bd/jobs/government/14936',
    'https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=15160'
  ];

  for (const u of urls) {
    console.log(`\nTesting URL: ${u}`);
    const t0 = Date.now();
    const res = await testParseUrl(u);
    const ms = Date.now() - t0;
    console.log(` -> HTTP ${res.status} (${ms}ms)`);
    if (res.json?.success) {
      const ext = res.json.extracted;
      console.log(`    Success: ${res.json.success}`);
      console.log(`    Title: ${ext?.title}`);
      console.log(`    Organization: ${ext?.organization}`);
      console.log(`    Total Posts: ${ext?.totalPosts}`);
      console.log(`    Deadline: ${ext?.deadline}`);
      console.log(`    Positions: ${ext?.positions?.length || 0}`);
      console.log(`    First Position:`, ext?.positions?.[0]?.title, 'Posts:', ext?.positions?.[0]?.posts);
    } else {
      console.log(`    Error:`, res.json?.error || res.raw || res.error);
    }
  }
}

runTests().catch(console.error);

