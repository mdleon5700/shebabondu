const fs = require('fs');
const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const categories = store.categories || {};
console.log('Categories count:', Object.keys(categories).length);
console.log(JSON.stringify(Object.values(categories), null, 2));

