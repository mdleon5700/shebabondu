const fs = require('fs');
const path = require('path');

const mockPath = path.join(__dirname, '..', 'src', 'data', 'mockJobs.ts');
const dbFile = path.join(__dirname, '..', 'src', 'db', 'local_store.json');

// Rebuild initial clean database state using mockJobs and mockUserProfile
const defaultId = 'USR-01712345678';
const crypto = require('crypto');
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync('123456', salt, 64).toString('hex');
const defaultPasswordHash = 'scrypt$' + salt + '$' + hash;

const cleanCandidate = {
  id: defaultId,
  phone: '01712-345678',
  email: 'tanvir.jobseeker@gmail.com',
  username: 'tanvir2026',
  name: 'মোঃ তানভীর হাসান',
  nameBn: 'মোঃ তানভীর হাসান',
  fatherName: 'মোঃ রফিকুল ইসলাম',
  motherName: 'মোসাঃ রোকেয়া বেগম',
  dob: '1998-05-15',
  gender: 'male',
  nid: '19982692015004512',
  district: 'ঢাকা',
  address: 'বাড়ি ১২, রোড ৪, সেক্টর ১০, উত্তরা, ঢাকা-১২৩০',
  permanentAddress: 'গ্রাম: চরভদ্রাসন, ডাকঘর: চরভদ্রাসন, উপজেলা: চরভদ্রাসন, জেলা: ফরিদপুর',
  nationality: 'Bangladeshi',
  maritalStatus: 'single',
  photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  signatureUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
  education: [
    { level: 'SSC', degree: 'এসএসসি (বিজ্ঞান)', boardOrUni: 'ঢাকা', roll: '451289', reg: '1214896320', year: '2014', result: '5.00' },
    { level: 'HSC', degree: 'এইচএসসি (বিজ্ঞান)', boardOrUni: 'ঢাকা', roll: '189421', reg: '1214896320', year: '2016', result: '4.83' },
    { level: 'Honours', degree: 'বিএসসি (সম্মান) ইন সিএসই', boardOrUni: 'ঢাকা বিশ্ববিদ্যালয়', roll: '160541', reg: '201648912', year: '2021', result: '3.68' }
  ],
  walletBalance: 450,
  passwordHash: defaultPasswordHash,
  role: 'candidate',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const cleanApps = [
  {
    id: 'APP-2026-001',
    jobId: 'bb-ad-2026',
    jobTitle: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (জেনারেল)',
    organization: 'বাংলাদেশ ব্যাংক',
    postName: 'সহকারী পরিচালক (৯ম গ্রেড)',
    candidateName: 'মোঃ তানভীর হাসান',
    candidatePhone: '01712-345678',
    candidateDistrict: 'ঢাকা',
    date: '২৬ অক্টোবর ২০২৬',
    totalAmount: 280,
    paymentMethod: 'bKash',
    trxId: 'BKL89921471',
    status: 'completed',
    teleTalkTrackingId: 'BBAD-9981241',
    applicantCopyPdfUrl: 'https://alljobs.teletalk.com.bd/slips/APP-2026-001.pdf',
    verificationType: 'officially_verified',
    governmentFee: 200,
    serviceCharge: 80,
    couponDiscount: 0,
    notes: 'আবেদন সফলভাবে সম্পন্ন এবং অ্যাপ্লিক্যান্ট কপি সংযুক্ত।'
  },
  {
    id: 'APP-2026-002',
    jobId: 'sonali-senior-officer-2026',
    jobTitle: 'সোনালী ব্যাংক সিনিয়র অফিসার নিয়োগ ২০২৬',
    organization: 'সোনালী ব্যাংক পিএলসি',
    postName: 'সিনিয়র অফিসার (সাধারণ)',
    candidateName: 'মোঃ তানভীর হাসান',
    candidatePhone: '01712-345678',
    candidateDistrict: 'ঢাকা',
    date: '২৭ অক্টোবর ২০২৬',
    totalAmount: 280,
    paymentMethod: 'bKash',
    trxId: 'BKL77123992',
    status: 'processing',
    verificationType: 'admin_verified',
    governmentFee: 200,
    serviceCharge: 80,
    couponDiscount: 0,
    notes: 'পেমেন্ট অনুমোদিত। টিম মেম্বার টেলিটকে ফরম পূরণ করছে।'
  },
  {
    id: 'APP-2026-003',
    jobId: 'bpsc-47-bcs',
    jobTitle: '৪৭তম বিসিএস পরীক্ষা ২০২৬ নিয়োগ বিজ্ঞপ্তি',
    organization: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)',
    postName: 'বিসিএস (প্রশাসন / পুলিশ / সাধারণ ক্যাডার)',
    candidateName: 'মোসাঃ সাদিয়া আফরিন',
    candidatePhone: '01811-999888',
    candidateDistrict: 'চট্টগ্রাম',
    date: '২৮ অক্টোবর ২০২৬',
    totalAmount: 780,
    paymentMethod: 'bKash',
    trxId: 'BKL99321455',
    status: 'pending_payment',
    verificationType: 'user_reported',
    governmentFee: 700,
    serviceCharge: 80,
    couponDiscount: 0,
    notes: 'পেমেন্ট ট্রানজেকশন যাচাইয়ের অপেক্ষায় রয়েছে।'
  }
];

const cleanPages = {
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
        content: { ctaText: 'চলতি সার্কুলার দেখুন', ctaUrl: '/jobs', badge: '⚡ ২০২৬ এর সর্বশেষ নিয়োগ সার্কুলার' },
        style: { backgroundColor: '#064e3b', textColor: '#ffffff', paddingY: 'xl', textAlign: 'center' },
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
        style: { backgroundColor: '#ffffff', textColor: '#0f172a', paddingY: 'lg', columns: 3 },
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

const cleanSources = {
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

const cleanDrafts = {
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

const cleanCompanies = {
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

const cleanCoupons = {
  'FIRST50': {
    id: 'coupon-first50',
    code: 'FIRST50',
    title: '৫০% সার্ভিস ছাড় (নতুন প্রার্থীর প্রথম আবেদন)',
    description: 'প্রথম আবেদনে সার্ভিস চার্জে ৫০% ছাড়',
    discountType: 'percentage',
    discountValue: 50,
    minServiceCharge: 50,
    maxDiscountCap: 40,
    startDate: new Date(Date.now() - 86400000).toISOString(),
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    status: 'active',
    globalUsageLimit: 1000,
    usedCount: 12,
    perCandidateLimit: 1,
    allowCombineWithRaffle: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

const cleanDB = {
  candidates: { [defaultId]: cleanCandidate },
  documents: { [defaultId]: [] },
  applications: { [defaultId]: cleanApps },
  savedJobs: { [defaultId]: ['bb-ad-2026', 'sonali-senior-officer-2026'] },
  transactions: { [defaultId]: [] },
  notifications: { [defaultId]: [] },
  sessions: {},
  coupons: cleanCoupons,
  raffleCampaigns: {},
  couponRedemptions: {},
  raffleEntries: {},
  adminAuditLogs: [
    {
      id: 'AUDIT-INIT',
      adminId: 'ADMIN-SUPER',
      action: 'order_adjustment',
      targetId: 'APP-2026-001',
      targetType: 'order',
      changes: { status: { new: 'completed' } },
      notes: 'সিস্টেম ইনিশিয়ালাইজেশন ও ভেরিফাইড আবেদন রেকর্ড প্রস্তুত।',
      timestamp: new Date().toISOString()
    }
  ],
  jobs: {},
  pages: cleanPages,
  jobSources: cleanSources,
  circularDrafts: cleanDrafts,
  companies: cleanCompanies,
  companyApplications: {}
};

fs.writeFileSync(dbFile, JSON.stringify(cleanDB, null, 2), 'utf8');
console.log('Restored pristine UTF-8 database state in local_store.json!');