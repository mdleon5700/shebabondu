const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "src", "lib", "db.ts");
let content = fs.readFileSync(dbPath, "utf8");

// 1. Update imports
if (!content.includes("PageRecord")) {
  content = content.replace(
    /FinancialSnapshot, AdminAuditLog\r?\n\} from \x27\.\/types\x27;/,
    "FinancialSnapshot, AdminAuditLog,\n  JobCircular, PageRecord, JobSource, CircularDraft, CompanyProfile, CompanyApplication\n} from './types';"
  );
  content = content.replace(
    /import \{ mockUserProfile, mockApplications \} from \x27@\/data\/mockJobs\x27;/,
    "import { mockUserProfile, mockApplications, mockJobs } from '@/data/mockJobs';"
  );
}

// 2. Update DatabaseState
if (!content.includes("pages: Record<string, PageRecord>;")) {
  content = content.replace(
    /adminAuditLogs: AdminAuditLog\[\];\r?\n\}/,
    `adminAuditLogs: AdminAuditLog[];
  jobs: Record<string, JobCircular>;
  pages: Record<string, PageRecord>;
  jobSources: Record<string, JobSource>;
  circularDrafts: Record<string, CircularDraft>;
  companies: Record<string, CompanyProfile>;
  companyApplications: Record<string, CompanyApplication[]>;
}`
  );
}

// 3. Update getInitialState
if (!content.includes("jobs: mockJobsMap")) {
  const seedBlock = `
  const mockJobsMap: Record<string, JobCircular> = {};
  mockJobs.forEach(j => { mockJobsMap[j.id] = j; });

  const defaultPages: Record<string, PageRecord> = {
    'home': {
      id: 'home',
      slug: '/',
      title: 'হোমপেজ — চাকরি সেবা',
      metaTitle: 'চাকরি সেবা | সরকারি ও বেসরকারি চাকরি আবেদন পোর্টাল ২০২৬',
      metaDescription: '১-ক্লিকে চাকরির আবেদন, টেলিটক অটো-ফিল ও নির্ভুল ফর্ম পূরণ সেবা।',
      status: 'published',
      version: 1,
      isSystemPage: true,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      sections: [
        {
          id: 'sec-hero',
          type: 'hero',
          title: 'সরকারি ও ব্যাংক চাকরির নির্ভুল আবেদন সেবা',
          subtitle: 'টেলিটক আবেদনের ঝামেলা শেষ। ঘরে বসেই ১-ক্লিকে নিশ্চিত করুন নির্ভুল আবেদন ও দ্রুত স্লিপ ডেলিভারি।',
          content: {
            ctaText: 'চলতি সার্কুলার দেখুন',
            ctaUrl: '/jobs',
            badge: '⚡ ২০২৬ এর সর্বশেষ নিয়োগ সার্কুলার'
          },
          style: {
            backgroundColor: '#064e3b',
            textColor: '#ffffff',
            paddingY: 'xl',
            textAlign: 'center'
          },
          isVisible: true
        },
        {
          id: 'sec-features',
          type: 'features',
          title: 'কেন চাকরি সেবা ব্যবহার করবেন?',
          subtitle: 'আমাদের প্ল্যাটফর্মের বিশ্বস্ত ও আধুনিক সেবাসমূহ',
          content: {
            items: [
              { title: '১০০% নির্ভুল টেলিটক ফরম পূরণ', desc: 'অভিজ্ঞ ব্যাকঅফিস টিম দ্বারা অফিসিয়াল সাইটে প্রমিত ফর্ম পূরণ।' },
              { title: '৩০০×৩০০ ছবি ও স্বাক্ষর কনভার্ট', desc: 'টেলিটকের কঠোর মেগাবাইট ও পিক্সেল সাইজ অটোমেটিক ফরম্যাটিং।' },
              { title: 'এসএমএস ও ট্র্যাকিং অ্যালার্ট', desc: 'পরীক্ষার তারিখ ও প্রবেশপত্র আসার সাথে সাথে ইনস্ট্যান্ট নোটিফিকেশন।' }
            ]
          },
          style: {
            backgroundColor: '#ffffff',
            textColor: '#0f172a',
            paddingY: 'lg',
            columns: 3
          },
          isVisible: true
        }
      ],
      revisions: []
    },
    'about-us': {
      id: 'about-us',
      slug: '/about-us',
      title: 'আমাদের সম্পর্কে — চাকরি সেবা',
      metaTitle: 'আমাদের সম্পর্কে | চাকরি সেবা বিডি',
      metaDescription: 'চাকরি সেবা বাংলাদেশের চাকরিপ্রার্থীদের জন্য একটি ওয়ান-স্টপ প্রযুক্তি নির্ভর প্ল্যাটফর্ম।',
      status: 'published',
      version: 1,
      isSystemPage: true,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      sections: [
        {
          id: 'sec-about-hero',
          type: 'hero',
          title: 'বাংলাদেশের প্রথম ডিজিটাল জব অ্যাসিস্ট্যান্স প্ল্যাটফর্ম',
          subtitle: 'আমরা চাকরিপ্রার্থীদের সময়, শ্রম এবং ভুলের ঝুঁকি কমিয়ে ক্যারিয়ার গঠনে পাশে থাকি।',
          content: {},
          style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },
          isVisible: true
        }
      ],
      revisions: []
    }
  };

  const defaultSources: Record<string, JobSource> = {
    'teletalk-alljobs': {
      id: 'teletalk-alljobs',
      name: 'Teletalk Alljobs Portal',
      sourceUrl: 'https://alljobs.teletalk.com.bd',
      type: 'official_portal',
      fetchStatus: 'active',
      lastFetchedAt: new Date().toISOString(),
      autoSync: true
    },
    'bpsc-portal': {
      id: 'bpsc-portal',
      name: 'Bangladesh Public Service Commission (BPSC)',
      sourceUrl: 'http://www.bpsc.gov.bd',
      type: 'official_portal',
      fetchStatus: 'active',
      lastFetchedAt: new Date().toISOString(),
      autoSync: true
    },
    'bb-erecruitment': {
      id: 'bb-erecruitment',
      name: 'Bangladesh Bank e-Recruitment System',
      sourceUrl: 'https://erecruitment.bb.org.bd',
      type: 'official_portal',
      fetchStatus: 'active',
      lastFetchedAt: new Date().toISOString(),
      autoSync: true
    }
  };

  const defaultDrafts: Record<string, CircularDraft> = {
    'draft-rupali-01': {
      id: 'draft-rupali-01',
      sourceName: 'দৈনিক ইত্তেফাক ও টেলিটক পোর্টাল',
      sourceUrl: 'https://alljobs.teletalk.com.bd/circular/rupali-bank-2026',
      extractedTitle: 'রূপালী ব্যাংক পিএলসি সিনিয়র অফিসার (আইটি) নিয়োগ',
      extractedOrg: 'রূপালী ব্যাংক পিএলসি',
      category: 'bank',
      grade: '৯ম গ্রেড',
      deadline: '৩০ নভেম্বর ২০২৬',
      vacancies: 65,
      minEducation: 'বিএসসি ইন সিএসই / আইটি',
      salary: '২২,০০০ - ৫৩,০৬০ টাকা',
      govtFee: 200,
      confidenceScore: 0.96,
      duplicateDetected: false,
      status: 'pending_review',
      createdAt: new Date().toISOString()
    }
  };

  const defaultCompanies: Record<string, CompanyProfile> = {
    'comp-pran': {
      id: 'comp-pran',
      name: 'PRAN-RFL Group',
      nameBn: 'প্রাণ-আরএফএল গ্রুপ',
      industry: 'FMCG & Manufacturing',
      district: 'ঢাকা',
      verified: true,
      contactEmail: 'careers@pranrflgroup.com',
      contactPhone: '09613-772673',
      activeJobsCount: 4,
      createdAt: new Date().toISOString()
    },
    'comp-walton': {
      id: 'comp-walton',
      name: 'Walton Hi-Tech Industries PLC',
      nameBn: 'ওয়ালটন হাই-টেক ইন্ডাস্ট্রিজ পিএলসি',
      industry: 'Electronics & Engineering',
      district: 'গাজীপুর',
      verified: true,
      contactEmail: 'jobs@waltonbd.com',
      contactPhone: '09612-316267',
      activeJobsCount: 2,
      createdAt: new Date().toISOString()
    }
  };
`;

  content = content.replace(
    /const defaultId = \x27USR-01712345678\x27;/,
    seedBlock + "\n  const defaultId = 'USR-01712345678';"
  );

  content = content.replace(
    /adminAuditLogs: \[\]\r?\n  \};/,
    `adminAuditLogs: [],
    jobs: mockJobsMap,
    pages: defaultPages,
    jobSources: defaultSources,
    circularDrafts: defaultDrafts,
    companies: defaultCompanies,
    companyApplications: {}
  };`
  );
}

// 4. Update loadDB fallback checks
if (!content.includes("if (!state.pages)")) {
  content = content.replace(
    /if \(!state\.adminAuditLogs\) state\.adminAuditLogs = \[\];/,
    `if (!state.adminAuditLogs) state.adminAuditLogs = [];
    if (!state.jobs) {
      state.jobs = {};
      mockJobs.forEach(j => { state.jobs[j.id] = j; });
    }
    if (!state.pages) state.pages = {};
    if (!state.jobSources) state.jobSources = {};
    if (!state.circularDrafts) state.circularDrafts = {};
    if (!state.companies) state.companies = {};
    if (!state.companyApplications) state.companyApplications = {};`
  );
}

fs.writeFileSync(dbPath, content, "utf8");
console.log("Updated db.ts state & initial seeds successfully");
