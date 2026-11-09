const fs = require('fs');

function findInDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = dir + '/' + f;
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.next' && f !== '.git') {
      findInDir(full, pattern);
    } else if (stat.isFile() && (f.endsWith('.tsx') || f.endsWith('.ts'))) {
      const c = fs.readFileSync(full, 'utf8');
      if (pattern.test(c)) {
        console.log(`Found in: ${full}`);
      }
    }
  }
}

console.log('Searching for category routes/links:');
findInDir('src/app', /categories\/|category ===/);
findInDir('src/components', /categories\/|category ===/);

