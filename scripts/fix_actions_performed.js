const fs = require('fs');

// Fix 15
let sc15 = fs.readFileSync('src/lib/testing/scenarios/15-academic-document-security.ts', 'utf8');
sc15 = sc15.replace('    actions,\n    assertions,', '    actionsPerformed: actions,\n    assertions,');
fs.writeFileSync('src/lib/testing/scenarios/15-academic-document-security.ts', sc15, 'utf8');

// Fix 16
let sc16 = fs.readFileSync('src/lib/testing/scenarios/16-admin-education-review-sync.ts', 'utf8');
sc16 = sc16.replace('    actions,\n    assertions,', '    actionsPerformed: actions,\n    assertions,');
sc16 = sc16.replace(/candidate\.id/g, '(candidate.id || "SYNTH-USR-KHULNA-001")');
fs.writeFileSync('src/lib/testing/scenarios/16-admin-education-review-sync.ts', sc16, 'utf8');

// Fix 17
let sc17 = fs.readFileSync('src/lib/testing/scenarios/17-academic-hierarchy-validation.ts', 'utf8');
sc17 = sc17.replace('    actions,\n    assertions,', '    actionsPerformed: actions,\n    assertions,');
fs.writeFileSync('src/lib/testing/scenarios/17-academic-hierarchy-validation.ts', sc17, 'utf8');

console.log('Fixed actionsPerformed and candidate.id');
