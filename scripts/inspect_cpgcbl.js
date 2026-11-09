const fs = require('fs');
const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const cpgcbl = store.jobs['job-ai-cpgcbl-dfc0e2'];
console.log('CPGCBL top-level keys & values:');
for (const [k, v] of Object.entries(cpgcbl)) {
  if (k === 'positions') {
    console.log(`positions: array of ${v.length} items. Sample position 0:`, v[0]);
  } else {
    console.log(`${k}: ${JSON.stringify(v)}`);
  }
}

