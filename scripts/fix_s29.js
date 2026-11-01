const fs = require('fs');
let s29 = fs.readFileSync('src/lib/testing/scenarios/29-bangladesh-location-filter-audit.ts', 'utf8');
s29 = s29.replace(/publicationStatus: 'PUBLISHED' as any/g, "// publicationStatus removed");
s29 = s29.replace(/publicationStatus: 'PUBLISHED'/g, "// publicationStatus removed");
fs.writeFileSync('src/lib/testing/scenarios/29-bangladesh-location-filter-audit.ts', s29, 'utf8');
console.log('✅ Removed publicationStatus from s29');
