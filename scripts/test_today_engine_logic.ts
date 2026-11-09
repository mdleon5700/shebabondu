import { BangladeshDateHelper } from '../src/lib/feeds/timezone';
import { JobFeedEngine } from '../src/lib/feeds/engine';
import { JobCircular } from '../src/lib/types';

const parsed = BangladeshDateHelper.parseToIsoDate('৯ নভেম্বর ২০২৬');
console.log("Parse '৯ নভেম্বর ২০২৬':", parsed);

const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();
console.log('Today isoDate:', todayInfo.isoDate);

if (parsed === todayInfo.isoDate) {
  console.log('SUCCESS: Bengali date ৯ নভেম্বর ২০২৬ matches todayInfo.isoDate exactly!');
} else {
  console.error('MISMATCH:', parsed, 'vs', todayInfo.isoDate);
}

// Test sample job
const mockJob: Partial<JobCircular> = {
  id: 'test-job-today',
  title: 'সহকারী প্রোগ্রামার পদে নিয়োগ বিজ্ঞপ্তি ২০২৬',
  organization: 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
  category: 'govt',
  grade: '৯ম গ্রেড',
  totalPosts: 5,
  salary: '২২,০০০ - ৫৩,০৬০ টাকা',
  minEducation: 'বিএসসি ইন সিএসই',
  minAge: 18,
  maxAge: 32,
  districts: 'সকল জেলা',
  deadline: '৩০ নভেম্বর ২০২৬',
  daysRemaining: 21,
  publishedDate: '৯ নভেম্বর ২০২৬',
  status: 'published'
};

const feed = JobFeedEngine.getFeed([mockJob as JobCircular], { feedType: 'today' });
console.log('Feed result count for today:', feed.total);
console.log('Feed jobs:', feed.jobs.map(j => ({ id: j.id, title: j.title })));

