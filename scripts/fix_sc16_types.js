const fs = require('fs');
const file = 'src/lib/testing/scenarios/16-admin-education-review-sync.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "scenarioName: 'Admin Education Review Queue & Candidate Profile Synchronization',",
  "name: 'Admin Education Review Queue & Candidate Profile Synchronization',\n    category: 'admin',"
);

content = content.replace(
  `  const candidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-KHULNA-001') || 
                    SyntheticUserManager.getAllSyntheticUsers()[2];`,
  `  const candidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-KHULNA-001') || 
                    SyntheticUserManager.getAllSyntheticUsers()[2] || 
                    SyntheticUserManager.getAllSyntheticUsers()[0];
  if (!candidate) throw new Error('No candidate available');`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Scenario 16');
