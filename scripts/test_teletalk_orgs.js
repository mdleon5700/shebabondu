const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

https.get('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=50', { agent }, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Total orgs in org-list:', json.govtOrgJobs.length);
    json.govtOrgJobs.slice(0, 20).forEach((org, idx) => {
      const firstJobId = org.govt_jobs && org.govt_jobs[0] ? org.govt_jobs[0].id : 'N/A';
      console.log((idx + 1) + '. ID: ' + org.id + ' | Name: ' + org.name + ' | Short: ' + org.short_name + ' | Jobs: ' + (org.govt_jobs ? org.govt_jobs.length : 0) + ' | FirstJobId: ' + firstJobId);
    });
  });
});

