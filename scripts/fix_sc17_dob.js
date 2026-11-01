const fs = require('fs');
const file = 'src/lib/testing/scenarios/17-academic-hierarchy-validation.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "district: 'ঢাকা',",
  "district: 'ঢাকা',\n      dob: '1998-05-15',"
);

// Do it for both candidateWithHonours and candidateWithHscOnly
content = content.replace(
  "district: 'ঢাকা',",
  "district: 'ঢাকা',\n      dob: '1998-05-15',"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully added dob to candidate test fixtures in Scenario 17');
