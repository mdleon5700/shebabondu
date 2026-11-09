const fs = require('fs');

const file = 'src/components/admin/JobCategorySearchManager.tsx';
if (fs.existsSync(file)) {
  const c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('<select') || l.includes('category') || l.includes('govt')) {
      if (l.includes('<option') || l.includes('category') || l.includes('Category')) {
        console.log((i+1) + ': ' + l.trim());
      }
    }
  });
}

