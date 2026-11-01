const fs = require('fs');
const path = require('path');

class BuildMode {
  constructor() {}

  buildNewProject(targetDir, projectSpec) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const name = projectSpec.name || 'new-website';
    const description = projectSpec.description || 'Modern Web Application';

    // 1. package.json
    const packageJson = {
      name,
      version: '1.0.0',
      description,
      main: 'server.js',
      scripts: {
        start: 'node server.js',
        test: 'node test.js'
      },
      dependencies: {},
      devDependencies: {}
    };
    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8');

    // 2. server.js (Express-style native HTTP or Node app)
    const serverJs = `const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!DOCTYPE html><html><head><title>${name}</title></head><body><h1>${name}</h1><p>${description}</p></body></html>');
  } else if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
  });
}

module.exports = server;
`;
    fs.writeFileSync(path.join(targetDir, 'server.js'), serverJs, 'utf8');

    // 3. test.js
    const testJs = `const assert = require('assert');
const server = require('./server');

console.log('[TEST] Checking server exports...');
assert(typeof server.listen === 'function', 'Server must be an HTTP server instance');
console.log('[PASS] Build Mode verification test passed cleanly');
`;
    fs.writeFileSync(path.join(targetDir, 'test.js'), testJs, 'utf8');

    // 4. README.md
    fs.writeFileSync(path.join(targetDir, 'README.md'), `# ${name}\n\n${description}\n\nCreated by Universal Autonomous AI Brain.`, 'utf8');

    return {
      success: true,
      targetDir,
      createdFiles: ['package.json', 'server.js', 'test.js', 'README.md']
    };
  }
}

module.exports = BuildMode;
