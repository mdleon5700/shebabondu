const fs = require('fs');
let s60 = fs.readFileSync('src/lib/testing/scenarios/60-responsive-viewports-accessibility-seo-permanently-free-audit.ts', 'utf8');
s60 = s60.replace(/category: 'responsive'/g, "category: 'mobile'");
fs.writeFileSync('src/lib/testing/scenarios/60-responsive-viewports-accessibility-seo-permanently-free-audit.ts', s60, 'utf8');
console.log('Fixed category in Scenario 60.');
