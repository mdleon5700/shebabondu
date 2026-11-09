const fs = require('fs');
const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
console.log('Top level keys:', Object.keys(store));
if (Array.isArray(store)) {
  console.log('Store is an array with length:', store.length);
} else {
  for (const k of Object.keys(store)) {
    if (Array.isArray(store[k])) {
      console.log(`Key ${k} is array of length ${store[k].length}`);
    } else if (typeof store[k] === 'object' && store[k] !== null) {
      console.log(`Key ${k} is object with keys:`, Object.keys(store[k]).slice(0, 10));
    }
  }
}

