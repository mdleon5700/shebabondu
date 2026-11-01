const fs = require('fs');
const path = require('path');

const STORE_PATH = path.resolve('src/db/local_store.json');

function cleanupSyntheticData() {
  const store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));

  const candidateKeys = Object.keys(store.candidates || {});
  let removedCandidates = 0;

  candidateKeys.forEach(k => {
    if (k.startsWith('CAND-TEST-') || (store.candidates[k] && store.candidates[k].isSyntheticTest)) {
      delete store.candidates[k];
      if (store.documents) delete store.documents[k];
      if (store.applications) delete store.applications[k];
      if (store.savedJobs) delete store.savedJobs[k];
      if (store.notifications) delete store.notifications[k];
      removedCandidates++;
    }
  });

  const sessionKeys = Object.keys(store.sessions || {});
  let removedSessions = 0;
  sessionKeys.forEach(k => {
    if (k.startsWith('TEST-SESSION-CAND-TEST-')) {
      delete store.sessions[k];
      removedSessions++;
    }
  });

  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  console.log('Cleanup complete: Removed ' + removedCandidates + ' synthetic test candidates and ' + removedSessions + ' test sessions. Real records preserved.');
}

module.exports = { cleanupSyntheticData };

if (require.main === module) {
  cleanupSyntheticData();
}
