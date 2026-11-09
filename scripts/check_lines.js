const fs = require('fs');

const types = fs.readFileSync('src/lib/types.ts', 'utf8');
const lines = types.split('\n');
console.log('Line 113 in types.ts:');
console.log(lines[112]);
console.log('Line 4025 in types.ts:');
console.log(lines[4024]);

