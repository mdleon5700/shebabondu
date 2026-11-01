const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'testing', 'index.ts');
let content = fs.readFileSync(filePath, 'utf8');

const importTarget = `import { runScenario42 } from './scenarios/42-matching-transparency-explainability-notifications-audit';`;

const importReplacement = `import { runScenario42 } from './scenarios/42-matching-transparency-explainability-notifications-audit';
import { runScenario43 } from './scenarios/43-notification-catalog-event-lifecycle-audit';
import { runScenario44 } from './scenarios/44-64-district-personalized-job-alerts-eligibility-audit';
import { runScenario45 } from './scenarios/45-notification-preferences-channel-control-audit';
import { runScenario46 } from './scenarios/46-duplicate-prevention-and-idempotency-audit';
import { runScenario47 } from './scenarios/47-deadline-alerts-and-automated-reminders-audit';
import { runScenario48 } from './scenarios/48-user-panel-notification-experience-security-isolation-audit';`;

const scenarioTarget = `    { id: 'SCENARIO-42', fn: runScenario42 },`;

const scenarioReplacement = `    { id: 'SCENARIO-42', fn: runScenario42 },
    { id: 'SCENARIO-43', fn: runScenario43 },
    { id: 'SCENARIO-44', fn: runScenario44 },
    { id: 'SCENARIO-45', fn: runScenario45 },
    { id: 'SCENARIO-46', fn: runScenario46 },
    { id: 'SCENARIO-47', fn: runScenario47 },
    { id: 'SCENARIO-48', fn: runScenario48 },`;

if (content.includes(importTarget) && content.includes(scenarioTarget)) {
  content = content.replace(importTarget, importReplacement);
  content = content.replace(scenarioTarget, scenarioReplacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully added Scenarios 43-48 to testing/index.ts');
} else {
  console.error('Target not found in testing/index.ts');
  process.exit(1);
}
