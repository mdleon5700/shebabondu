const fs = require('fs');
let s40 = fs.readFileSync('src/lib/testing/scenarios/40-experience-skills-64-district-matching-audit.ts', 'utf8');
s40 = s40.replace(/districtAudits/g, 'districtSummary');
fs.writeFileSync('src/lib/testing/scenarios/40-experience-skills-64-district-matching-audit.ts', s40, 'utf8');

let s42 = fs.readFileSync('src/lib/testing/scenarios/42-matching-transparency-explainability-notifications-audit.ts', 'utf8');
s42 = s42.replace(/districtAudits/g, 'districtSummary');
s42 = s42.replace(/\(d\s*=>/g, '((d: any) =>');
fs.writeFileSync('src/lib/testing/scenarios/42-matching-transparency-explainability-notifications-audit.ts', s42, 'utf8');

console.log('✅ Updated districtSummary in s40 & s42');
