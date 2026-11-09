const fs = require('fs');
const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));

console.log('--- VERIFICATION OF CLEAN WIPE ---');
console.log('Candidates count:', Object.keys(store.candidates || {}).length);
console.log('Applications count:', Object.keys(store.applications || {}).length);
console.log('Documents count:', Object.keys(store.documents || {}).length);
console.log('SavedJobs count:', Object.keys(store.savedJobs || {}).length);
console.log('Transactions count:', Object.keys(store.transactions || {}).length);
console.log('Sessions count:', Object.keys(store.sessions || {}).length);
console.log('Notifications count:', Object.keys(store.notifications || {}).length);
console.log('Jobs count:', Object.keys(store.jobs || {}).length);

