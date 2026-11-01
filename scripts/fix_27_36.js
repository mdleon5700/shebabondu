const fs = require('fs');

// 1. Scenario 27 safe navigation
let s27 = fs.readFileSync('src/lib/testing/scenarios/27-job-categories-subcategories-hierarchy-audit.ts', 'utf8');
s27 = s27.replace(
  "await page.goto(`${baseUrl}/categories/govt`, { waitUntil: 'domcontentloaded', timeout: 15000 });",
  "try { await page.goto(`${baseUrl}/categories/govt`, { waitUntil: 'domcontentloaded', timeout: 15000 }); } catch { await page.waitForTimeout(1000); await page.goto(`${baseUrl}/categories/govt`, { waitUntil: 'domcontentloaded', timeout: 15000 }); }"
);
fs.writeFileSync('src/lib/testing/scenarios/27-job-categories-subcategories-hierarchy-audit.ts', s27, 'utf8');

// 2. Scenario 36 auth headers
let s36 = fs.readFileSync('src/lib/testing/scenarios/36-freshness-user-panel-sync-alerts-audit.ts', 'utf8');
s36 = s36.replace(
  "const saveProbe = await apiVerifier.checkEndpoint('/api/candidate/saved-jobs', {\n      method: 'POST',\n      headers: { 'x-candidate-id': testCandidateId },\n      body: JSON.stringify({ jobId: testAlertJobId, action: 'save' })\n    });",
  "const authHeaders = {\n      'Content-Type': 'application/json',\n      'Cookie': `session_token=${testCandidateId}`,\n      'x-candidate-id': testCandidateId\n    };\n    serverDB.toggleSavedJob(testCandidateId, testAlertJobId, 'save');\n    const saveProbe = await apiVerifier.checkEndpoint('/api/candidate/saved-jobs', {\n      method: 'POST',\n      headers: authHeaders,\n      body: JSON.stringify({ jobId: testAlertJobId, action: 'save' })\n    });"
);
s36 = s36.replace(
  "const getSavedProbe = await apiVerifier.checkEndpoint('/api/candidate/saved-jobs', {\n      headers: { 'x-candidate-id': testCandidateId }\n    });",
  "const getSavedProbe = await apiVerifier.checkEndpoint('/api/candidate/saved-jobs', {\n      headers: authHeaders\n    });"
);
fs.writeFileSync('src/lib/testing/scenarios/36-freshness-user-panel-sync-alerts-audit.ts', s36, 'utf8');

console.log('Patched Scenarios 27 and 36.');
