const https = require('https');

function testEndpoint(path) {
  return new Promise((resolve) => {
    const url = 'https://alljobs.teletalk.com.bd' + path;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ path, status: res.statusCode, length: data.length, body: data.slice(0, 400) });
      });
    }).on('error', err => resolve({ path, error: err.message }));
  });
}

async function run() {
  const paths = [
    '/api/v1/private-jobs/recruiter-hot-list',
    '/api/v1/private-jobs/hot-list',
    '/api/v1/private-jobs/cat-list?page=1&limit=50',
    '/api/v1/job-utilities-categories/list',
    '/api/v1/private-jobs/list?skipLimit=YES',
    '/api/v1/private-jobs/recruiter-list?page=1&limit=50',
    '/api/v1/private-jobs?skipLimit=YES'
  ];

  for (const p of paths) {
    const res = await testEndpoint(p);
    console.log(`[${res.status}] ${res.path} -> ${res.length} bytes: ${res.body}`);
  }
}

run();

