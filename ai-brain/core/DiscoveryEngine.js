const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DiscoveryEngine {
  constructor(options = {}) {
    this.options = options;
  }

  discover(workspacePath) {
    if (!fs.existsSync(workspacePath)) {
      throw new Error(`Workspace path does not exist: ${workspacePath}`);
    }

    const absPath = path.resolve(workspacePath);
    const report = {
      timestamp: new Date().toISOString(),
      workspacePath: absPath,
      os: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      },
      git: this._getGitInfo(absPath),
      packageInfo: this._getPackageInfo(absPath),
      framework: null,
      language: null,
      styling: null,
      routing: null,
      persistence: null,
      auth: null,
      envVars: this._getSafeEnvVarNames(absPath),
      structure: this._getStructureSummary(absPath),
      projectClassification: 'UNKNOWN'
    };

    // Analyze framework & language
    report.framework = this._detectFramework(report.packageInfo, absPath);
    report.language = this._detectLanguage(report.packageInfo, absPath);
    report.styling = this._detectStyling(report.packageInfo, absPath);
    report.routing = this._detectRouting(absPath, report.framework);
    report.persistence = this._detectPersistence(report.packageInfo, absPath);
    report.auth = this._detectAuth(report.packageInfo, absPath);
    report.projectClassification = this._classifyProject(report);

    return report;
  }

  _getGitInfo(workspacePath) {
    try {
      const isGit = fs.existsSync(path.join(workspacePath, '.git'));
      if (!isGit) {
        return { isGitRepo: false, status: 'Not a git repository' };
      }
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: workspacePath, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
      const statusOut = execSync('git status --short', { cwd: workspacePath, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
      const uncommittedChanges = statusOut.length > 0 ? statusOut.split('\n').length : 0;
      return {
        isGitRepo: true,
        branch,
        hasUncommittedChanges: uncommittedChanges > 0,
        uncommittedCount: uncommittedChanges
      };
    } catch (e) {
      return { isGitRepo: false, error: e.message };
    }
  }

  _getPackageInfo(workspacePath) {
    const pkgPath = path.join(workspacePath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      return { exists: false, dependencies: {}, devDependencies: {}, scripts: {} };
    }
    try {
      const data = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return {
        exists: true,
        name: data.name || 'unnamed',
        version: data.version || '0.0.0',
        scripts: data.scripts || {},
        dependencies: data.dependencies || {},
        devDependencies: data.devDependencies || {}
      };
    } catch (e) {
      return { exists: true, parseError: e.message, dependencies: {}, devDependencies: {}, scripts: {} };
    }
  }

  _detectFramework(pkg, workspacePath) {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps['next']) {
      return { name: 'Next.js', version: allDeps['next'], type: 'fullstack-react' };
    }
    if (allDeps['vite']) {
      return { name: 'Vite', version: allDeps['vite'], type: 'frontend-bundler' };
    }
    if (allDeps['express']) {
      return { name: 'Express', version: allDeps['express'], type: 'backend-api' };
    }
    if (allDeps['react']) {
      return { name: 'React', version: allDeps['react'], type: 'frontend-library' };
    }
    return { name: 'Vanilla / Custom', type: 'web' };
  }

  _detectLanguage(pkg, workspacePath) {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const hasTsConfig = fs.existsSync(path.join(workspacePath, 'tsconfig.json'));
    if (allDeps['typescript'] || hasTsConfig) {
      return { primary: 'TypeScript', isTypeScript: true };
    }
    return { primary: 'JavaScript', isTypeScript: false };
  }

  _detectStyling(pkg, workspacePath) {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const styles = [];
    if (allDeps['tailwindcss'] || fs.existsSync(path.join(workspacePath, 'tailwind.config.js')) || fs.existsSync(path.join(workspacePath, 'tailwind.config.ts'))) {
      styles.push('TailwindCSS');
    }
    if (allDeps['styled-components']) styles.push('styled-components');
    if (allDeps['sass']) styles.push('Sass');
    return styles.length > 0 ? styles.join(', ') : 'CSS / Standard';
  }

  _detectRouting(workspacePath, framework) {
    if (framework.name === 'Next.js') {
      const appDir = fs.existsSync(path.join(workspacePath, 'src', 'app')) 
        ? path.join(workspacePath, 'src', 'app')
        : (fs.existsSync(path.join(workspacePath, 'app')) ? path.join(workspacePath, 'app') : null);
      
      const pagesDir = fs.existsSync(path.join(workspacePath, 'src', 'pages')) 
        ? path.join(workspacePath, 'src', 'pages')
        : (fs.existsSync(path.join(workspacePath, 'pages')) ? path.join(workspacePath, 'pages') : null);

      if (appDir) {
        return { type: 'Next.js App Router', root: appDir, hasPagesRouter: !!pagesDir };
      }
      if (pagesDir) {
        return { type: 'Next.js Pages Router', root: pagesDir };
      }
    }
    return { type: 'File-based or custom' };
  }

  _detectPersistence(pkg, workspacePath) {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const persistence = [];
    if (fs.existsSync(path.join(workspacePath, 'src', 'db', 'local_store.json'))) {
      persistence.push('Local JSON File Store (local_store.json)');
    }
    if (allDeps['prisma'] || allDeps['@prisma/client']) persistence.push('Prisma ORM');
    if (allDeps['mongoose']) persistence.push('Mongoose (MongoDB)');
    if (allDeps['pg'] || allDeps['postgres']) persistence.push('PostgreSQL client');
    if (allDeps['sqlite3'] || allDeps['better-sqlite3']) persistence.push('SQLite');
    return persistence.length > 0 ? persistence.join(', ') : 'In-memory / Client storage';
  }

  _detectAuth(pkg, workspacePath) {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps['next-auth']) return 'NextAuth.js';
    if (allDeps['jsonwebtoken']) return 'JWT';
    if (fs.existsSync(path.join(workspacePath, 'src', 'lib', 'auth.ts')) || fs.existsSync(path.join(workspacePath, 'src', 'lib', 'auth.js'))) {
      return 'Custom Session Cookie & Password Scrypt Auth';
    }
    return 'None or Custom';
  }

  _getSafeEnvVarNames(workspacePath) {
    const envFiles = ['.env', '.env.local', '.env.example', '.env.production', '.env.development'];
    const names = new Set();
    for (const f of envFiles) {
      const p = path.join(workspacePath, f);
      if (fs.existsSync(p)) {
        try {
          const lines = fs.readFileSync(p, 'utf8').split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
              const varName = trimmed.split('=')[0].trim();
              if (varName) names.add(varName);
            }
          }
        } catch (e) {}
      }
    }
    return Array.from(names);
  }

  _getStructureSummary(workspacePath) {
    const summary = { totalFiles: 0, totalDirs: 0, topLevelDirs: [] };
    try {
      const items = fs.readdirSync(workspacePath);
      for (const item of items) {
        if (item === 'node_modules' || item === '.next' || item === '.git') continue;
        const full = path.join(workspacePath, item);
        if (fs.statSync(full).isDirectory()) {
          summary.topLevelDirs.push(item);
          summary.totalDirs++;
        } else {
          summary.totalFiles++;
        }
      }
    } catch (e) {}
    return summary;
  }

  _classifyProject(report) {
    if (!report.packageInfo.exists && report.structure.totalFiles === 0) {
      return 'NEW_EMPTY_PROJECT';
    }
    if (report.framework.name === 'Next.js' && report.structure.totalDirs > 0) {
      return 'EXISTING_FUNCTIONING_PROJECT';
    }
    return 'EXISTING_PARTIALLY_COMPLETED_PROJECT';
  }
}

module.exports = DiscoveryEngine;
