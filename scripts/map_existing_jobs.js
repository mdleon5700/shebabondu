const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../src/db/local_store.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const jobs = Object.values(db.jobs || {});

console.log(`Total jobs in DB: ${jobs.length}`);
jobs.forEach((j, i) => {
  console.log(`${i+1}. ID: ${j.id} | Org: ${j.organization} | OfficialLink: ${j.officialLink} | Positions: ${j.positions?.length || 0}`);
});

