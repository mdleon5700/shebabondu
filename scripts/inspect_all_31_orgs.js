const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  const p1 = await get('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=20');
  const p2 = await get('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=2&limit=20');
  const allOrgs = [...p1.govtOrgJobs, ...p2.govtOrgJobs];
  console.log('Total Organizations:', allOrgs.length);
  for (let i = 0; i < allOrgs.length; i++) {
    const o = allOrgs[i];
    const firstJob = o.govt_jobs && o.govt_jobs[0];
    if (!firstJob) {
      console.log(`${i+1}. ${o.name} (No jobs!)`);
      continue;
    }
    const detRes = await get('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=' + firstJob.id);
    const d = detRes.details;
    console.log(`${i+1}. [Org ${o.id}] ${o.name_bn || o.name} (${o.short_name}) | SubJobs: ${o.govt_jobs.length} | FirstJob: ${firstJob.id} | Deadline: ${d?.deadline_date} | Published: ${d?.advertisement_published_date || d?.published_date} | Site: ${d?.application_site}`);
  }
}

run().catch(console.error);

