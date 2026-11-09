const fs = require('fs');

const content = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = content.split('\n');

console.log('--- SECTIONS & HEADINGS IN PAGE.TSX ---');
lines.forEach((l, i) => {
  const trimmed = l.trim();
  if (trimmed.startsWith('<section') || trimmed.startsWith('<HeroSection') || trimmed.startsWith('<JobSearchSection') || trimmed.includes('id="circulars-section"') || (trimmed.startsWith('<h2') && !trimmed.includes('hidden'))) {
    console.log(`Line ${i+1}: ${trimmed.slice(0, 120)}`);
  }
});

