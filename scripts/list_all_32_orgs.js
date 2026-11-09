const https = require('https');

function getOrgList(page) {
  return new Promise((resolve) => {
    https.get(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=${page}&limit=20`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
  });
}

async function run() {
  const p1 = await getOrgList(1);
  const p2 = await getOrgList(2);
  const all = [...p1.govtOrgJobs, ...p2.govtOrgJobs];
  console.log(`Total organizations: ${all.length}`);
  all.forEach((org, idx) => {
    console.log(`${idx + 1}. ID: ${org.id} | ${org.name} | BN: ${org.name_bn || 'N/A'} | Short: ${org.short_name || 'N/A'} | Web: ${org.website || 'N/A'} | Posts: ${org.govt_jobs ? org.govt_jobs.length : 0}`);
  });
}

run();

