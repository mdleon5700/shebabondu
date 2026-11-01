const fs = require('fs');
const filePath = 'C:\\Users\\Leon Rahman\\Documents\\chakri-sheba\\scripts\\test_full_system_integration.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  "const initialMaritalStatus = testCandidate.maritalStatus || 'single';",
  "const initialMaritalStatus = testCandidate.maritalStatus;"
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('test_full_system_integration.ts test condition updated');