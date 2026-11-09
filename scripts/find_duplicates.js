const fs = require('fs');
const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const jobs = Object.values(store.jobs || {});

const orgMap = {};
jobs.forEach(j => {
  const normOrg = (j.organization || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!orgMap[normOrg]) orgMap[normOrg] = [];
  orgMap[normOrg].push(j);
});

console.log('Duplicate check:');
for (const [normOrg, list] of Object.entries(orgMap)) {
  if (list.length > 1) {
    console.log(`\nOrg key: ${normOrg} has ${list.length} entries:`);
    list.forEach(j => {
      console.log(`- ID: ${j.id} | Title: ${j.title} | Positions: ${j.positions ? j.positions.length : 0} | PubStatus: ${j.publicationStatus}`);
    });
  }
}

