const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function inspectAll20() {
  const orgListRes = await fetchJson('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=50');
  const orgs = orgListRes.govtOrgJobs.slice(0, 20);
  console.log(`Found ${orgs.length} orgs.`);

  for (let i = 0; i < orgs.length; i++) {
    const org = orgs[i];
    const firstJob = org.govt_jobs && org.govt_jobs[0];
    const jobId = firstJob ? firstJob.id : null;
    let detail = null;
    if (jobId) {
      try {
        const detailRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${jobId}`);
        detail = detailRes.details;
      } catch (e) {
        console.error(`Error fetching detail for job ${jobId}:`, e.message);
      }
    }
    console.log(`[${i+1}/20] Org: ${org.name} | Short: ${org.short_name} | Jobs Count: ${org.govt_jobs?.length} | FirstJobId: ${jobId} | Portal: ${detail?.application_site || 'N/A'} | Deadline: ${detail?.deadline_date || 'N/A'}`);
  }
}

inspectAll20().catch(console.error);

