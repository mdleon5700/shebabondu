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

  const breakdown = [];
  let totalOpenings = 0;

  orgs.forEach((o, i) => {
    const openings = (o.govt_jobs || []).length;
    totalOpenings += openings;
    breakdown.push({
      index: i + 1,
      org: o.name_bn || o.name,
      short: o.short_name || o.code,
      openings
    });
  });

  console.log(`Total Organizations: ${orgs.length}`);
  console.log(`Total Individual Job Circulars (Openings): ${totalOpenings}`);
  console.log('\nTop 10 Organizations by Individual Job Openings:');
  breakdown.sort((a, b) => b.openings - a.openings).slice(0, 10).forEach(b => {
    console.log(`${b.index}. ${b.org} -> ${b.openings}টি আলাদা পদ`);
  });
}

run();

