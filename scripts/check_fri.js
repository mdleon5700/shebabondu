const fs = require('fs');
const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const fri = store.jobs['job-teletalk-15178'];
console.log('FRI entry:', { id: fri?.id, org: fri?.organization, title: fri?.title, positions: fri?.positions?.length, totalPosts: fri?.totalPosts });
if (fri?.positions) {
  console.log('Positions sample:', fri.positions.slice(0, 3));
}

