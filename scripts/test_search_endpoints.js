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
    'https://alljobs.teletalk.com.bd/api/v1/jobs/search?q=company',
    'https://alljobs.teletalk.com.bd/api/v1/govt-jobs/search?q=company',
    'https://alljobs.teletalk.com.bd/api/v1/jobs/search?keyword=company',
    'https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=50&search=company',
    'https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=50&search=ltd'
  ];

  for (const t of tests) {
    const res = await test(t);
    console.log(res);
  }
}

run();

