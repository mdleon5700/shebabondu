const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../src/lib/db.ts");
let dbSrc = fs.readFileSync(dbPath, "utf8");

// 1. Hook up getDocuments, saveDocument, deleteDocument
const oldDocs = `  getDocuments(candidateId: string): CandidateDocument[] {



    const db = loadDB();



    return db.documents[candidateId] || [];



  },



  saveDocument(candidateId: string, doc: CandidateDocument): CandidateDocument[] {



    const db = loadDB();



    const list = db.documents[candidateId] || [];



    const updated = [doc, ...list.filter(d => d.id !== doc.id)];



    db.documents[candidateId] = updated;



    saveDB(db);



    return updated;



  },



  deleteDocument(candidateId: string, docId: string): CandidateDocument[] {



    const db = loadDB();



    const list = db.documents[candidateId] || [];



    const updated = list.filter(d => d.id !== docId);



    db.documents[candidateId] = updated;



    saveDB(db);`;

const newDocs = `  getDocuments(candidateId: string): CandidateDocument[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.getDocuments(candidateId);
    }
    const db = loadDB();
    return db.documents[candidateId] || [];
  },

  saveDocument(candidateId: string, doc: CandidateDocument): CandidateDocument[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.saveDocument(candidateId, doc);
    }
    const db = loadDB();
    const list = db.documents[candidateId] || [];
    const updated = [doc, ...list.filter(d => d.id !== doc.id)];
    db.documents[candidateId] = updated;
    saveDB(db);
    return updated;
  },

  deleteDocument(candidateId: string, docId: string): CandidateDocument[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.deleteDocument(candidateId, docId);
    }
    const db = loadDB();
    const list = db.documents[candidateId] || [];
    const updated = list.filter(d => d.id !== docId);
    db.documents[candidateId] = updated;
    saveDB(db);`;

if (dbSrc.includes('getDocuments(candidateId: string): CandidateDocument[] {')) {
  // Use regex to replace getDocuments, saveDocument, deleteDocument safely
  const docsRegex = /getDocuments\(candidateId:\s*string\):\s*CandidateDocument\[\]\s*\{[\s\S]+?saveDB\(db\);[\s\S]+?return updated;[\s\S]+?deleteDocument\(candidateId:\s*string,\s*docId:\s*string\):\s*CandidateDocument\[\]\s*\{[\s\S]+?saveDB\(db\);/;
  dbSrc = dbSrc.replace(docsRegex, `${newDocs}\n    return updated;\n  }`);
  console.log("Replaced Document methods in db.ts");
}

// 2. Hook up addCandidateEducation, updateCandidateEducation, deleteCandidateEducation
const eduRegex = /addCandidateEducation\(candidateId:\s*string,\s*edu:\s*EducationRecord\):\s*CandidateRecord\s*\|\s*null\s*\{[\s\S]+?deleteCandidateEducation\(candidateId:\s*string,\s*eduId:\s*string\):\s*CandidateRecord\s*\|\s*null\s*\{[\s\S]+?return candidate;\s*\}/;

const newEduMethods = `addCandidateEducation(candidateId: string, edu: EducationRecord): CandidateRecord | null {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.addCandidateEducation(candidateId, edu) as unknown as CandidateRecord;
    }
    const db = loadDB();
    const candidate = db.candidates[candidateId];
    if (!candidate) return null;
    if (!candidate.education) candidate.education = [];
    const item = { ...edu, id: edu.id || ('edu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)) };
    candidate.education.push(item);
    candidate.updatedAt = new Date().toISOString();
    saveDB(db);
    return candidate;
  },

  updateCandidateEducation(candidateId: string, eduId: string, edu: Partial<EducationRecord>): CandidateRecord | null {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.updateCandidateEducation(candidateId, eduId, edu) as unknown as CandidateRecord;
    }
    const db = loadDB();
    const candidate = db.candidates[candidateId];
    if (!candidate || !candidate.education) return null;
    const idx = candidate.education.findIndex(e => e.id === eduId);
    if (idx < 0) return null;
    candidate.education[idx] = { ...candidate.education[idx], ...edu };
    candidate.updatedAt = new Date().toISOString();
    saveDB(db);
    return candidate;
  },

  deleteCandidateEducation(candidateId: string, eduId: string): CandidateRecord | null {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.deleteCandidateEducation(candidateId, eduId) as unknown as CandidateRecord;
    }
    const db = loadDB();
    const candidate = db.candidates[candidateId];
    if (!candidate || !candidate.education) return null;
    candidate.education = candidate.education.filter(e => e.id !== eduId);
    candidate.updatedAt = new Date().toISOString();
    saveDB(db);
    return candidate;
  }`;

dbSrc = dbSrc.replace(eduRegex, newEduMethods);
console.log("Replaced Education methods in db.ts");

// 3. Hook up updateDocumentVerification
const docVerifRegex = /updateDocumentVerification\(\s*candidateId:\s*string,\s*docId:\s*string,\s*updates:\s*\{[\s\S]+?saveDB\(db\);\s*return true;\s*\}/;
const newDocVerif = `updateDocumentVerification(
    candidateId: string, 
    docId: string, 
    updates: { 
      isVerified: boolean; 
      verificationStatus?: any; 
      verificationRemarks?: string; 
      verifiedBy?: string; 
      verifiedAt?: string; 
    }
  ): boolean {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.updateDocumentVerification(candidateId, docId, updates);
    }
    const db = loadDB();
    if (!db.documents || !db.documents[candidateId]) return false;
    const doc = db.documents[candidateId].find(d => d.id === docId);
    if (!doc) return false;
    Object.assign(doc, updates);
    saveDB(db);
    return true;
  }`;

dbSrc = dbSrc.replace(docVerifRegex, newDocVerif);
console.log("Replaced updateDocumentVerification in db.ts");

fs.writeFileSync(dbPath, dbSrc, "utf8");
console.log("Successfully updated db.ts for Step 03 education & document routing");