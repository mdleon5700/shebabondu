const fs = require('fs');
const file = 'src/app/api/admin/testing/personas/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'districtBatchAudit: SyntheticUserManager.getDistrictBatchAudit(),',
  'districtBatchAudit: SyntheticUserManager.getDistrictBatchAudit(),\n      educationSummary: SyntheticUserManager.getEducationAuditSummary(),'
);

content = content.replace(
  'isolation,',
  'isolation,\n    educationSummary: SyntheticUserManager.getEducationAuditSummary(),'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully added educationSummary to personas API route');
