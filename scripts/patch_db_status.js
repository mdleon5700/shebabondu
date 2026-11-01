const fs = require('fs');
const filePath = 'C:\\Users\\Leon Rahman\\Documents\\chakri-sheba\\src\\lib\\db.ts';
let code = fs.readFileSync(filePath, 'utf8');

// Add status to CandidateRecord
code = code.replace(
  'export interface CandidateRecord extends CandidateProfile {\n\n\n\n  id: string;',
  'export interface CandidateRecord extends CandidateProfile {\n  status?: \'active\' | \'suspended\' | \'banned\';\n  id: string;'
);

// Also use (candidate as any).status = status;
code = code.replace(
  '    candidate.status = status as any;',
  '    (candidate as any).status = status;'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('db.ts CandidateRecord status patched');