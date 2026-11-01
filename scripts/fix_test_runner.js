const fs = require('fs');
let content = fs.readFileSync('scripts/test_step08_scenarios.ts', 'utf8');
content = content.replace('new BrowserController(config)', 'new BrowserController(config as any)');
fs.writeFileSync('scripts/test_step08_scenarios.ts', content, 'utf8');
