const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/lib/db.ts'), 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('adminAuditLogs') || l.includes('transactions') || l.includes('AuditLog') || l.includes('logAudit')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});
