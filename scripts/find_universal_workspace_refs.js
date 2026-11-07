const fs = require('fs');
const path = require('path');

function searchRefs(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') searchRefs(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes('UniversalUserWorkspace')) {
        console.log('Found ref in:', full);
      }
      if (c.includes('UniversalJobWorkspace')) {
        console.log('Found UniversalJobWorkspace in:', full);
      }
    }
  }
}

searchRefs(path.join(__dirname, '../src'));

