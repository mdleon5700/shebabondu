const fs = require('fs');
const { SmartJobMatchingEngine } = require('../src/lib/matching/engine');
const { CentralDeadlineEngine } = require('../src/lib/deadlines/engine');

const store = JSON.parse(fs.readFileSync('src/db/synthetic_users_store.json', 'utf8'));
const localStore = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const candidate = store['SYNTH-USR-DHAKA-001'];
const jobs = Object.values(localStore.jobs || {});

console.log('Testing candidate with JSC education against jobs:');
let evaluated = 0;
let eligible = 0;
for (const j of jobs) {
  const dl = CentralDeadlineEngine.evaluateDeadline(j);
  if (dl.isClosed || dl.status === 'CANCELLED' || dl.status === 'SUSPENDED') {
    continue;
  }
  evaluated++;
  const match = SmartJobMatchingEngine.evaluateMatch(candidate, j);
  if (match.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS') {
    eligible++;
    console.log('ELIGIBLE MATCH:', j.title, 'Score:', match.overallScore, 'Required Edu:', match.breakdown.education.requiredLevel);
  } else {
    // console.log('Ineligible:', j.title, match.eligibilityLabelBn);
  }
}
console.log(`Evaluated: ${evaluated} open jobs, Eligible: ${eligible}`);
