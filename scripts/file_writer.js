const fs = require('fs');
const [,, targetPath] = process.argv;
let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => buffer += chunk);
process.stdin.on('end', () => {
  fs.writeFileSync(targetPath, buffer, 'utf8');
  console.log(`Wrote ${buffer.length} bytes to ${targetPath}`);
});
