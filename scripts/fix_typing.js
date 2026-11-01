const fs = require('fs');
const filePath = 'src/lib/testing/synthetic/synthetic-user-manager.ts';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace('const statusMessages = {', 'const statusMessages: Record<string, string> = {');
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed statusMessages typing.');
