import { serverDB } from '../src/lib/db';
import { CentralDeadlineEngine } from '../src/lib/deadlines/engine';

const jobs = serverDB.getPublicJobs();
console.log('Total jobs:', jobs.length);

const currentMatches = [];
for (const job of jobs) {
  const revisions = serverDB.getDeadlineRevisions(job.id);
  const evalResult = CentralDeadlineEngine.evaluateDeadline(job);

  if (evalResult.status === 'EXTENDED' || revisions.length > 0 || (job.deadline && (job.deadline.includes('বৃদ্ধি') || job.deadline.includes('বর্ধিত')))) {
    currentMatches.push(job);
  }
}

console.log('Currently matching updated jobs:', currentMatches.length);

const hasCorrigendumWord = jobs.filter(j => 
  j.title?.includes('সংশোধিত') || 
  j.title?.includes('সংশোধনী') || 
  j.bengaliDescription?.includes('সংশোধিত') || 
  j.bengaliDescription?.includes('সংশোধনী') ||
  (j as any).hasCorrigendum
);
console.log('Jobs mentioning সংশোধিত / সংশোধনী:', hasCorrigendumWord.length);

