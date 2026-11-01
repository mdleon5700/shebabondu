const fs = require('fs');
const file = 'C:/Users/Leon Rahman/Documents/chakri-sheba/src/app/admin/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!code.includes("import JobVerificationCenter from '@/components/admin/JobVerificationCenter';")) {
  code = code.replace(
    "import CandidateManagementHub from '@/components/admin/CandidateManagementHub';",
    "import CandidateManagementHub from '@/components/admin/CandidateManagementHub';\nimport JobVerificationCenter from '@/components/admin/JobVerificationCenter';"
  );
}

// 2. Add JobVerificationCenter component inside activeTab === 'imported-drafts'
const oldTabStart = "{activeTab === 'imported-drafts' && (\n            <div className=\"space-y-6\">";
const newTabStart = `{activeTab === 'imported-drafts' && (
            <div className="space-y-6">
              <JobVerificationCenter
                drafts={drafts}
                onRefreshDrafts={fetchAllAdminData}
                onApproveDraft={handleApproveDraft}
                onRejectDraft={handleRejectDraft}
              />`;

if (code.includes(oldTabStart) && !code.includes('<JobVerificationCenter')) {
  code = code.replace(oldTabStart, newTabStart);
}

fs.writeFileSync(file, code, 'utf8');
console.log('Successfully wired JobVerificationCenter into admin page!');
