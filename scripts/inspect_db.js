const fs = require('fs');
const content = fs.readFileSync('src/lib/db.ts', 'utf8');

const methods = [...content.matchAll(/^\s{2}(?:async\s+)?([a-zA-Z0-9_]+)\s*\(/gm)].map(m => m[1]);
console.log('ServerDB methods count:', methods.length);
console.log('Methods:', methods);

const dbFiles = [...content.matchAll(/['"]([^'"]+\.json)['"]/g)].map(m => m[1]);
console.log('JSON DB files referenced:', [...new Set(dbFiles)]);

