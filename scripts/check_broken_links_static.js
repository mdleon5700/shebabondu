const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      files = files.concat(walk(full));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      files.push(full);
    }
  }
  return files;
}

const srcDir = path.resolve('C:/Users/Leon Rahman/Documents/chakri-sheba/src');
const allFiles = walk(srcDir);

// Collect all static app routes
function getAppRoutes(dir, base = '') {
  let r = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (e.name.startsWith('(') && e.name.endsWith(')')) {
        r = r.concat(getAppRoutes(path.join(dir, e.name), base));
      } else if (!e.name.startsWith('_') && !e.name.startsWith('.')) {
        r = r.concat(getAppRoutes(path.join(dir, e.name), base + '/' + e.name));
      }
    } else if (e.name === 'page.tsx') {
      r.push(base === '' ? '/' : base);
    }
  }
  return r;
}

const knownRoutes = new Set(getAppRoutes(path.join(srcDir, 'app')));
console.log('Known routes count:', knownRoutes.size);

const hrefRegex = /href=[\"']([^\"']+)[\"']/g;
const linksFound = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(srcDir, file).replace(/\\/g, '/');
  if (relPath.includes('testing/') || relPath.includes('scenarios/')) continue;

  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('/api') || href.startsWith('#')) {
      continue;
    }
    // Clean query/hash
    const cleanPath = href.split('?')[0].split('#')[0];
    linksFound.push({ file: relPath, href, cleanPath });
  }
}

console.log('Total internal links found:', linksFound.length);

const suspectLinks = [];
for (const link of linksFound) {
  // Check if matches knownRoutes directly or dynamic routes
  let matched = knownRoutes.has(link.cleanPath);
  if (!matched) {
    // Check if matches a dynamic route
    for (const kr of knownRoutes) {
      if (kr.includes('[')) {
        const regexStr = '^' + kr.replace(/\[\.\.\.[^\]]+\]/g, '.*').replace(/\[[^\]]+\]/g, '[^/]+') + '$';
        if (new RegExp(regexStr).test(link.cleanPath)) {
          matched = true;
          break;
        }
      }
    }
  }
  if (!matched && link.cleanPath !== '') {
    suspectLinks.push(link);
  }
}

console.log('Suspect Links:', suspectLinks.length);
// Group by cleanPath
const grouped = {};
for (const s of suspectLinks) {
  if (!grouped[s.cleanPath]) grouped[s.cleanPath] = [];
  grouped[s.cleanPath].push(s.file);
}
console.log(JSON.stringify(grouped, null, 2));
