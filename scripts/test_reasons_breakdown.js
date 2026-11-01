const fs = require('fs');
const { SmartJobMatchingEngine } = require('../src/lib/matching/engine');

const store = JSON.parse(fs.readFileSync('src/db/synthetic_users_store.json', 'utf8'));
const localStore = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const cand = store['SYNTH-USR-DHAKA-009'];
const jobs = Object.values(localStore.jobs || {});

console.log('Candidate 9 Profile:');
console.log('DOB:', cand.dob, 'District:', cand.district, 'Skills:', cand.skills);
console.log('Education:', JSON.stringify(cand.education));

let reasons = {};
for (const j of jobs) {
  const match = SmartJobMatchingEngine.evaluateMatch(cand, j);
  if (match.eligibilityStatus !== 'MEETS_VERIFIED_REQUIREMENTS') {
    const key = match.eligibilityLabelBn.split('(')[0].trim();
    reasons[key] = (reasons[key] || 0) + 1;
  }
}
console.log('Ineligibility breakdown for Bachelor candidate across 214 jobs:');
console.table(reasons);
