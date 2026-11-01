const fs = require('fs');
const path = require('path');

class DeterministicScanner {
  constructor(options = {}) {
    this.maxFileSize = options.maxFileSize || 1024 * 1024; // 1MB limit for scan
    this.ignoredDirs = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.cache']);
  }

  scan(workspacePath) {
    const findings = [];
    const files = this._collectFiles(workspacePath);

    for (const filePath of files) {
      this._scanSingleFile(workspacePath, filePath, findings);
    }

    // Check imports cross-references
    this._scanImportIntegrity(workspacePath, files, findings);

    return {
      timestamp: new Date().toISOString(),
      workspacePath,
      totalFilesScanned: files.length,
      findingsCount: findings.length,
      findingsSummary: {
        critical: findings.filter(f => f.severity === 'CRITICAL').length,
        high: findings.filter(f => f.severity === 'HIGH').length,
        medium: findings.filter(f => f.severity === 'MEDIUM').length,
        low: findings.filter(f => f.severity === 'LOW').length,
        info: findings.filter(f => f.severity === 'INFO').length
      },
      findings
    };
  }

  _collectFiles(dir, fileList = []) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (this.ignoredDirs.has(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          this._collectFiles(fullPath, fileList);
        } else if (entry.isFile()) {
          fileList.push(fullPath);
        }
      }
    } catch (e) {}
    return fileList;
  }

  _scanSingleFile(workspacePath, filePath, findings) {
    const relPath = path.relative(workspacePath, filePath);
    const ext = path.extname(filePath).toLowerCase();

    // 1. JSON file integrity
    if (ext === '.json') {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
      } catch (err) {
        findings.push({
          issueId: `JSON-SYNTAX-${Math.abs(this._hash(relPath))}`,
          category: 'SYNTAX',
          severity: 'CRITICAL',
          file: relPath,
          description: `Invalid JSON syntax: ${err.message}`,
          evidence: err.message,
          reproducible: true,
          suggestedFix: 'Correct JSON syntax formatting and commas'
        });
      }
    }

    // 2. Source code scans (.ts, .tsx, .js, .jsx)
    if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for text encoding corruption (??? in Bengali strings or replacement characters)
        if (content.includes('???') || content.includes('\uFFFD')) {
          const count = (content.match(/\?\?\?/g) || []).length;
          findings.push({
            issueId: `ENC-CORRUPT-${Math.abs(this._hash(relPath))}`,
            category: 'ENCODING',
            severity: 'HIGH',
            file: relPath,
            description: `Potential UTF-8 text corruption detected (${count} occurrences of ???)`,
            evidence: `Found ${count} occurrences of '???' sequence in text strings`,
            reproducible: true,
            suggestedFix: 'Restore original UTF-8 characters and verify file encoding'
          });
        }

        // Check for hardcoded API secret keys
        const secretMatches = content.match(/(sk_live_[0-9a-zA-Z]{24,}|AIzaSy[0-9a-zA-Z_-]{33}|ghp_[0-9a-zA-Z]{36})/g);
        if (secretMatches && !relPath.includes('.example')) {
          findings.push({
            issueId: `SEC-KEY-${Math.abs(this._hash(relPath))}`,
            category: 'SECURITY',
            severity: 'CRITICAL',
            file: relPath,
            description: 'Potential hardcoded API private key in source code',
            evidence: 'Detected credential token pattern matching live secret format',
            reproducible: true,
            suggestedFix: 'Move secret key to server environment variable'
          });
        }

        // Check for empty button click handlers
        if (/onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/.test(content)) {
          findings.push({
            issueId: `UX-EMPTY-HANDLER-${Math.abs(this._hash(relPath))}`,
            category: 'QUALITY',
            severity: 'LOW',
            file: relPath,
            description: 'Disconnected empty button handler: onClick={() => {}}',
            evidence: 'Found placeholder empty arrow function in onClick',
            reproducible: true,
            suggestedFix: 'Connect button to real action or provide disabled state'
          });
        }
      } catch (e) {}
    }
  }

  _scanImportIntegrity(workspacePath, files, findings) {
    const fileSet = new Set(files.map(f => path.resolve(f)));
    const jsFiles = files.filter(f => ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(f).toLowerCase()));

    for (const filePath of jsFiles) {
      const relPath = path.relative(workspacePath, filePath);
      const dir = path.dirname(filePath);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const importRegex = /(?:import|from|require\()\s*['"](\.[^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          const resolvedBase = path.resolve(dir, importPath);

          // Check common extensions
          const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];
          const exists = extensions.some(ext => fileSet.has(resolvedBase + ext) || fs.existsSync(resolvedBase + ext));

          if (!exists) {
            findings.push({
              issueId: `IMPORT-BROKEN-${Math.abs(this._hash(relPath + importPath))}`,
              category: 'IMPORT',
              severity: 'HIGH',
              file: relPath,
              description: `Broken relative import path: "${importPath}"`,
              evidence: `Target file cannot be resolved at ${resolvedBase}`,
              reproducible: true,
              suggestedFix: 'Update import path or create missing module file'
            });
          }
        }
      } catch (e) {}
    }
  }

  _hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

module.exports = DeterministicScanner;
