const fs = require('fs');

const types = fs.readFileSync('src/lib/types.ts', 'utf8');
const lines = types.split('\n');
lines.forEach((l, i) => {
  if (l.includes("'govt' | 'bank'") || l.includes('"govt" | "bank"')) {
    console.log((i+1) + ': ' + l.trim());
  }
});

