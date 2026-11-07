const fs = require('fs');
const content = fs.readFileSync('src/components/admin/CandidateManagementHub.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('109841') || l.includes('214589')) {
    console.log(i + 1, l.trim());
  }
});

