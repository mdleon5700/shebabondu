const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/app/admin/page.tsx'), 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('পুনরায় চেষ্টা করুন')) {
    console.log(lines.slice(Math.max(0, i - 15), Math.min(lines.length, i + 10)).join('\n'));
  }
});
