import { BangladeshDateHelper } from '../src/lib/feeds/timezone';
import { serverDB } from '../src/lib/db';
import { JobFeedEngine } from '../src/lib/feeds/engine';

const today = BangladeshDateHelper.getBangladeshTodayDate();
console.log('Bangladesh Today:', today);

const jobs = serverDB.getPublicJobs();
const feed = JobFeedEngine.getFeed(jobs, { feedType: 'today' });
console.log('Total jobs matched for today (' + today.isoDate + '):', feed.total);
console.log('Jobs list count:', feed.jobs.length);
feed.jobs.forEach(j => {
  console.log(' - Title:', j.title.slice(0, 50), '| PublishedDate:', j.publishedDate, '| Org:', j.organization);
});

