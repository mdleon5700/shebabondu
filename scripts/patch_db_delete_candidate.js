const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
let content = fs.readFileSync(dbPath, 'utf8');

const target = "    db.candidates[id] = updated;\r\n    saveDB(db);\r\n    return updated;\r\n  },";
const targetLF = "    db.candidates[id] = updated;\n    saveDB(db);\n    return updated;\n  },";

const addition = `    db.candidates[id] = updated;
    saveDB(db);
    return updated;
  },

  deleteCandidate(id: string, adminId = 'ADMIN', reason?: string): boolean {
    if (id.startsWith('SYNTH-')) {
      return SyntheticUserManager.deleteSyntheticUser(id);
    }
    const db = loadDB();
    const existing = db.candidates[id];
    if (!existing) {
      return SyntheticUserManager.deleteSyntheticUser(id);
    }

    delete db.candidates[id];
    if (db.documents && db.documents[id]) delete db.documents[id];
    if (db.applications && db.applications[id]) delete db.applications[id];
    if (db.savedJobs && db.savedJobs[id]) delete db.savedJobs[id];
    if (db.transactions && db.transactions[id]) delete db.transactions[id];
    if (db.notifications && db.notifications[id]) delete db.notifications[id];
    saveDB(db);

    try {
      SyntheticUserManager.deleteSyntheticUser(id);
    } catch {}

    return true;
  },`;

if (!content.includes('deleteCandidate(id: string')) {
  if (content.includes(target)) {
    content = content.replace(target, addition.replace(/\n/g, '\r\n'));
    fs.writeFileSync(dbPath, content, 'utf8');
    console.log('Successfully patched db.ts (CRLF)');
  } else if (content.includes(targetLF)) {
    content = content.replace(targetLF, addition);
    fs.writeFileSync(dbPath, content, 'utf8');
    console.log('Successfully patched db.ts (LF)');
  } else {
    console.error('Target not found in db.ts');
  }
} else {
  console.log('deleteCandidate already present');
}

