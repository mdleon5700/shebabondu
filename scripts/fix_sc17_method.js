const fs = require('fs');
const file = 'src/lib/testing/scenarios/17-academic-hierarchy-validation.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'SmartJobMatchingEngine.checkHardEligibility(candidateWithHonours, honoursJob as JobCircular);',
  'SmartJobMatchingEngine.evaluateEligibility(candidateWithHonours, honoursJob as JobCircular);'
);

content = content.replace(
  'SmartJobMatchingEngine.checkHardEligibility(candidateWithHscOnly, honoursJob as JobCircular);',
  'SmartJobMatchingEngine.evaluateEligibility(candidateWithHscOnly, honoursJob as JobCircular);'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated evaluateEligibility in Scenario 17');
