const fs = require('fs');
const file = 'src/lib/testing/scenarios/15-academic-document-security.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "scenarioName: 'Academic Document Security, Upload Validation & Permission Guard',",
  "name: 'Academic Document Security, Upload Validation & Permission Guard',\n    category: 'security',"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Scenario 15');
