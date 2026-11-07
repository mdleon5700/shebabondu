const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/app/admin/page.tsx'), 'utf8');
const regex = /activeTab === ['"]([^'"]+)['"]/g;
const tabs = new Set();
let m;
while ((m = regex.exec(content)) !== null) {
  tabs.add(m[1]);
}
console.log('Tabs in admin page:', Array.from(tabs));
