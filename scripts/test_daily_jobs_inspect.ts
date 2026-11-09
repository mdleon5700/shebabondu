import { serverDB } from '../src/lib/db';
import { JobFeedEngine } from '../src/lib/feeds/engine';
import { BangladeshDateHelper } from '../src/lib/feeds/timezone';

async function main() {
  const jobs = serverDB.getPublicJobs();
  console.log('Total public jobs:', jobs.length);
  
  const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();
  console.log('Bangladesh today:', todayInfo.isoDate, todayInfo.dateBn);

  const archives = JobFeedEngine.getDailyArchiveDates(jobs, 30);
  console.log('Total archives generated:', archives.length);

  const populated = archives.filter(a => a.jobCount > 0);
  console.log('Days with jobs:', populated.length);
  populated.slice(0, 10).forEach(a => {
    console.log(`  Date: ${a.date} | ${a.date_bn} => ${a.jobCount} jobs`);
  });

  // Test feed on populated date e.g. 2026-11-08 or 2026-11-10 or 2026-11-05
  const samplePopulatedDate = populated[0]?.date || '2026-11-05';
  const feedResult = JobFeedEngine.getFeed(jobs, { feedType: 'daily', date: samplePopulatedDate, limit: 9 });
  console.log(`Feed result for ${samplePopulatedDate}:`, feedResult.total, 'jobs found, page count:', feedResult.jobs.length);

  // Test feed on an empty date e.g. 2026-11-07
  const emptyDate = '2026-11-07';
  const emptyFeed = JobFeedEngine.getFeed(jobs, { feedType: 'daily', date: emptyDate, limit: 9 });
  console.log(`Feed result for empty date ${emptyDate}:`, emptyFeed.total, 'jobs found');
}

main().catch(console.error);
