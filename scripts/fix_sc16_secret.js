const fs = require('fs');
const file = 'src/lib/testing/scenarios/16-admin-education-review-sync.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const adminSecret = process.env.ADMIN_JWT_SECRET || 'chakri-sheba-admin-super-secret-key-2025';",
  "const adminSecret = process.env.ADMIN_SECRET_KEY || 'CHAKRISEBA_SECURE_ADMIN_2026';"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated adminSecret in Scenario 16');
