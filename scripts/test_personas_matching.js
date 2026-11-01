const fs = require('fs');
const { SmartJobMatchingEngine } = require('../src/lib/matching/engine');
const { CentralDeadlineEngine } = require('../src/lib/deadlines/engine');

const store = JSON.parse(fs.readFileSync('src/db/synthetic_users_store.json', 'utf8'));
const localStore = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const jobs = Object.values(localStore.jobs || {});

const personas = Object.values(store);
console.log('Testing 5 different personas:');
for (const cand of personas.slice(0, 10)) {
  const highestEdu = SmartJobMatchingEngine.getCandidateHighestEducation(cand);
  let eligibleCount = 0;
  for (const j of jobs) {
    const dl = CentralDeadlineEngine.evaluateDeadline(j);
    if (dl.isClosed) continue;
    const match = SmartJobMatchingEngine.evaluateMatch(cand, j);
    if (match.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS') {
      eligibleCount++;
    }
  }
  console.log(`Persona ${cand.id} (${cand.name}): Level=${highestEdu?.level}, District=${cand.district}, Eligible Jobs=${eligibleCount}`);
}
