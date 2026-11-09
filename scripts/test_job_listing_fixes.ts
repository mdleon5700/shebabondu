import { matchGradeComprehensive, parseSalaryRange } from '../src/lib/search-helper';
import fs from 'fs';
import path from 'path';

const raw = fs.readFileSync(path.join(__dirname, '../src/db/local_store.json'), 'utf-8');
const data = JSON.parse(raw);
const jobs = Object.values(data.jobs || {}) as any[];

console.log('Testing Job Listing Engine with', jobs.length, 'jobs:');

// Test Grade Matching
const g9 = jobs.filter(j => matchGradeComprehensive(j.grade, '৯ম গ্রেড'));
const g10 = jobs.filter(j => matchGradeComprehensive(j.grade, '১০ম গ্রেড'));
const g11_16 = jobs.filter(j => matchGradeComprehensive(j.grade, '১১তম - ১৬তম'));
const g17_20 = jobs.filter(j => matchGradeComprehensive(j.grade, '১৭তম - ২০তম'));

console.log('9th Grade matched:', g9.length);
console.log('10th Grade matched:', g10.length);
console.log('11th-16th Grade matched:', g11_16.length);
console.log('17th-20th Grade matched:', g17_20.length);

if (g11_16.length === 0 || g17_20.length === 0) {
  console.error('FAIL: Grade 11-16 or 17-20 matched 0 jobs!');
  process.exit(1);
}

// Test Engineering Filter
const eng = jobs.filter(job => {
  return (
    job.category === 'engineer' || 
    job.title.includes('প্রকৌশলী') || 
    job.title.includes('ইঞ্জিনিয়ার') ||
    (job.positions && job.positions.some((p: any) => p.title?.includes('প্রকৌশলী') || p.title?.includes('ইঞ্জিনিয়ার')))
  );
});

console.log('Engineering jobs matched:', eng.length);
if (eng.length === 0) {
  console.error('FAIL: Engineering matched 0 jobs!');
  process.exit(1);
}

// Test IT Filter
const it = jobs.filter(job => {
  return (
    job.category === 'engineer' || 
    job.title.includes('কম্পিউটার') || 
    job.title.includes('আইটি') || 
    job.title.includes('ডাটা') || 
    job.title.includes('Data') || 
    job.title.includes('প্রোগ্রামার') ||
    (job.positions && job.positions.some((p: any) => p.title?.includes('কম্পিউটার') || p.title?.includes('আইটি') || p.title?.includes('ডাটা') || p.title?.includes('প্রোগ্রামার')))
  );
});

console.log('IT/Computer jobs matched:', it.length);
if (it.length === 0) {
  console.error('FAIL: IT matched 0 jobs!');
  process.exit(1);
}

console.log('ALL JOB LISTING ENGINE TESTS PASSED SUCCESSFULLY!');
