const fs = require('fs');
const [,, filePath, target, replacement] = process.argv;
if (!filePath) {
  console.error("Usage: node scripts/patch_file.js <file> <target> <replacement>");
  process.exit(1);
}
let content = fs.readFileSync(filePath, 'utf8');
if (!content.includes(target)) {
  console.error("Target text not found in " + filePath);
  process.exit(2);
}
content = content.replace(target, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched " + filePath);
