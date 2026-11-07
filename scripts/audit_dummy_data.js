const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '../src/components/admin');
const appAdminDir = path.join(__dirname, '../src/app/admin');

const findings = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  // Check for dummy data indicators
  const dummyIndicators = [
    { pattern: /2847|48921|1245320|2,847|48,921|12,45,320|২,৮৪৭|৪৮,৯২১|১২,৪৫,৩২০/, desc: 'Approved Mockup benchmark numbers' },
    { pattern: /\+12\.4%|\+18\.7%|\+26\.1%|\+১২\.৪%|\+১৮\.৭%|\+২৬\.১%/, desc: 'Hardcoded KPI percentage increase' },
    { pattern: /২,৪২১|২৭৮|৩৬|১০৮/, desc: 'Hardcoded Donut chart counts' },
    { pattern: /৮৫\.১%|৯\.৮%|১\.৩%|৩\.৮%/, desc: 'Hardcoded Donut percentages' },
    { pattern: /109841|1512409841|214589/, desc: 'Hardcoded candidate roll/reg dummy values' }
  ];

  dummyIndicators.forEach(({ pattern, desc }) => {
    const matches = content.match(pattern);
    if (matches) {
      findings.push({
        file: relPath,
        desc,
        matches: Array.from(new Set(matches))
      });
    }
  });
}

function traverse(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && e.name !== '.next') traverse(full);
    } else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) {
      checkFile(full);
    }
  }
}

traverse(adminDir);
traverse(appAdminDir);

console.log(JSON.stringify(findings, null, 2));
