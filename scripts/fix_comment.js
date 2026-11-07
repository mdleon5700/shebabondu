const fs = require('fs');
const content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// Fix the JSX comment issue
let fixed = content.replace(
  `        {/* Breadcrumb & Section Title Bar (Shown on non-dashboard tabs) */}\r\n        {activeTab !== 'dashboard' && (\r\n          \r\n          {/* Breadcrumb & Section Title Bar */}\r\n          <div className="mb-6 flex flex-col`,
  `        {/* Breadcrumb & Section Title Bar (Shown on non-dashboard tabs) */}\r\n        {activeTab !== 'dashboard' && (\r\n          <div className="mb-6 flex flex-col`
);

fs.writeFileSync('src/app/admin/page.tsx', fixed, 'utf8');
console.log('Fixed comment');

