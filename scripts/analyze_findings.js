const fs = require('fs');
const findings = JSON.parse(fs.readFileSync('scripts/live_audit_results.json', 'utf8'));
console.log('Total Findings:', findings.length);

const byCat = {};
for (const f of findings) {
  if (!byCat[f.category]) byCat[f.category] = [];
  byCat[f.category].push(f);
}

for (const cat of Object.keys(byCat)) {
  console.log('\n=== CATEGORY: ' + cat + ' (' + byCat[cat].length + ') ===');
  byCat[cat].forEach(item => {
    console.log('[' + item.severity + '] ' + item.url + ' -> ' + item.description + (item.snippet ? ' | ' + item.snippet : ''));
  });
}
