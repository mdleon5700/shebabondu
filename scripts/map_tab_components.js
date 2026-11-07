const fs = require('fs');
const path = require('path');

const adminPagePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
const adminPage = fs.readFileSync(adminPagePath, 'utf8');

// Parse what gets rendered for each tab
const d = require('../audit_admin_summary_utf8.json');
const tabDetails = {};

for (const tab of d.tabs) {
  const regex = new RegExp(`activeTab\\s*===?\\s*['"]${tab}['"]([\\s\\S]*?)(?:activeTab\\s*===?|$)`, 'g');
  const match = regex.exec(adminPage);
  if (match) {
    const chunk = match[1].slice(0, 1500); // first 1500 chars of tab render block
    // Look for JSX components like <UniversalJobWorkspace, <CandidateManagementHub, etc.
    const componentMatches = chunk.match(/<([A-Z][A-Za-z0-9]+)/g) || [];
    const components = [...new Set(componentMatches.map(c => c.slice(1)))].filter(c => !['div', 'span', 'p', 'h1', 'h2', 'h3', 'button', 'input', 'select', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'section', 'article', 'nav', 'header', 'footer', 'main', 'svg', 'path', 'LucideIcon'].includes(c));
    
    tabDetails[tab] = {
      detectedComponents: components,
      snippetSample: chunk.trim().split('\n').slice(0, 5).join('\n')
    };
  }
}

fs.writeFileSync(path.join(__dirname, '..', 'tab_mapping_audit.json'), JSON.stringify(tabDetails, null, 2), 'utf8');
console.log('Saved tab_mapping_audit.json with 50 tabs analysis');

