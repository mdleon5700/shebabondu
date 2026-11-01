const fs = require('fs');
const file = 'src/lib/matching/normalizer.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "lower.includes('msc') || lower.includes('mba')",
  "lower.includes('msc') || lower.includes('mba') || lower.includes('কামিল') || lower.includes('kamil')"
);

content = content.replace(
  "lower.includes('bba') || lower.includes('ডিগ্রি')",
  "lower.includes('bba') || lower.includes('ডিগ্রি') || lower.includes('ফাজিল') || lower.includes('fazil')"
);

content = content.replace(
  "lower.includes('hsc') || lower.includes('আলিম')",
  "lower.includes('hsc') || lower.includes('আলিম') || lower.includes('alim')"
);

content = content.replace(
  "lower.includes('ssc') || lower.includes('দাখিল')",
  "lower.includes('ssc') || lower.includes('দাখিল') || lower.includes('dakhil')"
);

content = content.replace(
  "lower.includes('jsc')",
  "lower.includes('jsc') || lower.includes('জেডিসি') || lower.includes('jdc')"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully enhanced normalizer.ts with full BD qualification mappings');
