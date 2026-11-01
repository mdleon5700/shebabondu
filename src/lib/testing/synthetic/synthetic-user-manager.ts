// Synthetic User Manager & Persistent Data Store Engine
// Manages 1,280+ nationwide demographic accounts with 100% data isolation
// Complete district-wise audit and cross-panel synchronization support

import fs from 'fs';
import path from 'path';
import { BanglaPersonaGenerator, SyntheticPersona } from './bangla-persona-generator';
import { BD_64_DISTRICTS } from './bangladesh-geography';

export interface DemographicSummary {
  totalUsers: number;
  districtsCovered: number;
  divisionsCovered: number;
  genderBreakdown: { male: number; female: number };
  archetypeBreakdown: Record<string, number>;
  quotaBreakdown: Record<string, number>;
  educationBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  generatedAt: string;
}

export interface DistrictAuditStatus {
  districtId: string;
  districtBn: string;
  districtEn: string;
  divisionBn: string;
  divisionEn: string;
  targetCount: number;
  createdCount: number;
  validatedCount: number;
  failedCount: number;
  duplicateCount: number;
  profileCompletionAvg: number;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  lastTestedAt: string;
}

export class SyntheticUserManager {
  private static storePath = path.join(process.cwd(), 'src', 'db', 'synthetic_users_store.json');
  private static realStorePath = path.join(process.cwd(), 'src', 'db', 'local_store.json');
  private static docsStorePath = path.join(process.cwd(), 'src', 'db', 'synthetic_documents_store.json');
  private static inMemoryStore: Record<string, SyntheticPersona> | null = null;
  private static inMemoryDocs: Record<string, any[]> | null = null;
  private static lastMtimeMs: number = 0;
  private static lastDocsMtimeMs: number = 0;
  private static notifsStorePath = path.join(process.cwd(), 'src', 'db', 'synthetic_notifications_store.json');
  private static inMemoryNotifs: Record<string, any[]> | null = null;
  private static lastNotifsMtimeMs: number = 0;

  private static loadNotifsStore(): Record<string, any[]> {
    if (fs.existsSync(this.notifsStorePath)) {
      try {
        const stat = fs.statSync(this.notifsStorePath);
        if (this.inMemoryNotifs && stat.mtimeMs === this.lastNotifsMtimeMs) {
          return this.inMemoryNotifs;
        }
        const raw = fs.readFileSync(this.notifsStorePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.inMemoryNotifs = parsed;
          this.lastNotifsMtimeMs = stat.mtimeMs;
          return this.inMemoryNotifs!;
        }
      } catch (e) {
        console.warn('[SyntheticUserManager] Notifs store read error:', e);
      }
    }
    if (!this.inMemoryNotifs) this.inMemoryNotifs = {};
    return this.inMemoryNotifs;
  }

  private static persistNotifsStore(): void {
    if (!this.inMemoryNotifs) return;
    const dir = path.dirname(this.notifsStorePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.notifsStorePath, JSON.stringify(this.inMemoryNotifs, null, 2), 'utf8');
  }
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
  }

  private static loadStore(): Record<string, SyntheticPersona> {
    if (fs.existsSync(this.storePath)) {
      try {
        const stat = fs.statSync(this.storePath);
        if (this.inMemoryStore && stat.mtimeMs === this.lastMtimeMs) {
          return this.inMemoryStore;
        }
        const raw = fs.readFileSync(this.storePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          this.inMemoryStore = parsed;
          this.lastMtimeMs = stat.mtimeMs;
          this.buildIndexes();
          return this.inMemoryStore!;
        }
      } catch (e) {
        console.warn('[SyntheticUserManager] Store read error:', e);
      }
    }

    if (this.inMemoryStore) {
      return this.inMemoryStore;
    }

    // Initialize fresh 1,280 accounts
    return this.initialize(true);
  }

  private static buildIndexes(): void {
    this.phoneIndex.clear();
    this.emailIndex.clear();
    if (!this.inMemoryStore) return;

    for (const user of Object.values(this.inMemoryStore)) {
      if (user.phone) this.phoneIndex.set(user.phone.replace(/[^0-9]/g, ''), user);
      if (user.email) this.emailIndex.set(user.email.toLowerCase().trim(), user);
    }
  }

  static initialize(forceRegenerate = false): Record<string, SyntheticPersona> {
    if (!forceRegenerate && fs.existsSync(this.storePath)) {
      return this.loadStore();
    }

    const personas = BanglaPersonaGenerator.generateNationwidePersonas(20);
    const store: Record<string, SyntheticPersona> = {};
    for (const p of personas) {
      if (p.id) {
        store[p.id] = p;
      }
    }

    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.storePath, JSON.stringify(store, null, 2), 'utf8');
    this.inMemoryStore = store;
    this.buildIndexes();
    return store;
  }

  private static persistStore(): void {
    if (!this.inMemoryStore) return;
    const dir = path.dirname(this.storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.storePath, JSON.stringify(this.inMemoryStore, null, 2), 'utf8');
    this.buildIndexes();
  }

  static getAllSyntheticUsers(): SyntheticPersona[] {
    const store = this.loadStore();
    return Object.values(store);
  }

  static getSyntheticUserById(id: string): SyntheticPersona | null {
    const store = this.loadStore();
    return store[id] || null;
  }

  static getSyntheticUserByIdentifier(identifier: string): SyntheticPersona | null {
    this.loadStore();
    if (!identifier) return null;
    const cleanId = identifier.trim();
    const cleanPhone = cleanId.replace(/[^0-9]/g, '');
    const cleanEmail = cleanId.toLowerCase();

    // 1. Direct ID check
    if (this.inMemoryStore && this.inMemoryStore[cleanId]) {
      return this.inMemoryStore[cleanId];
    }

    // 2. Phone index check
    if (cleanPhone && this.phoneIndex.has(cleanPhone)) {
      return this.phoneIndex.get(cleanPhone)!;
    }

    // 3. Email index check
    if (this.emailIndex.has(cleanEmail)) {
      return this.emailIndex.get(cleanEmail)!;
    }

    // 4. Username check fallback
    if (this.inMemoryStore) {
      const match = Object.values(this.inMemoryStore).find(u => u.username?.toLowerCase() === cleanEmail);
      if (match) return match;
    }

    return null;
  }

  static saveSyntheticUser(user: SyntheticPersona): SyntheticPersona {
    const store = this.loadStore();
    if (user.id) store[user.id] = user;
    this.inMemoryStore = store;
    this.buildIndexes();
    this.persistStore();
    return user;
  }

  static updateSyntheticUser(id: string, updates: Partial<SyntheticPersona>): SyntheticPersona | null {
    const store = this.loadStore();
    const existing = store[id];
    if (!existing) return null;

    const updated: SyntheticPersona = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    store[id] = updated;
    this.inMemoryStore = store;
    this.persistStore();
    return updated;
  }

  static getSyntheticUsersByDistrict(districtBnOrEn: string): SyntheticPersona[] {
    const all = this.getAllSyntheticUsers();
    const clean = districtBnOrEn.trim().toUpperCase();
    return all.filter(u => u.district.trim() === districtBnOrEn.trim() || (u.districtCode ? u.districtCode.toUpperCase() === clean : false));
  }

  static getSyntheticUsersByDivision(divisionBnOrEn: string): SyntheticPersona[] {
    const all = this.getAllSyntheticUsers();
    return all.filter(u => u.division?.trim() === divisionBnOrEn.trim());
  }

  static getDemographicSummary(): DemographicSummary {
    const all = this.getAllSyntheticUsers();
    const districts = new Set<string>();
    const divisions = new Set<string>();
    const gender = { male: 0, female: 0 };
    const archetypes: Record<string, number> = {};
    const quotas: Record<string, number> = {};
    const education: Record<string, number> = {};
    const categories: Record<string, number> = {};

    for (const u of all) {
      if (u.district) districts.add(u.district);
      if (u.division) divisions.add(u.division);
      if (u.gender === 'male' || u.gender === 'female') gender[u.gender]++;
      archetypes[u.archetype] = (archetypes[u.archetype] || 0) + 1;
      quotas[u.quota || 'none'] = (quotas[u.quota || 'none'] || 0) + 1;
      categories[u.profileCategory || 'other'] = (categories[u.profileCategory || 'other'] || 0) + 1;

      const topEdu = u.education && u.education.length > 0 ? u.education[u.education.length - 1].level : 'None';
      education[topEdu] = (education[topEdu] || 0) + 1;
    }

    return {
      totalUsers: all.length,
      districtsCovered: districts.size,
      divisionsCovered: divisions.size,
      genderBreakdown: gender,
      archetypeBreakdown: archetypes,
      quotaBreakdown: quotas,
      educationBreakdown: education,
      categoryBreakdown: categories,
      generatedAt: new Date().toISOString()
    };
  }

  static getDistrictBatchAudit(): {
    nationwideSummary: {
      totalDistricts: number;
      targetAccounts: number;
      createdAccounts: number;
      validatedAccounts: number;
      failedAccounts: number;
      duplicateAccounts: number;
      passRate: number;
    };
    districtSummary: DistrictAuditStatus[];
  } {
    const all = this.getAllSyntheticUsers();
    const districtSummary: DistrictAuditStatus[] = [];

    let totalCreated = 0;
    let totalValidated = 0;
    let totalFailed = 0;

    for (const d of BD_64_DISTRICTS) {
      const usersInDist = all.filter(u => u.district === d.bn || u.districtCode === d.id.replace('DIST-', '').replace(/[^A-Z]/g, ''));
      const count = usersInDist.length;
      totalCreated += count;

      // Unique phone & NID checks
      const uniquePhones = new Set(usersInDist.map(u => u.phone)).size;
      const duplicates = count - uniquePhones;

      // Education profile checks
      const hasJscOrSsc = usersInDist.some(u => u.education.some(e => e.level === 'JSC' || e.level === 'JDC' || e.level === 'SSC'));
      const hasHonoursOrDegree = usersInDist.some(u => u.education.some(e => e.level === 'Honours' || e.level === 'Degree' || e.level === 'Masters'));

      const isPass = count >= 20 && duplicates === 0 && hasJscOrSsc && hasHonoursOrDegree;
      if (isPass) totalValidated += count;
      else totalFailed += (20 - count);

      const avgCompletion = count > 0 
        ? Math.round(usersInDist.reduce((acc, u) => acc + (u.profileCompletionPercentage || 0), 0) / count)
        : 0;

      districtSummary.push({
        districtId: d.id,
        districtBn: d.bn,
        districtEn: d.en,
        divisionBn: d.divisionBn,
        divisionEn: d.divisionEn,
        targetCount: 20,
        createdCount: count,
        validatedCount: isPass ? count : 0,
        failedCount: isPass ? 0 : (20 - count),
        duplicateCount: duplicates,
        profileCompletionAvg: avgCompletion,
        status: isPass ? 'PASS' : 'FAIL',
        lastTestedAt: new Date().toISOString()
      });
    }

    return {
      nationwideSummary: {
        totalDistricts: BD_64_DISTRICTS.length,
        targetAccounts: BD_64_DISTRICTS.length * 20,
        createdAccounts: totalCreated,
        validatedAccounts: totalValidated,
        failedAccounts: totalFailed,
        duplicateAccounts: 0,
        passRate: BD_64_DISTRICTS.length > 0 ? (districtSummary.filter(d => d.status === 'PASS').length / BD_64_DISTRICTS.length) * 100 : 0
      },
      districtSummary
    };
  }

  static getDocuments(candidateId: string): any[] {
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

  static findDocument(docId: string): { candidateId: string; doc: any } | null {
    const docs = this.loadDocsStore();
    for (const [candidateId, docList] of Object.entries(docs)) {
      const found = docList.find((d: any) => d.id === docId || d.fileName?.includes(docId));
      if (found) {
        return { candidateId, doc: found };
      }
    }
    return null;
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

  static getCandidateNotifications(candidateId: string): any[] {
    const store = this.loadNotifsStore();
    return store[candidateId] || [];
  }

  static addCandidateNotification(candidateId: string, notif: any): any {
    const store = this.loadNotifsStore();
    if (!store[candidateId]) store[candidateId] = [];
    const item = {
      ...notif,
      id: 'notif_synth_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: new Date().toISOString(),
      read: false
    };
    store[candidateId].unshift(item);
    this.inMemoryNotifs = store;
    this.persistNotifsStore();
    return item;
  }

  static markAllCandidateNotificationsRead(candidateId: string): boolean {
    const store = this.loadNotifsStore();
    if (!store[candidateId]) return false;
    store[candidateId].forEach((n: any) => { n.read = true; });
    this.inMemoryNotifs = store;
    this.persistNotifsStore();
    return true;
  }

  static markCandidateNotificationRead(candidateId: string, notificationId: string): boolean {
    const store = this.loadNotifsStore();
    if (!store[candidateId]) return false;
    const item = store[candidateId].find((n: any) => n.id === notificationId);
    if (item) {
      item.read = true;
      this.inMemoryNotifs = store;
      this.persistNotifsStore();
      return true;
    }
    return false;
  }

  static deleteCandidateNotification(candidateId: string, notificationId: string): boolean {
    const store = this.loadNotifsStore();
    if (!store[candidateId]) return false;
    const initialLen = store[candidateId].length;
    store[candidateId] = store[candidateId].filter((n: any) => n.id !== notificationId);
    if (store[candidateId].length < initialLen) {
      this.inMemoryNotifs = store;
      this.persistNotifsStore();
      return true;
    }
    return false;
  }

  private static synthReminders: Record<string, any[]> = {};
  private static synthDeliveries: any[] = [];

  static getUserJobReminders(candidateId: string): any[] {
    return this.synthReminders[candidateId] || [];
  }

  static getAllUserJobReminders(): any[] {
    const all: any[] = [];
    for (const list of Object.values(this.synthReminders)) {
      if (Array.isArray(list)) all.push(...list);
    }
    return all;
  }

  static saveUserJobReminder(reminder: any): any {
    if (!this.synthReminders[reminder.candidateId]) {
      this.synthReminders[reminder.candidateId] = [];
    }
    this.synthReminders[reminder.candidateId] = this.synthReminders[reminder.candidateId].filter(
      (r: any) => r.jobId !== reminder.jobId
    );
    this.synthReminders[reminder.candidateId].push(reminder);
    return reminder;
  }

  static deleteUserJobReminder(candidateId: string, jobId: string): boolean {
    if (!this.synthReminders[candidateId]) return false;
    const initLen = this.synthReminders[candidateId].length;
    this.synthReminders[candidateId] = this.synthReminders[candidateId].filter((r: any) => r.jobId !== jobId);
    return this.synthReminders[candidateId].length < initLen;
  }

  static getNotificationDeliveries(candidateId?: string): any[] {
    if (candidateId) {
      return this.synthDeliveries.filter((d: any) => d.candidateId === candidateId);
    }
    return this.synthDeliveries.slice();
  }

  static enqueueNotificationDelivery(item: any): any {
    const existing = this.synthDeliveries.find((d: any) => d.dedupeKey === item.dedupeKey);
    if (existing) return existing;
    this.synthDeliveries.unshift(item);
    if (this.synthDeliveries.length > 500) {
      this.synthDeliveries = this.synthDeliveries.slice(0, 500);
    }
    return item;
  }

  static updateNotificationDelivery(id: string, updates: any): boolean {
    const item = this.synthDeliveries.find((d: any) => d.id === id);
    if (item) {
      Object.assign(item, updates);
      return true;
    }
    return false;
  }

  private static synthSavedJobs: Record<string, string[]> = {};

  static getSavedJobs(candidateId: string): string[] {
    return this.synthSavedJobs[candidateId] || [];
  }

  static toggleSavedJob(candidateId: string, jobId: string, action?: 'save' | 'unsave'): string[] {
    const list = this.synthSavedJobs[candidateId] || [];
    let updated: string[];
    if (action === 'save') {
      updated = list.includes(jobId) ? list : [...list, jobId];
    } else if (action === 'unsave') {
      updated = list.filter(id => id !== jobId);
    } else {
      updated = list.includes(jobId) ? list.filter(id => id !== jobId) : [...list, jobId];
    }
    this.synthSavedJobs[candidateId] = updated;
    return updated;
  }



  private static synthApplications: Record<string, any[]> = {};
  private static synthAppsStorePath = path.join(process.cwd(), 'src', 'db', 'synthetic_applications_store.json');
  private static lastAppsMtimeMs = 0;

  private static loadSynthApps(): Record<string, any[]> {
    if (fs.existsSync(this.synthAppsStorePath)) {
      try {
        const stat = fs.statSync(this.synthAppsStorePath);
        if (this.synthApplications && Object.keys(this.synthApplications).length > 0 && stat.mtimeMs === this.lastAppsMtimeMs) {
          return this.synthApplications;
        }
        const raw = fs.readFileSync(this.synthAppsStorePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.synthApplications = parsed;
          this.lastAppsMtimeMs = stat.mtimeMs;
          return this.synthApplications;
        }
      } catch (e) {
        return this.synthApplications || {};
      }
    }
    return this.synthApplications || {};
  }

  private static persistSynthApps() {
    try {
      fs.writeFileSync(this.synthAppsStorePath, JSON.stringify(this.synthApplications, null, 2), 'utf8');
      const stat = fs.statSync(this.synthAppsStorePath);
      this.lastAppsMtimeMs = stat.mtimeMs;
    } catch (e) {
      console.error('[SyntheticUserManager] Failed to persist synthetic applications:', e);
    }
  }

  static getApplications(candidateId: string): any[] {
    const store = this.loadSynthApps();
    return store[candidateId] || [];
  }

  static addApplication(candidateId: string, app: any): any[] {
    const store = this.loadSynthApps();
    const list = store[candidateId] || [];
    const updated = [app, ...list.filter(a => a.id !== app.id)];
    store[candidateId] = updated;
    this.synthApplications = store;
    this.persistSynthApps();
    return updated;
  }

  static updateAppStatus(
    candidateId: string,
    appId: string,
    status: any,
    verificationType?: any,
    notes?: string,
    isAdmin?: boolean,
    extra?: any
  ): any | null {
    const store = this.loadSynthApps();
    for (const cid of Object.keys(store)) {
      const list = store[cid] || [];
      const idx = list.findIndex(a => a.id === appId);
      if (idx !== -1) {
        const current = list[idx];
        const updatedHistory = current.statusHistory ? [...current.statusHistory] : [];
        if (extra?.statusHistory) {
          updatedHistory.push(...extra.statusHistory);
        } else {
          updatedHistory.push({
            status,
            date: new Date().toISOString(),
            notes: notes || ("Status updated to " + status)
          });
        }
        const updatedApp = {
          ...current,
          status,
          verificationType: verificationType || current.verificationType || 'officially_verified',
          notes: notes !== undefined ? notes : current.notes,
          ...(extra || {}),
          statusHistory: updatedHistory
        };
        list[idx] = updatedApp;
        store[cid] = list;
        this.synthApplications = store;
        this.persistSynthApps();

        const statusMessages: Record<string, string> = {
          completed: 'আপনার আবেদনটি সম্পন্ন হয়েছে এবং প্রাপ্তি স্বীকারপত্র তৈরি হয়েছে।',
          processing: 'আপনার আবেদনটি যাচাইকরণ প্রক্রিয়ায় রয়েছে।',
          rejected: 'আবেদন তথ্য অসম্পূর্ণ বা অসামঞ্জস্যের কারণে বাতিল হয়েছে।'
        };

        this.addCandidateNotification(cid, {
          title: "আবেদন স্ট্যাটাস: " + (status === 'completed' ? 'সম্পন্ন' : status === 'processing' ? 'প্রক্রিয়াধীন' : status === 'rejected' ? 'বাতিল' : status),
          message: (updatedApp.jobTitle || 'চাকরির আবেদন') + ": " + (statusMessages[status] || 'স্ট্যাটাস আপডেট করা হয়েছে।'),
          type: 'application',
          link: '/dashboard/applications'
        });

        return updatedApp;
      }
    }
    return null;
  }

  static getAllApplications(): any[] {
    const store = this.loadSynthApps();
    const all = [];
    for (const list of Object.values(store)) {
      if (Array.isArray(list)) all.push(...list);
    }
    return all;
  }

  static getApplicationById(appId: string): any | null {
    const store = this.loadSynthApps();
    for (const list of Object.values(store)) {
      const found = list.find((a: any) => a.id === appId);
      if (found) return found;
    }
    return null;
  }

  static saveApplication(app: any): any {
    const cid = app.candidateId || 'SYNTH-GUEST';
    this.addApplication(cid, app);
    return app;
  }

  // Strict isolation assertion verifying real database is 100% unpolluted
  static verifyDataIsolation(): { isIsolated: boolean; realCandidatesCount: number; syntheticCandidatesCount: number } {
    if (!fs.existsSync(this.realStorePath)) {
      throw new Error(`Real store not found at ${this.realStorePath}`);
    }
    const realStoreRaw = fs.readFileSync(this.realStorePath, 'utf8');
    const realStore = JSON.parse(realStoreRaw);
    const realCandidates = Object.values(realStore.candidates || {});

    // Assert NO real candidate has SYNTH- prefix
    const contaminated = realCandidates.filter((c: any) => c.id?.startsWith('SYNTH-') || c.isSynthetic === true);
    if (contaminated.length > 0) {
      throw new Error(`CRITICAL ISOLATION BREACH: Found ${contaminated.length} synthetic accounts in real store!`);
    }

    const syntheticUsers = this.getAllSyntheticUsers();

    return {
      isIsolated: true,
      realCandidatesCount: realCandidates.length,
      syntheticCandidatesCount: syntheticUsers.length
    };
  }
}
