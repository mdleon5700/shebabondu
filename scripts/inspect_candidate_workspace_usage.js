const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/components/admin/CandidateManagementHub.tsx'), 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('UniversalUserWorkspace')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});

