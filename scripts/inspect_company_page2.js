const https = require('https');

https.get('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=2&limit=20', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const json = JSON.parse(d);
    const companyOrgs = json.govtOrgJobs.filter(o => 
      o.name.includes('Limited') || 
      o.name.includes('Corporation') || 
      o.name.includes('Company') || 
      o.name.includes('Petrobangla') ||
      o.name.includes('Authority') ||
      o.name.includes('Institute')
    );
    console.log('Company / Corp / Autonomous orgs on page 2:');
    companyOrgs.forEach(o => {
      console.log(`- ID: ${o.id} | ${o.name} | Posts: ${o.govt_jobs ? o.govt_jobs.length : 0}`);
    });
  });
});

