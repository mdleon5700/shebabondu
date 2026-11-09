const https = require('https');

function test(url) {
  return new Promise((resolve) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ url, status: res.statusCode, body: d.slice(0, 300) }));
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

async function run() {
  const tests = [
    'https://alljobs.teletalk.com.bd/api/v1/govt-jobs/details?id=15178',
    'https://alljobs.teletalk.com.bd/api/v1/govt-jobs/15178',
    'https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=15178',
    'https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-wise-job-list?orgId=1171',
    'https://alljobs.teletalk.com.bd/api/v1/govt-jobs/view?id=15178'
  ];

  for (const t of tests) {
    const res = await test(t);
    console.log(res);
  }
}

run();

