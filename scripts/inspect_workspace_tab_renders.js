const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/components/admin/UniversalUserWorkspace.tsx'), 'utf8');
const lines = content.split('\n');

console.log('--- Checking tabs rendering in UniversalUserWorkspace ---');
lines.forEach((l, i) => {
  if (l.includes("activeTab === '") || l.includes('case \'')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});

