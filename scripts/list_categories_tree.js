const fs = require('fs');
const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const categories = Object.values(store.categories || {});
const topLevel = categories.filter(c => !c.parent_id);
console.log('Top level categories:');
topLevel.forEach(c => console.log(`- ${c.id}: ${c.name_bn} (${c.name_en}) [slug: ${c.slug}]`));
const subs = categories.filter(c => c.parent_id);
console.log('\nSubcategories:');
subs.forEach(c => console.log(`- ${c.id} (parent: ${c.parent_id}): ${c.name_bn} [slug: ${c.slug}]`));

