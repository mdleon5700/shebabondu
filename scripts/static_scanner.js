const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      files = files.concat(walk(full));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx'))) {
      files.push(full);
    }
  }
  return files;
}

const srcDir = path.resolve('C:/Users/Leon Rahman/Documents/chakri-sheba/src');
const allFiles = walk(srcDir);
console.log('Total source files:', allFiles.length);

const issues = [];
const placeholderRegex = /\b(lorem ipsum|dolor sit amet|TODO:|FIXME:|dummy text|sample text)\b/i;
const deadLinkRegex = /href=["']#["']/g;
const emptyHeadingRegex = /<h[1-6][^>]*>\s*<\/h[1-6]>/g;
const emptyPRegex = /<p[^>]*>\s*<\/p>/g;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(srcDir, file).replace(/\\/g, '/');

  const isTestOrMock = relPath.includes('testing/') || relPath.includes('mock') || relPath.includes('scenarios/');

  if (!isTestOrMock) {
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (placeholderRegex.test(line)) {
        issues.push({ file: relPath, line: idx + 1, type: 'placeholder', match: line.trim() });
      }
    });
  }

  const deadLinks = content.match(deadLinkRegex);
  if (deadLinks && !isTestOrMock) {
    issues.push({ file: relPath, type: 'dead_link_hash', count: deadLinks.length });
  }

  const emptyHeadings = content.match(emptyHeadingRegex);
  if (emptyHeadings) {
    issues.push({ file: relPath, type: 'empty_heading', count: emptyHeadings.length });
  }
}

console.log('Found issues:', issues.length);
console.log(JSON.stringify(issues, null, 2));
