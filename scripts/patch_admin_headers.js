const fs = require('fs');

// 1. JobPublishingCenter.tsx
let f1 = fs.readFileSync('src/components/admin/JobPublishingCenter.tsx', 'utf8');
f1 = f1.replace(/'x-admin-pin':\s*'1234'/g, "'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'");
fs.writeFileSync('src/components/admin/JobPublishingCenter.tsx', f1, 'utf8');
console.log('Fixed JobPublishingCenter.tsx');

// 2. JobCategorySearchManager.tsx
let f2 = fs.readFileSync('src/components/admin/JobCategorySearchManager.tsx', 'utf8');
f2 = f2.replace(/'x-admin-pin':\s*'1234'/g, "'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'");
fs.writeFileSync('src/components/admin/JobCategorySearchManager.tsx', f2, 'utf8');
console.log('Fixed JobCategorySearchManager.tsx');
