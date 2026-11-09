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
  const allRes = await get('/api/jobs');
  console.log(`/api/jobs status: ${allRes.status}, count: ${allRes.json?.jobs?.length || 0}`);

  const compRes = await get('/api/jobs?category=company');
  console.log(`/api/jobs?category=company status: ${compRes.status}, count: ${compRes.json?.jobs?.length || 0}`);

  const govRes = await get('/api/jobs?category=govt');
  console.log(`/api/jobs?category=govt status: ${govRes.status}, count: ${govRes.json?.jobs?.length || 0}`);

  if (allRes.json?.jobs) {
    console.log('\nSample 5 job entries from live API:');
    allRes.json.jobs.slice(0, 5).forEach((j, i) => {
      console.log(`${i+1}. [${j.category}] ${j.title} (${j.totalPosts} জন, ${j.grade}, ${j.salary})`);
    });
  }
}

run();

