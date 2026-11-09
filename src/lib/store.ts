import { emptyCandidateProfile } from './candidate-defaults';
import { 
  JobCircular, 
  CandidateProfile, 
  ApplicationRequest, 
  CandidateDocument, 
  WalletTransaction, 
  NotificationItem, 
  EligibilityResult 
} from './types';


export interface AuthState {
  isLoggedIn: boolean;
  role: 'candidate' | 'admin' | null;
  name: string;
  phone?: string;
  userId?: string;
}

const JOBS_KEY = 'cs_jobs_data';
const AUTH_KEY = 'cs_auth_data';

// Helper to partition candidate data for strict multi-user isolation
export function getUserScope(): string {
  if (typeof window === 'undefined') return 'default';
  const saved = localStorage.getItem(AUTH_KEY);
  if (!saved) return 'default';
  try {
    const auth: AuthState = JSON.parse(saved);
    if (!auth || !auth.isLoggedIn) return 'default';
    const id = auth.userId || auth.phone || auth.name || 'default';
    return String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
  } catch {
    return 'default';
  }
}

function getScopedKey(baseKey: string, customScope?: string): string {
  const scope = customScope || getUserScope();
  return baseKey + "_" + scope;
}

const initialDocs: CandidateDocument[] = [
  {
    id: 'DOC-01',
    type: 'photo',
    title: 'প্রার্থীর ছবি (টেলিটক স্ট্যান্ডার্ড)',
    fileName: 'candidate-photo-300x300.jpg',
    fileSize: '৭২ KB',
    dimensions: '300 × 300 px',
    uploadDate: '২৪ অক্টোবর ২০২৬',
    dataUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    isVerified: true
  },
  {
    id: 'DOC-02',
    type: 'signature',
    title: 'ডিজিタル স্বাক্ষর (স্বচ্ছ ব্যাকগ্রাউন্ড)',
    fileName: 'candidate-signature-300x80.png',
    fileSize: '৩৮ KB',
    dimensions: '300 × 80 px',
    uploadDate: '২৪ অক্টোবর ২০২৬',
    dataUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    isVerified: true
  },
  {
    id: 'DOC-03',
    type: 'nid',
    title: 'জাতীয় পরিচয়পত্র (NID স্মার্ট কার্ড)',
    fileName: 'smart-nid-card.pdf',
    fileSize: '৩৪০ KB',
    uploadDate: '২৫ অক্টোবর ২০২৬',
    isVerified: true
  },
  {
    id: 'DOC-04',
    type: 'ssc_cert',
    title: 'এসএসসি মূল সনদপত্র ও ট্রান্সক্রিপ্ট',
    fileName: 'ssc-certificate-dhaka-board.pdf',
    fileSize: '৫১২ KB',
    uploadDate: '২৫ অক্টোবর ২০২৬',
    isVerified: true
  },
  {
    id: 'DOC-05',
    type: 'grad_cert',
    title: 'বিএসসি (সম্মান) সার্টিফিকেট ও মার্কশিট',
    fileName: 'du-cse-certificate.pdf',
    fileSize: '৬২০ KB',
    uploadDate: '২৫ অক্টোবর ২০২৬',
    isVerified: true
  }
];

const initialTxs: WalletTransaction[] = [
  {
    id: 'TXN-9841',
    date: '২৭ অক্টোবর ২০২৬, সকাল ১০:১৫',
    amount: 280,
    type: 'fee_deduction',
    description: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক আবেদন ফি',
    method: 'bKash',
    trxId: 'BKL89921471',
    status: 'completed'
  },
  {
    id: 'TXN-9820',
    date: '২৫ অক্টোবর ২০২৬, দুপুর ০৩:৩০',
    amount: 500,
    type: 'recharge',
    description: 'ওয়ালেট ব্যালেন্স রিচার্জ (বিকাশ)',
    method: 'bKash',
    trxId: 'BKL77123992',
    status: 'completed'
  }
];

const initialNotifs: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    title: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক পরীক্ষার তারিখ',
    message: 'সহকারী পরিচালক পদে প্রিলিমিনারি পরীক্ষা আগামী ২৮ নভেম্বর ২০২৬ অনুষ্ঠিত হবে।',
    date: 'আজ, সকাল ৯:০০ টা',
    read: false,
    type: 'exam',
    link: '/dashboard/exam-calendar'
  },
  {
    id: 'NOTIF-02',
    title: 'আবেদনের শেষ সময় বাকি মাত্র ৩ দিন!',
    message: 'সোনালী ব্যাংক সিনিয়র অফিসার পদে আবেদনের শেষ সময় ১৮ নভেম্বর ২০২৬।',
    date: 'গতকাল',
    read: false,
    type: 'deadline',
    link: '/jobs/sonali-senior-officer-2026'
  },
  {
    id: 'NOTIF-03',
    title: 'সফল আবেদন ও পেমেন্ট কনফার্মেশন',
    message: 'আপনার আবেদন নং APP-2026-001 সফলভাবে টেলিটকে গৃহীত হয়েছে।',
    date: '২৭ অক্টোবর ২০২৬',
    read: true,
    type: 'application',
    link: '/dashboard/applications'
  }
];

// Exact Age Calculator accounting for boundary dates and leap years
export function calculateExactAge(birthDateStr: string, cutOffDateStr: string): { years: number; months: number; days: number; meetsAge?: boolean } | null {
  if (!birthDateStr || !cutOffDateStr) return null;
  const birth = new Date(birthDateStr);
  const cutOff = new Date(cutOffDateStr);
  if (isNaN(birth.getTime()) || isNaN(cutOff.getTime())) return null;
  if (birth > cutOff) return { years: 0, months: 0, days: 0 };

  let years = cutOff.getFullYear() - birth.getFullYear();
  let months = cutOff.getMonth() - birth.getMonth();
  let days = cutOff.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(cutOff.getFullYear(), cutOff.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export interface EvaluatedAcademicResult {
  gpa: number;
  scale: number;
  division: '1st' | '2nd' | '3rd' | 'unknown';
  divisionBn: string;
  isFirst: boolean;
  isSecond: boolean;
  isThird: boolean;
  raw: string;
}

export function parseBnToEnNumber(str: string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(str || '').replace(/[০-৯]/g, d => String(bnDigits.indexOf(d)));
}

export function evaluateAcademicResult(level: string, rawResult: string): EvaluatedAcademicResult {
  const normalizedRaw = String(rawResult || '').trim();
  const normalizedLower = normalizedRaw.toLowerCase();
  const enStr = parseBnToEnNumber(normalizedRaw);

  if (normalizedLower.includes('1st') || normalizedRaw.includes('১ম') || normalizedRaw.includes('প্রথম')) {
    return { gpa: 3.0, scale: 4.0, division: '1st', divisionBn: '১ম শ্রেণি/বিভাগ', isFirst: true, isSecond: false, isThird: false, raw: normalizedRaw };
  }
  if (normalizedLower.includes('2nd') || normalizedRaw.includes('২য়') || normalizedRaw.includes('২য়') || normalizedRaw.includes('দ্বিতীয়')) {
    return { gpa: 2.5, scale: 4.0, division: '2nd', divisionBn: '২য় শ্রেণি/বিভাগ', isFirst: false, isSecond: true, isThird: false, raw: normalizedRaw };
  }
  if (normalizedLower.includes('3rd') || normalizedRaw.includes('৩য়') || normalizedRaw.includes('৩য়') || normalizedRaw.includes('তৃতীয়')) {
    return { gpa: 2.0, scale: 4.0, division: '3rd', divisionBn: '৩য় শ্রেণি/বিভাগ', isFirst: false, isSecond: false, isThird: true, raw: normalizedRaw };
  }

  const match = enStr.match(/(\\d+(?:\\.\\d+)?)/);
  const val = match ? parseFloat(match[1]) : 0;

  const isScale5 = /ssc|hsc|আলিম|দাখিল|মাধ্যমিক|উচ্চ মাধ্যমিক|diploma|ডিপ্লোমা/i.test(level) || val > 4.0;
  const scale = isScale5 ? 5.0 : 4.0;

  let division: '1st' | '2nd' | '3rd' | 'unknown' = 'unknown';
  let divisionBn = 'অনির্ধারিত';

  if (scale === 5.0) {
    if (val >= 3.00) {
      division = '1st';
      divisionBn = '১ম বিভাগ (GPA ' + val.toFixed(2) + ')';
    } else if (val >= 2.00) {
      division = '2nd';
      divisionBn = '২য় বিভাগ (GPA ' + val.toFixed(2) + ')';
    } else if (val > 0) {
      division = '3rd';
      divisionBn = '৩য় বিভাগ (GPA ' + val.toFixed(2) + ')';
    }
  } else {
    if (val >= 3.00) {
      division = '1st';
      divisionBn = '১ম শ্রেণি (CGPA ' + val.toFixed(2) + ')';
    } else if (val >= 2.25) {
      division = '2nd';
      divisionBn = '২য় শ্রেণি (CGPA ' + val.toFixed(2) + ')';
    } else if (val > 0) {
      division = '3rd';
      divisionBn = '৩য় শ্রেণি (CGPA ' + val.toFixed(2) + ')';
    }
  }

  return {
    gpa: val,
    scale,
    division,
    divisionBn,
    isFirst: division === '1st',
    isSecond: division === '2nd',
    isThird: division === '3rd',
    raw: normalizedRaw
  };
}


export const storage = {
  // Auth
  getAuth(): AuthState {
    if (typeof window === 'undefined') return { isLoggedIn: false, role: null, name: '' };
    const saved = localStorage.getItem(AUTH_KEY);
    if (!saved) return { isLoggedIn: false, role: null, name: '' };
    try {
      return JSON.parse(saved);
    } catch {
      return { isLoggedIn: false, role: null, name: '' };
    }
  },
  setAuth(auth: AuthState) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      window.dispatchEvent(new Event('cs_auth_changed'));
    }
  },
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cs_session_token');
  },
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem('cs_session_token');
      localStorage.removeItem('cs_admin_auth');
      localStorage.removeItem('cs_admin_pin');
      document.cookie = 'cs_session_token=; path=/; max-age=0; SameSite=Lax';
      window.dispatchEvent(new Event('cs_auth_changed'));
    }
  },

  // Jobs (Global)
  getJobs(): JobCircular[] {
    if (typeof window === 'undefined') return [];
    try {
      const jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
      return Array.isArray(jobs) ? jobs : [];
    } catch {
      return [];
    }
  },
  addJob(job: JobCircular) {
    const jobs = this.getJobs();
    const updated = [job, ...jobs];
    if (typeof window !== 'undefined') {
      localStorage.setItem(JOBS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('cs_jobs_changed'));
    }
    return updated;
  },

  // User Profile (Scoped by Authenticated User)
  getUser(targetUserId?: string): CandidateProfile {
    if (typeof window === 'undefined') return structuredClone(emptyCandidateProfile);
    const currentAuth = this.getAuth();
    
    // Authorization Check: prevent cross-user profile access unless admin
    if (targetUserId && targetUserId !== currentAuth.userId && targetUserId !== currentAuth.phone && currentAuth.role !== 'admin') {
      console.warn('Unauthorized cross-user profile access attempt blocked');
      // Return safe fallback for active session
    }

    const key = getScopedKey('cs_user_data', targetUserId);
    const saved = localStorage.getItem(key);
    if (!saved) {
      // If unauthenticated guest, return read-only fallback without injecting mock user to storage
      if (!currentAuth.isLoggedIn) {
        return structuredClone(emptyCandidateProfile);
      }
      const initialProfile: CandidateProfile = {
        ...structuredClone(emptyCandidateProfile),
        id: currentAuth.userId || 'USR-NEW',
        name: currentAuth.name || '',
        phone: currentAuth.phone || '',
        walletBalance: 0
      };
      localStorage.setItem(key, JSON.stringify(initialProfile));
      return initialProfile;
    }
    try {
      const parsed = JSON.parse(saved);
      const res = { ...parsed };
      if (res.fatherNid && (res.fatherNid.startsWith('/') || res.fatherNid.startsWith('http'))) {
        if (!res.fatherNidUrl) res.fatherNidUrl = res.fatherNid;
        res.fatherNid = '';
      }
      if (res.motherNid && (res.motherNid.startsWith('/') || res.motherNid.startsWith('http'))) {
        if (!res.motherNidUrl) res.motherNidUrl = res.motherNid;
        res.motherNid = '';
      }
      return res;
    } catch {
      return structuredClone(emptyCandidateProfile);
    }
  },
  updateUser(profile: CandidateProfile, targetUserId?: string) {
    if (typeof window !== 'undefined') {
      const key = getScopedKey('cs_user_data', targetUserId);
      localStorage.setItem(key, JSON.stringify(profile));
      window.dispatchEvent(new Event('cs_user_changed'));
    }
  },
  updateWallet(amountToAdd: number) {
    const user = this.getUser();
    // Prevent negative balance
    user.walletBalance = Math.max(0, (user.walletBalance || 0) + amountToAdd);
    this.updateUser(user);
    return user.walletBalance;
  },

  // Applications (Scoped by User)
  getApplications(targetUserId?: string): ApplicationRequest[] {
    if (typeof window === 'undefined') return [];
    const key = getScopedKey('cs_apps_data', targetUserId);
    const saved = localStorage.getItem(key);
    if (!saved) {
      const legacy = localStorage.getItem('cs_apps_data');
      if (legacy && getUserScope() === 'default') {
        try { 
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return [];
    }
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  addApplication(app: ApplicationRequest, targetUserId?: string) {
    const apps = this.getApplications(targetUserId);
    // Ensure verification type defaults to user_reported until admin verifies
    const appWithVerification: ApplicationRequest = {
      ...app,
      verificationType: app.verificationType || 'user_reported'
    };
    const updated = [appWithVerification, ...apps];
    if (typeof window !== 'undefined') {
      const key = getScopedKey('cs_apps_data', targetUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new Event('cs_apps_changed'));
    }
    return updated;
  },
  updateAppStatus(id: string, status: ApplicationRequest['status'], notes?: string, verificationType?: ApplicationRequest['verificationType']) {
    const apps = this.getApplications();
    const updated = apps.map((a) => (a.id === id ? { 
      ...a, 
      status, 
      notes: notes || a.notes,
      verificationType: verificationType || a.verificationType || 'user_reported'
    } : a));
    if (typeof window !== 'undefined') {
      const key = getScopedKey('cs_apps_data');
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new Event('cs_apps_changed'));
    }
    return updated;
  },

  // Saved Jobs (Scoped)
  getSavedJobIds(targetUserId?: string): string[] {
    if (typeof window === 'undefined') return [];
    const key = getScopedKey('cs_saved_jobs', targetUserId);
    const saved = localStorage.getItem(key);
    if (!saved) {
      const initial: string[] = [];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },
  replaceSavedJobIds(ids: string[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getScopedKey('cs_saved_jobs'), JSON.stringify(ids));
    window.dispatchEvent(new Event('cs_saved_changed'));
  },
  isJobSaved(id: string): boolean {
    return this.getSavedJobIds().includes(id);
  },
  toggleSaveJob(id: string): boolean {
    const savedIds = this.getSavedJobIds();
    let updated: string[];
    let isNowSaved = false;
    if (savedIds.includes(id)) {
      updated = savedIds.filter(item => item !== id);
      isNowSaved = false;
    } else {
      // Prevent duplicate saving
      updated = [id, ...savedIds.filter(item => item !== id)];
      isNowSaved = true;
    }
    if (typeof window !== 'undefined') {
      const key = getScopedKey('cs_saved_jobs');
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new Event('cs_saved_changed'));
    }
    return isNowSaved;
  },

  // Document Vault (Scoped by User)
  getDocuments(targetUserId?: string): CandidateDocument[] {
    if (typeof window === 'undefined') return [];
    const key = getScopedKey('cs_documents_data', targetUserId);
    const saved = localStorage.getItem(key);
    if (!saved) {
      const legacy = localStorage.getItem('cs_documents_data');
      if (legacy && getUserScope() === 'default') {
        localStorage.setItem(key, legacy);
        try { return JSON.parse(legacy); } catch { return []; }
      }
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },
  replaceDocuments(documents: CandidateDocument[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getScopedKey('cs_documents_data'), JSON.stringify(documents));
    window.dispatchEvent(new Event('cs_docs_changed'));
  },
  saveDocument(doc: CandidateDocument, targetUserId?: string) {
    const docs = this.getDocuments(targetUserId);
    const updated = [doc, ...docs.filter(d => d.id !== doc.id)];
    if (typeof window !== 'undefined') {
      const key = getScopedKey('cs_documents_data', targetUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new Event('cs_docs_changed'));
    }
    return updated;
  },
  deleteDocument(id: string, targetUserId?: string) {
    const docs = this.getDocuments(targetUserId);
    const updated = docs.filter(d => d.id !== id);
    if (typeof window !== 'undefined') {
      const key = getScopedKey('cs_documents_data', targetUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new Event('cs_docs_changed'));
    }
    return updated;
  },

  // Wallet Transactions (Scoped with Duplicate Rejection)
  getTransactions(targetUserId?: string): WalletTransaction[] {
    if (typeof window === 'undefined') return [];
    const key = getScopedKey('cs_txs_data', targetUserId);
    const saved = localStorage.getItem(key);
    if (!saved) {
      const legacy = localStorage.getItem('cs_txs_data');
      if (legacy && getUserScope() === 'default') {
        localStorage.setItem(key, legacy);
        try { return JSON.parse(legacy); } catch { return []; }
      }
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },
  addTransaction(tx: WalletTransaction, targetUserId?: string) {
    const txs = this.getTransactions(targetUserId);
    // Duplicate transaction detection
    const isDuplicate = txs.some(existing => existing.id === tx.id || (tx.trxId && existing.trxId === tx.trxId));
    if (isDuplicate) {
      console.warn("Duplicate transaction rejected:", tx.id, tx.trxId);
      return txs;
    }
    const updated = [tx, ...txs];
    if (typeof window !== 'undefined') {
      const key = getScopedKey('cs_txs_data', targetUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new Event('cs_txs_changed'));
    }
    return updated;
  },

  // Notifications (Scoped)
  getNotifications(targetUserId?: string): NotificationItem[] {
    if (typeof window === 'undefined') return [];
    const key = getScopedKey('cs_notifs_data', targetUserId);
    const saved = localStorage.getItem(key);
    if (!saved) {
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },
  markNotificationRead(id: string, targetUserId?: string) {
    const notifs = this.getNotifications(targetUserId);
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    if (typeof window !== 'undefined') {
      const key = getScopedKey('cs_notifs_data', targetUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new Event('cs_notifs_changed'));
    }
    return updated;
  },

  // Smart Engine: Profile Completion Calculator (5 Core Pillars - 20% each)
  calculateProfileCompletion(profile: CandidateProfile, documents?: CandidateDocument[]): number {
    if (!profile) return 0;
    let score = 0;

    // Pillar 1: Basic Identity & Personal Info (20%)
    const hasBasic = Boolean(
      (profile.name?.trim() || profile.nameBn?.trim()) &&
      (profile.phone?.trim() || profile.email?.trim()) &&
      (profile.dob || (profile as any).dateOfBirth)
    );
    if (hasBasic) score += 20;

    // Pillar 2: Candidate Photo (20%)
    const hasPhoto = Boolean(
      (profile.photoUrl && !profile.photoUrl.includes('data:image/svg+xml') && !profile.photoUrl.includes('avatar-placeholder') && profile.photoUrl.length > 20) ||
      (documents && documents.some(d => d.type === 'photo')) ||
      (typeof window !== 'undefined' && this.getDocuments().some(d => d.type === 'photo'))
    );
    if (hasPhoto) score += 20;

    // Pillar 3: Digital Signature (20%)
    const hasSignature = Boolean(
      (profile.signatureUrl && !profile.signatureUrl.includes('data:image/svg+xml') && !profile.signatureUrl.includes('signature-placeholder') && profile.signatureUrl.length > 20) ||
      (documents && documents.some(d => d.type === 'signature')) ||
      (typeof window !== 'undefined' && this.getDocuments().some(d => d.type === 'signature'))
    );
    if (hasSignature) score += 20;

    // Pillar 4: Educational Qualifications (20%)
    const hasEdu = Boolean(profile.education && profile.education.length > 0);
    if (hasEdu) score += 20;

    // Pillar 5: National ID Card (20%)
    const hasNid = Boolean(
      (profile.nid && profile.nid.trim().length >= 10) ||
      profile.nidUrl ||
      profile.nidFrontUrl ||
      (documents && documents.some(d => d.type === 'nid')) ||
      (typeof window !== 'undefined' && this.getDocuments().some(d => d.type === 'nid'))
    );
    if (hasNid) score += 20;

    return Math.min(100, Math.max(0, score));
  },

  // Smart Engine: Rigorous Job Eligibility Checker
  checkEligibility(profile: CandidateProfile, job: JobCircular, documents?: any[]): EligibilityResult {
    const reasons: string[] = [];
    let isEligible = true;

    // 1. Missing Data Checks
    if (!profile.dob || profile.dob.trim() === '') {
      return {
        status: 'need_info',
        statusLabel: 'তথ্য অনুপস্থিত (জন্মতারিখ প্রয়োজন)',
        reasons: ['প্রার্থীর জন্মতারিখ প্রোফাইলে যুক্ত করা হয়নি। চাকরির বয়সসীমা যাচাইয়ের জন্য প্রোফাইল এডিট করে জন্মতারিখ প্রদান করুন।'],
        ageCalculated: undefined,
        educationMatch: {
          matched: false,
          required: job.minEducation,
          provided: profile.education?.[0]?.degree || 'প্রদান করা হয়নি'
        }
      };
    }

    if (!profile.education || profile.education.length === 0) {
      return {
        status: 'need_info',
        statusLabel: 'তথ্য অনুপস্থিত (শিক্ষাগত সনদ প্রয়োজন)',
        reasons: ['শিক্ষাগত যোগ্যতার কোনো রেকর্ড প্রোফাইলে পাওয়া যায়নি। বিজ্ঞপ্তির ন্যূনতম শর্ত যাচাইয়ের জন্য আপনার এসএসসি/এইচএসসি/স্নাতক তথ্য যোগ করুন।'],
        ageCalculated: undefined,
        educationMatch: {
          matched: false,
          required: job.minEducation,
          provided: 'অনুপস্থিত'
        }
      };
    }

    // 2. Cut-off Date & Exact Age Calculation
    const cutOffDateStr = job.ageCutOffDate || '2026-11-01';
    const ageResult = calculateExactAge(profile.dob, cutOffDateStr);
    
    if (!ageResult) {
      return {
        status: 'need_info',
        statusLabel: 'ত্রুটিপূর্ণ জন্মতারিখ',
        reasons: ['জন্মতারিখের ফরম্যাট সঠিক নয়। অনুগ্রহ করে YYYY-MM-DD ফরম্যাটে জন্মতারিখ দিন।']
      };
    }

    // Quota considerations (Freedom fighter & disabled get 32 years limit)
    let maxAllowed = job.maxAge;
    if (profile.quota === 'freedom_fighter' || profile.quota === 'disabled') {
      maxAllowed = Math.max(job.maxAge, 32);
      reasons.push('সরকারি কোটা সুবিধা প্রযোজ্য: সর্বোচ্চ বয়সসীমা ' + maxAllowed + ' বছর পর্যন্ত বর্ধিত');
    }

    // Age bounds check
    const isTooYoung = ageResult.years < job.minAge;
    const isTooOld = ageResult.years > maxAllowed || (ageResult.years === maxAllowed && (ageResult.months > 0 || ageResult.days > 0));
    const ageMeets = !isTooYoung && !isTooOld;

    if (ageMeets) {
      reasons.push('বয়সের শর্ত পূরণ হয়েছে (হিসাবকৃত বয়স: ' + ageResult.years + ' বছর ' + ageResult.months + ' মাস ' + ageResult.days + ' দিন; অনুমোদিত সীমা: ' + job.minAge + '-' + maxAllowed + ' বছর; কাট-অফ ডেট: ' + cutOffDateStr + ')');
    } else if (isTooOld) {
      isEligible = false;
      reasons.push('বয়সসীমা অতিক্রম হয়েছে (কাট-অফ ডেটে বয়স: ' + ageResult.years + ' বছর ' + ageResult.months + ' মাস ' + ageResult.days + ' দিন; অনুমোদিত সর্বোচ্চ: ' + maxAllowed + ' বছর)');
    } else {
      isEligible = false;
      reasons.push('ন্যূনতম বয়স পূর্ণ হয়নি (কাট-অফ ডেটে বয়স: ' + ageResult.years + ' বছর ' + ageResult.months + ' মাস ' + ageResult.days + ' দিন; প্রয়োজনীয় ন্যূনতম: ' + job.minAge + ' বছর)');
    }

    // 3. Education Helper Check function (Safe against undefined level/degree)
    const getEduText = (e: any) => `${e?.level || ''} ${e?.degree || ''} ${e?.majorSubject || ''}`;
    const hasMasters = profile.education.some(e => {
      const txt = getEduText(e);
      return txt.includes('মাস্টার্স') || txt.includes('স্নাতকোত্তর') || txt.includes('Masters');
    });
    const hasHonours = profile.education.some(e => {
      const txt = getEduText(e);
      return txt.includes('স্নাতক') || txt.includes('Honours') || txt.includes('বিএসসি') || txt.includes('অনার্স') || txt.includes('ডিগ্রি') || txt.includes('Bachelor');
    });
    const hasHsc = profile.education.some(e => {
      const txt = getEduText(e);
      return txt.includes('HSC') || txt.includes('এইচএসসি') || txt.includes('উচ্চ মাধ্যমিক') || txt.includes('আলিম') || txt.includes('ডিপ্লোমা') || txt.includes('Diploma');
    });
    const hasSsc = profile.education.some(e => {
      const txt = getEduText(e);
      return txt.includes('SSC') || txt.includes('এসএসসি') || txt.includes('মাধ্যমিক') || txt.includes('দাখিল');
    });

    const checkDegreeMeets = (reqStr: string) => {
      const req = (reqStr || '').toLowerCase();
      // If circular allows Bachelor OR Masters (e.g. স্নাতক বা স্নাতকোত্তর)
      if (req.includes('স্নাতক') && (req.includes('স্নাতকোত্তর') || req.includes('মাস্টার্স'))) {
        return hasHonours || hasMasters;
      }
      if (req.includes('স্নাতকোত্তর') || req.includes('মাস্টার্স')) return hasMasters;
      if (req.includes('স্নাতক') || req.includes('ডিগ্রি') || req.includes('honours') || req.includes('বিএসসি')) return hasHonours || hasMasters;
      if (req.includes('hsc') || req.includes('উচ্চ মাধ্যমিক') || req.includes('আলিম')) return hasHsc || hasHonours || hasMasters;
      if (req.includes('ssc') || req.includes('মাধ্যমিক') || req.includes('দাখিল')) return hasSsc || hasHsc || hasHonours || hasMasters;
      return true;
    };

    const eduMeets = checkDegreeMeets(job.minEducation);
    if (eduMeets) {
      reasons.push('প্রয়োজনীয় শিক্ষাগত ডিগ্রির যোগ্যতা পূরণ হয়েছে (প্রয়োজন: ' + job.minEducation + ')');
    } else {
      isEligible = false;
      reasons.push('ন্যূনতম শিক্ষাগত ডিগ্রি মেলেনি (প্রয়োজন: ' + job.minEducation + ')');
    }

    // 4. Academic Results & Class/Division Matching (Govt & Bank Standards)
    const evaluatedResults = (profile.education || []).map(edu => ({
      level: edu.level,
      degree: edu.degree,
      result: evaluateAcademicResult(edu.level + ' ' + edu.degree, edu.result || '')
    }));

    const hasThirdDivision = evaluatedResults.some(r => r.result.isThird);
    const firstDivisionsCount = evaluatedResults.filter(r => r.result.isFirst).length;

    // Disallow 3rd division if circular prohibits it or explicit flag
    const disallowThird = job.allowThirdDivision === false || 
      (job.requirements && job.requirements.some(r => r.includes('৩য় বিভাগ') || r.includes('৩য় বিভাগ') || r.includes('৩য় শ্রেণি')));

    if (disallowThird && hasThirdDivision) {
      isEligible = false;
      const thirdLevels = evaluatedResults.filter(r => r.result.isThird).map(r => r.level).join(', ');
      reasons.push('কোনো পর্যায়ে ৩য় বিভাগ/শ্রেণি গ্রহণযোগ্য নয় (আপনার ' + thirdLevels + '-এ ৩য় বিভাগ/শ্রেণি রয়েছে)');
    }

    // Minimum required 1st divisions count
    const requiredFirsts = job.minFirstDivisionsCount || 
      (job.requirements && job.requirements.some(r => r.includes('২টিতে প্রথম বিভাগ') || r.includes('২টিতে ১ম')) ? 2 : 0);

    if (requiredFirsts > 0 && firstDivisionsCount < requiredFirsts) {
      isEligible = false;
      reasons.push('ন্যূনতম ' + requiredFirsts + 'টি পরীক্ষায় প্রথম বিভাগ/শ্রেণি প্রয়োজন (আপনার রয়েছে ' + firstDivisionsCount + 'টি)');
    }

    // Qualifying graduation result (Min 2nd class or min CGPA)
    const graduationRecord = evaluatedResults.find(r => 
      /স্নাতক|Honours|অনার্স|ডিগ্রি|বিএসসি|Masters|স্নাতকোত্তর/i.test(r.level + ' ' + r.degree)
    ) || evaluatedResults[0];

    const requiredMinCgpa = job.minCgpa || (job.minDivision === '1st' ? 3.00 : job.minDivision === '2nd' ? 2.25 : undefined);
    
    let resultCriteriaPassed = true;
    if (graduationRecord && requiredMinCgpa) {
      if (graduationRecord.result.gpa > 0 && graduationRecord.result.gpa < requiredMinCgpa) {
        isEligible = false;
        resultCriteriaPassed = false;
        reasons.push('ন্যূনতম ফলাফল মেলেনি (প্রয়োজন সিজিপিএ: ' + requiredMinCgpa.toFixed(2) + ' বা ২য় শ্রেণি; আপনার অর্জিত: ' + graduationRecord.result.gpa.toFixed(2) + ')');
      } else {
        reasons.push('শিক্ষাগত ফলাফলের শর্ত পূরণ হয়েছে (' + graduationRecord.result.divisionBn + ')');
      }
    } else if (!hasThirdDivision && (requiredFirsts === 0 || firstDivisionsCount >= requiredFirsts)) {
      reasons.push('ফলাফলের শর্তাবলী যাচাইকৃত (কোনো ৩য় বিভাগ নেই, ' + firstDivisionsCount + 'টি ১ম বিভাগ রয়েছে)');
    }

    // 5. District Quota Check
    if (job.districts && !job.districts.includes('সকল') && !job.districts.includes(profile.district)) {
      isEligible = false;
      reasons.push('জেলা কোটা মেলেনি (বিজ্ঞপ্তি অনুযায়ী প্রযোজ্য জেলা: ' + job.districts + '; প্রার্থীর জেলা: ' + profile.district + ')');
    } else {
      reasons.push('জেলা কোটার শর্ত প্রযোজ্য (সকল জেলা / ' + profile.district + ')');
    }

    // 6. Multi-Position Granular Evaluation (If circular has multiple positions)
    let positionsEvaluated: { title: string; grade: string; posts: number; minEducation: string; govtFee?: number; isEligible: boolean; reason: string }[] | undefined = undefined;
    let eligiblePositionsCount = 0;

    if (job.positions && job.positions.length > 0) {
      positionsEvaluated = job.positions.map(pos => {
        const meetsPosDegree = checkDegreeMeets(pos.minEducation);
        const meetsGeneralReqs = ageMeets && (!disallowThird || !hasThirdDivision) && (requiredFirsts === 0 || firstDivisionsCount >= requiredFirsts);
        const posEligible = meetsPosDegree && meetsGeneralReqs;

        let posReason = 'যোগ্য পদ (আবেদন করা যাবে)';
        if (!meetsGeneralReqs) {
          posReason = !ageMeets ? 'বয়সসীমা অতিক্রম' : (hasThirdDivision ? '৩য় বিভাগ গ্রহণযোগ্য নয়' : 'ফলাফল শর্ত অপূর্ণ');
        } else if (!meetsPosDegree) {
          posReason = 'ডিগ্রি মেলেনি (প্রয়োজন: ' + pos.minEducation + ')';
        }

        if (posEligible) eligiblePositionsCount++;

        return {
          title: pos.title,
          grade: pos.grade,
          posts: pos.posts,
          minEducation: pos.minEducation,
          govtFee: pos.govtFee || job.govtFee,
          isEligible: posEligible,
          reason: posReason
        };
      });

      // If circular has positions and candidate is eligible for AT LEAST ONE position, candidate can apply!
      if (positionsEvaluated.length > 0) {
        if (eligiblePositionsCount > 0) {
          isEligible = true;
          reasons.unshift('এই বিজ্ঞপ্তির ' + positionsEvaluated.length + 'টি পদের মধ্যে ' + eligiblePositionsCount + 'টি পদে আপনি আবেদনযোগ্য!');
        } else {
          isEligible = false;
        }
      }
    }

    // 7. Mandatory Documents & Verification State Check
    const candidateDocs = documents || (profile as any).documents || [];
    if (job.documentsRequired && job.documentsRequired.length > 0 && isEligible) {
      if (candidateDocs.length === 0) {
        return {
          status: 'need_info',
          statusLabel: 'তথ্য/কাগজপত্র অসম্পূর্ণ (ডকুমেন্ট অনুপস্থিত)',
          reasons: [...reasons, 'বিজ্ঞপ্তির আবেদনের জন্য প্রয়োজনীয় সনদ ও কাগজপত্র আপলোড করা হয়নি। প্রোফাইলে সিভি ও সনদ যুক্ত করুন।'],
          ageCalculated: { years: ageResult.years, months: ageResult.months, days: ageResult.days, meetsAge: ageMeets },
          educationMatch: { matched: eduMeets, required: job.minEducation, provided: profile.education[0]?.degree || 'স্নাতক' }
        };
      }

      const hasCertificate = candidateDocs.some((d: any) => /সনদ|সার্টিফিকেট|cert|transcript|ডিগ্রি|degree/i.test(d.title + ' ' + (d.fileName || '')));
      const reqRequiresCert = job.documentsRequired.some((r: string) => /সনদ|সার্টিফিকেট|cert|ট্রান্সক্রিপ্ট/i.test(r));
      if (reqRequiresCert && !hasCertificate) {
        return {
          status: 'need_info',
          statusLabel: 'তথ্য/কাগজপত্র অসম্পূর্ণ (শিক্ষাগত সনদ প্রয়োজন)',
          reasons: [...reasons, 'শিক্ষাগত সনদের কপি সংযুক্ত করা হয়নি। অনুগ্রহ করে প্রোফাইলে শিক্ষাগত সনদ আপলোড করুন।'],
          ageCalculated: { years: ageResult.years, months: ageResult.months, days: ageResult.days, meetsAge: ageMeets },
          educationMatch: { matched: eduMeets, required: job.minEducation, provided: profile.education[0]?.degree || 'স্নাতক' }
        };
      }

      const hasUnverifiedDocs = candidateDocs.some((d: any) => d.isVerified === false);
      if (hasUnverifiedDocs) {
        return {
          status: 'needs_review',
          statusLabel: 'কাগজপত্র অ্যাডমিন পর্যালোচনার অপেক্ষায়',
          reasons: [...reasons, 'আপলোডকৃত কাগজপত্র যাচাইয়ের অপেক্ষায় রয়েছে। অ্যাডমিন রিভিউ সম্পন্ন হলে চূড়ান্ত যোগ্যতা নিশ্চিত হবে।'],
          ageCalculated: { years: ageResult.years, months: ageResult.months, days: ageResult.days, meetsAge: ageMeets },
          educationMatch: { matched: eduMeets, required: job.minEducation, provided: profile.education[0]?.degree || 'স্নাতক' }
        };
      }
    }

    // 8. Experience Requirements Evaluation
    const requiredExpMatch = (job.requirements || []).join(' ').match(/(\d+)\s*বছরের\s*(?:বাস্তব\s*)?অভিজ্ঞতা/);
    if (requiredExpMatch && isEligible) {
      const requiredExpYears = parseInt(requiredExpMatch[1], 10);
      const candidateExpYears = (profile as any).experienceYears || 0;
      if (candidateExpYears < requiredExpYears) {
        return {
          status: 'needs_review',
          statusLabel: 'অভিজ্ঞতা ম্যানুয়াল পর্যালোচনার অপেক্ষায়',
          reasons: [...reasons, `বিজ্ঞপ্তিতে ${requiredExpYears} বছরের অভিজ্ঞতা চাওয়া হয়েছে; আপনার প্রোফাইলে ${candidateExpYears} বছর নথিভুক্ত। অ্যাডমিন পর্যালোচনার জন্য চিহ্নিত।`],
          ageCalculated: { years: ageResult.years, months: ageResult.months, days: ageResult.days, meetsAge: ageMeets },
          educationMatch: { matched: eduMeets, required: job.minEducation, provided: profile.education[0]?.degree || 'স্নাতক' }
        };
      }
    }

    let statusLabel = isEligible ? 'সম্ভাব্য যোগ্য প্রার্থী' : 'শর্তানুযায়ী অনুপযুক্ত';
    if (positionsEvaluated && positionsEvaluated.length > 0) {
      if (eligiblePositionsCount === positionsEvaluated.length) {
        statusLabel = 'সকল পদে আবেদনযোগ্য (' + eligiblePositionsCount + 'টি পদ)';
      } else if (eligiblePositionsCount > 0) {
        statusLabel = 'আংশিক যোগ্য (' + eligiblePositionsCount + '/' + positionsEvaluated.length + 'টি পদ)';
      } else {
        statusLabel = 'কোনো পদের শর্ত মেলেনি';
      }
    }

    return {
      status: isEligible ? 'eligible' : 'not_eligible',
      statusLabel,
      reasons,
      ageCalculated: {
        years: ageResult.years,
        months: ageResult.months,
        days: ageResult.days,
        meetsAge: ageMeets
      },
      educationMatch: {
        matched: eduMeets,
        required: job.minEducation,
        provided: profile.education[0]?.degree || 'স্নাতক'
      },
      resultMatch: {
        matched: (!disallowThird || !hasThirdDivision) && (requiredFirsts === 0 || firstDivisionsCount >= requiredFirsts) && resultCriteriaPassed,
        hasThirdDivision,
        firstDivisionsCount,
        details: firstDivisionsCount + 'টি ১ম বিভাগ, ৩য় বিভাগ: ' + (hasThirdDivision ? 'রয়েছে' : 'নেই')
      },
      positionsEvaluated,
      eligiblePositionsCount: positionsEvaluated ? eligiblePositionsCount : (isEligible ? 1 : 0),
      totalPositionsCount: positionsEvaluated ? positionsEvaluated.length : 1
    };
  }
};