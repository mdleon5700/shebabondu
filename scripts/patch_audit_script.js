const fs = require('fs');
let content = fs.readFileSync('scripts/live_site_spider_audit.ts', 'utf8');
content = content.replace(
  'const adminContext = await browser.newContext({',
  "const adminContext = await browser.newContext({\n    extraHTTPHeaders: { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' },"
);
fs.writeFileSync('scripts/live_site_spider_audit.ts', content, 'utf8');
console.log('Added extraHTTPHeaders to admin context');
