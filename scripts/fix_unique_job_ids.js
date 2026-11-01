const fs = require('fs');

// 1. Scenario 50
let s50 = fs.readFileSync('src/lib/testing/scenarios/50-application-form-validation-cv-document-attachment-audit.ts', 'utf8');
s50 = s50.replace("jobId: 'JOB-TEST-DOCS-02',", "jobId: 'JOB-TEST-DOCS-' + Date.now(),");
fs.writeFileSync('src/lib/testing/scenarios/50-application-form-validation-cv-document-attachment-audit.ts', s50, 'utf8');

// 2. Scenario 51
let s51 = fs.readFileSync('src/lib/testing/scenarios/51-application-submission-persistence-duplicate-prevention-audit.ts', 'utf8');
s51 = s51.replace("const targetJobId = 'SYNTH-JOB-POST-KHULNA-101';", "const targetJobId = 'SYNTH-JOB-POST-KHULNA-' + Date.now();");
fs.writeFileSync('src/lib/testing/scenarios/51-application-submission-persistence-duplicate-prevention-audit.ts', s51, 'utf8');

// 3. Scenario 54
let s54 = fs.readFileSync('src/lib/testing/scenarios/54-application-status-notification-synchronization-audit.ts', 'utf8');
s54 = s54.replace("id: 'SYNTH-APP-NOTIF-CTG-401',", "id: 'SYNTH-APP-NOTIF-CTG-' + Date.now(),");
fs.writeFileSync('src/lib/testing/scenarios/54-application-status-notification-synchronization-audit.ts', s54, 'utf8');

console.log('Updated Scenarios 50, 51, and 54 with dynamic IDs.');
