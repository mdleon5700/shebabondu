import { serverDB } from '../src/lib/db';
import { JobFeedEngine } from '../src/lib/feeds/engine';

const jobs = serverDB.getPublicJobs();
const placements = serverDB.getFeaturedPlacements();

console.log('Total public jobs:', jobs.length);
const feed = JobFeedEngine.getFeed(jobs, { feedType: 'featured', limit: 9 }, placements);

console.log('Featured feed total count:', feed.total);
console.log('Page size:', feed.jobs.length);
console.log('Total pages:', feed.totalPages);
console.log('\nTop 5 featured jobs on Page 1:');
feed.jobs.slice(0, 5).forEach((j, i) => {
  console.log(`${i + 1}. ${j.title} | ${j.organization} | Posts: ${j.totalPosts} | Grade: ${j.grade}`);
});

