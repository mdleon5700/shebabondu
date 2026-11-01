const fs = require('fs');
let c = fs.readFileSync('src/lib/db.ts', 'utf8');

const targetRegex = /getAllApplications\(\): ApplicationRequest\[\] {[\s\S]+?return all\.sort\(\(a, b\) => \(b\.id > a\.id \? 1 : -1\)\);\s+}/;

const replacement = `getAllApplications(): ApplicationRequest[] {
    const db = loadDB();
    const all: ApplicationRequest[] = [];
    for (const list of Object.values(db.applications)) {
      if (Array.isArray(list)) all.push(...list);
    }
    const synthApps = SyntheticUserManager.getAllApplications();
    all.push(...synthApps);
    if (all.length === 0) return [...mockApplications];
    return all.sort((a, b) => (b.id > a.id ? 1 : -1));
  }`;

if (targetRegex.test(c)) {
  c = c.replace(targetRegex, replacement);
  fs.writeFileSync('src/lib/db.ts', c, 'utf8');
  console.log('Successfully patched getAllApplications in src/lib/db.ts.');
} else {
  console.error('Target regex did not match.');
}
