const fs = require('fs');
const file = 'src/lib/testing/index.ts';
let content = fs.readFileSync(file, 'utf8');

const targetImports = "import { runScenario13 } from './scenarios/13-cross-panel-sync';";
const replacementImports = `import { runScenario13 } from './scenarios/13-cross-panel-sync';
import { runScenario14 } from './scenarios/14-education-crud-lifecycle';
import { runScenario15 } from './scenarios/15-academic-document-security';
import { runScenario16 } from './scenarios/16-admin-education-review-sync';
import { runScenario17 } from './scenarios/17-academic-hierarchy-validation';`;

const targetFns = `    { id: 'SCENARIO-13', fn: runScenario13 },
  ];`;
const replacementFns = `    { id: 'SCENARIO-13', fn: runScenario13 },
    { id: 'SCENARIO-14', fn: runScenario14 },
    { id: 'SCENARIO-15', fn: runScenario15 },
    { id: 'SCENARIO-16', fn: runScenario16 },
    { id: 'SCENARIO-17', fn: runScenario17 },
  ];`;

content = content.replace(targetImports, replacementImports);
content = content.replace(targetFns, replacementFns);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully wired Scenarios 14-17 into index.ts');
