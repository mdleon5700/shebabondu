const { SyntheticUserManager } = require('../src/lib/testing/synthetic/synthetic-user-manager');
const { JobRequirementNormalizer } = require('../src/lib/matching/normalizer');
const { SmartJobMatchingEngine } = require('../src/lib/matching/engine');

const cseHonoursUser = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-009');
console.log('Candidate Edu:', JSON.stringify(cseHonoursUser.education));

const cseJob = {
  id: 'SYNTH-JOB-TEST-EDU-CSE-ONLY',
  title: 'সহকারী প্রোগ্রামার (কম্পিউটার সায়েন্স আবশ্যক)',
  organization: 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ',
  minEducation: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (সিএসই) বা আইসিটি বিষয়ে বিএসসি',
  requirements: [
    'স্বীকৃত বিশ্ববিদ্যালয় হতে সিএসই বা আইসিটি বিষয়ে স্নাতক ডিগ্রি',
    'বয়স: ২১-৩০ বছর'
  ],
  minAge: 21,
  maxAge: 30,
  status: 'PUBLISHED'
};

const normJob = JobRequirementNormalizer.normalizeJob(cseJob);
console.log('Norm Job requiredSubjects:', normJob.requiredSubjects);
const highest = SmartJobMatchingEngine.getCandidateHighestEducation(cseHonoursUser);
console.log('Candidate Highest Edu:', highest);

const res = SmartJobMatchingEngine.evaluateEligibility(cseHonoursUser, cseJob);
console.log('Eligibility Result:', res);
