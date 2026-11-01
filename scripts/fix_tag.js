const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'test_step09_scenarios.ts');
let c = fs.readFileSync(p, 'utf8');
c = c.replace("syntheticTag: 'STEP09',", "syntheticTag: { isSynthetic: true, testRunId: 'STEP09', testDataVersion: '2.0', createdAt: new Date().toISOString() },");
fs.writeFileSync(p, c, 'utf8');
console.log('Fixed syntheticTag in test_step09_scenarios.ts');
