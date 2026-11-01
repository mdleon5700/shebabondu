const fs = require('fs');
const filePath = 'src/lib/testing/scenarios/50-application-form-validation-cv-document-attachment-audit.ts';
let c = fs.readFileSync(filePath, 'utf8');
c = c.replace("verificationStatus: 'verified'", "verificationStatus: 'VERIFIED'");
fs.writeFileSync(filePath, c, 'utf8');
console.log('Fixed verificationStatus in Scenario 50.');
