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
  const orgs = [...p1.govtOrgJobs, ...p2.govtOrgJobs];
  
  let totalJobs = 0;
  const allIndividualJobs = [];
  
  orgs.forEach(o => {
    const list = o.govt_jobs || [];
    totalJobs += list.length;
    list.forEach(j => {
      allIndividualJobs.push({
        jobId: j.id,
        title: j.job_title,
        title_bn: j.job_title_bn,
        orgId: o.id,
        orgName: o.name,
        orgNameBn: o.name_bn
      });
    });
  });

  console.log(`Total Organizations: ${orgs.length}`);
  console.log(`Total Individual Job Posts / Openings: ${totalJobs}`);
  console.log('Sample 10 individual jobs:');
  console.log(allIndividualJobs.slice(0, 10));
}

run();

