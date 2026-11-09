const fs = require('fs');
const db = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const categories = db.categories || [];
console.log('Total categories in DB:', categories.length);
const rootCategories = categories.filter(c => !c.parent_id);
const subCategories = categories.filter(c => c.parent_id);
console.log('Root categories count:', rootCategories.length);
console.log('Sub-categories count:', subCategories.length);

console.log('\n--- ROOT CATEGORIES ---');
rootCategories.forEach((c, i) => {
  console.log(`${i+1}. id: ${c.id}, name_bn: ${c.name_bn}, slug: ${c.slug}, icon: ${c.icon}, active: ${c.is_active}`);
});

console.log('\n--- SUB CATEGORIES ---');
subCategories.forEach((c, i) => {
  console.log(`${i+1}. id: ${c.id}, parent: ${c.parent_id}, name_bn: ${c.name_bn}, slug: ${c.slug}`);
});

