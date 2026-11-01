const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
fs.writeFileSync(target, '', 'utf8');
console.log('Initialized empty target file');
