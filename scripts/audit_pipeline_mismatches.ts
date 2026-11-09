import * as fs from 'fs';
import * as path from 'path';

const WORKSPACE_DIR = process.cwd();

interface AuditReport {
  adminTabMismatches: string[];
  footerDeadLinks: string[];
  headerDeadLinks: string[];
  dbStateMissingKeys: string[];
  missingDynamicRouteProtections: string[];
}

function runAudit() {
  console.log('🔍 Running Comprehensive Pipeline-to-Pipeline Mismatch Audit...\n');
  const report: AuditReport = {
    adminTabMismatches: [],
    footerDeadLinks: [],
    headerDeadLinks: [],
    dbStateMissingKeys: [],
    missingDynamicRouteProtections: []
  };

  // --------------------------------------------------------------------------
  // 1. Audit Admin SubTabs vs ActiveTab Render Blocks in src/app/admin/page.tsx
  // --------------------------------------------------------------------------
  console.log('--- 1. Auditing Admin Tabs Pipeline ---');
  const adminPagePath = path.join(WORKSPACE_DIR, 'src', 'app', 'admin', 'page.tsx');
  if (fs.existsSync(adminPagePath)) {
    const adminContent = fs.readFileSync(adminPagePath, 'utf8');

    // Extract all subTabs declared in navigation config
    const subTabRegex = /id:\s*['"]([a-zA-Z0-9_-]+)['"],\s*label:/g;
    let match;
    const declaredSubTabs: string[] = [];
    while ((match = subTabRegex.exec(adminContent)) !== null) {
      declaredSubTabs.push(match[1]);
    }

    // Extract all activeTab render conditions
    const renderRegex = /activeTab === ['"]([a-zA-Z0-9_-]+)['"]/g;
    const renderedTabs = new Set<string>();
    while ((match = renderRegex.exec(adminContent)) !== null) {
      renderedTabs.add(match[1]);
    }

    // Special tabs handled by parent category or alias
    const handledByParent = new Set([
      'dashboard',
      'circulars',
      'applications'
    ]);

    for (const tabId of declaredSubTabs) {
      if (!renderedTabs.has(tabId) && !handledByParent.has(tabId)) {
        report.adminTabMismatches.push(tabId);
      }
    }

    console.log(`Declared SubTabs: ${declaredSubTabs.length}`);
    console.log(`Rendered Tab Blocks: ${renderedTabs.size}`);
    if (report.adminTabMismatches.length > 0) {
      console.log(`⚠️ Found ${report.adminTabMismatches.length} unrendered subTabs:`, report.adminTabMismatches);
    } else {
      console.log('✅ All Admin SubTabs have activeTab render blocks or parent handlers.');
    }
  }

  // --------------------------------------------------------------------------
  // 2. Audit Footer & Header Links vs src/app Routes
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Auditing Public Navigation & Footer Links ---');
  const footerPath = path.join(WORKSPACE_DIR, 'src', 'components', 'Footer.tsx');
  if (fs.existsSync(footerPath)) {
    const footerContent = fs.readFileSync(footerPath, 'utf8');
    const linkRegex = /href=['"](\/[a-zA-Z0-9_/-]*)['"]/g;
    let match;
    const footerLinks = new Set<string>();
    while ((match = linkRegex.exec(footerContent)) !== null) {
      const link = match[1];
      if (!link.startsWith('/#') && link !== '/') {
        footerLinks.add(link);
      }
    }

    for (const l of footerLinks) {
      // Check if folder exists in src/app
      const cleanPath = l.split('?')[0].replace(/^\//, '');
      const folderPath = path.join(WORKSPACE_DIR, 'src', 'app', cleanPath);
      const isDynamic = cleanPath.includes('[') || cleanPath.includes('job-') || cleanPath.endsWith('.xml');
      if (!isDynamic && !fs.existsSync(folderPath)) {
        report.footerDeadLinks.push(l);
      }
    }

    if (report.footerDeadLinks.length > 0) {
      console.log('⚠️ Potential dead links in Footer:', report.footerDeadLinks);
    } else {
      console.log('✅ All Footer links map to verified routes.');
    }
  }

  const headerPath = path.join(WORKSPACE_DIR, 'src', 'components', 'Navbar.tsx');
  if (fs.existsSync(headerPath)) {
    const headerContent = fs.readFileSync(headerPath, 'utf8');
    const linkRegex = /href[:=]\s*['"](\/[a-zA-Z0-9_/-]+)['"]/g;
    let match;
    const headerLinks = new Set<string>();
    while ((match = linkRegex.exec(headerContent)) !== null) {
      const link = match[1];
      if (!link.startsWith('/#') && link !== '/') {
        headerLinks.add(link);
      }
    }

    for (const l of headerLinks) {
      const cleanPath = l.split('?')[0].replace(/^\//, '');
      const folderPath = path.join(WORKSPACE_DIR, 'src', 'app', cleanPath);
      const isDynamic = cleanPath.includes('[') || cleanPath.includes('job-') || cleanPath.endsWith('.xml');
      if (!isDynamic && !fs.existsSync(folderPath)) {
        report.headerDeadLinks.push(l);
      }
    }

    if (report.headerDeadLinks.length > 0) {
      console.log('⚠️ Potential dead links in Navbar:', report.headerDeadLinks);
    } else {
      console.log('✅ All Navbar links map to verified routes.');
    }
  }

  // --------------------------------------------------------------------------
  // 3. Audit DatabaseState in src/lib/db.ts vs local_store.json
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Auditing Database State & local_store.json ---');
  const dbPath = path.join(WORKSPACE_DIR, 'src', 'lib', 'db.ts');
  const localStorePath = path.join(WORKSPACE_DIR, 'src', 'db', 'local_store.json');

  if (fs.existsSync(localStorePath) && fs.existsSync(dbPath)) {
    const store = JSON.parse(fs.readFileSync(localStorePath, 'utf8'));
    const dbContent = fs.readFileSync(dbPath, 'utf8');

    // Key collections that must exist in store and loadDB()
    const criticalKeys = [
      'jobs',
      'applications',
      'candidates',
      'transactions',
      'categories',
      'jobReports',
      'jobAlertSubscriptions',
      'contactMessages'
    ];

    for (const key of criticalKeys) {
      if (!(key in store)) {
        report.dbStateMissingKeys.push(key);
      }
    }

    if (report.dbStateMissingKeys.length > 0) {
      console.log('⚠️ Missing critical keys in local_store.json:', report.dbStateMissingKeys);
    } else {
      console.log('✅ All critical DB collections exist in local_store.json.');
    }
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('AUDIT SUMMARY REPORT:');
  console.log(`- Admin SubTab Mismatches: ${report.adminTabMismatches.length}`);
  console.log(`- Footer Dead Links: ${report.footerDeadLinks.length}`);
  console.log(`- Header Dead Links: ${report.headerDeadLinks.length}`);
  console.log(`- DB Missing Keys: ${report.dbStateMissingKeys.length}`);
  console.log('======================================================');

  return report;
}

runAudit();
