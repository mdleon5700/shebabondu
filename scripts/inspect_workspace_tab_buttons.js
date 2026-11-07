const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/components/admin/UniversalUserWorkspace.tsx'), 'utf8');
const lines = content.split('\n');

console.log('--- UniversalUserWorkspace Tab list items ---');
let start = false;
lines.forEach((l, i) => {
  if (l.includes('const TABS') || l.includes('tab.id') || l.includes('UserWorkspaceTab')) {
    if (i < 400) console.log(`${i+1}: ${l}`);
  }
});
