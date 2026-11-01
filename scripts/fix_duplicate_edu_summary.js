const fs = require('fs');
const file = 'src/app/api/admin/testing/personas/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `      educationSummary: SyntheticUserManager.getEducationAuditSummary(),
      isolation,
    educationSummary: SyntheticUserManager.getEducationAuditSummary(),`,
  `      educationSummary: SyntheticUserManager.getEducationAuditSummary(),
      isolation,`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed duplicate educationSummary in personas route');
