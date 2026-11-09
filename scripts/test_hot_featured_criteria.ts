import { serverDB } from '../src/lib/db';

const jobs = serverDB.getPublicJobs();
console.log('Total jobs:', jobs.length);

const highVacancy = jobs.filter(j => (j.totalPosts || 0) >= 20);
console.log('Jobs with 20+ posts:', highVacancy.length);

const sortedByPosts = [...jobs].sort((a, b) => (b.totalPosts || 0) - (a.totalPosts || 0));
console.log('\nTop 10 jobs by vacancies:');
sortedByPosts.slice(0, 10).forEach(j => {
  console.log(`- [${j.totalPosts} posts] ${j.title} | ${j.organization} | Grade: ${j.grade} | Category: ${j.category}`);
});

const grade9or10 = jobs.filter(j => j.grade?.includes('৯ম') || j.grade?.includes('১০ম'));
console.log('\nJobs with 9th or 10th grade:', grade9or10.length);

