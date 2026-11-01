const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'lib', 'testing', 'scenarios');
const files = [
  '49-public-job-details-application-entry-eligibility-audit.ts',
  '50-application-form-validation-cv-document-attachment-audit.ts',
  '51-application-submission-persistence-duplicate-prevention-audit.ts',
  '52-user-panel-applications-dashboard-tracking-audit.ts',
  '53-admin-application-review-status-transition-audit.ts',
  '54-application-status-notification-synchronization-audit.ts'
];

for (const f of files) {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');

  // Fix return object missing startTime
  c = c.replace(/return {\s+scenarioId,/g, 'return {\n      scenarioId,\n      startTime,');

  // Fix errors.push
  c = c.replace(/errors\.push\(\{\s*step:[^}]+message:\s*err\.message,\s*stack:\s*err\.stack\s*\}\);/g,
    "errors.push({ type: 'interaction_failure', message: err.message, stack: err.stack, timestamp: new Date().toISOString() });");

  // Fix category 'sync' to 'api'
  c = c.replace(/category: 'sync'/g, "category: 'api'");

  // Fix Scenario 50 document properties
  if (f.startsWith('50-')) {
    c = c.replace(/const sampleDoc = \{[\s\S]+?verificationStatus: 'verified' as const,/, `const sampleDoc = {
      id: 'SYNTH-DOC-CV-BARISHAL-002',
      candidateId,
      title: 'Curriculum Vitae (Synthetic)',
      name: 'Curriculum Vitae (Synthetic).pdf',
      fileName: 'barishal_cv.pdf',
      type: 'resume',
      fileType: 'application/pdf',
      size: '240 KB',
      fileSize: '240 KB',
      uploadedAt: new Date().toISOString(),
      uploadDate: new Date().toLocaleDateString('bn-BD'),
      url: '/uploads/synthetic/barishal_cv.pdf',
      verificationStatus: 'verified' as const,`);
  }

  fs.writeFileSync(p, c, 'utf8');
  console.log('Fixed', f);
}
