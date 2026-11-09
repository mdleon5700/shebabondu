import fs from 'fs';
import path from 'path';

const storePath = path.resolve(process.cwd(), 'src/db/local_store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const jobs = Object.values(store.jobs || {}) as any[];

const cats: Record<string, number> = {};
const totalVacanciesByCat: Record<string, number> = {};
let totalPostsCount = 0;
let totalVacanciesCount = 0;

jobs.forEach(j => {
  const cat = j.category || 'other';
  cats[cat] = (cats[cat] || 0) + 1;
  const vac = j.totalPosts || 0;
  totalVacanciesByCat[cat] = (totalVacanciesByCat[cat] || 0) + vac;
  totalPostsCount += (j.positions ? j.positions.length : 0);
  totalVacanciesCount += vac;
});

console.log('=== UPDATED DATABASE SUMMARY ===');
console.log(`Total Curated Organizations: ${jobs.length}`);
console.log(`Total Designations / Positions: ${totalPostsCount}`);
console.log(`Total Vacancies: ${totalVacanciesCount}`);
console.log('\nOrganization Count by Category:', cats);
console.log('Vacancies by Category:', totalVacanciesByCat);

console.log('\n=== COMPANY & AUTONOMOUS JOBS AUDIT ===');
const companyJobs = jobs.filter(j => j.category === 'company');
companyJobs.forEach((j, idx) => {
  console.log(`${idx + 1}. [${j.categoryLabel}] ${j.organization}`);
  console.log(`   - Org Type: ${j.orgType} | Sub-Category: ${j.subCategory}`);
  console.log(`   - Positions: ${j.positions?.length || 0} | Total Vacancies: ${j.totalPosts}`);
  console.log(`   - Apply URL: ${j.applicationUrl || j.officialLink}`);
  console.log(`   - Notes: ${j.officialNotes || j.verificationNotes}`);
  console.log('');
});

