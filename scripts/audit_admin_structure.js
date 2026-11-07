const fs = require('fs');
const path = require('path');

const adminPagePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
const adminPage = fs.readFileSync(adminPagePath, 'utf8');

// 1. Find imports
const imports = adminPage.split('\n')
  .filter(l => l.trim().startsWith('import') && l.includes('components/admin'))
  .map(l => l.trim());

// 2. Find tab conditions
const tabMatches = adminPage.match(/activeTab\s*===?\s*['"][^'"]+['"]/g) || [];
const tabs = [...new Set(tabMatches.map(m => m.replace(/activeTab\s*===?\s*['"]/, '').replace(/['"]$/, '')))];

// 3. Find subTab conditions
const subTabMatches = adminPage.match(/activeSubTab\s*===?\s*['"][^'"]+['"]/g) || [];
const subTabs = [...new Set(subTabMatches.map(m => m.replace(/activeSubTab\s*===?\s*['"]/, '').replace(/['"]$/, '')))];

// 4. Find all API routes under src/app/api/admin
function getApiRoutes(dir, base = '/api/admin') {
  let routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      routes = routes.concat(getApiRoutes(full, `${base}/${entry.name}`));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      routes.push(base);
    }
  }
  return routes;
}
const apiAdminDir = path.join(__dirname, '..', 'src', 'app', 'api', 'admin');
const apiRoutes = getApiRoutes(apiAdminDir);

// 5. List all files in src/components/admin
const adminCompDir = path.join(__dirname, '..', 'src', 'components', 'admin');
const adminComponents = fs.readdirSync(adminCompDir);

// 6. Inspect serverDB methods in src/lib/db.ts
const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
const dbContent = fs.readFileSync(dbPath, 'utf8');
const dbMethods = [...dbContent.matchAll(/^\s{2}([a-zA-Z0-9_]+)\s*\(/gm)].map(m => m[1]);

const summary = {
  imports,
  tabs,
  subTabs,
  adminComponents,
  apiRoutesCount: apiRoutes.length,
  apiRoutes,
  dbMethodsCount: dbMethods.length,
  dbMethods: [...new Set(dbMethods)]
};
fs.writeFileSync(path.join(__dirname, '..', 'audit_admin_summary_utf8.json'), JSON.stringify(summary, null, 2), 'utf8');
console.log('Successfully saved audit_admin_summary_utf8.json');

