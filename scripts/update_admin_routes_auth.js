const fs = require('fs');
const path = require('path');

// 1. Update job-reports/route.ts
const jobReportsPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'job-reports', 'route.ts');
let jr = fs.readFileSync(jobReportsPath, 'utf8');
if (!jr.includes('verifyAdminSecret')) {
  jr = jr.replace("import { getServerSession } from '@/lib/auth';", "import { getServerSession, verifyAdminSecret } from '@/lib/auth';");
  jr = jr.replace(
    /const session = getServerSession\(req\);\s+if \(!session \|\| session\.role !== 'admin'\) \{/g,
    `const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const hasAccess = Boolean((session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret)));
  if (!hasAccess) {`
  );
  fs.writeFileSync(jobReportsPath, jr, 'utf8');
  console.log('Updated job-reports/route.ts');
}

// 2. Update support-tickets/route.ts
const supportTicketsPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'support-tickets', 'route.ts');
let st = fs.readFileSync(supportTicketsPath, 'utf8');
if (!st.includes('verifyAdminSecret')) {
  st = st.replace("import { getServerSession } from '@/lib/auth';", "import { getServerSession, verifyAdminSecret } from '@/lib/auth';");
  st = st.replace(
    /const session = getServerSession\(req\);\s+if \(!session \|\| session\.role !== 'admin'\) \{/g,
    `const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const hasAccess = Boolean((session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret)));
  if (!hasAccess) {`
  );
  fs.writeFileSync(supportTicketsPath, st, 'utf8');
  console.log('Updated support-tickets/route.ts');
}

// 3. Update settings/route.ts
const settingsPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'settings', 'route.ts');
let set = fs.readFileSync(settingsPath, 'utf8');
if (!set.includes('verifyAdminSecret')) {
  set = set.replace("import { getServerSession } from '@/lib/auth';", "import { getServerSession, verifyAdminSecret } from '@/lib/auth';");
  set = set.replace(
    /const session = getServerSession\(req\);\s+if \(!session \|\| session\.role !== 'admin'\) \{/g,
    `const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const hasAccess = Boolean((session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret)));
  if (!hasAccess) {`
  );
  fs.writeFileSync(settingsPath, set, 'utf8');
  console.log('Updated settings/route.ts');
}
