const { SyntheticUserManager } = require('../src/lib/testing/synthetic/synthetic-user-manager');
const { SmartJobMatchingEngine } = require('../src/lib/matching/engine');
const { PersonalizedRecommender } = require('../src/lib/matching/recommender');
const { SyntheticJobManager } = require('../src/lib/testing/synthetic/synthetic-job-manager');

const testJobId = 'SYNTH-JOB-E2E-PUBLISH-MATCH-01';
const newJob = {
  id: testJobId,
  title: 'সিনিয়র সহকারী প্রোগ্রামার (আইসিটি বিভাগ)',
  organization: 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
  category: 'govt',
  categoryLabel: 'সরকারি চাকরি',
  minEducation: 'সিএসই বা আইসিটিতে ৪ বছর মেয়াদি স্নাতক (সম্মান)',
  requirements: [
    'সিএসই বা আইসিটিতে ৪ বছর মেয়াদি স্নাতক (সম্মান)',
    'বয়সসীমা: ২১ হতে ৩২ বছর'
  ],
  minAge: 21,
  maxAge: 32,
  salary: '৩৫,৫০০ - ৬৭,০১০ টাকা',
  deadline: '২০২৭-১২-৩১',
  status: 'PUBLISHED',
  districts: 'সকল জেলা'
};
SyntheticJobManager.saveJob(newJob);

const candB = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-005');
console.log('Cand B Profile:', candB.name, 'dob:', candB.dob);
const newDegree = {
  id: 'edu_honours_synth_refresh',
  level: 'Honours',
  degree: 'B.Sc in Computer Science & Engineering',
  majorSubject: 'CSE',
  boardOrUni: 'University of Dhaka',
  year: '2024',
  result: '3.75',
  resultType: 'CGPA',
  academicStatus: 'COMPLETED'
};
const updatedCandB = {
  ...candB,
  education: [...(candB.education || []), newDegree]
};
SyntheticUserManager.saveSyntheticUser(updatedCandB);

const match = SmartJobMatchingEngine.evaluateMatch(updatedCandB, newJob);
console.log('Direct Match for Updated Cand B:', match.overallScore, match.eligibilityStatus, match.eligibilityLabelBn);

const feeds = PersonalizedRecommender.getRecommendations(updatedCandB, { limit: 50, minScore: 20 });
const hasJob = feeds.bestMatches.some(b => b.job.id === testJobId);
console.log('In Best Matches:', hasJob, 'Total in Best:', feeds.bestMatches.length);
console.log('In all evaluated:', feeds.totalEligibleMatches);

SyntheticJobManager.deleteJob(testJobId);
