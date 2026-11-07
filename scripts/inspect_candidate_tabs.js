const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/app/admin/page.tsx'), 'utf8');
const lines = content.split('\n');

const targetTabs = ['candidate-directory', 'candidate-details', 'account-status', 'eligibility-rules'];

targetTabs.forEach(t => {
  console.log('=== TAB:', t, '===');
  lines.forEach((line, idx) => {
    if (line.includes(`activeTab === '${t}'`)) {
      console.log(lines.slice(Math.max(0, idx - 2), Math.min(lines.length, idx + 25)).join('\n'));
    }
  });
});
