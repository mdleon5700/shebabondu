const fs = require('fs');
let c = fs.readFileSync('src/lib/db.ts', 'utf8');

const targetRegex = /\/\/ Applications\s+getApplications\(candidateId: string\): ApplicationRequest\[\] {[\s\S]+?updateAppStatus\([\s\S]+?const db = loadDB\(\);/;

const replacement = `// Applications
  getApplications(candidateId: string): ApplicationRequest[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.getApplications(candidateId);
    }
    const db = loadDB();
    return db.applications[candidateId] || [];
  },

  addApplication(candidateId: string, app: ApplicationRequest): ApplicationRequest[] {
    if ((candidateId && candidateId.startsWith('SYNTH-')) || app.id?.startsWith('SYNTH-') || (app as any).isSynthetic) {
      return SyntheticUserManager.addApplication(candidateId, app);
    }
    const db = loadDB();
    const list = db.applications[candidateId] || [];
    const updated = [app, ...list];
    db.applications[candidateId] = updated;
    saveDB(db);
    return updated;
  },

  updateAppStatus(
    candidateId: string, 
    appId: string, 
    status: ApplicationRequest['status'], 
    verificationType?: ApplicationRequest['verificationType'], 
    notes?: string, 
    isAdmin?: boolean,
    extra?: Partial<ApplicationRequest>
  ): ApplicationRequest | null {
    if (candidateId?.startsWith('SYNTH-') || appId?.startsWith('SYNTH-') || SyntheticUserManager.getApplicationById(appId)) {
      return SyntheticUserManager.updateAppStatus(candidateId, appId, status, verificationType, notes, isAdmin, extra);
    }
    const db = loadDB();`;

if (targetRegex.test(c)) {
  c = c.replace(targetRegex, replacement);
  fs.writeFileSync('src/lib/db.ts', c, 'utf8');
  console.log('Successfully patched getApplications, addApplication, and updateAppStatus in src/lib/db.ts.');
} else {
  console.error('Target regex did not match.');
}
