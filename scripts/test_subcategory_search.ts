import { serverDB } from '../src/lib/db';

const allJobs = serverDB.getPublicJobs().filter(j => !j.id?.startsWith('draft-'));

const ministryJobs = allJobs.filter(j => {
  const text = ((j.organization || '') + ' ' + (j.title || '')).toLowerCase();
  return text.includes('মন্ত্রণালয়') || text.includes('মন্ত্রণালয়') || text.includes('সচিবালয়') || text.includes('সচিবালয়');
});

console.log('Ministry jobs count in DB:', ministryJobs.length);
ministryJobs.forEach(j => console.log(`- [${j.organization}] ${j.title}`));

const bankJobs = allJobs.filter(j => {
  const text = ((j.organization || '') + ' ' + (j.title || '') + ' ' + (j.category || '')).toLowerCase();
  return text.includes('ব্যাংক') || text.includes('bank');
});
console.log('Bank jobs count in DB:', bankJobs.length);
bankJobs.forEach(j => console.log(`- [${j.organization}] ${j.title}`));
