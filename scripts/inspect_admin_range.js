const fs = require('fs');
let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

const isCRLF = content.includes('\r\n');
console.log('File is CRLF:', isCRLF);

const lines = content.split(/\r?\n/);
let returnLineIdx = -1;
let breadcrumbLineIdx = -1;

for (let i = 1800; i < 2200; i++) {
  if (lines[i].includes('return (') && lines[i+1]?.includes('<div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 font-solaiman">')) {
    returnLineIdx = i;
  }
  if (lines[i].includes('{/* Breadcrumb & Section Title Bar */}')) {
    breadcrumbLineIdx = i;
  }
}

console.log('returnLineIdx:', returnLineIdx, 'breadcrumbLineIdx:', breadcrumbLineIdx);

let dashboardStartIdx = -1;
let dashboardEndIdx = -1;
for (let i = 2100; i < 2400; i++) {
  if (lines[i].includes("activeTab === 'dashboard' && (")) {
    dashboardStartIdx = i;
  }
  if (lines[i].includes("activeTab === 'system-health' && (")) {
    dashboardEndIdx = i;
  }
}
console.log('dashboardStartIdx:', dashboardStartIdx, 'dashboardEndIdx:', dashboardEndIdx);

let bottomMainIdx = -1;
for (let i = lines.length - 50; i < lines.length; i++) {
  if (lines[i]?.includes('</main>')) {
    bottomMainIdx = i;
  }
}
console.log('bottomMainIdx:', bottomMainIdx, 'Total lines:', lines.length);

