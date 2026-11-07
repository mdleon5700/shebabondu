const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'src', 'app');

function getPages(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const rel = path.join(base, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getPages(full, rel));
    } else if (item === 'page.tsx') {
      results.push(base.replace(/\\/g, '/'));
    }
  }
  return results;
}

const allRoutes = getPages(appDir);
console.log('Total routes with page.tsx:', allRoutes.length);

const adminRoutes = allRoutes.filter(r => r === 'admin' || r.startsWith('admin/'));
const dashboardRoutes = allRoutes.filter(r => r === 'dashboard' || r.startsWith('dashboard/'));
const redirectRoutes = ['profile', 'wallet', 'vault', 'documents', 'applications', 'notifications'];

const publicRoutes = allRoutes.filter(r => 
  !adminRoutes.includes(r) && 
  !dashboardRoutes.includes(r) && 
  !redirectRoutes.includes(r)
);

console.log('Admin routes:', adminRoutes.length);
console.log('Dashboard routes:', dashboardRoutes.length);
console.log('Redirect to dashboard:', redirectRoutes.length);
console.log('Pure Public routes:', publicRoutes.length);
console.log('\nList of Pure Public Routes:');
publicRoutes.forEach((r, i) => {
  const routePath = r === '' ? '/' : `/${r}`;
  console.log(`${i + 1}. ${routePath}`);
});

