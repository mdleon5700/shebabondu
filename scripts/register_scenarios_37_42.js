const fs = require('fs');
let indexContent = fs.readFileSync('src/lib/testing/index.ts', 'utf8');

// 1. Add imports
const oldImport = "import { runScenario36 } from './scenarios/36-freshness-user-panel-sync-alerts-audit';";
const newImports = `import { runScenario36 } from './scenarios/36-freshness-user-panel-sync-alerts-audit';
import { runScenario37 } from './scenarios/37-mandatory-eligibility-vs-recommendation-separation-audit';
import { runScenario38 } from './scenarios/38-complete-education-matrix-subject-match-audit';
import { runScenario39 } from './scenarios/39-age-boundaries-reference-date-quota-audit';
import { runScenario40 } from './scenarios/40-experience-skills-64-district-matching-audit';
import { runScenario41 } from './scenarios/41-new-job-publishing-matching-profile-refresh-simulation';
import { runScenario42 } from './scenarios/42-matching-transparency-explainability-notifications-audit';`;

indexContent = indexContent.replace(oldImport, newImports);

// 2. Add to scenarioFns array
const oldArrayEnd = "    { id: 'SCENARIO-36', fn: runScenario36 },\n  ];";
const newArrayEnd = `    { id: 'SCENARIO-36', fn: runScenario36 },
    { id: 'SCENARIO-37', fn: runScenario37 },
    { id: 'SCENARIO-38', fn: runScenario38 },
    { id: 'SCENARIO-39', fn: runScenario39 },
    { id: 'SCENARIO-40', fn: runScenario40 },
    { id: 'SCENARIO-41', fn: runScenario41 },
    { id: 'SCENARIO-42', fn: runScenario42 },
  ];`;

indexContent = indexContent.replace(oldArrayEnd, newArrayEnd);
fs.writeFileSync('src/lib/testing/index.ts', indexContent, 'utf8');
console.log('✅ Registered scenarios 37-42 in testing/index.ts');
