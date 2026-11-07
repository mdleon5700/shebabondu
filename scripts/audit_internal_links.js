const fs = require('fs');
const path = require('path');

function getFiles(dir, filter = () => true) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, filter));
    } else if (filter(fullPath)) {
      results.push(fullPath);
    }
  });
  return results;
}

// 1. Collect all filesystem routes
const appDir = path.resolve('src/app');
const pageFiles = getFiles(appDir, f => f.endsWith('page.tsx') || f.endsWith('page.jsx') || f.endsWith('page.js'));

const routes = new Set();
pageFiles.forEach(f => {
  let rel = path.relative(appDir, f).replace(/\\/g, '/');
  rel = rel.replace(/\/page\.(tsx|jsx|js)$/, '').replace(/^page\.(tsx|jsx|js)$/, '');
  routes.add('/' + rel);
});

console.log('Total registered filesystem page routes:', routes.size);

// Dynamic pattern matching helper
function matchesRoute(targetPath) {
  if (!targetPath || targetPath === '#' || targetPath.startsWith('http://') || targetPath.startsWith('https://') || targetPath.startsWith('mailto:') || targetPath.startsWith('tel:') || targetPath.startsWith('javascript:')) {
    return true; // External or anchor
  }

  // Strip query string and hash
  const cleanPath = targetPath.split('?')[0].split('#')[0];
  if (cleanPath === '' || cleanPath === '/') return true;

  // Direct match
  if (routes.has(cleanPath)) return true;

  // Check against dynamic route patterns (excluding generic catch-all [...slug])
  for (const r of routes) {
    if (r.includes('[') && r.includes(']') && !r.includes('[...slug]')) {
      const regexStr = '^' + r
        .replace(/\[\.\.\.([^\]]+)\]/g, '(.+)') // Catch-all
        .replace(/\[([^\]]+)\]/g, '([^/]+)')    // Dynamic segment [id]
        + '$';
      const regex = new RegExp(regexStr);
      if (regex.test(cleanPath)) return true;
    }
  }

  // Check CMS pages in local_store.json for [...slug] and /p/[slug]
  try {
    const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
    if (store.pages && store.pages.some(p => p.slug === cleanPath || p.id === cleanPath.replace(/^\//, ''))) {
      return true;
    }
  } catch (e) {}

  return false;
}

// 2. Scan all files in src/ for links: href=... and router.push(...)
const srcFiles = getFiles(path.resolve('src'), f => f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js'));
const brokenLinks = [];

const hrefRegex = /href=["']([^"']+)["']/g;
const routerPushRegex = /router\.push\(["']([^"']+)["']\)/g;

srcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const link = match[1];
    if (link.startsWith('/') && !matchesRoute(link)) {
      brokenLinks.push({ file: path.relative(process.cwd(), file), link, type: 'href' });
    }
  }
  while ((match = routerPushRegex.exec(content)) !== null) {
    const link = match[1];
    if (link.startsWith('/') && !matchesRoute(link)) {
      brokenLinks.push({ file: path.relative(process.cwd(), file), link, type: 'router.push' });
    }
  }
});

console.log('Total broken link occurrences found:', brokenLinks.length);
const uniqueBroken = [...new Set(brokenLinks.map(b => b.link))];
console.log('Unique broken target paths (' + uniqueBroken.length + '):', uniqueBroken);

uniqueBroken.forEach(ub => {
  const occ = brokenLinks.filter(b => b.link === ub);
  console.log(`\n• Target: "${ub}" (${occ.length} references)`);
  occ.slice(0, 5).forEach(o => console.log(`   - ${o.file} (${o.type})`));
});
