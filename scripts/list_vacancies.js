const fs = require('fs');
const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const jobs = Object.values(store.jobs || {});

console.log(`Total jobs: ${jobs.length}`);
jobs.forEach((j, i) => {
  console.log(`${i+1}. [${j.category}] ${j.organization} (ID: ${j.id}) -> Posts: ${j.positions ? j.positions.length : 0} | Total Vacancies: ${j.totalPosts || 0}`);
});

