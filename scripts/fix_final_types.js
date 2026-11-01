const fs = require('fs');
const path = require('path');

function replaceInFile(relPath, replacers) {
  const fullPath = path.join(__dirname, '..', relPath);
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const [target, replacement] of replacers) {
    content = content.split(target).join(replacement);
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed ${relPath}`);
}

// Fix test_step09_scenarios.ts
replaceInFile('scripts/test_step09_scenarios.ts', [
  [`const browserCtrl = new BrowserController({
    id: \`VERIFY-STEP09-\${Date.now().toString().slice(-4)}\`,
    environment: 'development',
    browser: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 720 },
    timeoutMs: 15000
  });`,
  `const browserCtrl = new BrowserController({
    id: \`VERIFY-STEP09-\${Date.now().toString().slice(-4)}\`,
    name: 'Step 09 Standalone Verifier',
    environment: 'development',
    browser: 'chrome',
    headless: true,
    baseUrl,
    maxRetries: 1,
    syntheticTag: 'STEP09',
    viewport: { width: 1280, height: 720 },
    timeoutMs: 15000
  });`]
]);

// Fix scenario 44
replaceInFile('src/lib/testing/scenarios/44-64-district-personalized-job-alerts-eligibility-audit.ts', [
  [`const testCircularAD: Partial<JobCircular> = {`, `const testCircularAD: any = {`],
  [`const sylhetDistrictJob: Partial<JobCircular> = {`, `const sylhetDistrictJob: any = {`],
  [`const nationwideJob: Partial<JobCircular> = {`, `const nationwideJob: any = {`]
]);

// Fix scenario 46
replaceInFile('src/lib/testing/scenarios/46-duplicate-prevention-and-idempotency-audit.ts', [
  [`type: 'job_match',`, `type: 'deadline_reminder',`]
]);

console.log('All final fixes applied!');
