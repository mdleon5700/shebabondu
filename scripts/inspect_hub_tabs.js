const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/components/admin/CandidateManagementHub.tsx'), 'utf8');
const lines = content.split('\n');

console.log('--- CandidateManagementHub tabs ---');
lines.forEach((l, i) => {
  if (l.includes("currentTab === '") || l.includes("activeTab === '")) {
    if (i < 400) console.log(`Line ${i+1}: ${l.trim()}`);
  }
});

