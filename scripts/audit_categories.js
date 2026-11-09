const fs = require('fs');

const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const jobs = Object.values(store.jobs || {});

console.log('Total jobs in local_store:', jobs.length);
const catCount = {};
jobs.forEach(j => {
  const cat = j.category || 'uncategorized';
  catCount[cat] = (catCount[cat] || 0) + 1;
});
console.log('Category distribution:', catCount);

console.log('\nAll Organizations & Categories:');
jobs.forEach((j, idx) => {
  console.log(`${idx + 1}. [${j.category}] ${j.organization} (ID: ${j.id}) | Positions: ${j.positions ? j.positions.length : 0} | Vacancies: ${j.vacancies || 0} | Apply: ${j.applicationUrl || j.sourceUrl}`);
});
