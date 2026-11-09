import { DEFAULT_TAXONOMY_CATEGORIES } from '../src/lib/taxonomy/defaults';
import { serverDB } from '../src/lib/db';

const dbCats = serverDB.getCategories();
const roots = dbCats.filter(c => !c.parent_id);
const subs = dbCats.filter(c => c.parent_id);

console.log('Total categories in serverDB:', dbCats.length);
console.log('Total root categories:', roots.length);
console.log('Total sub-categories:', subs.length);

console.log('\n--- ROOT CATEGORIES (' + roots.length + ') ---');
roots.forEach((c, i) => {
  console.log((i+1) + '. [' + c.id + '] ' + c.name_bn + ' (' + c.name_en + ') -> slug: ' + c.slug + ' | icon: ' + c.icon);
});

console.log('\n--- SUB CATEGORIES (' + subs.length + ') ---');
subs.forEach((c, i) => {
  console.log((i+1) + '. [' + c.id + '] ' + c.name_bn + ' (Parent: ' + c.parent_id + ') -> slug: ' + c.slug);
});

