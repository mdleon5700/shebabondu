const http = require('http');

function get(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ path, status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          resolve({ path, status: res.statusCode, body: data.slice(0, 200) });
        }
      });
    }).on('error', err => resolve({ path, error: err.message }));
  });
}

async function run() {
  const compRes = await get('/api/jobs?category=company');
  console.log(`\n/api/jobs?category=company status: ${compRes.status}, count: ${compRes.json?.jobs?.length || 0}`);
  if (compRes.json?.jobs) {
    compRes.json.jobs.forEach((j, i) => {
      console.log(`${i+1}. [${j.category}] ${j.organization} - ${j.totalPosts} vacancies`);
    });
  }

  const privRes = await get('/api/jobs?category=private');
  console.log(`\n/api/jobs?category=private status: ${privRes.status}, count: ${privRes.json?.jobs?.length || 0}`);

  const govRes = await get('/api/jobs?category=govt');
  console.log(`\n/api/jobs?category=govt status: ${govRes.status}, count: ${govRes.json?.jobs?.length || 0}`);
}

run();

