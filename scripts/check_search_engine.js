const fs = require('fs');

const file = 'src/lib/search/engine.ts';
if (fs.existsSync(file)) {
  const c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('category') || l.includes('Category') || l.includes('classify')) {
      console.log((i+1) + ': ' + l.trim());
    }
  });
}

