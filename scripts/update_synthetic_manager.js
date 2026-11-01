const fs = require("fs");
const path = require("path");

const managerPath = path.join(__dirname, "../src/lib/testing/synthetic/synthetic-user-manager.ts");
let managerSrc = fs.readFileSync(managerPath, "utf8");

const docsStoreLogic = `  private static storePath = path.join(process.cwd(), 'src', 'db', 'synthetic_users_store.json');
  private static realStorePath = path.join(process.cwd(), 'src', 'db', 'local_store.json');
  private static docsStorePath = path.join(process.cwd(), 'src', 'db', 'synthetic_documents_store.json');
  private static inMemoryStore: Record<string, SyntheticPersona> | null = null;
  private static inMemoryDocs: Record<string, any[]> | null = null;
  private static lastMtimeMs: number = 0;
  private static lastDocsMtimeMs: number = 0;
  private static phoneIndex: Map<string, SyntheticPersona> = new Map();
  private static emailIndex: Map<string, SyntheticPersona> = new Map();

  private static loadDocsStore(): Record<string, any[]> {
    if (fs.existsSync(this.docsStorePath)) {
      try {
        const stat = fs.statSync(this.docsStorePath);
        if (this.inMemoryDocs && stat.mtimeMs === this.lastDocsMtimeMs) {
          return this.inMemoryDocs;
        }
        const raw = fs.readFileSync(this.docsStorePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.inMemoryDocs = parsed;
          this.lastDocsMtimeMs = stat.mtimeMs;
          return this.inMemoryDocs!;
        }
      } catch (e) {
        console.warn('[SyntheticUserManager] Docs store read error:', e);
      }
    }
    if (!this.inMemoryDocs) this.inMemoryDocs = {};
    return this.inMemoryDocs;
  }

  private static persistDocsStore(): void {
    if (!this.inMemoryDocs) return;
    const dir = path.dirname(this.docsStorePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.docsStorePath, JSON.stringify(this.inMemoryDocs, null, 2), 'utf8');
  }`;

managerSrc = managerSrc.replace(
  `  private static storePath = path.join(process.cwd(), 'src', 'db', 'synthetic_users_store.json');
  private static realStorePath = path.join(process.cwd(), 'src', 'db', 'local_store.json');
  private static inMemoryStore: Record<string, SyntheticPersona> | null = null;
  private static lastMtimeMs: number = 0;
  private static phoneIndex: Map<string, SyntheticPersona> = new Map();
  private static emailIndex: Map<string, SyntheticPersona> = new Map();`,
  docsStoreLogic
);

const newMethods = `  static getDocuments(candidateId: string): any[] {
    const docs = this.loadDocsStore();
    return docs[candidateId] || [];
  }

  static saveDocument(candidateId: string, doc: any): any[] {
    const docs = this.loadDocsStore();
    const list = docs[candidateId] || [];
    const updated = [doc, ...list.filter(d => d.id !== doc.id)];
    docs[candidateId] = updated;
    this.inMemoryDocs = docs;
    this.persistDocsStore();
    return updated;
  }

  static deleteDocument(candidateId: string, docId: string): any[] {
    const docs = this.loadDocsStore();
    const list = docs[candidateId] || [];
    const updated = list.filter(d => d.id !== docId);
    docs[candidateId] = updated;
    this.inMemoryDocs = docs;
    this.persistDocsStore();
    return updated;
  }

  static updateDocumentVerification(candidateId: string, docId: string, updates: any): boolean {
    const docs = this.loadDocsStore();
    if (!docs[candidateId]) return false;
    const doc = docs[candidateId].find(d => d.id === docId);
    if (!doc) return false;
    Object.assign(doc, updates);
    this.inMemoryDocs = docs;
    this.persistDocsStore();
    return true;
  }

  static addCandidateEducation(candidateId: string, edu: any): any {
    const user = this.getSyntheticUserById(candidateId);
    if (!user) return null;
    if (!user.education) user.education = [];
    const item = { ...edu, id: edu.id || ('edu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)) };
    user.education.push(item);
    user.updatedAt = new Date().toISOString();
    return this.saveSyntheticUser(user);
  }

  static updateCandidateEducation(candidateId: string, eduId: string, edu: any): any {
    const user = this.getSyntheticUserById(candidateId);
    if (!user || !user.education) return null;
    const idx = user.education.findIndex((e: any) => e.id === eduId);
    if (idx < 0) return null;
    user.education[idx] = { ...user.education[idx], ...edu };
    user.updatedAt = new Date().toISOString();
    return this.saveSyntheticUser(user);
  }

  static deleteCandidateEducation(candidateId: string, eduId: string): any {
    const user = this.getSyntheticUserById(candidateId);
    if (!user || !user.education) return null;
    user.education = user.education.filter((e: any) => e.id !== eduId);
    user.updatedAt = new Date().toISOString();
    return this.saveSyntheticUser(user);
  }

  static getEducationAuditSummary() {
    const users = this.getAllSyntheticUsers();
    let totalWithEdu = 0;
    let totalNoEdu = 0;
    let jscJdcCount = 0;
    let sscDakhilCount = 0;
    let hscAlimCount = 0;
    let diplomaCount = 0;
    let honoursBachelorCount = 0;
    let degreeCount = 0;
    let mastersKamilCount = 0;
    let advancedCount = 0;
    let ongoingCount = 0;
    let multipleRecordsCount = 0;

    for (const u of users) {
      const edus = u.education || [];
      if (edus.length === 0) {
        totalNoEdu++;
        continue;
      }
      totalWithEdu++;
      if (edus.length > 1) multipleRecordsCount++;

      const highest = edus[edus.length - 1];
      const lvl = (highest.level || '').toUpperCase();
      const deg = (highest.degree || '').toUpperCase();

      if (lvl.includes('JSC') || lvl.includes('JDC') || deg.includes('JUNIOR')) jscJdcCount++;
      else if (lvl.includes('SSC') || lvl.includes('DAKHIL')) sscDakhilCount++;
      else if (lvl.includes('HSC') || lvl.includes('ALIM')) hscAlimCount++;
      else if (lvl.includes('DIPLOMA')) diplomaCount++;
      else if (lvl.includes('HONOURS') || lvl.includes('BACHELOR') || deg.includes('B.SC') || deg.includes('BBA') || deg.includes('B.S.S') || deg.includes('B.A')) honoursBachelorCount++;
      else if (lvl.includes('DEGREE') || deg.includes('PASS')) degreeCount++;
      else if (lvl.includes('MASTERS') || deg.includes('M.SC') || deg.includes('KAMIL')) mastersKamilCount++;
      else if (lvl.includes('MPHIL') || lvl.includes('PHD')) advancedCount++;

      if (edus.some((e: any) => e.academicStatus === 'CURRENTLY_STUDYING' || e.year === 'ONGOING')) {
        ongoingCount++;
      }
    }

    const docs = this.loadDocsStore();
    let totalDocsUploaded = 0;
    let totalDocsVerified = 0;
    for (const list of Object.values(docs)) {
      totalDocsUploaded += list.length;
      totalDocsVerified += list.filter((d: any) => d.isVerified || d.verificationStatus === 'VERIFIED').length;
    }

    return {
      totalUsers: users.length,
      totalWithEdu,
      totalNoEdu,
      jscJdcCount,
      sscDakhilCount,
      hscAlimCount,
      diplomaCount,
      honoursBachelorCount,
      degreeCount,
      mastersKamilCount,
      advancedCount,
      ongoingCount,
      multipleRecordsCount,
      totalDocsUploaded,
      totalDocsVerified
    };
  }

  // Strict isolation assertion`;

managerSrc = managerSrc.replace('  // Strict isolation assertion', newMethods);

fs.writeFileSync(managerPath, managerSrc, "utf8");
console.log("Updated SyntheticUserManager with education & document operations");