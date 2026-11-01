const fs = require('fs');
let c = fs.readFileSync('src/lib/testing/index.ts', 'utf8');

const importTarget = "import { runScenario48 } from './scenarios/48-user-panel-notification-experience-security-isolation-audit';";
const newImports = `import { runScenario48 } from './scenarios/48-user-panel-notification-experience-security-isolation-audit';
import { runScenario49 } from './scenarios/49-public-job-details-application-entry-eligibility-audit';
import { runScenario50 } from './scenarios/50-application-form-validation-cv-document-attachment-audit';
import { runScenario51 } from './scenarios/51-application-submission-persistence-duplicate-prevention-audit';
import { runScenario52 } from './scenarios/52-user-panel-applications-dashboard-tracking-audit';
import { runScenario53 } from './scenarios/53-admin-application-review-status-transition-audit';
import { runScenario54 } from './scenarios/54-application-status-notification-synchronization-audit';
import { runScenario55 } from './scenarios/55-role-based-access-control-security-boundary-audit';
import { runScenario56 } from './scenarios/56-admin-dashboard-analytics-integrity-audit';
import { runScenario57 } from './scenarios/57-admin-user-job-content-management-lifecycle-audit';
import { runScenario58 } from './scenarios/58-user-panel-comprehensive-profile-settings-audit';
import { runScenario59 } from './scenarios/59-cross-panel-full-synchronization-audit';
import { runScenario60 } from './scenarios/60-responsive-viewports-accessibility-seo-permanently-free-audit';
import { runScenario61 } from './scenarios/61-nationwide-64-district-full-user-journey-simulation';
import { runScenario62 } from './scenarios/62-comprehensive-security-vulnerability-hardening-audit';
import { runScenario63 } from './scenarios/63-high-concurrency-performance-scalability-audit';
import { runScenario64 } from './scenarios/64-gemini-independence-operational-resilience-regression-audit';`;

const listTarget = "    { id: 'SCENARIO-48', fn: runScenario48 },";
const newListItems = `    { id: 'SCENARIO-48', fn: runScenario48 },
    { id: 'SCENARIO-49', fn: runScenario49 },
    { id: 'SCENARIO-50', fn: runScenario50 },
    { id: 'SCENARIO-51', fn: runScenario51 },
    { id: 'SCENARIO-52', fn: runScenario52 },
    { id: 'SCENARIO-53', fn: runScenario53 },
    { id: 'SCENARIO-54', fn: runScenario54 },
    { id: 'SCENARIO-55', fn: runScenario55 },
    { id: 'SCENARIO-56', fn: runScenario56 },
    { id: 'SCENARIO-57', fn: runScenario57 },
    { id: 'SCENARIO-58', fn: runScenario58 },
    { id: 'SCENARIO-59', fn: runScenario59 },
    { id: 'SCENARIO-60', fn: runScenario60 },
    { id: 'SCENARIO-61', fn: runScenario61 },
    { id: 'SCENARIO-62', fn: runScenario62 },
    { id: 'SCENARIO-63', fn: runScenario63 },
    { id: 'SCENARIO-64', fn: runScenario64 },`;

if (c.includes(importTarget) && c.includes(listTarget)) {
  c = c.replace(importTarget, newImports);
  c = c.replace(listTarget, newListItems);
  fs.writeFileSync('src/lib/testing/index.ts', c, 'utf8');
  console.log('Successfully wired Scenarios 49 to 64 into master Autonomous Testing Spider.');
} else {
  console.error('Target not found in index.ts');
}
