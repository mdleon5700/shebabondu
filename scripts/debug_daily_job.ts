import { serverDB } from '../src/lib/db';
import { JobFeedEngine } from '../src/lib/feeds/engine';
import { BangladeshDateHelper } from '../src/lib/feeds/timezone';

const testJobId = 'test-daily-job-reactive-audit-2';
const testJob = {
  id: testJobId,
  title: 'সহকারী পরিচালক (প্রকৌশল) পদে বিশেষ নিয়োগ ২০২৬',
  organization: 'বাংলাদেশ পেট্রোলিয়াম কর্পোরেশন (BPC)',
  logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=120&q=80',
  category: 'govt' as const,
  categoryLabel: 'সরকারি চাকরি',
  grade: '৯ম গ্রেড',
  totalPosts: 5,
  salary: '২২,০০০ - ৫৩,০৬০ টাকা',
  minEducation: 'বিএসসি ইঞ্জিনিয়ারিং',
  minAge: 18,
  maxAge: 32,
  districts: 'সকল জেলা',
  deadline: '২৮ নভেম্বর ২০২৬',
  daysRemaining: 19,
  publishedDate: '৭ নভেম্বর ২০২৬',
  createdAt: '2026-11-07T10:00:00.000Z',
  status: 'published' as const,
  verificationStatus: 'VERIFIED' as const,
  circularImage: '',
  audioSummary: '',
  requirements: ['বিএসসি ইঞ্জিনিয়ারিং ডিগ্রি'],
  officialLink: 'https://bpc.teletalk.com.bd',
  serviceFee: 60,
  govtFee: 223
};

serverDB.saveJob(testJob, 'ADMIN');

const jobs = serverDB.getPublicJobs();
const saved = jobs.find(j => j.id === testJobId);
console.log('Is saved found in getPublicJobs?:', !!saved);

const parsedIso = BangladeshDateHelper.parseToIsoDate(testJob.publishedDate);
console.log('Parsed ISO date for publishedDate:', parsedIso);

const feedResult = JobFeedEngine.getFeed(jobs, { feedType: 'daily', date: '2026-11-07', limit: 9 });
console.log('Feed result total for 2026-11-07:', feedResult.total, 'feed jobs length:', feedResult.jobs.length);

serverDB.deleteJob(testJobId, 'ADMIN');
console.log('Cleaned up.');

