const fs = require('fs');

console.log('--- 1. WebsiteCmsSeoManagement tabs ---');
const cmsContent = fs.readFileSync('src/components/admin/WebsiteCmsSeoManagement.tsx', 'utf8');
const cmsTabs = [...cmsContent.matchAll(/currentTab\s*===?\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('CMS tabs:', [...new Set(cmsTabs)]);

console.log('\n--- 2. MediaLibraryManager analysis ---');
const mediaContent = fs.readFileSync('src/components/admin/MediaLibraryManager.tsx', 'utf8');
console.log('MediaLibraryManager lines:', mediaContent.split('\n').length);
const mediaState = [...mediaContent.matchAll(/const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState/g)].map(m => m[1]);
console.log('Media state:', mediaState);

console.log('\n--- 3. Page APIs in src/app/api/admin/pages ---');
const pageApiRoutes = fs.readdirSync('src/app/api/admin/pages', { withFileTypes: true });
pageApiRoutes.forEach(p => console.log(p.name));

console.log('\n--- 4. DB Methods for Pages & Revisions in src/lib/db.ts ---');
const dbContent = fs.readFileSync('src/lib/db.ts', 'utf8');
const pageDbMethods = [...dbContent.matchAll(/(getPages|getPageById|savePage|deletePage|restorePageRevision|publishPage|getPublishedPageBySlug|getPublishedPageById)/g)].map(m => m[0]);
console.log('Page DB methods:', [...new Set(pageDbMethods)]);

