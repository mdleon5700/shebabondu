const fs = require('fs');
const file = 'src/lib/testing/scenarios/17-academic-hierarchy-validation.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `    const candidateWithHscOnly: CandidateProfile = {
      id: 'SYNTH-TEST-HSC-ONLY',
      name: 'Kamrul Hasan',
      phone: '01889922334',
      district: 'ঢাকা',`,
  `    const candidateWithHscOnly: CandidateProfile = {
      id: 'SYNTH-TEST-HSC-ONLY',
      name: 'Kamrul Hasan',
      phone: '01889922334',
      district: 'ঢাকা',
      dob: '1998-05-15',`
);

// Clean up debug logs
content = content.replace('    console.log("DEBUG matchHscOnly:", JSON.stringify(matchHscOnly, null, 2));\n    console.log("DEBUG candidateWithHscOnly:", JSON.stringify(candidateWithHscOnly, null, 2));', '');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully added dob to candidateWithHscOnly');
