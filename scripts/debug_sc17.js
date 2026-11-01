const fs = require('fs');
const file = 'src/lib/testing/scenarios/17-academic-hierarchy-validation.ts';
let content = fs.readFileSync(file, 'utf8');

const target = 'const matchHscOnly = SmartJobMatchingEngine.evaluateEligibility(candidateWithHscOnly, honoursJob as JobCircular);';
const replacement = target + '\n    console.log("DEBUG matchHscOnly:", JSON.stringify(matchHscOnly, null, 2));\n    console.log("DEBUG candidateWithHscOnly:", JSON.stringify(candidateWithHscOnly, null, 2));';

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
