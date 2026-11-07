const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/components/admin/UniversalUserWorkspace.tsx'), 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);

// Look for tabs, sub-features, state variables
lines.forEach((l, i) => {
  if (l.includes('activeTab') || l.includes('tab ===') || l.includes('case \'') || l.includes('setSubTab') || l.includes('subTab')) {
    if (i < 300) console.log(`Line ${i+1}: ${l.trim()}`);
  }
});

