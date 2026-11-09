const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${data.slice(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching org list from page 1 & 2...');
  const p1 = await fetchJson('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=20');
  const p2 = await fetchJson('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=2&limit=20');
  const orgs = [...p1.govtOrgJobs, ...p2.govtOrgJobs];
  console.log(`Fetched ${orgs.length} organizations.`);

  // Collect all govt_jobs
  const allJobs = [];
  orgs.forEach(o => {
    (o.govt_jobs || []).forEach(j => {
      allJobs.push({
        id: j.id,
        title: j.job_title,
        title_bn: j.job_title_bn,
        orgId: o.id,
        orgName: o.name,
        orgNameBn: o.name_bn,
        shortName: o.short_name,
        website: o.website,
        logo: o.logo
      });
    });
  });

  console.log(`Total individual jobs to fetch: ${allJobs.length}`);

  // Fetch details for first 5 jobs as a test
  console.log('Testing public-details for first 3 jobs:');
  for (let i = 0; i < 3; i++) {
    const job = allJobs[i];
    const detailsRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${job.id}`);
    console.log(`[Job ${job.id}] ${job.title}:`, {
      vacancy: detailsRes.details?.vacancy,
      deadline: detailsRes.details?.deadline_date,
      pdf: detailsRes.details?.advertisement_file,
      site: detailsRes.details?.application_site
    });
  }
}

run().catch(console.error);

