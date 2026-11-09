import { serverDB } from '../src/lib/db';
import { JobTaxonomyClassifier } from '../src/lib/taxonomy/classifier';

const allCategories = serverDB.getCategories().filter(c => c.is_active);
const allJobs = serverDB.getPublicJobs().filter(j => !j.id?.startsWith('draft-'));

const counts: Record<string, number> = {};
for (const cat of allCategories) {
  counts[cat.id] = 0;
}

for (const job of allJobs) {
  const cl = JobTaxonomyClassifier.classify(job);
  const catSlug = (job.category || '').toLowerCase();

  for (const cat of allCategories) {
    let matched = false;
    if (cat.parent_id) {
      if (
        cl.subcategories.includes(cat.id) ||
        cl.subcategories.includes(cat.slug) ||
        cl.subcategories.includes(cat.id.replace('cat-', ''))
      ) {
        matched = true;
      }
    } else {
      if (
        cl.primaryCategory === cat.id ||
        cl.categorySlug === cat.slug ||
        catSlug === cat.slug ||
        catSlug === cat.id.replace('cat-', '') ||
        cl.subcategories.includes(cat.id)
      ) {
        matched = true;
      }
    }
    if (matched) counts[cat.id] = (counts[cat.id] || 0) + 1;
  }
}

console.log('--- 20 ROOT CATEGORIES ---');
allCategories.filter(c => !c.parent_id).forEach((c, i) => {
  console.log(`${i+1}. [${c.id}] ${c.name_bn} (${c.slug}): ${counts[c.id]} jobs`);
});

console.log('\n--- 7 SUB-CATEGORIES ---');
allCategories.filter(c => c.parent_id).forEach((c, i) => {
  console.log(`${i+1}. [${c.id}] ${c.name_bn} (Parent: ${c.parent_id}) -> ${counts[c.id]} jobs`);
});
