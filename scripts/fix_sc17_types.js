const fs = require('fs');
const file = 'src/lib/testing/scenarios/17-academic-hierarchy-validation.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "category: 'General',",
  "category: 'govt',"
);

content = content.replace(
  `    const candidateWithHonours: CandidateProfile = {
      id: 'SYNTH-TEST-HONOURS',
      name: 'Ashikur Rahman',
      phone: '01889911223',
      district: 'ঢাকা',
      dob: '1998-05-15',
      dob: '1998-05-15',`,
  `    const candidateWithHonours: CandidateProfile = {
      id: 'SYNTH-TEST-HONOURS',
      name: 'Ashikur Rahman',
      phone: '01889911223',
      district: 'ঢাকা',
      dob: '1998-05-15',`
);

content = content.replace(
  "const honoursMeetsReq = matchHonours.status === 'ELIGIBLE' || !matchHonours.isHardDisqualified;",
  "const honoursMeetsReq = matchHonours.status === 'MEETS_VERIFIED_REQUIREMENTS' || !matchHonours.isHardDisqualified;"
);

content = content.replace(
  "scenarioName: 'Academic Hierarchy, Grading Scales & Smart Match Validation',",
  "name: 'Academic Hierarchy, Grading Scales & Smart Match Validation',\n    category: 'api',"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Scenario 17');
