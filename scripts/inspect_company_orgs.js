const https = require('https');

https.get('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=20', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const json = JSON.parse(d);
    // Find CPGCBL, BCSL, APSCL, Petrobangla, BCIC
    const companyOrgs = json.govtOrgJobs.filter(o => 
      o.name.includes('Limited') || 
      o.name.includes('Corporation') || 
      o.name.includes('Company') || 
      o.name.includes('Authority')
    );
    console.log('Company / Corp orgs found on page 1:');
    companyOrgs.forEach(o => {
      console.log(JSON.stringify(o, null, 2));
    });
  });
});

