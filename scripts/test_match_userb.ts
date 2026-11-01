import { SyntheticUserManager } from '../src/lib/testing/synthetic/synthetic-user-manager';
import { SmartJobMatchingEngine } from '../src/lib/matching/engine';

const sylhet = SyntheticUserManager.getSyntheticUsersByDistrict('SYLHET')[0];
const khulna = SyntheticUserManager.getSyntheticUsersByDistrict('KHULNA')[0];

const sylhetJob = {
  id: 'JOB-ALERT-SIM-SYL-002',
  title: 'উপজেলা সমাজসেবা কর্মকর্তা (সিলেট জেলা কোটা)',
  organization: 'সমাজসেবা অধিদপ্তর',
  category: 'বিসিএস ও সরকারি চাকরি',
  minEducation: 'যেকোনো বিষয়',
  location: 'সিলেট',
  districts: 'সিলেট',
  ageLimit: '১৮-৩০ বছর',
  publishedDate: new Date().toISOString(),
  deadline: '2026-12-31'
};

const sylhetMatch = SmartJobMatchingEngine.evaluateMatch(sylhet as any, sylhetJob as any);
const khulnaMatch = SmartJobMatchingEngine.evaluateMatch(khulna as any, sylhetJob as any);

console.log('Sylhet location score:', sylhetMatch.breakdown.location.score, 'status:', sylhetMatch.breakdown.location.status);
console.log('Sylhet eligibility:', sylhetMatch.eligibilityStatus);
console.log('Khulna location score:', khulnaMatch.breakdown.location.score, 'status:', khulnaMatch.breakdown.location.status);
console.log('Khulna eligibility:', khulnaMatch.eligibilityStatus);
