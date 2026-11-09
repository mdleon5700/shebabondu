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
  const p2 = await get('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=2&limit=20');
  const orgs = p2.govtOrgJobs || [];
  console.log(`Page 2 Orgs Count: ${orgs.length}`);
  
  for (let i = 0; i < orgs.length; i++) {
    const o = orgs[i];
    const firstJob = o.govt_jobs && o.govt_jobs[0];
    if (!firstJob) continue;
    const detRes = await get('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=' + firstJob.id);
    const d = detRes.details;
    console.log(`\n--- Org ${i+21}: ${o.name_bn || o.name} (${o.short_name}) ---`);
    console.log(`Deadline: ${d?.deadline_date}`);
    console.log(`Published: ${d?.advertisement_published_date || d?.published_date}`);
    console.log(`Site: ${d?.application_site}`);
    console.log(`Ad File: ${d?.advertisement_file}`);
    console.log(`Sub-jobs Count: ${o.govt_jobs.length}`);
    console.log(`Positions:`);
    o.govt_jobs.slice(0, 5).forEach(gj => {
      console.log(` - ID: ${gj.id} | Title: ${gj.job_title_bn || gj.job_title} | Vacancy: ${gj.vacancy}`);
    });
    if (o.govt_jobs.length > 5) {
      console.log(` ... and ${o.govt_jobs.length - 5} more positions`);
    }
  }
}

run().catch(console.error);

