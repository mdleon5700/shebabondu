const fs = require('fs');

// Check type definitions
const files = ['src/types/index.ts', 'src/types/job.ts', 'src/lib/types.ts', 'src/lib/constants.ts'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    console.log(`=== ${f} ===`);
    const c = fs.readFileSync(f, 'utf8');
    const m = c.match(/type JobCategory[^;]+;|enum JobCategory[^}]+}|const CATEGORIES[^;]+;/);
    if (m) console.log(m[0]);
    else console.log('No direct JobCategory enum/type match');
  }
});

