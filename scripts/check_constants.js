const fs = require('fs');

const constants = fs.readFileSync('src/lib/constants.ts', 'utf8');
console.log('=== src/lib/constants.ts ===');
const lines = constants.split('\n');
lines.forEach((l, i) => {
  if (l.includes('category') || l.includes('Category') || l.includes('CATEGORIES')) {
    console.log((i+1) + ': ' + l);
  }
});

