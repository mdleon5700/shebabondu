const fs = require('fs');

function checkFile(path) {
  if (!fs.existsSync(path)) return;
  console.log(`=== ${path} ===`);
  const c = fs.readFileSync(path, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('category') || l.includes('categories') || l.includes('orgType') || l.includes('subCategory')) {
      console.log((i+1) + ': ' + l.trim());
    }
  });
}

checkFile('src/app/api/jobs/route.ts');
checkFile('src/app/jobs/page.tsx');

