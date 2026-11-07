const fs = require('fs');
const lines = fs.readFileSync('src/components/admin/WebsiteBuilder.tsx', 'utf8').split(/\r?\n/);

console.log('Line 2753:', lines[2753]);
console.log('Line 2754:', lines[2754]);
console.log('Line 2755:', lines[2755]);
console.log('Line 2756:', lines[2756]);
console.log('Line 2757:', lines[2757]);
console.log('Line 2758:', lines[2758]);

// Remove lines 2754 to 2758 if they are the misplaced closing tags
const updatedLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i >= 2754 && i <= 2758 && (lines[i].includes('HEADER & FOOTER') || lines[i].trim() === '</div>')) {
    console.log('Skipping line ' + i + ': ' + lines[i]);
    continue;
  }
  updatedLines.push(lines[i]);
}

fs.writeFileSync('src/components/admin/WebsiteBuilder.tsx', updatedLines.join('\r\n'), 'utf8');
console.log('Removed misplaced lines successfully!');

