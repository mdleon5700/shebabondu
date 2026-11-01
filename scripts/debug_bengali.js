const { SmartJobMatchingEngine } = require('../src/lib/matching/engine');
const { JobRequirementNormalizer } = require('../src/lib/matching/normalizer');

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

const bengaliHonoursUser = {
  id: 'SYNTH-TEST-BENGALI-HONOURS-USER',
  name: 'Test Bengali Honours Candidate',
  district: 'ঢাকা',
  dob: '1998-05-10',
  education: [
    {
      id: 'edu-hon-bn',
      level: 'Honours',
      degree: 'B.A in Bengali Literature',
      majorSubject: 'Bengali Literature',
      institutionName: 'University of Dhaka',
      boardOrUni: 'University of Dhaka',
      year: '2020',
      result: '3.60',
      resultType: 'CGPA',
      academicStatus: 'COMPLETED'
    }
  ]
};

const norm = JobRequirementNormalizer.normalizeJob(cseJob);
console.log('Norm Job requiredLevel:', norm.requiredEducationLevel);
console.log('Norm Job requiredSubjects:', norm.requiredSubjects);
const highest = SmartJobMatchingEngine.getCandidateHighestEducation(bengaliHonoursUser);
console.log('Candidate Highest Edu:', highest);

const userSubject = (highest.subject || '').trim().toLowerCase();
const userDeg = (highest.degreeName || '').toLowerCase();
console.log('userSubject:', userSubject, 'userDeg:', userDeg);

for (const reqSub of norm.requiredSubjects) {
  const s = reqSub.toLowerCase();
  console.log(`Checking against reqSub "${reqSub}":`);
  console.log('  userSubject.includes(s):', userSubject.includes(s));
  console.log('  s.includes(userSubject):', s.includes(userSubject));
  console.log('  userDeg.includes(s):', userDeg.includes(s));
  console.log('  s.includes(userDeg):', s.includes(userDeg));
}
