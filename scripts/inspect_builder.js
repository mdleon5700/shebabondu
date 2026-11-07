const fs = require('fs');
const content = fs.readFileSync('src/components/admin/WebsiteBuilder.tsx', 'utf8');
const lines = content.split('\n');

console.log('Total lines in WebsiteBuilder.tsx:', lines.length);

// Extract imports
const imports = lines.filter(l => l.trim().startsWith('import '));
console.log('\nImports count:', imports.length);

// Extract interfaces / types defined in WebsiteBuilder
const typeMatches = content.match(/export\s+(?:interface|type)\s+([A-Za-z0-9_]+)/g) || [];
console.log('\nExported types:', typeMatches);

// Extract section types or element types
const sectionTypeMatches = content.match(/type\s*[:=]\s*['"]([a-z0-9_-]+)['"]/gi) || [];
console.log('\nSection/Element types mentioned:', [...new Set(sectionTypeMatches)].slice(0, 30));

// Check state variables
const stateMatches = content.match(/const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState/g) || [];
console.log('\nState variables:', stateMatches.map(s => s.replace(/const\s+\[/, '').replace(/,.*/, '')));

