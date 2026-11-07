const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Check if AdminLayout import is present
if (!content.includes("import AdminLayout from '@/components/admin/layout/AdminLayout';")) {
  content = content.replace(
    "import GeminiBrowserSpiderHub from '@/components/admin/GeminiBrowserSpiderHub';",
    "import GeminiBrowserSpiderHub from '@/components/admin/GeminiBrowserSpiderHub';\nimport AdminLayout from '@/components/admin/layout/AdminLayout';\nimport AdminDashboardOverview from '@/components/admin/dashboard/AdminDashboardOverview';"
  );
}

// 2. Replace the outer header & sidebar block
const oldShellStart = `  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 font-solaiman">`;
const oldShellEnd = `        {/* 3. MAIN CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100">`;

// Handle CRLF vs LF
const normalizedOldShellStart = oldShellStart.replace(/\r?\n/g, '\r\n');
const normalizedOldShellEnd = oldShellEnd.replace(/\r?\n/g, '\r\n');

const newShellHeader = `  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={handleTabChange}
      onLogout={handleLogout}
      adminEmail="admin@chakrisheba.com"
      adminName="সুপার অ্যাডমিন"
    >
      <div className="space-y-6">
        {/* Breadcrumb & Section Title Bar (Shown on non-dashboard tabs) */}
        {activeTab !== 'dashboard' && (`;

// Check positions
const idxStart = content.indexOf(normalizedOldShellStart);
const idxEnd = content.indexOf(normalizedOldShellEnd);

if (idxStart === -1 || idxEnd === -1) {
  console.error('Could not find shell markers! idxStart:', idxStart, 'idxEnd:', idxEnd);
  process.exit(1);
}

const beforeShell = content.substring(0, idxStart);
const afterShell = content.substring(idxEnd + normalizedOldShellEnd.length);

// Also need to close the {activeTab !== 'dashboard' && ( after the title bar
const titleBarCloseTarget = `            </div>\r\n          </div>`;
const titleBarCloseIdx = afterShell.indexOf(titleBarCloseTarget);

if (titleBarCloseIdx === -1) {
  console.error('Could not find title bar close marker!');
  process.exit(1);
}

const beforeTitleClose = afterShell.substring(0, titleBarCloseIdx + titleBarCloseTarget.length);
const afterTitleClose = afterShell.substring(titleBarCloseIdx + titleBarCloseTarget.length);

const updatedAfterTitleClose = `\r\n        )}\r\n` + afterTitleClose;

// 3. Replace the activeTab === 'dashboard' block with AdminDashboardOverview
const dashboardTargetStart = `          {/* TAB 1: OVERVIEW -> DASHBOARD (STEP 14: PLATFORM GOVERNANCE & CONTROL CENTER) */}\r\n          {activeTab === 'dashboard' && (`;
const dashboardTargetEnd = `          {/* TAB 2: OVERVIEW -> SYSTEM HEALTH (Enhanced with Live Diagnostic Engine) */}`;

const dashStartIdx = updatedAfterTitleClose.indexOf(dashboardTargetStart);
const dashEndIdx = updatedAfterTitleClose.indexOf(dashboardTargetEnd);

if (dashStartIdx === -1 || dashEndIdx === -1) {
  console.error('Could not find dashboard markers! dashStartIdx:', dashStartIdx, 'dashEndIdx:', dashEndIdx);
  process.exit(1);
}

const newDashboardBlock = `          {/* TAB 1: OVERVIEW -> APPROVED BANGLA ADMIN DASHBOARD REDESIGN */}
          {activeTab === 'dashboard' && (
            <AdminDashboardOverview
              stats={stats}
              jobs={jobs}
              candidates={candidates}
              applications={applications}
              onNavigate={handleTabChange}
              onEditJob={(job) => {
                setEditingJob(job);
                setIsCreatingNewJob(false);
                setActiveTab('circulars');
              }}
              onViewJob={(jobId) => {
                setActiveTab('circulars');
              }}
            />
          )}

`;

const beforeDash = updatedAfterTitleClose.substring(0, dashStartIdx);
const afterDash = updatedAfterTitleClose.substring(dashEndIdx);

const updatedBody = beforeDash + newDashboardBlock.replace(/\n/g, '\r\n') + afterDash;

// 4. Replace the bottom closing tags: </main> </div> </div>
const oldBottom = `      </main>\r\n      </div>\r\n\r\n    </div>\r\n  );\r\n}`;
const newBottom = `      </div>\r\n    </AdminLayout>\r\n  );\r\n}`;

const bottomIdx = updatedBody.indexOf(oldBottom);
if (bottomIdx === -1) {
  console.error('Could not find bottom markers!');
  process.exit(1);
}

const finalContent = beforeShell + newShellHeader.replace(/\n/g, '\r\n') + beforeTitleClose + updatedBody.substring(0, bottomIdx) + newBottom;

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('Successfully updated src/app/admin/page.tsx with AdminLayout & AdminDashboardOverview!');

