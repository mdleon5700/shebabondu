import { JobCircular } from '../src/lib/types';
import store from '../src/db/local_store.json';

function normalizeBangla(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFC')
    .replace(/\u09af\u09bc/g, '\u09df') // য়
    .replace(/\u09a1\u09bc/g, '\u09dc') // ড়
    .replace(/\u09a2\u09bc/g, '\u09dd'); // ঢ়
}

const w1 = normalizeBangla('রেলওয়ে');
const w2 = normalizeBangla('রেলওয়ে');

console.log('w1 === w2:', w1 === w2); // Should be TRUE!

const jobs: any[] = Object.values(store.jobs || {});
const railwayJobs = jobs.filter(j => {
  const corpus = normalizeBangla((j.title + ' ' + j.organization + ' ' + (j.categoryLabel || '') + ' ' + j.category).toLowerCase());
  return corpus.includes('railway') || corpus.includes('রেল') || corpus.includes(w1);
});
console.log('Normalized Railway Jobs found:', railwayJobs.length);

