const fs = require('fs');

const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
console.log('Top level keys in local_store.json:');
for (const [k, v] of Object.entries(store)) {
  if (Array.isArray(v)) {
    console.log(`- ${k}: Array (${v.length} items)`);
  } else if (typeof v === 'object' && v !== null) {
    console.log(`- ${k}: Object (${Object.keys(v).length} keys)`);
  } else {
    console.log(`- ${k}: ${typeof v}`);
  }
}

