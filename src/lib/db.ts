import { repairStoredText } from './text-encoding';
import { CentralDeadlineEngine } from './deadlines/engine';
import { isPublicJob } from './job-visibility';
import fs from 'fs';



import path from 'path';



import { 



  CandidateProfile, 



  EducationRecord, 



  CandidateDocument, 



  ApplicationRequest, 



  WalletTransaction, 



  NotificationItem,



  Coupon,



  RaffleCampaign,



  CouponRedemption,



  RaffleEntry,



  FinancialSnapshot, AdminAuditLog,



  JobCircular, PageRecord, JobSource, CircularDraft, CompanyProfile, CompanyApplication, SpiderRun, VerificationResult, AIUsageLog, AdminCorrection,



  SourceClassification, CollectionMethod, SourceHealthStatus, SourceErrorDetails, SourceCollectionMetrics



} from './types';



import { mockUserProfile, mockApplications, mockJobs } from '../data/mockJobs';
import { SyntheticUserManager } from './testing/synthetic/synthetic-user-manager';
import { SyntheticJobManager } from './testing/synthetic/synthetic-job-manager';







export interface CandidateRecord extends CandidateProfile {



  id: string;



  passwordHash: string;



  role: 'candidate' | 'admin';



  createdAt: string;



  updatedAt: string;



}







interface DatabaseState {



  candidates: Record<string, CandidateRecord>;



  documents: Record<string, CandidateDocument[]>;



  applications: Record<string, ApplicationRequest[]>;



  savedJobs: Record<string, string[]>;



  transactions: Record<string, WalletTransaction[]>;



  notifications: Record<string, NotificationItem[]>;



  sessions: Record<string, { candidateId: string; role: 'candidate' | 'admin'; expiresAt: string }>;



  coupons: Record<string, Coupon>;



  raffleCampaigns: Record<string, RaffleCampaign>;



  couponRedemptions: Record<string, CouponRedemption[]>;



  raffleEntries: Record<string, RaffleEntry[]>;



  adminAuditLogs: AdminAuditLog[];



  jobs: Record<string, JobCircular>;



  pages: Record<string, PageRecord>;



  jobSources: Record<string, JobSource>;



  circularDrafts: Record<string, CircularDraft>;



  companies: Record<string, CompanyProfile>;



  companyApplications: Record<string, CompanyApplication[]>;



  spiderRuns?: Record<string, SpiderRun>;

  verificationResults?: Record<string, VerificationResult>;

  aiUsageLogs?: Record<string, AIUsageLog>;

  verificationQueue?: any[];

  contentStudioArticles?: Record<string, import('./content_studio/types').ContentStudioState>;

  publishingQueue?: Record<string, import('./publishing/types').PublishingQueueItem>;

  publicationSnapshots?: Record<string, import('./publishing/types').PublicationSnapshot>;

  publicationAuditLogs?: import('./publishing/types').PublicationAuditLog[];

  redirects?: Record<string, import('./publishing/types').RedirectRecord>;

  reviewComments?: Record<string, import('./publishing/types').ReviewComment[]>;

  categories?: Record<string, import('./taxonomy/types').CategoryRecord>;

  searchAnalytics?: import('./search/types').SearchEventRecord[];

  featuredPlacements?: Record<string, import('./feeds/types').FeaturedPlacement>;

  feedConfig?: import('./feeds/types').GlobalFeedConfig;

  deadlineData?: Record<string, import('./deadlines/types').DeadlineData>;

  deadlineRevisions?: Record<string, import('./deadlines/types').DeadlineRevision[]>;

  circularChangeProposals?: Record<string, import('./deadlines/types').CircularChangeProposal>;

  userJobReminders?: Record<string, import('./deadlines/types').UserJobReminder[]>;

  notificationDeliveries?: import('./deadlines/types').NotificationDeliveryItem[];

  monitoringRuns?: import('./deadlines/types').MonitoringRunRecord[];

  deadlineAlertRules?: import('./deadlines/types').DeadlineAlertRule[];

  recommendationFeedback?: Record<string, import('./matching/types').RecommendationFeedbackItem[]>;

  matchingConfig?: import('./matching/types').MatchingEngineConfig;

  operationalExpenses?: Record<string, import('./operations/types').OperationalExpenseRecord>;

  platformBudget?: import('./operations/types').PlatformBudgetConfig;
  staffMembers?: Record<string, import('./governance/types').StaffMemberRecord>;
  mediaItems?: Record<string, import('./types').MediaItem>;
  platformSettings?: import('./types').PlatformSettings;

}







const DB_FILE = process.env.CHAKRI_DB_FILE || path.join(process.cwd(), 'src', 'db', 'local_store.json');







export const ALL_DEFAULT_PAGES: Record<string, PageRecord> = {

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

          badge: 'âš¡ ২০২৬ এর সর্বশেষ নিয়োগ সার্কুলার'

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

        content: { badge: 'আমাদের পরিচয়' },

        style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      }

    ],

    revisions: []

  },

  'contact-us': {

    id: 'contact-us',

    slug: '/contact-us',

    title: 'সাহায্য ও যোগাযোগ — চাকরি সেবা',

    metaTitle: 'সাহায্য ও যোগাযোগ | চাকরি সেবা বিডি',

    metaDescription: 'আবেদন সংক্রান্ত যেকোনো জিজ্ঞাসা, পেমেন্ট ভেরিফিকেশন বা সহযোগিতার জন্য হেল্পলাইনে যোগাযোগ করুন।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-contact-hero',

        type: 'hero',

        title: 'যেকোনো প্রয়োজনে আমরা আপনার পাশে আছি',

        subtitle: 'আবেদন সংক্রান্ত যেকোনো জিজ্ঞাসা, পেমেন্ট ভেরিফিকেশন বা সহযোগিতার জন্য সরাসরি হেল্পলাইনে কল করুন বা হোয়াটসঅ্যাপে মেসেজ দিন।',

        content: { badge: '২৪/৭ সাপোর্ট ও সহায়তা' },

        style: { backgroundColor: '#064e3b', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      },

      {

        id: 'sec-contact-features',

        type: 'features',

        title: 'আমাদের সাপোর্ট চ্যানেলসমূহ',

        subtitle: 'দ্রুত সেবা পেতে নিচের যেকোনো মাধ্যমে যোগাযোগ করুন',

        content: {

          items: [

            { title: 'জরুরি হেল্পলাইন', desc: 'সরাসরি ফোনে কথা বলুন সকাল ৯:০০ হতে রাত ১০:০০ পর্যন্ত।' },

            { title: 'WhatsApp চ্যাট সাপোর্ট', desc: '২৪ ঘণ্টার মধ্যে দ্রুত ও নির্ভুল সমাধান পেতে মেসেজ দিন।' },

            { title: 'টেলিগ্রাম চ্যানেল', desc: 'ইনস্ট্যান্ট চাকরির আপডেট ও সার্কুলার অ্যালার্ট পেতে যুক্ত থাকুন।' }

          ]

        },

        style: { backgroundColor: '#ffffff', textColor: '#0f172a', paddingY: 'md', columns: 3 },

        isVisible: true

      }

    ],

    revisions: []

  },

  'faq': {

    id: 'faq',

    slug: '/faq',

    title: 'সাধারণ জিজ্ঞাসা (FAQ) — চাকরি সেবা',

    metaTitle: 'সাধারণ জিজ্ঞাসা ও উত্তর | চাকরি সেবা বিডি',

    metaDescription: 'চাকরি আবেদন সেবা ও নিরাপত্তা নিয়ে সাধারণ কিছু প্রশ্নের বিস্তারিত উত্তর।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-faq-hero',

        type: 'hero',

        title: 'সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর (FAQ)',

        subtitle: 'চাকরি সেবা প্ল্যাটফর্মের আবেদন পদ্ধতি, সরকারি ফি এবং কাস্টমার গ্যারান্টি সম্পর্কিত সাধারণ প্রশ্নাবলী।',

        content: { badge: 'সহায়তা ও নির্দেশিকা' },

        style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      },

      {

        id: 'sec-faq-text',

        type: 'text',

        title: 'আবেদন ও নিরাপত্তা নিশ্চয়তা',

        subtitle: 'আমরা সর্বোচ্চ ব্যাংকিং গ্রেড সিকিউরিটি ও এনক্রিপশন ব্যবহার করি। আপনার ডাটা অন্য কোথাও শেয়ার করা হয় না।',

        content: {},

        style: { backgroundColor: '#f8fafc', textColor: '#0f172a', paddingY: 'md', textAlign: 'left' },

        isVisible: true

      }

    ],

    revisions: []

  },

  'privacy-policy': {

    id: 'privacy-policy',

    slug: '/privacy-policy',

    title: 'প্রাইভেসি পলিসি — চাকরি সেবা',

    metaTitle: 'প্রাইভেসি ও তথ্য সুরক্ষা নীতি | চাকরি সেবা বিডি',

    metaDescription: 'চাকরি সেবা প্ল্যাটফর্মে ব্যবহারকারীর তথ্যের নিরাপত্তা ও সুরক্ষার অঙ্গীকার।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-privacy-hero',

        type: 'hero',

        title: 'গোপনীয়তা ও তথ্য সুরক্ষা নীতি',

        subtitle: 'আপনার তথ্যের শতভাগ নিরাপত্তা নিশ্চিত করাই আমাদের শীর্ষ অগ্রাধিকার।',

        content: { badge: 'ডাটা সিকিউরিটি' },

        style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      }

    ],

    revisions: []

  },

  'terms-and-conditions': {

    id: 'terms-and-conditions',

    slug: '/terms-and-conditions',

    title: 'ব্যবহারের শর্তাবলী — চাকরি সেবা',

    metaTitle: 'ব্যবহারের নিয়ম ও শর্তাবলী | চাকরি সেবা বিডি',

    metaDescription: 'চাকরি সেবা ব্যবহারের সাধারণ শর্তাবলী ও আইনি নীতিমালা।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-terms-hero',

        type: 'hero',

        title: 'ব্যবহারের সাধারণ নিয়ম ও শর্তাবলী',

        subtitle: 'চাকরি সেবা প্ল্যাটফর্ম ব্যবহারের পূর্বে অনুগ্রহ করে শর্তাবলী সাবধানে পড়ুন।',

        content: {},

        style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      }

    ],

    revisions: []

  },

  'disclaimer': {

    id: 'disclaimer',

    slug: '/disclaimer',

    title: 'আইনি নোটিশ ও ডিসক্লেইমার — চাকরি সেবা',

    metaTitle: 'ডিসক্লেইমার ও আইনগত ঘোষণা | চাকরি সেবা বিডি',

    metaDescription: 'চাকরি সেবা একটি স্বাধীন প্রযুক্তি প্ল্যাটফর্ম, সরকারি সরাসরি নিয়োগকারী সংস্থা নয়।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-disclaimer-hero',

        type: 'hero',

        title: 'আইনগত নোটিশ ও ঘোষণা (Disclaimer)',

        subtitle: 'চাকরি সেবা একটি স্বাধীন অ্যাপ্লিকেশন অ্যাসিস্ট্যান্স পোর্টাল, কোনো সরকারি নিয়োগ কর্তৃপক্ষ নয়।',

        content: {},

        style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      }

    ],

    revisions: []

  },

  'corrections-policy': {

    id: 'corrections-policy',

    slug: '/corrections-policy',

    title: 'তথ্য সংশোধন নীতিমালা — চাকরি সেবা',

    metaTitle: 'তথ্য সংশোধন ও ভুল নিরসন নীতিমালা | চাকরি সেবা বিডি',

    metaDescription: 'বিজ্ঞপ্তি বা তথ্যে কোনো অসঙ্গতি পরিলক্ষিত হলে দ্রুততম সময়ে সংশোধনের অঙ্গীকার।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-corrections-hero',

        type: 'hero',

        title: 'তথ্য সংশোধন ও ভুল নিরসন নীতিমালা',

        subtitle: 'সঠিক ও যাচাইকৃত তথ্য চাকরিপ্রার্থীদের কাছে পৌঁছানোই আমাদের মূল লক্ষ্য।',

        content: { badge: 'স্বচ্ছতা ও নির্ভুলতা' },

        style: { backgroundColor: '#064e3b', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      }

    ],

    revisions: []

  },

  'editorial-policy': {

    id: 'editorial-policy',

    slug: '/editorial-policy',

    title: 'সম্পাদকীয় নীতিমালা — চাকরি সেবা',

    metaTitle: 'সম্পাদকীয় ও কনটেন্ট প্রকাশনা নীতিমালা | চাকরি সেবা বিডি',

    metaDescription: 'আমাদের কনটেন্ট যাচাই ও প্রকাশনা প্রক্রিয়ার মূল নীতিসমূহ।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-editorial-hero',

        type: 'hero',

        title: 'সম্পাদকীয় ও কনটেন্ট প্রকাশনা নীতিমালা',

        subtitle: 'নির্ভুল, পক্ষপাতহীন এবং যাচাইকৃত চাকরির খবর পরিবেশনে আমরা প্রতিশ্রুতিবদ্ধ।',

        content: { badge: 'দায়িত্বশীল প্রকাশনা' },

        style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      }

    ],

    revisions: []

  },

  'job-verification-policy': {

    id: 'job-verification-policy',

    slug: '/job-verification-policy',

    title: 'বিজ্ঞপ্তি সত্যতা যাচাই নীতিমালা — চাকরি সেবা',

    metaTitle: 'বিজ্ঞপ্তি সত্যতা ও স্বচ্ছতা নীতিমালা | চাকরি সেবা বিডি',

    metaDescription: 'ফেক বা ভুয়া সার্কুলার প্রতিরোধে আমাদের ৪-স্তরের সত্যতা যাচাই ব্যবস্থা।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-verification-hero',

        type: 'hero',

        title: '৪-স্তরের সার্কুলার সত্যতা যাচাই প্রক্রিয়া',

        subtitle: 'কোনো ভুয়া বা প্রতারণামূলক সার্কুলার যাতে প্ল্যাটফর্মে প্রকাশিত না হয় তা আমরা নিশ্চিত করি।',

        content: { badge: '১০০% ভেরিফাইড গ্যারান্টি' },

        style: { backgroundColor: '#064e3b', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      }

    ],

    revisions: []

  },

  'admit-cards': {

    id: 'admit-cards',

    slug: '/admit-cards',

    title: 'প্রবেশপত্র ডাউনলোড ও নোটিশ — চাকরি সেবা',

    metaTitle: 'প্রবেশপত্র ডাউনলোড ও পরীক্ষার তারিখ | চাকরি সেবা বিডি',

    metaDescription: 'সরকারি ও ব্যাংক চাকরির এডমিট কার্ড ডাউনলোড লিংক ও পরীক্ষার তারিখ।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-admit-hero',

        type: 'hero',

        title: 'পরীক্ষার প্রবেশপত্র (Admit Card) ও তারিখ',

        subtitle: 'চলমান সকল সরকারি ও ব্যাংক চাকরির প্রবেশপত্র ডাউনলোড ও পরীক্ষার সিট প্ল্যান।',

        content: { badge: 'লাইভ এডমিট কার্ড পোর্টাল' },

        style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      }

    ],

    revisions: []

  },

  'exam-results': {

    id: 'exam-results',

    slug: '/exam-results',

    title: 'পরীক্ষার ফলাফল ও মেরিট লিস্ট — চাকরি সেবা',

    metaTitle: 'পরীক্ষার ফলাফল ও ভাইভা তালিকা | চাকরি সেবা বিডি',

    metaDescription: 'প্রিলিমিনারি, লিখিত ও ভাইভা পরীক্ষার অফিসিয়াল ফলাফল ও পিডিএফ নোটিশ।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-results-hero',

        type: 'hero',

        title: 'পরীক্ষার ফলাফল ও উত্তীর্ণদের তালিকা',

        subtitle: 'বিপিএসসি, ব্যাংক ও সরকারি বিভিন্ন নিয়োগ পরীক্ষার অফিসিয়াল ফলাফল ও নোটিশ।',

        content: { badge: 'সর্বশেষ পরীক্ষার ফলাফল' },

        style: { backgroundColor: '#0f172a', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      }

    ],

    revisions: []

  },

  'career-guides': {

    id: 'career-guides',

    slug: '/career-guides',

    title: 'ক্যারিয়ার গাইড ও প্রস্তুতি — চাকরি সেবা',

    metaTitle: 'ক্যারিয়ার গাইড ও চাকরির প্রস্তুতি | চাকরি সেবা বিডি',

    metaDescription: 'বিসিএস, ব্যাংক ও সরকারি চাকরির প্রস্তুতিমূলক গাইড ও দিকনির্দেশনা।',

    status: 'published',

    version: 1,

    isSystemPage: true,

    updatedAt: new Date().toISOString(),

    publishedAt: new Date().toISOString(),

    sections: [

      {

        id: 'sec-career-hero',

        type: 'hero',

        title: 'ক্যারিয়ার প্রস্তুতি ও গাইডলাইন',

        subtitle: 'সিভি তৈরি, ভাইভা ফেস করা ও অনলাইন আবেদনের সেরা কৌশলসমূহ শিখুন।',

        content: { badge: 'ক্যারিয়ার রিসোর্স সেন্টার' },

        style: { backgroundColor: '#064e3b', textColor: '#ffffff', paddingY: 'lg', textAlign: 'center' },

        isVisible: true

      }

    ],

    revisions: []

  }

};





function getInitialState(): DatabaseState {



  



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



            badge: 'âš¡ ২০২৬ এর সর্বশেষ নিয়োগ সার্কুলার'



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







  const defaultId = 'USR-01712345678';



  const defaultCandidate: CandidateRecord = {



    ...mockUserProfile,



    id: defaultId,



    passwordHash: '',



    role: 'candidate',



    createdAt: new Date().toISOString(),



    updatedAt: new Date().toISOString()



  };



  return {



    candidates: { [defaultId]: defaultCandidate },



    documents: { [defaultId]: [] },



    applications: { [defaultId]: [...mockApplications] },



    savedJobs: { [defaultId]: ['bb-ad-2026', 'sonali-senior-officer-2026'] },



    transactions: { [defaultId]: [] },



    notifications: { [defaultId]: [] },



    sessions: {},



    coupons: {},



    raffleCampaigns: {},



    couponRedemptions: {},



    raffleEntries: {},



    adminAuditLogs: [],



    jobs: mockJobsMap,



    pages: ALL_DEFAULT_PAGES,



    jobSources: defaultSources,



    circularDrafts: defaultDrafts,



    companies: defaultCompanies,



    companyApplications: {}



  };



}







let _cachedDbState: DatabaseState | null = null;
let _cachedDbSignature = '';

function databaseSignature(): string {
  const stat = fs.statSync(DB_FILE, { bigint: true });
  return `${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}`;
}

function loadDB(): DatabaseState {



  try {



    if (!fs.existsSync(DB_FILE)) {



      const init = getInitialState();



      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2), 'utf8');



      return init;



    }



    const currentSignature = databaseSignature();
    if (_cachedDbState && _cachedDbSignature === currentSignature) {
      return _cachedDbState;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf8');



    const state = repairStoredText(JSON.parse(raw));



    if (!state.candidates) state.candidates = {};



    if (!state.documents) state.documents = {};



    if (!state.applications) state.applications = {};



    if (!state.savedJobs) state.savedJobs = {};



    if (!state.transactions) state.transactions = {};



    if (!state.notifications) state.notifications = {};



    if (!state.sessions) state.sessions = {};



    if (!state.coupons) state.coupons = {};



    if (!state.raffleCampaigns) state.raffleCampaigns = {};



    if (!state.couponRedemptions) state.couponRedemptions = {};



    if (!state.raffleEntries) state.raffleEntries = {};



    if (!state.adminAuditLogs) state.adminAuditLogs = [];



    if (!state.jobs) {
      state.jobs = {};
    }



    if (!state.pages) state.pages = {};



    if (!state.jobSources) state.jobSources = {};



    if (!state.circularDrafts) state.circularDrafts = {};



    if (!state.companies) state.companies = {};



    if (!state.companyApplications) state.companyApplications = {};

    if (!state.deadlineData) state.deadlineData = {};

    if (!state.deadlineRevisions) state.deadlineRevisions = {};

    if (!state.circularChangeProposals) state.circularChangeProposals = {};

    if (!state.userJobReminders) state.userJobReminders = {};

    if (!state.notificationDeliveries) state.notificationDeliveries = [];

    if (!state.monitoringRuns) state.monitoringRuns = [];

    if (!state.recommendationFeedback) state.recommendationFeedback = {};

    if (!state.matchingConfig) {

      state.matchingConfig = {

        version: 'v1.0.0',

        enabled: true,

        weights: { education: 25, skills: 25, experience: 15, category: 10, location: 10, employmentType: 5, organizationType: 5, salary: 5 },

        minScoreToRecommend: 40,

        excellentThreshold: 90,

        strongThreshold: 75,

        goodThreshold: 60,

        partialThreshold: 40,

        allowOverqualification: true,

        quotaAgeRelaxationYears: 2,

        updatedAt: new Date().toISOString(),

        updatedBy: 'SYSTEM_DEFAULT'

      };

    }

    if (!state.deadlineAlertRules) state.deadlineAlertRules = [

      { id: 'rule-7d', name: '7 Days Before', nameBn: 'আবেদনের ৭ দিন আগে', leadDays: 7, channel: 'in_app', isEnabled: true },

      { id: 'rule-3d', name: '3 Days Before', nameBn: 'আবেদনের ৩ দিন আগে (জরুরি)', leadDays: 3, channel: 'in_app', isEnabled: true },

      { id: 'rule-1d', name: '1 Day Before', nameBn: 'আবেদনের ১ দিন আগে', leadDays: 1, channel: 'in_app', isEnabled: true },

      { id: 'rule-0d', name: 'Deadline Day', nameBn: 'আবেদনের শেষ তারিখ আজ', leadDays: 0, channel: 'in_app', isEnabled: true }

    ];



    _cachedDbState = state;
    _cachedDbSignature = currentSignature;
    return state;



  } catch (loadErr) {



    console.warn('Warning: DB file read failed, attempting backup recovery...', loadErr);



    const bakFile = DB_FILE + '.bak';



    if (fs.existsSync(bakFile)) {



      try {



        const rawBak = fs.readFileSync(bakFile, 'utf8');



        return repairStoredText(JSON.parse(rawBak));



      } catch (bakErr) {



        console.error('Backup recovery failed as well:', bakErr);



      }



    }



    throw new Error('Unable to read the database or its backup.');



  }



}







function saveDB(state: DatabaseState) {



  try {



    const tmpFile = DB_FILE + '.tmp';



    const bakFile = DB_FILE + '.bak';



    const jsonStr = JSON.stringify(state, null, 2);



    // 1. Atomic write to temporary file



    fs.writeFileSync(tmpFile, jsonStr, 'utf8');



    // 2. Refresh rolling backup



    if (fs.existsSync(DB_FILE)) {



      try { fs.copyFileSync(DB_FILE, bakFile); } catch {}



    }




    // 3. Atomic rename to replace active store file with Windows fallback

    try {

      fs.renameSync(tmpFile, DB_FILE);

    } catch {

      try {

        fs.writeFileSync(DB_FILE, jsonStr, 'utf8');

        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

      } catch (writeErr) {

        throw writeErr;

      }

    }



    _cachedDbState = state;
    _cachedDbSignature = databaseSignature();
  } catch (err) {



    _cachedDbState = null;
    _cachedDbSignature = '';
    throw new Error('Failed to persist database changes.', { cause: err });



  }



}







function normalizeJobSource(source: JobSource): JobSource {



  const isEnabled = source.enabled !== undefined ? source.enabled : (source.autoSync !== undefined ? source.autoSync : true);



  return {



    ...source,



    classification: source.classification || 'official',



    enabled: isEnabled,



    collectionMethod: source.collectionMethod || 'html_scrape',



    scanIntervalMinutes: Number(source.scanIntervalMinutes) || 360,



    healthStatus: source.healthStatus || (source.fetchStatus === 'error' ? 'failing' : (!isEnabled ? 'paused' : 'healthy')),



    metrics: source.metrics ? {



      discovered: Number(source.metrics.discovered) || 0,



      collected: Number(source.metrics.collected) || 0,



      failed: Number(source.metrics.failed) || 0,



      deduplicated: Number(source.metrics.deduplicated) || 0



    } : {



      discovered: 0,



      collected: 0,



      failed: 0,



      deduplicated: 0



    },



    adminNotes: source.adminNotes || '',



    createdAt: source.createdAt || source.lastFetchedAt || new Date().toISOString(),



    updatedAt: source.updatedAt || source.lastFetchedAt || new Date().toISOString()



  };



}







export function parseBengaliDateScore(dateStr?: string): number {

  if (!dateStr || typeof dateStr !== 'string') return 0;

  

  const bnDigits: Record<string, string> = {

    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',

    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'

  };

  let norm = dateStr;

  for (const [bn, en] of Object.entries(bnDigits)) {

    norm = norm.split(bn).join(en);

  }



  // 1. Explicit DD/MM/YYYY or DD-MM-YYYY (Bangladesh standard, avoids US MM/DD swap)

  const slash = norm.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);

  if (slash) {

    const day = parseInt(slash[1], 10);

    const month = parseInt(slash[2], 10) - 1;

    const year = parseInt(slash[3], 10);

    return new Date(year, month, day).getTime();

  }



  // 2. Fallback to ISO / standard Date.parse (e.g. 2026-10-29T12:00:00Z)

  const direct = Date.parse(norm);

  if (!isNaN(direct)) return direct;



  // 3. Check Bengali month names: e.g. "২৮ অক্টোবর ২০২৬"

  const monthMap: Record<string, number> = {

    'জানুয়ারি': 0, 'ফেব্রুয়ারি': 1, 'মার্চ': 2, 'এপ্রিল': 3,

    'মে': 4, 'জুন': 5, 'জুলাই': 6, 'আগস্ট': 7,

    'সেপ্টেম্বর': 8, 'অক্টোবর': 9, 'নভেম্বর': 10, 'ডিসেম্বর': 11

  };

  for (const [bnMonth, mIdx] of Object.entries(monthMap)) {

    if (norm.includes(bnMonth)) {

      const match = norm.match(/(\d{1,2})\s*([^\d\s]+)\s*(\d{4})/);

      if (match) {

        const day = parseInt(match[1], 10);

        const year = parseInt(match[3], 10);

        return new Date(year, mIdx, day).getTime();

      }

    }

  }



  return 0;

}



export function sortJobsChronologically(jobs: JobCircular[]): JobCircular[] {
  const now = new Date();
  const bstOffset = 6 * 60 * 60 * 1000;
  const todayIso = new Date(now.getTime() + bstOffset).toISOString().split('T')[0];

  const isJobExpired = (job: JobCircular): boolean => {
    if ((job as any).status === 'EXPIRED' || (job as any).status === 'CLOSED') return true;
    if (job.deadline) {
      const d = job.deadline;
      if (d.includes('সমাপ্ত') || d.includes('শেষ') || d.toLowerCase().includes('expired') || d.toLowerCase().includes('closed')) return true;
      // Convert to ISO if possible
      let s = d.trim();
      const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      const en = ['0','1','2','3','4','5','6','7','8','9'];
      bn.forEach((digit, idx) => { s = s.split(digit).join(en[idx]); });
      const slash = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      let iso: string | null = null;
      if (slash) {
        iso = slash[3] + '-' + slash[2].padStart(2, '0') + '-' + slash[1].padStart(2, '0');
      } else {
        const words = s.split(/\s+/);
        if (words.length >= 2) {
          const day = words[0].replace(/[^0-9]/g, '').padStart(2, '0');
          const year = (words[2] ? words[2].replace(/[^0-9]/g, '') : '') || '2026';
          const mStr = words[1].toLowerCase();
          const months: Record<string, string> = {
            'জানুয়ারি': '01', 'জানুয়ারি': '01', 'ফেব্রুয়ারি': '02', 'ফেব্রুয়ারি': '02',
            'মার্চ': '03', 'এপ্রিল': '04', 'মে': '05', 'জুন': '06', 'জুলাই': '07',
            'আগস্ট': '08', 'সেপ্টেম্বর': '09', 'অক্টোবর': '10', 'নভেম্বর': '11', 'ডিসেম্বর': '12'
          };
          for (const [k, v] of Object.entries(months)) {
            if (mStr.includes(k)) { iso = year + '-' + v + '-' + day; break; }
          }
        }
      }
      if (iso) {
        const diffDays = Math.round((new Date(iso + 'T00:00:00Z').getTime() - new Date(todayIso + 'T00:00:00Z').getTime()) / (1000 * 60 * 60 * 24));
        return diffDays < 0; // Only past deadlines are expired; 0 is open today!
      }
    }
    return Boolean(job.daysRemaining !== undefined && job.daysRemaining !== null && job.daysRemaining < 0);
  };

  return [...jobs].sort((a, b) => {
    const aExpired = isJobExpired(a);
    const bExpired = isJobExpired(b);

    // Rule 1: Active jobs ALWAYS come before Expired / Closed jobs

    if (!aExpired && bExpired) return -1;

    if (aExpired && !bExpired) return 1;



    // Rule 2: Sort by newest publishedDate / createdAt first (descending)

    const aDate = parseBengaliDateScore(a.publishedDate || (a as any).createdAt);

    const bDate = parseBengaliDateScore(b.publishedDate || (b as any).createdAt);

    if (bDate !== aDate) {

      return bDate - aDate;

    }



    // Rule 3: Tie breaker by daysRemaining

    return (b.daysRemaining || 0) - (a.daysRemaining || 0);

  });

}





function normalizeJob(job: JobCircular): JobCircular {
  return {
    ...job,
    slug: job.slug?.replace(/^\/?jobs\//, '').replace(/^\/+|\/+$/g, '') || job.id
  };
}

export const serverDB = {



  // Candidate Operations



  getCandidateByPhone(phone: string): CandidateRecord | null {



    const db = loadDB();



    const found = Object.values(db.candidates).find(c => c.phone === phone) || null;
    if (found) return found;
    return (SyntheticUserManager.getSyntheticUserByIdentifier(phone) as unknown as CandidateRecord) || null;



  },



  getCandidateByEmail(email: string): CandidateRecord | null {



    const db = loadDB();



    const clean = email.trim().toLowerCase();



    return Object.values(db.candidates).find(c => c.email && c.email.trim().toLowerCase() === clean) || null;



  },



  getCandidateByUsername(username: string): CandidateRecord | null {



    const db = loadDB();



    const clean = username.trim().toLowerCase();



    return Object.values(db.candidates).find(c => c.username && c.username.trim().toLowerCase() === clean) || null;



  },



  getCandidateByIdentifier(identifier: string): CandidateRecord | null {



    const db = loadDB();



    const trimmed = identifier.trim();



    const clean = trimmed.toLowerCase();



    const cleanPhone = trimmed.replace(/[^0-9]/g, '');



    const found = Object.values(db.candidates).find(c => {
      if (c.email && c.email.trim().toLowerCase() === clean) return true;
      if (c.username && c.username.trim().toLowerCase() === clean) return true;
      if (c.phone === trimmed) return true;
      if (cleanPhone.length >= 10 && c.phone.replace(/[^0-9]/g, '') === cleanPhone) return true;
      return false;
    }) || null;
    if (found) return found;
    return (SyntheticUserManager.getSyntheticUserByIdentifier(identifier) as unknown as CandidateRecord) || null;



  },



  getCandidateById(id: string): CandidateRecord | null {



    const db = loadDB();



    if (db.candidates[id]) return db.candidates[id];
    if (id && id.startsWith('SYNTH-')) {
      return (SyntheticUserManager.getSyntheticUserById(id) as unknown as CandidateRecord) || null;
    }
    return null;



  },



  createCandidate(candidate: CandidateRecord): CandidateRecord {
    if (candidate.id?.startsWith('SYNTH-') || (candidate as any).isSynthetic || candidate.phone?.startsWith('01889') || (candidate.name && (candidate.name.includes('টেস্ট') || candidate.name.includes('Test')))) {
      const synthCandidate: any = {
        ...candidate,
        id: candidate.id?.startsWith('SYNTH-') ? candidate.id : 'SYNTH-USR-' + Date.now(),
        isSynthetic: true,
        testDataVersion: '2.0'
      };
      SyntheticUserManager.saveSyntheticUser(synthCandidate);
      return synthCandidate;
    }

    const db = loadDB();



    db.candidates[candidate.id] = candidate;



    if (!db.documents[candidate.id]) db.documents[candidate.id] = [];



    if (!db.applications[candidate.id]) db.applications[candidate.id] = [];



    if (!db.savedJobs[candidate.id]) db.savedJobs[candidate.id] = [];



    if (!db.transactions[candidate.id]) db.transactions[candidate.id] = [];



    if (!db.notifications[candidate.id]) db.notifications[candidate.id] = [];



    saveDB(db);



    return candidate;



  },



  updateCandidate(id: string, updates: Partial<CandidateRecord>, adminId = 'ADMIN', reason?: string): CandidateRecord | null {
    if (id.startsWith('SYNTH-')) {
      const synth = SyntheticUserManager.getSyntheticUserById(id);
      if (synth) {
        return SyntheticUserManager.updateSyntheticUser(id, updates as any) as unknown as CandidateRecord;
      }
    }
    const db = loadDB();
    const existing = db.candidates[id];
    if (!existing) {
      const synth = SyntheticUserManager.getSyntheticUserById(id);
      if (synth) {
        return SyntheticUserManager.updateSyntheticUser(id, updates as any) as unknown as CandidateRecord;
      }
      return null;
    }

    // Normalize status and accountStatus
    if ((updates as any).accountStatus && !(updates as any).status) {
      (updates as any).status = (updates as any).accountStatus;
    } else if ((updates as any).status && !(updates as any).accountStatus) {
      (updates as any).accountStatus = (updates as any).status;
    }

    // Detect changed fields for audit
    const changedFields: string[] = [];
    for (const key of Object.keys(updates)) {
      if (key !== 'updatedAt' && key !== 'adminAuditHistory' && JSON.stringify((existing as any)[key]) !== JSON.stringify((updates as any)[key])) {
        changedFields.push(key);
      }
    }

    const auditNote = reason || (changedFields.length > 0 ? `${changedFields.length}টি ফিল্ড পরিবর্তিত হয়েছে (${changedFields.slice(0, 3).join(', ')}${changedFields.length > 3 ? '...' : ''})` : 'প্রোফাইল তথ্য হালনাগাদ');
    const auditEntry = {
      timestamp: new Date().toISOString(),
      adminId: adminId || 'ADMIN',
      action: 'candidate_profile_update',
      changedFields,
      notes: auditNote,
      reason: auditNote
    };

    const existingAuditHistory = (existing as any).adminAuditHistory || [];
    const updatedAuditHistory = [auditEntry, ...existingAuditHistory].slice(0, 30);

    const updated = {
      ...existing,
      ...updates,
      adminAuditHistory: updatedAuditHistory,
      updatedAt: new Date().toISOString()
    };

    db.candidates[id] = updated;
    saveDB(db);
    return updated;
  },







  // Saved Jobs



  getSavedJobs(candidateId: string): string[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      const u = SyntheticUserManager.getSyntheticUserById(candidateId);
      return (u as any)?.savedJobs || [];
    }
    const db = loadDB();



    return (db.savedJobs && db.savedJobs[candidateId]) || [];



  },



  toggleSavedJob(candidateId: string, jobId: string, action?: 'save' | 'unsave'): string[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      const u = SyntheticUserManager.getSyntheticUserById(candidateId);
      if (u) {
        const list = (u as any).savedJobs || [];
        let updated: string[];
        if (action === 'save') {
          updated = list.includes(jobId) ? list : [...list, jobId];
        } else if (action === 'unsave') {
          updated = list.filter((id: string) => id !== jobId);
        } else {
          updated = list.includes(jobId) ? list.filter((id: string) => id !== jobId) : [...list, jobId];
        }
        (u as any).savedJobs = updated;
        return updated;
      }
      return [];
    }
    const db = loadDB();



    if (!db.savedJobs) db.savedJobs = {};



    const list = db.savedJobs[candidateId] || [];



    let updated: string[];



    if (action === 'save') {



      updated = list.includes(jobId) ? list : [...list, jobId];



    } else if (action === 'unsave') {



      updated = list.filter(id => id !== jobId);



    } else {



      updated = list.includes(jobId) ? list.filter(id => id !== jobId) : [...list, jobId];



    }



    db.savedJobs[candidateId] = updated;



    saveDB(db);



    return updated;



  },







  // Documents



    getDocuments(candidateId: string): CandidateDocument[] {
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
    const deleted = list.find(document => document.id === docId);
    const updated = list.filter(d => d.id !== docId);
    const candidate = db.candidates[candidateId];
    if (candidate && deleted) {
      const urls = [deleted.fileUrl, deleted.dataUrl, deleted.secureUrl].filter(Boolean);
      const fields = ['photoUrl', 'signatureUrl', 'nidFrontUrl', 'nidBackUrl', 'fatherNidUrl', 'motherNidUrl', 'nagorikCertificateUrl', 'birthCertificateUrl', 'characterCertificateUrl', 'quotaCertificateUrl'];
      for (const field of fields) {
        if (urls.includes((candidate as any)[field])) (candidate as any)[field] = '';
      }
      candidate.customDocuments = candidate.customDocuments?.filter(document => document.id !== docId);
    }
    db.documents[candidateId] = updated;
    saveDB(db);
    return updated;
  },







  // Applications
  getApplications(candidateId: string): ApplicationRequest[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.getApplications(candidateId);
    }
    const db = loadDB();
    const map = new Map<string, ApplicationRequest>();
    
    // 1. Direct candidateId bucket
    const directList = db.applications[candidateId] || [];
    for (const app of directList) {
      if (app && app.id) map.set(app.id, app);
    }

    // 2. Candidate phone cross-linking (for guest/unregistered applications linked by phone)
    const cand = db.candidates ? db.candidates[candidateId] : null;
    const cleanCandPhone = cand?.phone ? cand.phone.replace(/\D/g, '') : null;

    for (const list of Object.values(db.applications)) {
      if (!Array.isArray(list)) continue;
      for (const app of list) {
        if (!app || !app.id) continue;
        if (app.candidateId === candidateId) {
          map.set(app.id, app);
        } else if (cleanCandPhone && app.candidatePhone) {
          const appPhone = app.candidatePhone.replace(/\D/g, '');
          if (appPhone && (appPhone === cleanCandPhone || appPhone.endsWith(cleanCandPhone) || cleanCandPhone.endsWith(appPhone))) {
            map.set(app.id, app);
          }
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => (b.id > a.id ? 1 : -1));
  },

  submitApplication(candidateId: string, app: ApplicationRequest, payWithWallet: boolean): { success: boolean; error?: string; applications?: ApplicationRequest[]; walletBalance?: number; transaction?: WalletTransaction } {
    const db = loadDB();
    let candidate: CandidateRecord | undefined = db.candidates[candidateId];
    if (!candidate && candidateId?.startsWith('SYNTH-')) {
      candidate = SyntheticUserManager.getSyntheticUserById(candidateId) as any;
    }
    if (!candidate) {
      const all = Object.values(db.candidates);
      candidate = all.find(c => c.id === candidateId || c.phone === (app as any).candidatePhone);
    }
    if (!candidate) return { success: false, error: 'Candidate not found' };
    const list = db.applications[candidateId] || [];
    if (list.some(existing => existing.id === app.id || (existing.jobId === app.jobId && existing.postName === app.postName && ['pending_payment', 'processing', 'submitted'].includes(existing.status)))) {
      return { success: false, error: 'Duplicate application' };
    }
    if (!Number.isFinite(app.totalAmount) || app.totalAmount < 0) return { success: false, error: 'Invalid application fee' };
    let transaction: WalletTransaction | undefined = undefined;
    if (payWithWallet) {
      if ((candidate.walletBalance || 0) < app.totalAmount) return { success: false, error: 'Insufficient wallet balance' };
      candidate.walletBalance = Math.round(((candidate.walletBalance || 0) - app.totalAmount) * 100) / 100;
      transaction = {
        id: 'TXN-' + app.id,
        date: new Date().toISOString(),
        amount: app.totalAmount,
        type: 'fee_deduction',
        description: app.jobTitle + ' - ' + app.postName,
        method: 'Wallet',
        trxId: 'WALLET-' + app.id,
        status: 'completed'
      };
      db.transactions[candidateId] = [transaction, ...(db.transactions[candidateId] || [])];
    }
    const applications = [{ ...app, candidateId }, ...list];
    db.applications[candidateId] = applications;
    saveDB(db);
    return { success: true, applications, walletBalance: candidate.walletBalance, transaction };
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
    const db = loadDB();

    if (isAdmin || candidateId.startsWith('ADMIN-')) {

      for (const cid of Object.keys(db.applications)) {

        const list = db.applications[cid] || [];

        for (let i = 0; i < list.length; i++) {

          if (list[i].id === appId) {

            const current = list[i];

            const updatedHistory = current.statusHistory ? [...current.statusHistory] : [];

            if (extra?.statusHistory) {

              updatedHistory.push(...extra.statusHistory);

            }

            const found: ApplicationRequest = {

              ...current,

              status,

              verificationType: verificationType || current.verificationType || 'officially_verified',

              notes: notes !== undefined ? notes : current.notes,

              ...(extra || {}),

              statusHistory: updatedHistory

            };

            list[i] = found;

            db.applications[cid] = list;

            saveDB(db);

            const statusMessages_app_update: Record<string, string> = {
              completed: 'আপনার আবেদনটি সম্পন্ন হয়েছে এবং প্রাপ্তি স্বীকারপত্র তৈরি হয়েছে।',
              processing: 'আপনার আবেদনটি যাচাইকরণ প্রক্রিয়ায় রয়েছে।',
              rejected: 'আবেদন তথ্য অসম্পূর্ণ বা অসামঞ্জস্যের কারণে বাতিল হয়েছে।'
            };
            if (statusMessages_app_update[status]) {
              this.addCandidateNotification(cid, {
                title: `আবেদন স্ট্যাটাস: ${status === 'completed' ? 'সম্পন্ন' : status === 'processing' ? 'প্রক্রিয়াধীন' : 'বাতিল'}`,
                message: `${(current as any)?.jobTitle || 'চাকরির আবেদন'}: ${statusMessages_app_update[status]}`,
                type: 'application',
                link: '/dashboard/applications'
              });
            }

            return found;
          }
        }
      }
      return null;

    }

    const list = db.applications[candidateId] || [];

    let found: ApplicationRequest | null = null;

    const updated = list.map(a => {

      if (a.id === appId) {

        const updatedHistory = a.statusHistory ? [...a.statusHistory] : [];

        if (extra?.statusHistory) {

          updatedHistory.push(...extra.statusHistory);

        }

        found = {

          ...a,

          status,

          verificationType: verificationType || a.verificationType || 'user_reported',

          notes: notes !== undefined ? notes : a.notes,

          ...(extra || {}),

          statusHistory: updatedHistory

        };

        return found;

      }

      return a;

    });

    db.applications[candidateId] = updated;

    saveDB(db);

    return found;

  },



  // Transactions with Idempotency & Balance Update



  getTransactions(candidateId: string): WalletTransaction[] {



    const db = loadDB();



    return db.transactions[candidateId] || [];



  },



  getWalletTransactions() {
    const db = loadDB();
    return Object.entries(db.transactions).flatMap(([candidateId, transactions]) => transactions.map(transaction => ({
      ...transaction, candidateId,
      candidateName: db.candidates[candidateId]?.name || '',
      candidatePhone: db.candidates[candidateId]?.phone || ''
    })));
  },

  reviewWalletRecharge(candidateId: string, transactionId: string, decision: 'approve' | 'reject', adminId: string) {
    const db = loadDB();
    const candidate = db.candidates[candidateId];
    const transaction = db.transactions[candidateId]?.find(item => item.id === transactionId);
    if (!candidate || !transaction || transaction.type !== 'recharge') return { success: false, error: 'Recharge not found' };
    const targetStatus = decision === 'approve' ? 'completed' : 'failed';
    if (transaction.status === targetStatus) return { success: true, transaction, newBalance: candidate.walletBalance };
    if (transaction.status !== 'pending') return { success: false, error: 'Recharge already reviewed' };
    if (!Number.isFinite(transaction.amount) || transaction.amount <= 0) return { success: false, error: 'Invalid recharge amount' };
    if (decision === 'approve') candidate.walletBalance = Math.round(((candidate.walletBalance || 0) + transaction.amount) * 100) / 100;
    transaction.status = targetStatus;
    transaction.reviewedAt = new Date().toISOString();
    transaction.reviewedBy = adminId;
    db.adminAuditLogs.unshift({
      id: 'AUDIT-WALLET-' + transaction.id, adminId, action: 'wallet_recharge_review',
      targetId: transaction.id, targetType: 'order', changes: { status: { old: 'pending', new: targetStatus } },
      notes: decision === 'approve' ? 'Recharge verified and credited' : 'Recharge rejected', timestamp: transaction.reviewedAt
    } as AdminAuditLog);
    db.notifications[candidateId] = [{
      id: 'NOTIF-' + transaction.id,
      title: decision === 'approve' ? 'ওয়ালেট রিচার্জ সফল হয়েছে' : 'ওয়ালেট রিচার্জ প্রত্যাখ্যাত',
      message: decision === 'approve' 
        ? `TrxID: ${transaction.trxId} - ৳${transaction.amount} সফলভাবে আপনার ওয়ালেটে জমা হয়েছে।` 
        : `TrxID: ${transaction.trxId} - ৳${transaction.amount} রিচার্জ তথ্যের অমিলের কারণে বাতিল করা হয়েছে।`,
      type: 'system',
      read: false,
      date: transaction.reviewedAt,
      link: '/dashboard/wallet'
    }, ...(db.notifications[candidateId] || [])];
    saveDB(db);
    return { success: true, transaction, newBalance: candidate.walletBalance };
  },

  addTransaction(candidateId: string, tx: WalletTransaction, idempotencyKey?: string): { success: boolean; error?: string; tx?: WalletTransaction; newBalance?: number } {



    const db = loadDB();



    const list = db.transactions[candidateId] || [];



    const candidate = db.candidates[candidateId];



    if (!candidate) return { success: false, error: 'Candidate not found' };







    // Idempotency / Duplicate Prevention



    if (!Number.isFinite(tx.amount) || tx.amount <= 0) return { success: false, error: 'Invalid transaction amount' };
    const isDuplicate = Object.values(db.transactions).some(transactions => transactions.some(t => t.id === tx.id || (tx.trxId && (t.trxId || '').toUpperCase() === tx.trxId.toUpperCase())));



    if (isDuplicate) {



      return { success: false, error: 'Duplicate transaction rejected by ledger' };



    }







    const delta = tx.status === 'completed' ? (tx.type === 'fee_deduction' ? -tx.amount : tx.amount) : 0;



    const newBalance = Math.round(((candidate.walletBalance || 0) + delta) * 100) / 100;
    if (newBalance < 0) return { success: false, error: 'Insufficient wallet balance' };



    candidate.walletBalance = newBalance;







    const updatedList = [tx, ...list];



    db.transactions[candidateId] = updatedList;



    saveDB(db);



    return { success: true, tx, newBalance };



  },







  // Sessions



  createSession(token: string, candidateId: string, role: 'candidate' | 'admin', expiryDays = 7) {



    const db = loadDB();



    const expiresAt = new Date(Date.now() + expiryDays * 86400000).toISOString();



    db.sessions[token] = { candidateId, role, expiresAt };



    saveDB(db);



    return expiresAt;



  },



  verifySession(token: string): { candidateId: string; role: 'candidate' | 'admin' } | null {



    const db = loadDB();



    const s = db.sessions[token];



    if (!s) return null;



    if (new Date(s.expiresAt) < new Date()) {



      delete db.sessions[token];



      saveDB(db);



      return null;



    }



    return { candidateId: s.candidateId, role: s.role };



  },



  revokeSession(token: string) {



    const db = loadDB();



    delete db.sessions[token];



    saveDB(db);



  },







  // ==========================================



  // MILESTONE 2: COUPON & RAFFLE PERSISTENCE



  // ==========================================







  // Coupons



  getCoupons(): Coupon[] {



    const db = loadDB();



    return Object.values(db.coupons);



  },







  getCouponByCode(code: string): Coupon | null {



    if (!code || typeof code !== 'string') return null;



    const db = loadDB();



    const normalized = code.trim().toUpperCase();



    return Object.values(db.coupons).find(c => c.code.toUpperCase() === normalized) || null;



  },







  getCouponById(id: string): Coupon | null {



    const db = loadDB();



    return db.coupons[id] || null;



  },







  saveCoupon(coupon: Coupon): Coupon {



    const db = loadDB();



    const normalizedCode = coupon.code.trim().toUpperCase();



    const now = new Date().toISOString();



    const updated: Coupon = {



      ...coupon,



      code: normalizedCode,



      updatedAt: now,



      createdAt: coupon.createdAt || now



    };



    db.coupons[coupon.id] = updated;



    saveDB(db);



    return updated;



  },







  // Raffle Campaigns



  getRaffleCampaigns(): RaffleCampaign[] {



    const db = loadDB();



    return Object.values(db.raffleCampaigns);



  },







  getRaffleCampaignById(id: string): RaffleCampaign | null {



    const db = loadDB();



    return db.raffleCampaigns[id] || null;



  },







  getActiveRaffleCampaign(): RaffleCampaign | null {



    const db = loadDB();



    const now = new Date().getTime();



    return Object.values(db.raffleCampaigns).find(c => {



      if (c.status !== 'active') return false;



      const start = c.startDate ? new Date(c.startDate).getTime() : 0;



      const end = c.endDate ? new Date(c.endDate).getTime() : Infinity;



      return now >= start && now <= end;



    }) || null;



  },







  saveRaffleCampaign(campaign: RaffleCampaign): RaffleCampaign {



    const db = loadDB();



    const now = new Date().toISOString();



    const updated: RaffleCampaign = {



      ...campaign,



      updatedAt: now,



      createdAt: campaign.createdAt || now



    };



    db.raffleCampaigns[campaign.id] = updated;



    saveDB(db);



    return updated;



  },







  // Redemptions with Duplicate Prevention & Budget Safety



  getCouponRedemptions(candidateId?: string, couponId?: string): CouponRedemption[] {



    const db = loadDB();



    let all: CouponRedemption[] = [];



    if (candidateId) {



      all = db.couponRedemptions[candidateId] || [];



    } else {



      all = Object.values(db.couponRedemptions).flat();



    }



    if (couponId) {



      all = all.filter(r => r.couponId === couponId);



    }



    return all;



  },







  recordCouponRedemption(redemption: CouponRedemption): { success: boolean; error?: string; redemption?: CouponRedemption } {



    const db = loadDB();



    const candidateList = db.couponRedemptions[redemption.candidateId] || [];



    const coupon = db.coupons[redemption.couponId] || Object.values(db.coupons).find(c => c.code.toUpperCase() === redemption.couponCode.toUpperCase());







    if (!coupon) {



      return { success: false, error: 'Coupon not found in registry.' };



    }







    // 1. Prevent duplicate redemption for the exact same order



    const isDuplicateOrder = candidateList.some(r => r.orderId === redemption.orderId && r.couponId === coupon.id);



    if (isDuplicateOrder) {



      return { success: false, error: 'DUPLICATE_REDEMPTION: This order has already claimed this coupon.' };



    }







    // 2. Enforce global usage limit



    if (coupon.globalUsageLimit !== undefined && coupon.usedCount >= coupon.globalUsageLimit) {



      return { success: false, error: 'COUPON_GLOBAL_LIMIT_EXHAUSTED: Coupon global usage limit reached.' };



    }







    // 3. Enforce per-candidate usage limit



    const candidateUsageCount = candidateList.filter(r => r.couponId === coupon.id).length;



    const perCandidateLimit = coupon.perCandidateLimit ?? 1;



    if (candidateUsageCount >= perCandidateLimit) {



      return { success: false, error: 'COUPON_CANDIDATE_LIMIT_EXCEEDED: Candidate usage limit reached for this coupon.' };



    }







    // 4. Enforce monetary budget limit if configured



    if (coupon.totalBudget !== undefined) {



      const currentUsed = coupon.usedBudget || 0;



      if (currentUsed + redemption.discountAmount > coupon.totalBudget) {



        return { success: false, error: 'COUPON_BUDGET_EXCEEDED: Insufficient promotional budget remaining.' };



      }



      coupon.usedBudget = currentUsed + redemption.discountAmount;



    }







    // 5. Commit redemption and increment count



    coupon.usedCount += 1;



    coupon.updatedAt = new Date().toISOString();



    db.coupons[coupon.id] = coupon;







    const committedRedemption: CouponRedemption = {



      ...redemption,



      couponId: coupon.id,



      couponCode: coupon.code,



      status: 'committed'



    };







    db.couponRedemptions[redemption.candidateId] = [committedRedemption, ...candidateList];



    saveDB(db);







    return { success: true, redemption: committedRedemption };



  },







  // Raffle Entries



  getRaffleEntries(candidateId?: string, campaignId?: string): RaffleEntry[] {



    const db = loadDB();



    let all: RaffleEntry[] = [];



    if (candidateId) {



      all = db.raffleEntries[candidateId] || [];



    } else {



      all = Object.values(db.raffleEntries).flat();



    }



    if (campaignId) {



      all = all.filter(e => e.campaignId === campaignId);



    }



    return all;



  },







  recordRaffleEntry(entry: RaffleEntry): { success: boolean; error?: string; entry?: RaffleEntry } {



    const db = loadDB();



    const candidateList = db.raffleEntries[entry.candidateId] || [];



    const campaign = db.raffleCampaigns[entry.campaignId];







    if (!campaign) {



      return { success: false, error: 'Raffle campaign not found.' };



    }







    const isDuplicate = candidateList.some(e => e.orderId === entry.orderId && e.campaignId === entry.campaignId);



    if (isDuplicate) {



      return { success: false, error: 'DUPLICATE_ENTRY: This order has already been entered into this campaign.' };



    }







    if (entry.bonusAwarded > 0 && campaign.totalBudget !== undefined) {



      const currentUsed = campaign.usedBudget || 0;



      if (currentUsed + entry.bonusAwarded > campaign.totalBudget) {



        return { success: false, error: 'RAFFLE_BUDGET_EXCEEDED: Insufficient promotional bonus budget remaining.' };



      }



      campaign.usedBudget = currentUsed + entry.bonusAwarded;



      campaign.updatedAt = new Date().toISOString();



      db.raffleCampaigns[campaign.id] = campaign;



    }







    const committedEntry: RaffleEntry = {



      ...entry,



      status: 'committed'



    };







    db.raffleEntries[entry.candidateId] = [committedEntry, ...candidateList];



    saveDB(db);







    return { success: true, entry: committedEntry };



  },







  // Immutable Application Financial Snapshot Commitment



  commitApplicationFinancialSnapshot(



    candidateId: string,



    applicationId: string,



    snapshot: FinancialSnapshot



  ): { success: boolean; error?: string; application?: ApplicationRequest } {



    const db = loadDB();



    const candidateApps = db.applications[candidateId] || [];



    const appIndex = candidateApps.findIndex(a => a.id === applicationId);







    if (appIndex === -1) {



      return { success: false, error: 'Application order not found.' };



    }







    const existingApp = candidateApps[appIndex];



    if (existingApp.financialSnapshot?.isImmutable) {



      return {



        success: false,



        error: 'IMMUTABLE_SNAPSHOT: Order financial snapshot is finalized and locked against modification.'



      };



    }







    const immutableSnapshot: FinancialSnapshot = {



      ...snapshot,



      isImmutable: true,



      snapshotCreatedAt: snapshot.snapshotCreatedAt || new Date().toISOString()



    };







    const updatedApp: ApplicationRequest = {



      ...existingApp,



      totalAmount: immutableSnapshot.totalPayable,



      governmentFee: immutableSnapshot.governmentApplicationFee,



      serviceCharge: immutableSnapshot.serviceCharge,



      couponDiscount: immutableSnapshot.couponDiscount,



      raffleDiscount: immutableSnapshot.raffleBonusDiscount,



      financialSnapshot: immutableSnapshot



    };







    candidateApps[appIndex] = updatedApp;



    db.applications[candidateId] = candidateApps;



    saveDB(db);







    return { success: true, application: updatedApp };



  },







  // Admin Audit Logging



  



  // Candidate Management (Admin)



  getAllCandidates(): CandidateRecord[] {



    const db = loadDB();



    return Object.values(db.candidates).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());



  },







  getAllApplications(): ApplicationRequest[] {
    const db = loadDB();
    const all: ApplicationRequest[] = [];
    for (const list of Object.values(db.applications)) {
      if (Array.isArray(list)) all.push(...list);
    }
    return all.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (b.id > a.id ? 1 : -1);
    });
  },







  updateCandidateStatus(id: string, status: 'active' | 'suspended', reason: string, adminId = 'ADMIN'): CandidateRecord | null {



    const db = loadDB();



    const candidate = db.candidates[id];



    if (!candidate) return null;



    (candidate as any).status = status;
    candidate.accountStatus = status;
    candidate.updatedAt = new Date().toISOString();
    db.candidates[id] = candidate;
    saveDB(db);

    this.addCandidateNotification(id, {
      title: status === 'active' ? 'অ্যাকাউন্ট সক্রিয় হয়েছে' : 'অ্যাকাউন্ট স্থগিত করা হয়েছে',
      message: status === 'active'
        ? 'আপনার চাকরি সেবা অ্যাকাউন্টটি সফলভাবে সক্রিয় করা হয়েছে।'
        : `আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। কারণ: ${reason}`,
      type: 'system',
      link: '/dashboard'
    });







    this.recordAdminAudit({



      adminId,



      action: 'candidate_status_update' as any,



      targetId: id,



      targetType: 'order' as any,



      changes: { status: { old: 'active', new: status } },



      notes: reason



    });



    return candidate;



  },







  // Job Circular Management





  getJobs(): JobCircular[] {



    const db = loadDB();



    const list = Object.values(db.jobs || {});



    const sourceList = list;



    const synthJobs = process.env.NODE_ENV !== 'production' && process.env.ENABLE_TEST_AUTH === 'true'
      ? SyntheticJobManager.getPublishedJobs() : [];
    return [...synthJobs, ...sortJobsChronologically(sourceList)].map(normalizeJob);



  },







  getJobById(id: string): JobCircular | null {



    const db = loadDB();



    if (db.jobs && db.jobs[id]) return normalizeJob(db.jobs[id]);



    if (db.jobs) {

      const match = Object.values(db.jobs).find(j => j.id === id || normalizeJob(j).slug === id);

      if (match) return normalizeJob(match);

    }



    const synthFallback = process.env.NODE_ENV !== 'production' && process.env.ENABLE_TEST_AUTH === 'true'
      ? SyntheticJobManager.getJobById(id) : null;
    if (synthFallback) return synthFallback;
    return null;



  },



  getPublicJobs(): JobCircular[] {
    return this.getJobs().filter(isPublicJob).map(job => ({
      ...job, daysRemaining: CentralDeadlineEngine.evaluateDeadline(job).daysRemaining
    }));
  },

  getPublicJobById(id: string): JobCircular | null {
    const job = this.getJobById(id);
    return job && isPublicJob(job) ? { ...job, daysRemaining: CentralDeadlineEngine.evaluateDeadline(job).daysRemaining } : null;
  },

  getJobByIdOrSlug(idOrSlug: string): JobCircular | null {

    return this.getJobById(idOrSlug);

  },







  saveJob(job: Partial<JobCircular> & { id: string }, adminId = 'ADMIN'): JobCircular {
    job = repairStoredText(job);
    if (job.id && (job.id.startsWith('SYNTH-') || (job as any).isSynthetic)) {
      return SyntheticJobManager.saveJob(job, adminId);
    }
    const db = loadDB();

    if (!db.jobs) db.jobs = {};

    const exists = !!db.jobs[job.id];

    const existing = db.jobs[job.id] || {};

    const merged: JobCircular = { ...existing, ...job } as JobCircular;



    if (!merged.publishedDate) {

      const now = new Date();

      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

      const d = String(now.getDate()).padStart(2, '0').split('').map(ch => bnDigits[+ch]).join('');

      const m = String(now.getMonth() + 1).padStart(2, '0').split('').map(ch => bnDigits[+ch]).join('');

      const y = String(now.getFullYear()).split('').map(ch => bnDigits[+ch]).join('');

      merged.publishedDate = `${d}/${m}/${y}`;

    }

    if (!(merged as any).createdAt) {

      (merged as any).createdAt = new Date().toISOString();

    }



    const changedFields: string[] = [];
    if (exists) {
      for (const key of Object.keys(job)) {
        if (key !== 'updatedAt' && key !== 'revisionHistory' && JSON.stringify((existing as any)[key]) !== JSON.stringify((job as any)[key])) {
          changedFields.push(key);
        }
      }
    } else {
      changedFields.push('initial_creation');
    }

    merged.updatedAt = new Date().toISOString();

    const revisionEntry = {
      timestamp: new Date().toISOString(),
      adminId,
      action: exists ? (changedFields.length > 0 ? 'update' : 'no_change') : 'create',
      changedFields,
      summary: exists 
        ? (changedFields.length > 0 ? `${changedFields.length}টি ফিল্ড পরিবর্তিত হয়েছে (${changedFields.slice(0, 3).join(', ')}${changedFields.length > 3 ? '...' : ''})` : 'কোনো পরিবর্তন হয়নি')
        : 'সার্কুলার সফলভাবে তৈরি হয়েছে'
    };

    merged.revisionHistory = [revisionEntry, ...((existing as any).revisionHistory || [])].slice(0, 30);

    db.jobs[job.id] = merged;

    saveDB(db);



    const pdfTarget = merged.circularPdfUrl || (merged as any).pdfUrl;

    if (pdfTarget) {

      try {

        const { triggerAutoPdfConversion } = require('./pdfAutoConverter');

        triggerAutoPdfConversion(job.id, pdfTarget);

      } catch (e) {}

    }



    this.recordAdminAudit({



      adminId,



      action: (exists ? 'job_edit' : 'job_publish') as any,



      targetId: job.id,



      targetType: 'order' as any,



      changes: { job: { new: job.title } },



      notes: `Job circular ${exists ? 'updated' : 'published'}: ${job.title}`



    });



    
    // Automated Candidate Notification & Job Alerts Dispatch Engine
    try {
      const isJobActive = merged.status === 'published' || merged.status === 'active' || (merged as any).publicationStatus === 'PUBLISHED';
      if (isJobActive) {
        const notifTitle = exists ? `আপডেট: ${merged.title}` : `📢 নতুন সার্কুলার: ${merged.title}`;
        const notifMsg = `${merged.organization} কর্তৃক ${merged.categoryLabel || 'নিয়োগ'} বিজ্ঞপ্তি প্রকাশিত হয়েছে। পদ সংখ্যা: ${merged.totalPosts || 'একাধিক'}। আবেদনের শেষ সময়: ${merged.deadline || 'শীঘ্রই'}।`;
        const notifLink = `/jobs/${merged.slug || merged.id}`;

        if (db.candidates) {
          for (const candId of Object.keys(db.candidates)) {
            const cand = db.candidates[candId];
            if (!cand) continue;
            // Respect candidate alert settings
            if ((cand as any).jobAlerts === false) continue;

            // Intelligent Profile & CGPA Match Check
            let isProfileMatch = false;
            let matchedDegreeName = '';
            let matchedCgpa = '';
            const edus = Array.isArray(cand.education) ? cand.education : [];
            if (edus.length > 0) {
              const reqEdu = (merged.minEducation || '').toLowerCase();
              for (const edu of edus) {
                const deg = String(edu.degree || edu.level || '').trim();
                const res = String(edu.result || edu.cgpa || '').trim();
                const degLower = deg.toLowerCase();
                
                let degMatches = false;
                if (reqEdu.includes('master') || reqEdu.includes('মাস্টার্স') || reqEdu.includes('স্নাতকোত্তর')) {
                  if (degLower.includes('master') || degLower.includes('মাস্টার্স') || degLower.includes('স্নাতকোত্তর')) degMatches = true;
                } else if (reqEdu.includes('bachelor') || reqEdu.includes('honour') || reqEdu.includes('স্নাতক') || reqEdu.includes('বিএসসি') || reqEdu.includes('ইঞ্জিনিয়ারিং')) {
                  if (degLower.includes('bachelor') || degLower.includes('honour') || degLower.includes('স্নাতক') || degLower.includes('বিএসসি') || degLower.includes('master') || degLower.includes('মাস্টার্স')) degMatches = true;
                } else if (reqEdu.includes('diploma') || reqEdu.includes('ডিপ্লোমা') || reqEdu.includes('hsc') || reqEdu.includes('উচ্চ মাধ্যমিক')) {
                  if (degLower.includes('diploma') || degLower.includes('ডিপ্লোমা') || degLower.includes('hsc') || degLower.includes('bachelor') || degLower.includes('স্নাতক')) degMatches = true;
                } else if (reqEdu.includes('ssc') || reqEdu.includes('মাধ্যমিক') || reqEdu.includes('দাখিল')) {
                  degMatches = true;
                } else {
                  degMatches = true;
                }

                if (degMatches) {
                  isProfileMatch = true;
                  matchedDegreeName = deg;
                  matchedCgpa = res;
                  break;
                }
              }
            }

            let candNotifTitle = notifTitle;
            let candNotifMsg = notifMsg;

            if (isProfileMatch) {
              candNotifTitle = `🎯 আপনার যোগ্যতা ও সিজিপিএ অনুযায়ী সার্কুলার: ${merged.title}`;
              candNotifMsg = `আপনার ${matchedDegreeName || 'শিক্ষাগত যোগ্যতা'}${matchedCgpa ? ` (ফল: ${matchedCgpa})` : ''} অনুযায়ী ${merged.organization}-এর এই বিজ্ঞপ্তিটির যোগ্যতা শর্তাবলী পূরণ হয়েছে। পদ সংখ্যা: ${merged.totalPosts || 'একাধিক'}। শেষ সময়: ${merged.deadline || 'শীঘ্রই'}।`;
            }

            // Check category match if preferences exist
            const prefCats = (cand as any).preferredCategories || (cand as any).jobPreferences?.categories;
            if (Array.isArray(prefCats) && prefCats.length > 0) {
              const matches = prefCats.some((c: string) => 
                c.toLowerCase() === (merged.category || '').toLowerCase() || 
                c.toLowerCase() === 'all'
              );
              if (!matches) continue;
            }

            if (!db.notifications) db.notifications = {};
            if (!db.notifications[candId]) db.notifications[candId] = [];

            // Prevent spamming identical notification within 1 hour
            const recentSameNotif = db.notifications[candId].some(
              (n: any) => n.link === notifLink && Date.now() - new Date(n.date).getTime() < 3600000
            );

            if (!recentSameNotif) {
              db.notifications[candId].unshift({
                id: `notif_job_${merged.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                title: candNotifTitle,
                message: candNotifMsg,
                type: 'system',
                read: false,
                date: new Date().toISOString(),
                link: notifLink
              });
              if (db.notifications[candId].length > 100) {
                db.notifications[candId] = db.notifications[candId].slice(0, 100);
              }
            }
          }
        }

        // Notify Admin Center
        if (!db.notifications) db.notifications = {};
        if (!db.notifications['admin']) db.notifications['admin'] = [];
        db.notifications['admin'].unshift({
          id: `notif_adm_${merged.id}_${Date.now()}`,
          title: exists ? `সার্কুলার সম্পাদিত: ${merged.title}` : `নতুন সার্কুলার প্রকাশিত: ${merged.title}`,
          message: `${adminId} দ্বারা ${merged.organization} এর সার্কুলার সফলভাবে সংরক্ষিত হয়েছে।`,
          type: 'system',
          read: false,
          date: new Date().toISOString(),
          link: `/jobs/${merged.slug || merged.id}`
        });
        if (db.notifications['admin'].length > 50) {
          db.notifications['admin'] = db.notifications['admin'].slice(0, 50);
        }

        saveDB(db);
      }
    } catch (notifDispatchErr) {
      console.error('[Job Notification Dispatch Error]:', notifDispatchErr);
    }

    return merged;



  },







  deleteJob(id: string, adminId = 'ADMIN'): boolean {



    const db = loadDB();



    if (!db.jobs || !db.jobs[id]) return false;



    const title = db.jobs[id].title;



    delete db.jobs[id];



    saveDB(db);







    this.recordAdminAudit({



      adminId,



      action: 'job_delete' as any,



      targetId: id,



      targetType: 'order' as any,



      changes: { job: { old: title } },



      notes: `Job deleted: ${title}`



    });



    return true;



  },







  // Website Builder (Pages & Revisions)



  getPages(): PageRecord[] {

    const db = loadDB();

    if (!db.pages) db.pages = {};

    let modified = false;

    for (const [key, p] of Object.entries(ALL_DEFAULT_PAGES)) {

      if (!db.pages[key]) {

        db.pages[key] = p;

        modified = true;

      }

    }

    if (modified) {

      saveDB(db);

    }

    return Object.values(db.pages);

  },







  getPublishedPageBySlug(slug: string): PageRecord['publishedContent'] | null {
    const pages = Object.values(loadDB().pages || {});
    return pages.find(page => page.status !== 'archived' && page.publishedContent?.useOnCanonicalPath !== false && page.publishedContent?.slug === slug)?.publishedContent || null;
  },

  getPublishedPageById(id: string): PageRecord | null {
    const page = this.getPageById(id);
    if (!page || page.status === 'archived') return null;
    if (page.publishedContent) return { ...page, ...page.publishedContent, status: 'published', revisions: [] };
    return page.status === 'published' ? { ...page, revisions: [] } : null;
  },

  getPageById(id: string): PageRecord | null {



    const db = loadDB();



    return (db.pages && db.pages[id]) || null;



  },







  savePage(page: PageRecord, adminId = 'ADMIN', isPublish = false): PageRecord {



    const db = loadDB();



    if (!db.pages) db.pages = {};



    const existing = db.pages[page.id];



    const now = new Date().toISOString();



    const newVersion = (existing ? existing.version : 0) + 1;







    // Snapshot revision



    const revision = {



      id: 'REV-' + Date.now(),



      version: newVersion,



      savedAt: now,



      savedBy: adminId,



      status: isPublish ? ('published' as const) : ('draft' as const),



      sections: JSON.parse(JSON.stringify(page.sections || []))



    };







    const pastRevisions = existing ? (existing.revisions || []).slice(0, 9) : [];



    const updatedPage: PageRecord = {



      ...page,



      version: newVersion,



      status: isPublish ? 'published' : 'draft',
      publishedContent: isPublish ? {
        useOnCanonicalPath: true,
        slug: page.slug, title: page.title, metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        sections: JSON.parse(JSON.stringify(page.sections || [])), publishedAt: now
      } : existing?.publishedContent || (existing?.status === 'published' ? {
        useOnCanonicalPath: false,
        slug: existing.slug, title: existing.title, metaTitle: existing.metaTitle,
        metaDescription: existing.metaDescription, sections: structuredClone(existing.sections || []),
        publishedAt: existing.publishedAt || existing.updatedAt
      } : undefined),



      updatedAt: now,



      publishedAt: isPublish ? now : (existing ? existing.publishedAt : undefined),



      revisions: [revision, ...pastRevisions]



    };







    db.pages[page.id] = updatedPage;



    saveDB(db);







    this.recordAdminAudit({



      adminId,



      action: (isPublish ? 'page_publish' : 'page_save') as any,



      targetId: page.id,



      targetType: 'order' as any,



      changes: { version: { old: existing?.version, new: newVersion } },



      notes: `Page ${page.title} ${isPublish ? 'published' : 'saved as draft'}`



    });



    return updatedPage;



  },







  deletePage(id: string, adminId = 'ADMIN'): { success: boolean; error?: string } {



    const db = loadDB();



    if (!db.pages || !db.pages[id]) return { success: false, error: 'পৃষ্ঠা পাওয়া যায়নি' };



    if (db.pages[id].isSystemPage) {



      return { success: false, error: 'সিস্টেম বা জরুরি মূল পৃষ্ঠা ডিলিট করা নিষিদ্ধ!' };



    }



    const title = db.pages[id].title;



    delete db.pages[id];



    saveDB(db);







    this.recordAdminAudit({



      adminId,



      action: 'page_delete' as any,



      targetId: id,



      targetType: 'order' as any,



      changes: { page: { old: title } },



      notes: `Page deleted: ${title}`



    });



    return { success: true };



  },







  restorePageRevision(pageId: string, revisionId: string, adminId = 'ADMIN'): PageRecord | null {



    const db = loadDB();



    if (!db.pages || !db.pages[pageId]) return null;



    const page = db.pages[pageId];



    const targetRev = (page.revisions || []).find(r => r.id === revisionId);



    if (!targetRev) return null;







    page.sections = JSON.parse(JSON.stringify(targetRev.sections));



    page.version += 1;



    page.updatedAt = new Date().toISOString();



    db.pages[pageId] = page;



    saveDB(db);







    this.recordAdminAudit({



      adminId,



      action: 'page_rollback' as any,



      targetId: pageId,



      targetType: 'order' as any,



      changes: { revisionRestored: { new: `${revisionId} (v${targetRev.version})` } },



      notes: `Restored page ${page.title} to revision v${targetRev.version}`



    });



    return page;



  },







  // Job Sources & Circular Ingestion Pipeline



  getJobSources(): JobSource[] {



    const db = loadDB();



    return Object.values(db.jobSources || {}).map(normalizeJobSource);



  },







  getJobSourceById(id: string): JobSource | null {



    const db = loadDB();



    const source = (db.jobSources || {})[id];



    return source ? normalizeJobSource(source) : null;



  },







  createJobSource(sourceData: Partial<JobSource>, adminId = 'ADMIN'): JobSource {



    if (!sourceData.name || typeof sourceData.name !== 'string' || !sourceData.name.trim()) {



      throw new Error('Source name is required.');



    }



    if (!sourceData.sourceUrl || typeof sourceData.sourceUrl !== 'string' || !/^https?:\/\//i.test(sourceData.sourceUrl.trim())) {



      throw new Error('A valid HTTP or HTTPS sourceUrl is required.');



    }







    const cleanName = sourceData.name.trim();



    const cleanUrl = sourceData.sourceUrl.trim();



    const rawId = sourceData.id && typeof sourceData.id === 'string' && sourceData.id.trim()



      ? sourceData.id.trim()



      : 'src-' + cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);







    const cleanId = rawId || ('src-' + Date.now().toString(36));







    const db = loadDB();



    if (!db.jobSources) db.jobSources = {};







    // Prevent duplicate source ID



    if (db.jobSources[cleanId]) {



      throw new Error(`Job source with ID "${cleanId}" already exists.`);



    }







    // Prevent duplicate source URL



    const existingUrl = Object.values(db.jobSources).find(s => s.sourceUrl.toLowerCase() === cleanUrl.toLowerCase());



    if (existingUrl) {



      throw new Error(`A source with URL "${cleanUrl}" already exists under ID "${existingUrl.id}".`);



    }







    const isEnabled = sourceData.enabled !== undefined ? Boolean(sourceData.enabled) : (sourceData.autoSync !== undefined ? Boolean(sourceData.autoSync) : true);



    const now = new Date().toISOString();







    const newSource: JobSource = {



      id: cleanId,



      name: cleanName,



      sourceUrl: cleanUrl,



      type: sourceData.type || 'official_portal',



      fetchStatus: 'active',



      lastFetchedAt: now,



      autoSync: isEnabled,



      classification: sourceData.classification || 'official',



      enabled: isEnabled,



      collectionMethod: sourceData.collectionMethod || 'html_scrape',



      scanIntervalMinutes: Math.max(15, Number(sourceData.scanIntervalMinutes) || 360),



      lastSuccessfulScanAt: undefined,



      nextScheduledScanAt: undefined,



      healthStatus: isEnabled ? 'healthy' : 'paused',



      lastError: null,



      metrics: {



        discovered: 0,



        collected: 0,



        failed: 0,



        deduplicated: 0



      },



      adminNotes: sourceData.adminNotes ? sourceData.adminNotes.trim() : '',



      createdAt: now,



      updatedAt: now



    };







    db.jobSources[cleanId] = newSource;



    saveDB(db);







    this.recordAdminAudit({



      adminId,



      action: 'source_create',



      targetId: cleanId,



      targetType: 'source',



      changes: {



        name: { new: cleanName },



        sourceUrl: { new: cleanUrl },



        type: { new: newSource.type },



        classification: { new: newSource.classification }



      },



      notes: `Registered new job source: ${cleanName} (${cleanId})`



    });







    return normalizeJobSource(newSource);



  },







  updateJobSource(id: string, updates: Partial<JobSource>, adminId = 'ADMIN'): JobSource {



    const db = loadDB();



    if (!db.jobSources || !db.jobSources[id]) {



      throw new Error(`Job source not found: "${id}"`);



    }







    const current = db.jobSources[id];



    const changes: Record<string, { old: any; new: any }> = {};







    if (updates.name && typeof updates.name === 'string' && updates.name.trim() !== current.name) {



      changes.name = { old: current.name, new: updates.name.trim() };



      current.name = updates.name.trim();



    }







    if (updates.sourceUrl && typeof updates.sourceUrl === 'string' && updates.sourceUrl.trim() !== current.sourceUrl) {



      const cleanUrl = updates.sourceUrl.trim();



      if (!/^https?:\/\//i.test(cleanUrl)) {



        throw new Error('A valid HTTP or HTTPS sourceUrl is required.');



      }



      const duplicateUrl = Object.values(db.jobSources).find(s => s.id !== id && s.sourceUrl.toLowerCase() === cleanUrl.toLowerCase());



      if (duplicateUrl) {



        throw new Error(`Another source with URL "${cleanUrl}" already exists under ID "${duplicateUrl.id}".`);



      }



      changes.sourceUrl = { old: current.sourceUrl, new: cleanUrl };



      current.sourceUrl = cleanUrl;



    }







    if (updates.type && updates.type !== current.type) {



      changes.type = { old: current.type, new: updates.type };



      current.type = updates.type;



    }







    if (updates.classification && updates.classification !== current.classification) {



      changes.classification = { old: current.classification, new: updates.classification };



      current.classification = updates.classification;



    }







    if (updates.collectionMethod && updates.collectionMethod !== current.collectionMethod) {



      changes.collectionMethod = { old: current.collectionMethod, new: updates.collectionMethod };



      current.collectionMethod = updates.collectionMethod;



    }







    if (updates.scanIntervalMinutes !== undefined) {



      const interval = Math.max(15, Number(updates.scanIntervalMinutes) || 360);



      if (interval !== current.scanIntervalMinutes) {



        changes.scanIntervalMinutes = { old: current.scanIntervalMinutes, new: interval };



        current.scanIntervalMinutes = interval;



      }



    }







    if (updates.enabled !== undefined) {



      const isEnabled = Boolean(updates.enabled);



      if (isEnabled !== current.enabled) {



        changes.enabled = { old: current.enabled, new: isEnabled };



        current.enabled = isEnabled;



        current.autoSync = isEnabled;



        current.healthStatus = isEnabled ? (current.healthStatus === 'paused' ? 'healthy' : current.healthStatus) : 'paused';



      }



    } else if (updates.autoSync !== undefined) {



      const isSync = Boolean(updates.autoSync);



      if (isSync !== current.autoSync) {



        changes.autoSync = { old: current.autoSync, new: isSync };



        current.autoSync = isSync;



        current.enabled = isSync;



      }



    }







    if (updates.adminNotes !== undefined && updates.adminNotes !== current.adminNotes) {



      changes.adminNotes = { old: current.adminNotes, new: updates.adminNotes };



      current.adminNotes = updates.adminNotes.trim();



    }







    current.updatedAt = new Date().toISOString();



    saveDB(db);







    if (Object.keys(changes).length > 0) {



      this.recordAdminAudit({



        adminId,



        action: 'source_update',



        targetId: id,



        targetType: 'source',



        changes,



        notes: `Updated settings for job source: ${current.name}`



      });



    }







    return normalizeJobSource(current);



  },







  toggleJobSource(id: string, enabled?: boolean, adminId = 'ADMIN'): JobSource {



    const db = loadDB();



    if (!db.jobSources || !db.jobSources[id]) {



      throw new Error(`Job source not found: "${id}"`);



    }







    const current = db.jobSources[id];



    const previous = current.enabled !== undefined ? current.enabled : (current.autoSync !== undefined ? current.autoSync : true);



    const target = enabled !== undefined ? Boolean(enabled) : !previous;







    current.enabled = target;



    current.autoSync = target;



    current.healthStatus = target ? (current.healthStatus === 'paused' ? 'healthy' : current.healthStatus) : 'paused';



    current.updatedAt = new Date().toISOString();







    saveDB(db);







    this.recordAdminAudit({



      adminId,



      action: 'source_toggle',



      targetId: id,



      targetType: 'source',



      changes: { enabled: { old: previous, new: target } },



      notes: `${target ? 'Enabled' : 'Disabled'} job source: ${current.name}`



    });







    return normalizeJobSource(current);



  },







  updateSourceHealthAndMetrics(id: string, telemetry: {



    healthStatus?: SourceHealthStatus;



    fetchStatus?: 'active' | 'syncing' | 'error';



    lastError?: SourceErrorDetails | null;



    metricsDelta?: Partial<SourceCollectionMetrics>;



    lastSuccessfulScanAt?: string;



    nextScheduledScanAt?: string;



  }): JobSource {



    const db = loadDB();



    if (!db.jobSources || !db.jobSources[id]) {



      throw new Error(`Job source not found: "${id}"`);



    }







    const current = db.jobSources[id];



    if (telemetry.healthStatus) current.healthStatus = telemetry.healthStatus;



    if (telemetry.fetchStatus) current.fetchStatus = telemetry.fetchStatus;



    if (telemetry.lastError !== undefined) current.lastError = telemetry.lastError;



    if (telemetry.lastSuccessfulScanAt) current.lastSuccessfulScanAt = telemetry.lastSuccessfulScanAt;



    if (telemetry.nextScheduledScanAt) current.nextScheduledScanAt = telemetry.nextScheduledScanAt;







    if (!current.metrics) {



      current.metrics = { discovered: 0, collected: 0, failed: 0, deduplicated: 0 };



    }



    if (telemetry.metricsDelta) {



      if (telemetry.metricsDelta.discovered !== undefined) {



        current.metrics.discovered = Math.max(0, current.metrics.discovered + telemetry.metricsDelta.discovered);



      }



      if (telemetry.metricsDelta.collected !== undefined) {



        current.metrics.collected = Math.max(0, current.metrics.collected + telemetry.metricsDelta.collected);



      }



      if (telemetry.metricsDelta.failed !== undefined) {



        current.metrics.failed = Math.max(0, current.metrics.failed + telemetry.metricsDelta.failed);



      }



      if (telemetry.metricsDelta.deduplicated !== undefined) {



        current.metrics.deduplicated = Math.max(0, current.metrics.deduplicated + telemetry.metricsDelta.deduplicated);



      }



    }







    current.lastFetchedAt = telemetry.lastSuccessfulScanAt || new Date().toISOString();



    current.updatedAt = new Date().toISOString();







    saveDB(db);



    return normalizeJobSource(current);



  },







  archiveOrDeleteJobSource(id: string, force = false, adminId = 'ADMIN'): { success: boolean; action: 'archived' | 'deleted'; message: string; source: JobSource } {



    const db = loadDB();



    if (!db.jobSources || !db.jobSources[id]) {



      throw new Error(`Job source not found: "${id}"`);



    }







    const current = db.jobSources[id];







    // Check references to protect data integrity:



    // 1. Core system portals are permanently protected from hard deletion



    const isCoreSystemSource = ['teletalk-alljobs', 'bpsc-portal', 'bb-erecruitment'].includes(id);



    



    // 2. Referenced in circular drafts



    let sourceHost = '';



    try { sourceHost = new URL(current.sourceUrl).hostname.toLowerCase(); } catch {}







    const referencedInDrafts = Object.values(db.circularDrafts || {}).some(



      d => (sourceHost && d.sourceUrl && d.sourceUrl.toLowerCase().includes(sourceHost)) ||



           (d.sourceName && current.name && d.sourceName.includes(current.name))



    );







    // 3. Referenced in canonical published jobs



    const referencedInJobs = Object.values(db.jobs || {}).some(



      j => Boolean(sourceHost && j.officialLink && j.officialLink.toLowerCase().includes(sourceHost))



    );







    const isReferenced = isCoreSystemSource || referencedInDrafts || referencedInJobs;







    if (isReferenced && !force) {



      // Safe Archive / Disable Strategy



      current.enabled = false;



      current.autoSync = false;



      current.healthStatus = 'paused';



      current.adminNotes = (current.adminNotes ? current.adminNotes + ' | ' : '') + 'Archived: source is referenced by published jobs or drafts.';



      current.updatedAt = new Date().toISOString();







      saveDB(db);







      this.recordAdminAudit({



        adminId,



        action: 'source_archive',



        targetId: id,



        targetType: 'source',



        changes: { enabled: { old: true, new: false }, healthStatus: { old: 'healthy', new: 'paused' } },



        notes: `Archived referenced job source: ${current.name} (${id}) to protect data integrity`



      });







      return {



        success: true,



        action: 'archived',



        message: `Source "${current.name}" is referenced by existing jobs or drafts; safely archived and paused rather than deleted.`,



        source: normalizeJobSource(current)



      };



    }







    // Safe deletion of unreferenced custom source



    const deletedSource = { ...current };



    delete db.jobSources[id];



    saveDB(db);







    this.recordAdminAudit({



      adminId,



      action: 'source_delete',



      targetId: id,



      targetType: 'source',



      changes: { deletedSource: { old: deletedSource, new: null } },



      notes: `Deleted unreferenced job source: ${deletedSource.name} (${id})`



    });







    return {



      success: true,



      action: 'deleted',



      message: `Job source "${deletedSource.name}" (${id}) was permanently deleted.`,



      source: normalizeJobSource(deletedSource)



    };



  },







  getCircularDraft(id: string): CircularDraft | null {

    const db = loadDB();

    return (db.circularDrafts || {})[id] || null;

  },



  getCircularDrafts(): CircularDraft[] {



    const db = loadDB();



    return Object.values(db.circularDrafts || {}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());



  },







  

  getVerificationQueue(): any[] {

    const db = loadDB();

    return db.verificationQueue || [];

  },



  saveVerificationQueue(queue: any[]): void {

    const db = loadDB();

    db.verificationQueue = queue;

    saveDB(db);

  },



  enqueueVerificationItem(item: any): void {

    const db = loadDB();

    if (!db.verificationQueue) db.verificationQueue = [];

    // Deduplicate if draftId already queued

    const existingIdx = db.verificationQueue.findIndex((q: any) => q.draftId === item.draftId && q.status === 'QUEUED');

    if (existingIdx >= 0) {

      db.verificationQueue[existingIdx] = { ...db.verificationQueue[existingIdx], ...item };

    } else {

      db.verificationQueue.unshift(item);

    }

    saveDB(db);

  },



  updateVerificationQueueItem(id: string, updates: any): void {

    const db = loadDB();

    if (!db.verificationQueue) return;

    const item = db.verificationQueue.find((q: any) => q.id === id);

    if (item) {

      Object.assign(item, updates);

      saveDB(db);

    }

  },



  

  addAdminNotification(title: string, message: string): void {

    const db = loadDB();

    if (!db.notifications) db.notifications = {};

    if (!db.notifications['admin']) db.notifications['admin'] = [];

    db.notifications['admin'].unshift({

      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,

      title,

      message,

      date: new Date().toISOString(),

      read: false,

      type: 'system'

    });

    if (db.notifications['admin'].length > 50) db.notifications['admin'] = db.notifications['admin'].slice(0, 50);

    saveDB(db);

  },



  saveCircularDraft(draft: CircularDraft): CircularDraft {

    return this.addCircularDraft(draft);

  },



  addCircularDraft(draft: CircularDraft): CircularDraft {



    const db = loadDB();



    if (!db.circularDrafts) db.circularDrafts = {};



    db.circularDrafts[draft.id] = draft;



    saveDB(db);



    return draft;



  },







  getSpiderRuns(limit = 50): SpiderRun[] {

    const db = loadDB();

    const runs = Object.values(db.spiderRuns || {});

    return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, limit);

  },



  getSpiderRunById(runId: string): SpiderRun | null {

    const db = loadDB();

    return (db.spiderRuns || {})[runId] || null;

  },



  recordSpiderRun(run: SpiderRun): SpiderRun {

    const db = loadDB();

    if (!db.spiderRuns) db.spiderRuns = {};

    db.spiderRuns[run.id] = run;

    const all = Object.values(db.spiderRuns);

    if (all.length > 100) {

      all.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

      const toDelete = all.slice(0, all.length - 100);

      for (const d of toDelete) {

        delete db.spiderRuns[d.id];

      }

    }

    saveDB(db);

    return run;

  },



  saveVerificationResult(result: VerificationResult): void {

    const db = loadDB();

    if (!db.verificationResults) db.verificationResults = {};

    db.verificationResults[result.draftId] = result;

    saveDB(db);

  },



  getVerificationResult(draftId: string): VerificationResult | null {

    const db = loadDB();

    return (db.verificationResults || {})[draftId] || null;

  },



  saveContentStudioState(state: import('./content_studio/types').ContentStudioState): void {

    const db = loadDB();

    if (!db.contentStudioArticles) db.contentStudioArticles = {};

    db.contentStudioArticles[state.draftId] = state;

    if (db.circularDrafts && db.circularDrafts[state.draftId]) {

      db.circularDrafts[state.draftId].contentStudioState = state;

      if (state.article) {

        db.circularDrafts[state.draftId].aiGeneratedContent = {

          bengaliDescription: state.article.bengaliMarkdown,

          seoTitle: state.seo.seoTitle,

          seoDescription: state.seo.seoDescription,

          targetKeywords: [state.seo.focusKeyword, ...(state.seo.secondaryKeywords || [])],

          faqItems: state.article.faqItems,

          generatedAt: state.article.generatedAt

        };

      }

    }

    saveDB(db);

  },



  getContentStudioState(draftId: string): import('./content_studio/types').ContentStudioState | null {

    const db = loadDB();

    if (db.contentStudioArticles && db.contentStudioArticles[draftId]) {

      return db.contentStudioArticles[draftId];

    }

    if (db.circularDrafts && db.circularDrafts[draftId]?.contentStudioState) {

      return db.circularDrafts[draftId].contentStudioState!;

    }

    return null;

  },



  getPublishingQueue(): Record<string, import('./publishing/types').PublishingQueueItem> {

    const db = loadDB();

    return db.publishingQueue || {};

  },



  savePublishingQueueItem(item: import('./publishing/types').PublishingQueueItem): import('./publishing/types').PublishingQueueItem {

    const db = loadDB();

    if (!db.publishingQueue) db.publishingQueue = {};

    db.publishingQueue[item.id] = item;

    saveDB(db);

    return item;

  },



  deletePublishingQueueItem(queueId: string): boolean {

    const db = loadDB();

    if (db.publishingQueue && db.publishingQueue[queueId]) {

      delete db.publishingQueue[queueId];

      saveDB(db);

      return true;

    }

    return false;

  },



  getPublicationSnapshots(): Record<string, import('./publishing/types').PublicationSnapshot> {

    const db = loadDB();

    return db.publicationSnapshots || {};

  },



  savePublicationSnapshot(snapshot: import('./publishing/types').PublicationSnapshot): import('./publishing/types').PublicationSnapshot {

    const db = loadDB();

    if (!db.publicationSnapshots) db.publicationSnapshots = {};

    db.publicationSnapshots[snapshot.id] = snapshot;

    saveDB(db);

    return snapshot;

  },



  getPublicationSnapshotById(id: string): import('./publishing/types').PublicationSnapshot | null {

    const db = loadDB();

    return (db.publicationSnapshots || {})[id] || null;

  },



  getPublicationAuditLogs(): import('./publishing/types').PublicationAuditLog[] {

    const db = loadDB();

    return db.publicationAuditLogs || [];

  },



  addPublicationAuditLog(log: import('./publishing/types').PublicationAuditLog): void {

    const db = loadDB();

    if (!db.publicationAuditLogs) db.publicationAuditLogs = [];

    db.publicationAuditLogs.unshift(log);

    if (db.publicationAuditLogs.length > 500) {

      db.publicationAuditLogs = db.publicationAuditLogs.slice(0, 500);

    }

    saveDB(db);

  },



  getRedirects(): Record<string, import('./publishing/types').RedirectRecord> {

    const db = loadDB();

    return db.redirects || {};

  },



  saveRedirect(redirect: import('./publishing/types').RedirectRecord): import('./publishing/types').RedirectRecord {

    const db = loadDB();

    if (!db.redirects) db.redirects = {};

    db.redirects[redirect.sourcePath.toLowerCase().trim()] = redirect;

    saveDB(db);

    return redirect;

  },



  findRedirectByPath(path: string): import('./publishing/types').RedirectRecord | null {

    const db = loadDB();

    const redirects = db.redirects || {};

    return redirects[path.toLowerCase().trim()] || null;

  },



  getReviewComments(jobId: string): import('./publishing/types').ReviewComment[] {

    const db = loadDB();

    const all = db.reviewComments || {};

    return all[jobId] || [];

  },



  addReviewComment(comment: import('./publishing/types').ReviewComment): import('./publishing/types').ReviewComment {

    const db = loadDB();

    if (!db.reviewComments) db.reviewComments = {};

    if (!db.reviewComments[comment.jobId]) db.reviewComments[comment.jobId] = [];

    db.reviewComments[comment.jobId].unshift(comment);

    saveDB(db);

    return comment;

  },



  getAllContentStudioStates(): import('./content_studio/types').ContentStudioState[] {

    const db = loadDB();

    return Object.values(db.contentStudioArticles || {});

  },



  getAllJobs(): JobCircular[] {

    const db = loadDB();

    return Object.values(db.jobs || {});

  },



  getAllVerificationResults(): VerificationResult[] {

    const db = loadDB();

    return Object.values(db.verificationResults || {});

  },



  recordAiUsageLog(log: AIUsageLog): void {

    const db = loadDB();

    if (!db.aiUsageLogs) db.aiUsageLogs = {};

    db.aiUsageLogs[log.id] = log;



    // Retention cap: keep most recent 500 logs

    const all = Object.values(db.aiUsageLogs) as AIUsageLog[];

    if (all.length > 500) {

      all.sort((a, b) => new Date(b.requestTimestamp).getTime() - new Date(a.requestTimestamp).getTime());

      const keep = all.slice(0, 500);

      const newMap: Record<string, AIUsageLog> = {};

      for (const k of keep) newMap[k.id] = k;

      db.aiUsageLogs = newMap;

    }



    saveDB(db);

  },



  getAiUsageLogs(limit = 50): AIUsageLog[] {

    const db = loadDB();

    const all = Object.values(db.aiUsageLogs || {}) as AIUsageLog[];

    all.sort((a, b) => new Date(b.requestTimestamp).getTime() - new Date(a.requestTimestamp).getTime());

    return all.slice(0, limit);

  },



  getAiUsageSummary(): {

    totalRequests: number;

    successCount: number;

    failedCount: number;

    totalTokens: number;

    estimatedCostBdt: number;

  } {

    const db = loadDB();

    const all = Object.values(db.aiUsageLogs || {}) as AIUsageLog[];

    let totalTokens = 0;

    let estimatedCostBdt = 0;

    let successCount = 0;

    let failedCount = 0;



    for (const log of all) {

      totalTokens += log.totalTokens || 0;

      estimatedCostBdt += log.estimatedCostBdt || 0;

      if (log.status === 'success') successCount++;

      else failedCount++;

    }



    return {

      totalRequests: all.length,

      successCount,

      failedCount,

      totalTokens,

      estimatedCostBdt: Number(estimatedCostBdt.toFixed(2))

    };

  },





  deleteCircularDraft(draftId: string): boolean {



    const db = loadDB();



    if (db.circularDrafts && db.circularDrafts[draftId]) {



      delete db.circularDrafts[draftId];



      saveDB(db);



      return true;



    }



    return false;



  },







  approveCircularDraft(draftId: string, adminId = 'ADMIN', overrides?: Partial<JobCircular>): JobCircular | null {



    const db = loadDB();



    const draft = (db.circularDrafts || {})[draftId];



    if (!draft) return null;







    if (!db.jobs) db.jobs = {};



    // Idempotency: Return existing job if draft already approved or already matches



    const existing = Object.values(db.jobs).find(j => 



      (draft.approvedJobId && j.id === draft.approvedJobId) ||



      (j.officialLink && j.officialLink === draft.sourceUrl && j.title === draft.extractedTitle)



    );



    if (existing) {



      draft.status = 'approved';



      draft.approvedJobId = existing.id;



      saveDB(db);



      return existing;



    }







    draft.status = 'approved';



    const newJobId = 'job-' + Date.now().toString().slice(-6);



    draft.approvedJobId = newJobId;



    const cleanSlug = (draft.extractedTitle || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '-' + newJobId.slice(-4);

    const baseJob: JobCircular = {

      id: newJobId,

      title: draft.extractedTitle,

      organization: draft.extractedOrg,

      logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',

      category: draft.category || 'govt',

      categoryLabel: draft.category === 'bank' ? 'ব্যাংক জব' : 'সরকারি চাকরি',

      grade: draft.grade || '৯ম গ্রেড',

      totalPosts: draft.vacancies || 1,

      salary: draft.salary || '২২,০০০ - ৫৩,০৬০ টাকা',

      minEducation: draft.minEducation || 'স্নাতক বা সমমান',

      minAge: 18,

      maxAge: 32,

      districts: 'সকল জেলা',

      deadline: draft.deadline || '৩০ নভেম্বর ২০২৬',

      daysRemaining: 20,

      govtFee: draft.govtFee || 200,

      serviceFee: 80,

      officialLink: draft.sourceUrl || 'https://alljobs.teletalk.com.bd',

      circularImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',

      circularPdfUrl: (draft as any).pdfUrl || draft.evidenceUrl || (draft.sourceUrl?.endsWith('.pdf') ? draft.sourceUrl : ''),

      audioSummary: draft.extractedTitle + ' প্রকাশিত হয়েছে।',

      publishedDate: new Date().toLocaleDateString('bn-BD'),

      requirements: [draft.minEducation || 'স্নাতক বা সমমান', 'বয়স: ১৮-৩২ বছর'],

      ageCutOffDate: (draft as any).ageCutOffDate || '2026-11-01',

      allowThirdDivision: (draft as any).allowThirdDivision ?? true,

      seoTitle: draft.aiGeneratedContent?.seoTitle || `${draft.extractedTitle} - ${draft.extractedOrg} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`,

      seoDescription: draft.aiGeneratedContent?.seoDescription || `${draft.extractedOrg}-এ ${draft.extractedTitle} পদে নতুন নিয়োগ বিজ্ঞপ্তি প্রকাশ হয়েছে। পদসংখ্যা: ${draft.vacancies || 1}টি, আবেদনের শেষ সময়: ${draft.deadline}à¥¤ বিস্তারিত দেখে আবেদন করুন।`,

      seoKeywords: draft.aiGeneratedContent?.targetKeywords || [draft.extractedTitle, draft.extractedOrg, 'নিয়োগ বিজ্ঞপ্তি ২০২৬', 'সরকারি চাকরি'],

      bengaliDescription: draft.aiGeneratedContent?.bengaliDescription,

      faqItems: draft.aiGeneratedContent?.faqItems,

      aiGeneratedAt: draft.aiGeneratedContent?.generatedAt,

      slug: cleanSlug

    };

    const newJob: JobCircular = overrides ? { ...baseJob, ...overrides, id: newJobId } : baseJob;



    if (!db.jobs) db.jobs = {};



    db.jobs[newJobId] = newJob;



    saveDB(db);



    const pdfSource = (draft as any).pdfUrl || draft.evidenceUrl || (draft.sourceUrl && draft.sourceUrl.endsWith('.pdf') ? draft.sourceUrl : null);

    if (pdfSource) {

      try {

        const { triggerAutoPdfConversion } = require('./pdfAutoConverter');

        triggerAutoPdfConversion(newJobId, pdfSource);

      } catch (e) {}

    }







    this.recordAdminAudit({



      adminId,



      action: 'source_approval' as any,



      targetId: draftId,



      targetType: 'order' as any,



      changes: { draftId: { new: draftId }, createdJobId: { new: newJobId } },



      notes: `Approved draft into live job: ${newJob.title}`



    });



    return newJob;



  },







  rejectCircularDraft(draftId: string, adminId = 'ADMIN'): boolean {



    const db = loadDB();



    const draft = (db.circularDrafts || {})[draftId];



    if (!draft) return false;



    draft.status = 'rejected';



    saveDB(db);







    this.recordAdminAudit({



      adminId,



      action: 'source_rejection' as any,



      targetId: draftId,



      targetType: 'order' as any,



      changes: { draftId: { new: draftId }, status: { new: 'rejected' } },



      notes: `Rejected draft circular: ${draft.extractedTitle}`



    });



    return true;



  },







  // Private Company / Employer ATS



  getCompanies(): CompanyProfile[] {



    const db = loadDB();



    return Object.values(db.companies || {});



  },







  getCompanyApplications(companyId: string): CompanyApplication[] {



    const db = loadDB();



    return (db.companyApplications && db.companyApplications[companyId]) || [];



  },







  updateCompanyApplicationStatus(companyId: string, appId: string, status: CompanyApplication['status'], notes?: string): boolean {



    const db = loadDB();



    if (!db.companyApplications || !db.companyApplications[companyId]) return false;



    const list = db.companyApplications[companyId];



    const app = list.find(a => a.id === appId);



    if (!app) return false;



    app.status = status;



    if (notes) app.notes = notes;



    saveDB(db);



    return true;



  },



  updateCompanyVerification(companyId: string, verified: boolean): boolean {

    const db = loadDB();

    if (!db.companies || !db.companies[companyId]) return false;

    const previous = db.companies[companyId].verified;

    db.companies[companyId].verified = verified;

    saveDB(db);

    try {

      this.recordAdminAudit({

        action: 'UPDATE_COMPANY_VERIFICATION',

        adminId: 'ADMIN-SUPER',

        targetType: 'COMPANY',

        targetId: companyId,

        notes: 'Company verification changed from ' + previous + ' to ' + verified,

        changes: { verification: { old: previous, new: verified } }

      });

    } catch {

      // non-fatal audit log

    }

    return true;

  },









  addAuditLog(audit: Omit<AdminAuditLog, 'id' | 'timestamp'>): AdminAuditLog {

    return this.recordAdminAudit(audit);

  },



  getCandidates(): CandidateRecord[] {

    return this.getAllCandidates();

  },



  getDraftById(id: string): CircularDraft | null {

    return this.getCircularDraft(id);

  },



  saveDraft(draft: CircularDraft): CircularDraft {

    return this.saveCircularDraft(draft);

  },



  deleteDraft(id: string): boolean {

    const db = loadDB();

    if (db.circularDrafts && db.circularDrafts[id]) {

      delete db.circularDrafts[id];

      saveDB(db);

      return true;

    }

    return false;

  },



  getApplicationById(id: string): ApplicationRequest | null {

    const all = this.getAllApplications();

    return all.find(a => a.id === id) || null;

  },



  saveApplication(app: ApplicationRequest): ApplicationRequest {

    const db = loadDB();

    const candKey = app.candidateId || 'guest';

    if (!db.applications[candKey]) {

      db.applications[candKey] = [];

    }

    const idx = db.applications[candKey].findIndex((a: ApplicationRequest) => a.id === app.id);

    if (idx >= 0) {

      db.applications[candKey][idx] = app;

    } else {

      db.applications[candKey].unshift(app);

    }

    saveDB(db);

    return app;

  },



  deleteApplication(id: string): boolean {

    const db = loadDB();

    for (const [candId, list] of Object.entries(db.applications)) {

      if (Array.isArray(list)) {

        const initialLen = list.length;

        db.applications[candId] = list.filter(a => a.id !== id);

        if (db.applications[candId].length < initialLen) {

          saveDB(db);

          return true;

        }

      }

    }

    return false;

  },



  recordAdminAudit(audit: Omit<AdminAuditLog, 'id' | 'timestamp'>): AdminAuditLog {



    const db = loadDB();



    const log: AdminAuditLog = {



      ...audit,



      id: 'AUDIT-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase(),



      timestamp: new Date().toISOString()



    };



    db.adminAuditLogs = [log, ...(db.adminAuditLogs || [])];



    saveDB(db);



    return log;



  },



  getAdminAuditLogs(targetId?: string): AdminAuditLog[] {



    const db = loadDB();



    const logs = db.adminAuditLogs || [];



    if (targetId) return logs.filter(l => l.targetId === targetId);



    return logs;



  },



  // --- STEP 06: TAXONOMY & CATEGORY METHODS ---

  getCategories(): import('./taxonomy/types').CategoryRecord[] {

    const db = loadDB();

    if (!db.categories || Object.keys(db.categories).length === 0) {

      const { DEFAULT_TAXONOMY_CATEGORIES } = require('./taxonomy/defaults');

      const seeded: Record<string, any> = {};

      for (const cat of DEFAULT_TAXONOMY_CATEGORIES) {

        seeded[cat.id] = cat;

      }

      db.categories = seeded;

      saveDB(db);

      return DEFAULT_TAXONOMY_CATEGORIES;

    }

    return Object.values(db.categories).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  },



  getCategoryById(id: string): import('./taxonomy/types').CategoryRecord | null {

    const cats = this.getCategories();

    return cats.find(c => c.id === id) || null;

  },



  getCategoryBySlug(slug: string): import('./taxonomy/types').CategoryRecord | null {
    if (!slug) return null;
    const cats = this.getCategories();
    const clean = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');

    // 1. Direct exact slug match
    const exact = cats.find(c => c.slug.toLowerCase() === clean);
    if (exact) return exact;

    // 2. Comprehensive Alias Dictionary for short codes & common terms
    const ALIAS_MAP: Record<string, string> = {
      'govt': 'government-jobs',
      'government': 'government-jobs',
      'govt-jobs': 'government-jobs',
      'sorkari': 'government-jobs',
      'bank': 'bank-jobs',
      'banks': 'bank-jobs',
      'bank-job': 'bank-jobs',
      'bcs': 'bcs',
      'bpsc': 'bcs',
      'defense': 'defense-jobs',
      'defence': 'defense-jobs',
      'army': 'defense-jobs',
      'railway': 'railway-jobs',
      'railways': 'railway-jobs',
      'rail': 'railway-jobs',
      'ngo': 'ngo-jobs',
      'ngos': 'ngo-jobs',
      'it': 'it-jobs',
      'software': 'it-jobs',
      'tech': 'it-jobs',
      'engineering': 'engineering-jobs',
      'engineer': 'engineering-jobs',
      'medical': 'medical-jobs',
      'health': 'medical-jobs',
      'doctor': 'medical-jobs',
      'teacher': 'teacher-jobs',
      'teachers': 'teacher-jobs',
      'shikkhok': 'teacher-jobs',
      'education': 'teacher-jobs',
      'primary': 'primary-teacher-jobs',
      'private': 'private-jobs',
      'company': 'private-jobs',
      'marketing': 'marketing-jobs',
      'accounting': 'accounting-finance-jobs',
      'finance': 'accounting-finance-jobs',
      'fresher': 'fresher-jobs',
      'internship': 'internships',
      'internships': 'internships',
      'part-time': 'part-time-jobs',
      'parttime': 'part-time-jobs',
      'tutoring': 'tutoring-jobs',
      'ministry': 'ministry-jobs',
      'directorate': 'directorate-jobs',
      'autonomous': 'autonomous-jobs',
      'agriculture': 'agriculture-jobs',
      'telecom': 'telecom-jobs',
      'textile': 'textile-garments-jobs'
    };

    const targetSlug = ALIAS_MAP[clean] || (clean.endsWith('-jobs') ? clean : `${clean}-jobs`);
    const aliasMatch = cats.find(c => c.slug.toLowerCase() === targetSlug);
    if (aliasMatch) return aliasMatch;

    // 3. Substring & Bengali transliteration match
    return cats.find(c =>
      c.slug.toLowerCase().includes(clean) ||
      (c.name_bn && c.name_bn.includes(clean)) ||
      (c.name_en && c.name_en.toLowerCase().includes(clean))
    ) || null;
  },



  saveCategory(cat: import('./taxonomy/types').CategoryRecord): import('./taxonomy/types').CategoryRecord {

    const db = loadDB();

    if (!db.categories) db.categories = {};

    const existing = db.categories[cat.id] || {};

    const updated: import('./taxonomy/types').CategoryRecord = {

      ...existing,

      ...cat,

      updated_at: new Date().toISOString()

    };

    db.categories[cat.id] = updated;

    saveDB(db);

    return updated;

  },



  deleteCategory(id: string, reassignmentCategoryId?: string): boolean {

    const db = loadDB();

    if (!db.categories || !db.categories[id]) return false;



    if (reassignmentCategoryId && db.jobs) {

      this.reassignJobsCategory(id, reassignmentCategoryId);

    }



    delete db.categories[id];

    saveDB(db);

    return true;

  },



  reassignJobsCategory(sourceCatId: string, targetCatId: string): number {

    const db = loadDB();

    if (!db.jobs) return 0;

    const targetCat = (db.categories && db.categories[targetCatId]) ? db.categories[targetCatId] : null;

    let count = 0;



    for (const [jobId, job] of Object.entries(db.jobs)) {

      const curCat = (job.category || '').toLowerCase();

      if (curCat === sourceCatId.toLowerCase() || ('cat-' + curCat) === sourceCatId.toLowerCase()) {

        const newCatKey = targetCat?.id.replace('cat-', '') || targetCatId;

        (job as any).category = newCatKey;

        if (targetCat) {

          job.categoryLabel = targetCat.name_bn;

        }

        count++;

      }

    }



    if (count > 0) {

      saveDB(db);

    }

    return count;

  },



  // --- STEP 06: SEARCH ANALYTICS METHODS ---

  getSearchAnalytics(): import('./search/types').SearchEventRecord[] {

    const db = loadDB();

    return db.searchAnalytics || [];

  },



  logSearchEvent(event: Omit<import('./search/types').SearchEventRecord, 'id' | 'timestamp'>): import('./search/types').SearchEventRecord {

    const db = loadDB();

    if (!db.searchAnalytics) db.searchAnalytics = [];

    const record: import('./search/types').SearchEventRecord = {

      ...event,

      id: 'SEV-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),

      timestamp: new Date().toISOString()

    };

    db.searchAnalytics.unshift(record);

    if (db.searchAnalytics.length > 5000) {

      db.searchAnalytics = db.searchAnalytics.slice(0, 5000);

    }

    saveDB(db);

    return record;

  },



  // --- STEP 07: JOB FEEDS & FEATURED JOBS METHODS ---

  getFeaturedPlacements(): import('./feeds/types').FeaturedPlacement[] {

    const db = loadDB();

    if (!db.featuredPlacements) return [];

    return Object.values(db.featuredPlacements);

  },



  getFeaturedPlacementById(id: string): import('./feeds/types').FeaturedPlacement | null {

    const db = loadDB();

    if (!db.featuredPlacements) return null;

    return db.featuredPlacements[id] || null;

  },



  saveFeaturedPlacement(placement: import('./feeds/types').FeaturedPlacement): import('./feeds/types').FeaturedPlacement {

    const db = loadDB();

    if (!db.featuredPlacements) db.featuredPlacements = {};

    const updated = {

      ...placement,

      updatedAt: new Date().toISOString()

    };

    db.featuredPlacements[placement.id] = updated;



    // Synchronize legacy job.featured boolean flag

    if (db.jobs && db.jobs[placement.jobId]) {

      if (placement.status === 'ACTIVE') {

        db.jobs[placement.jobId].featured = true;

      } else if (placement.status === 'CANCELLED' || placement.status === 'EXPIRED') {

        db.jobs[placement.jobId].featured = false;

      }

    }



    saveDB(db);

    return updated;

  },



  deleteFeaturedPlacement(id: string): boolean {

    const db = loadDB();

    if (!db.featuredPlacements || !db.featuredPlacements[id]) return false;

    const p = db.featuredPlacements[id];

    delete db.featuredPlacements[id];

    if (db.jobs && db.jobs[p.jobId]) {

      db.jobs[p.jobId].featured = false;

    }

    saveDB(db);

    return true;

  },



  getFeedConfig(): import('./feeds/types').GlobalFeedConfig {

    const db = loadDB();

    if (!db.feedConfig) {

      const { DEFAULT_FEED_CONFIG } = require('./feeds/config');

      return DEFAULT_FEED_CONFIG;

    }

    return db.feedConfig;

  },



  saveFeedConfig(config: Partial<import('./feeds/types').GlobalFeedConfig>): import('./feeds/types').GlobalFeedConfig {

    const db = loadDB();

    const { DEFAULT_FEED_CONFIG } = require('./feeds/config');

    const existing = db.feedConfig || DEFAULT_FEED_CONFIG;

    const merged: import('./feeds/types').GlobalFeedConfig = {

      ...existing,

      ...config,

      sections: {

        ...existing.sections,

        ...(config.sections || {})

      },

      updatedAt: new Date().toISOString()

    };

    db.feedConfig = merged;

    saveDB(db);

    return merged;

  },



  // ==============================================================

  // STEP 08: DEADLINE & SMART ALERT SYSTEM METHODS

  // ==============================================================



  getDeadlineData(jobId: string): import('./deadlines/types').DeadlineData | null {

    const db = loadDB();

    return (db.deadlineData && db.deadlineData[jobId]) || null;

  },



  saveDeadlineData(data: import('./deadlines/types').DeadlineData): import('./deadlines/types').DeadlineData {

    const db = loadDB();

    if (!db.deadlineData) db.deadlineData = {};

    db.deadlineData[data.jobId] = data;

    saveDB(db);

    return data;

  },



  getDeadlineRevisions(jobId: string): import('./deadlines/types').DeadlineRevision[] {

    const db = loadDB();

    return (db.deadlineRevisions && db.deadlineRevisions[jobId]) || [];

  },



  addDeadlineRevision(revision: import('./deadlines/types').DeadlineRevision): void {

    const db = loadDB();

    if (!db.deadlineRevisions) db.deadlineRevisions = {};

    if (!db.deadlineRevisions[revision.jobId]) db.deadlineRevisions[revision.jobId] = [];

    db.deadlineRevisions[revision.jobId].unshift(revision);

    saveDB(db);

  },



  getCircularChangeProposals(status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'): import('./deadlines/types').CircularChangeProposal[] {

    const db = loadDB();

    const list = Object.values(db.circularChangeProposals || {});

    if (status) {

      return list.filter(p => p.status === status).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  },



  getCircularChangeProposal(id: string): import('./deadlines/types').CircularChangeProposal | null {

    const db = loadDB();

    return (db.circularChangeProposals && db.circularChangeProposals[id]) || null;

  },



  saveCircularChangeProposal(proposal: import('./deadlines/types').CircularChangeProposal): import('./deadlines/types').CircularChangeProposal {

    const db = loadDB();

    if (!db.circularChangeProposals) db.circularChangeProposals = {};

    db.circularChangeProposals[proposal.id] = proposal;

    saveDB(db);

    return proposal;

  },



  updateProposalStatus(id: string, status: 'APPROVED' | 'REJECTED', adminId: string, notes?: string): boolean {

    const db = loadDB();

    if (!db.circularChangeProposals || !db.circularChangeProposals[id]) return false;

    const proposal = db.circularChangeProposals[id];

    proposal.status = status;

    proposal.reviewedBy = adminId;

    proposal.reviewedAt = new Date().toISOString();

    if (notes) proposal.reviewNotes = notes;

    saveDB(db);

    return true;

  },



  getUserJobReminders(candidateId: string): import('./deadlines/types').UserJobReminder[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.getUserJobReminders(candidateId);
    }
    const db = loadDB();

    return (db.userJobReminders && db.userJobReminders[candidateId]) || [];

  },



  saveUserJobReminder(reminder: import('./deadlines/types').UserJobReminder): import('./deadlines/types').UserJobReminder {
    if (reminder.candidateId && reminder.candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.saveUserJobReminder(reminder);
    }
    const db = loadDB();

    if (!db.userJobReminders) db.userJobReminders = {};

    if (!db.userJobReminders[reminder.candidateId]) db.userJobReminders[reminder.candidateId] = [];

    const list = db.userJobReminders[reminder.candidateId];

    const idx = list.findIndex(r => r.jobId === reminder.jobId);

    if (idx >= 0) {

      list[idx] = { ...list[idx], ...reminder, updatedAt: new Date().toISOString() };

    } else {

      list.push(reminder);

    }

    saveDB(db);

    return reminder;

  },



  deleteUserJobReminder(candidateId: string, jobId: string): boolean {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.deleteUserJobReminder(candidateId, jobId);
    }
    const db = loadDB();

    if (!db.userJobReminders || !db.userJobReminders[candidateId]) return false;

    const initialLen = db.userJobReminders[candidateId].length;

    db.userJobReminders[candidateId] = db.userJobReminders[candidateId].filter(r => r.jobId !== jobId);

    if (db.userJobReminders[candidateId].length < initialLen) {

      saveDB(db);

      return true;

    }

    return false;

  },



  getAllUserJobReminders(): import('./deadlines/types').UserJobReminder[] {

    const db = loadDB();

    const all: import('./deadlines/types').UserJobReminder[] = [];

    for (const list of Object.values(db.userJobReminders || {})) {
      if (Array.isArray(list)) all.push(...list);
    }
    const synthReminders = SyntheticUserManager.getAllUserJobReminders();
    return [...all, ...synthReminders];

  },



  getNotificationDeliveries(candidateId?: string): import('./deadlines/types').NotificationDeliveryItem[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.getNotificationDeliveries(candidateId);
    }
    const db = loadDB();
    const list = db.notificationDeliveries || [];
    const synthList = SyntheticUserManager.getNotificationDeliveries();
    const combined = candidateId ? list.filter(n => n.candidateId === candidateId) : [...list, ...synthList];
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  enqueueNotificationDelivery(item: import('./deadlines/types').NotificationDeliveryItem): import('./deadlines/types').NotificationDeliveryItem {
    if (item.candidateId && item.candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.enqueueNotificationDelivery(item);
    }
    const db = loadDB();

    if (!db.notificationDeliveries) db.notificationDeliveries = [];

    // Deduplication check

    const existing = db.notificationDeliveries.find(n => n.dedupeKey === item.dedupeKey);

    if (existing) {

      return existing;

    }

    db.notificationDeliveries.unshift(item);

    if (db.notificationDeliveries.length > 500) {

      db.notificationDeliveries = db.notificationDeliveries.slice(0, 500);

    }

    saveDB(db);

    return item;

  },



  updateNotificationDelivery(id: string, updates: Partial<import('./deadlines/types').NotificationDeliveryItem>): boolean {
    if (SyntheticUserManager.updateNotificationDelivery(id, updates)) {
      return true;
    }
    const db = loadDB();

    if (!db.notificationDeliveries) return false;

    const item = db.notificationDeliveries.find(n => n.id === id);

    if (!item) return false;

    Object.assign(item, updates);

    saveDB(db);

    return true;

  },



  getMonitoringRuns(limit = 30): import('./deadlines/types').MonitoringRunRecord[] {

    const db = loadDB();

    return (db.monitoringRuns || []).slice(0, limit);

  },



  saveMonitoringRun(run: import('./deadlines/types').MonitoringRunRecord): import('./deadlines/types').MonitoringRunRecord {

    const db = loadDB();

    if (!db.monitoringRuns) db.monitoringRuns = [];

    const idx = db.monitoringRuns.findIndex(r => r.id === run.id);

    if (idx >= 0) {

      db.monitoringRuns[idx] = run;

    } else {

      db.monitoringRuns.unshift(run);

      if (db.monitoringRuns.length > 100) {

        db.monitoringRuns = db.monitoringRuns.slice(0, 100);

      }

    }

    saveDB(db);

    return run;

  },



  getDeadlineAlertRules(): import('./deadlines/types').DeadlineAlertRule[] {

    const db = loadDB();

    return db.deadlineAlertRules || [];

  },



  saveDeadlineAlertRules(rules: import('./deadlines/types').DeadlineAlertRule[]): void {

    const db = loadDB();

    db.deadlineAlertRules = rules;

    saveDB(db);

  },



  getCandidateNotifications(candidateId: string): NotificationItem[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.getCandidateNotifications(candidateId);
    }

    const db = loadDB();

    return (db.notifications && db.notifications[candidateId]) || [];

  },



  markCandidateNotificationRead(candidateId: string, notificationId: string): boolean {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.markCandidateNotificationRead(candidateId, notificationId);
    }
    const db = loadDB();

    if (!db.notifications || !db.notifications[candidateId]) return false;

    const item = db.notifications[candidateId].find(n => n.id === notificationId);

    if (item) {

      item.read = true;

      saveDB(db);

      return true;

    }

    return false;

  },



  markAllCandidateNotificationsRead(candidateId: string): boolean {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.markAllCandidateNotificationsRead(candidateId);
    }
    const db = loadDB();

    if (!db.notifications || !db.notifications[candidateId]) return false;

    db.notifications[candidateId].forEach(n => { n.read = true; });

    saveDB(db);

    return true;

  },



  deleteCandidateNotification(candidateId: string, notificationId: string): boolean {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.deleteCandidateNotification(candidateId, notificationId);
    }
    const db = loadDB();

    if (!db.notifications || !db.notifications[candidateId]) return false;

    const initialLen = db.notifications[candidateId].length;

    db.notifications[candidateId] = db.notifications[candidateId].filter(n => n.id !== notificationId);

    if (db.notifications[candidateId].length < initialLen) {

      saveDB(db);

      return true;

    }

    return false;

  },



  addCandidateNotification(candidateId: string, notif: Omit<NotificationItem, 'id' | 'date' | 'read'>): NotificationItem {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.addCandidateNotification(candidateId, notif);
    }

    const db = loadDB();

    if (!db.notifications) db.notifications = {};

    if (!db.notifications[candidateId]) db.notifications[candidateId] = [];

    const item: NotificationItem = {

      ...notif,

      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),

      date: new Date().toISOString(),

      read: false

    };

    db.notifications[candidateId].unshift(item);

    if (db.notifications[candidateId].length > 100) {

      db.notifications[candidateId] = db.notifications[candidateId].slice(0, 100);

    }

    saveDB(db);

    return item;

  },

  // =========================================================================

  // STEP 09: SMART JOB MATCHING & RECOMMENDATION METHODS

  // =========================================================================



  getRecommendationFeedback(candidateId?: string): import('./matching/types').RecommendationFeedbackItem[] {

    const db = loadDB();

    if (!db.recommendationFeedback) return [];

    if (candidateId) {

      return db.recommendationFeedback[candidateId] || [];

    }

    const all: import('./matching/types').RecommendationFeedbackItem[] = [];

    for (const list of Object.values(db.recommendationFeedback)) {

      if (Array.isArray(list)) all.push(...list);

    }

    return all;

  },



  saveRecommendationFeedback(item: import('./matching/types').RecommendationFeedbackItem): import('./matching/types').RecommendationFeedbackItem {

    const db = loadDB();

    if (!db.recommendationFeedback) db.recommendationFeedback = {};

    if (!db.recommendationFeedback[item.candidateId]) db.recommendationFeedback[item.candidateId] = [];

    const list = db.recommendationFeedback[item.candidateId];

    const idx = list.findIndex(f => f.jobId === item.jobId);

    if (idx >= 0) {

      list[idx] = item;

    } else {

      list.push(item);

    }

    saveDB(db);

    return item;

  },



  deleteRecommendationFeedback(candidateId: string, jobId: string): boolean {

    const db = loadDB();

    if (!db.recommendationFeedback || !db.recommendationFeedback[candidateId]) return false;

    const initialLen = db.recommendationFeedback[candidateId].length;

    db.recommendationFeedback[candidateId] = db.recommendationFeedback[candidateId].filter(f => f.jobId !== jobId);

    if (db.recommendationFeedback[candidateId].length < initialLen) {

      saveDB(db);

      return true;

    }

    return false;

  },



  getMatchingConfig(): import('./matching/types').MatchingEngineConfig {

    const db = loadDB();

    return db.matchingConfig || {

      version: 'v1.0.0',

      enabled: true,

      weights: { education: 25, skills: 25, experience: 15, category: 10, location: 10, employmentType: 5, organizationType: 5, salary: 5 },

      minScoreToRecommend: 40,

      excellentThreshold: 90,

      strongThreshold: 75,

      goodThreshold: 60,

      partialThreshold: 40,

      allowOverqualification: true,

      quotaAgeRelaxationYears: 2,

      updatedAt: new Date().toISOString(),

      updatedBy: 'SYSTEM_DEFAULT'

    };

  },



  updateMatchingConfig(updates: Partial<import('./matching/types').MatchingEngineConfig>): import('./matching/types').MatchingEngineConfig {

    const db = loadDB();

    const current = this.getMatchingConfig();

    const updated = {

      ...current,

      ...updates,

      updatedAt: new Date().toISOString()

    };

    db.matchingConfig = updated;

    saveDB(db);

    return updated;

  },



  updateCandidatePreferences(candidateId: string, prefs: import('./matching/types').CareerPreferences): CandidateRecord | null {

    const db = loadDB();

    const candidate = db.candidates[candidateId];

    if (!candidate) return null;

    candidate.careerPreferences = prefs;

    candidate.updatedAt = new Date().toISOString();

    saveDB(db);

    return candidate;

  },



  addCandidateEducation(candidateId: string, edu: EducationRecord): CandidateRecord | null {
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
  },



  addCandidateSkill(candidateId: string, skill: import('./matching/types').UserSkillItem): CandidateRecord | null {

    const db = loadDB();

    const candidate = db.candidates[candidateId];

    if (!candidate) return null;

    if (!candidate.skills) candidate.skills = [];

    const skillItem = {

      ...skill,

      id: skill.id || ('sk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6))

    };

    const existingIdx = candidate.skills.findIndex((s: any) => 

      (typeof s === 'string' && s.toLowerCase() === skillItem.name.toLowerCase()) || 

      (typeof s === 'object' && (s.id === skillItem.id || s.name?.toLowerCase() === skillItem.name.toLowerCase()))

    );

    if (existingIdx >= 0) {

      candidate.skills[existingIdx] = skillItem as any;

    } else {

      candidate.skills.push(skillItem as any);

    }

    candidate.updatedAt = new Date().toISOString();

    saveDB(db);

    return candidate;

  },



  deleteCandidateSkill(candidateId: string, skillId: string): CandidateRecord | null {

    const db = loadDB();

    const candidate = db.candidates[candidateId];

    if (!candidate || !candidate.skills) return null;

    candidate.skills = candidate.skills.filter((s: any) => {

      if (typeof s === 'string') return s !== skillId;

      return s.id !== skillId && s.normalizedId !== skillId && s.name !== skillId;

    });

    candidate.updatedAt = new Date().toISOString();

    saveDB(db);

    return candidate;

  },



  addCandidateExperience(candidateId: string, exp: import('./types').ExperienceRecord): CandidateRecord | null {

    const db = loadDB();

    const candidate = db.candidates[candidateId];

    if (!candidate) return null;

    if (!candidate.experiences) candidate.experiences = [];

    const item = { ...exp, id: exp.id || ('exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)) };

    candidate.experiences.push(item);

    candidate.updatedAt = new Date().toISOString();

    saveDB(db);

    return candidate;

  },



  updateCandidateExperience(candidateId: string, expId: string, exp: Partial<import('./types').ExperienceRecord>): CandidateRecord | null {

    const db = loadDB();

    const candidate = db.candidates[candidateId];

    if (!candidate || !candidate.experiences) return null;

    const idx = candidate.experiences.findIndex(e => e.id === expId);

    if (idx < 0) return null;

    candidate.experiences[idx] = { ...candidate.experiences[idx], ...exp };

    candidate.updatedAt = new Date().toISOString();

    saveDB(db);

    return candidate;

  },



  deleteCandidateExperience(candidateId: string, expId: string): CandidateRecord | null {

    const db = loadDB();

    const candidate = db.candidates[candidateId];

    if (!candidate || !candidate.experiences) return null;

    candidate.experiences = candidate.experiences.filter(e => e.id !== expId);

    candidate.updatedAt = new Date().toISOString();

    saveDB(db);

    return candidate;

  },




  // -------------------------------------------------------------------------
  // STEP 12: Training & Certificate Verification Extensions
  // -------------------------------------------------------------------------

  updateDocumentVerification(
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
  },

  getCandidateTrainings(candidateId: string): import('./types').TrainingRecord[] {
    const db = loadDB();
    const candidate = db.candidates[candidateId];
    return (candidate && candidate.trainings) || [];
  },

  addCandidateTraining(candidateId: string, training: import('./types').TrainingRecord): CandidateRecord | null {
    const db = loadDB();
    const candidate = db.candidates[candidateId];
    if (!candidate) return null;
    if (!candidate.trainings) candidate.trainings = [];
    const item = {
      ...training,
      id: training.id || ('tr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
      verificationStatus: training.verificationStatus || 'NOT_SUBMITTED'
    };
    candidate.trainings.push(item);
    candidate.updatedAt = new Date().toISOString();
    saveDB(db);
    return candidate;
  },

  updateCandidateTraining(
    candidateId: string, 
    trainingId: string, 
    updates: Partial<import('./types').TrainingRecord>
  ): CandidateRecord | null {
    const db = loadDB();
    const candidate = db.candidates[candidateId];
    if (!candidate || !candidate.trainings) return null;
    const idx = candidate.trainings.findIndex(t => t.id === trainingId);
    if (idx < 0) return null;
    candidate.trainings[idx] = { ...candidate.trainings[idx], ...updates };
    candidate.updatedAt = new Date().toISOString();
    saveDB(db);
    return candidate;
  },

  deleteCandidateTraining(candidateId: string, trainingId: string): CandidateRecord | null {
    const db = loadDB();
    const candidate = db.candidates[candidateId];
    if (!candidate || !candidate.trainings) return null;
    candidate.trainings = candidate.trainings.filter(t => t.id !== trainingId);
    candidate.updatedAt = new Date().toISOString();
    saveDB(db);
    return candidate;
  },

  // Step 13: Operational Expenses & Budget
  getOperationalExpenses(): import('./operations/types').OperationalExpenseRecord[] {
    const db = loadDB();
    return db.operationalExpenses ? Object.values(db.operationalExpenses) : [];
  },

  getOperationalExpenseById(id: string): import('./operations/types').OperationalExpenseRecord | null {
    const db = loadDB();
    return (db.operationalExpenses && db.operationalExpenses[id]) || null;
  },

  saveOperationalExpense(expense: import('./operations/types').OperationalExpenseRecord): void {
    const db = loadDB();
    if (!db.operationalExpenses) db.operationalExpenses = {};
    db.operationalExpenses[expense.id] = expense;
    saveDB(db);
  },

  deleteOperationalExpense(id: string): boolean {
    const db = loadDB();
    if (!db.operationalExpenses || !db.operationalExpenses[id]) return false;
    delete db.operationalExpenses[id];
    saveDB(db);
    return true;
  },

  getPlatformBudget(): import('./operations/types').PlatformBudgetConfig | null {
    const db = loadDB();
    return db.platformBudget || null;
  },

  savePlatformBudget(config: import('./operations/types').PlatformBudgetConfig): void {
    const db = loadDB();
    db.platformBudget = config;
    saveDB(db);
  },

  // Step 14: Admin Governance & Staff RBAC
  getStaffMembers(): import('./governance/types').StaffMemberRecord[] {
    const db = loadDB();
    return db.staffMembers ? Object.values(db.staffMembers) : [];
  },

  getStaffMemberById(id: string): import('./governance/types').StaffMemberRecord | null {
    const db = loadDB();
    return (db.staffMembers && db.staffMembers[id]) || null;
  },

  saveStaffMember(member: import('./governance/types').StaffMemberRecord): import('./governance/types').StaffMemberRecord {
    const db = loadDB();
    if (!db.staffMembers) db.staffMembers = {};
    db.staffMembers[member.id] = member;
    saveDB(db);
    return member;
  },

  // =========================================================================
  // STEP 16 / PHASE 04: ORGANIZATION MANAGEMENT ENHANCEMENTS
  // =========================================================================
  getCompanyById(id: string): CompanyProfile | null {
    const db = loadDB();
    return (db.companies && db.companies[id]) || null;
  },

  createCompany(data: Partial<CompanyProfile>): CompanyProfile {
    const db = loadDB();
    if (!db.companies) db.companies = {};
    const id = data.id || ('comp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
    const newCompany: CompanyProfile = {
      id,
      name: data.name || 'নতুন প্রতিষ্ঠান',
      nameBn: data.nameBn || data.name || 'নতুন প্রতিষ্ঠান',
      logo: data.logo || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
      industry: data.industry || 'সরকারি / স্বায়ত্তশাসিত',
      district: data.district || 'ঢাকা',
      verified: Boolean(data.verified),
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      activeJobsCount: data.activeJobsCount || 0,
      organizationType: data.organizationType || 'government',
      website: data.website || '',
      description: data.description || '',
      address: data.address || '',
      division: data.division || 'Dhaka',
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.companies[id] = newCompany;
    saveDB(db);

    try {
      this.recordAdminAudit({
        action: 'CREATE_ORGANIZATION',
        adminId: 'ADMIN-SUPER',
        targetType: 'COMPANY',
        targetId: id,
        notes: 'নতুন প্রতিষ্ঠান এন্ট্রি তৈরি: ' + newCompany.name,
        changes: { company: { new: newCompany } } as any
      });
    } catch {}

    return newCompany;
  },

  updateCompany(id: string, updates: Partial<CompanyProfile>, adminId = 'ADMIN-SUPER'): CompanyProfile | null {
    const db = loadDB();
    if (!db.companies || !db.companies[id]) return null;
    const existing = db.companies[id];
    const updated: CompanyProfile = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.companies[id] = updated;
    saveDB(db);

    try {
      this.recordAdminAudit({
        action: 'UPDATE_ORGANIZATION',
        adminId: adminId || 'ADMIN-SUPER',
        targetType: 'COMPANY',
        targetId: id,
        notes: 'প্রতিষ্ঠান তথ্য হালনাগাদ: ' + updated.name,
        changes: { updates: { new: updates } } as any
      });
    } catch {}

    return updated;
  },

  deleteCompany(id: string, adminId = 'ADMIN-SUPER'): boolean {
    const db = loadDB();
    if (!db.companies || !db.companies[id]) return false;
    const deletedName = db.companies[id].name;
    delete db.companies[id];
    saveDB(db);

    try {
      this.recordAdminAudit({
        action: 'DELETE_ORGANIZATION',
        adminId: adminId || 'ADMIN-SUPER',
        targetType: 'COMPANY',
        targetId: id,
        notes: 'প্রতিষ্ঠান মুছে ফেলা হয়েছে: ' + deletedName,
        changes: { company: { old: deletedName } } as any
      });
    } catch {}

    return true;
  },

  // =========================================================================
  // STEP 16 / PHASE 04: MEDIA LIBRARY REPOSITORY
  // =========================================================================
  getMediaItems(): import('./types').MediaItem[] {
    const db = loadDB();
    return db.mediaItems ? Object.values(db.mediaItems) : [];
  },

  getMediaItemById(id: string): import('./types').MediaItem | null {
    const db = loadDB();
    return (db.mediaItems && db.mediaItems[id]) || null;
  },

  saveMediaItem(item: import('./types').MediaItem): import('./types').MediaItem {
    const db = loadDB();
    if (!db.mediaItems) db.mediaItems = {};
    db.mediaItems[item.id] = {
      ...item,
      updatedAt: new Date().toISOString()
    };
    saveDB(db);

    try {
      this.recordAdminAudit({
        action: 'UPLOAD_MEDIA',
        adminId: item.uploadedBy || 'ADMIN-SUPER',
        targetType: 'MEDIA',
        targetId: item.id,
        notes: 'নতুন মিডিয়া ফাইল আপলোড: ' + item.originalName,
        changes: { media: { new: item } } as any
      });
    } catch {}

    return db.mediaItems[item.id];
  },

  updateMediaItem(id: string, updates: Partial<import('./types').MediaItem>): import('./types').MediaItem | null {
    const db = loadDB();
    if (!db.mediaItems || !db.mediaItems[id]) return null;
    const existing = db.mediaItems[id];
    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    db.mediaItems[id] = updated;
    saveDB(db);
    return updated;
  },

  deleteMediaItem(id: string): boolean {
    const db = loadDB();
    if (!db.mediaItems || !db.mediaItems[id]) return false;
    delete db.mediaItems[id];
    saveDB(db);
    return true;
  },

  // =========================================================================
  // STEP 16 / PHASE 04: PLATFORM SETTINGS & GLOBAL CONFIGURATION
  // =========================================================================
  getPlatformSettings(): import('./types').PlatformSettings {
    const db = loadDB();
    if (db.platformSettings) return db.platformSettings;

    const defaultSettings: import('./types').PlatformSettings = {
      general: {
        siteName: 'চাকরি সেবা (Chakri Sheba)',
        siteDescription: 'বাংলাদেশের একমাত্র ১০০% সম্পূর্ণ ফ্রি সরকারি ও বেসরকারি চাকরি পোর্টাল',
        siteUrl: 'https://chakrisheba.com',
        supportEmail: 'support@chakrisheba.com',
        supportPhone: '+880 1774-366643',
        officeAddress: 'ধানমন্ডি ৩২, ঢাকা-১২০৯, বাংলাদেশ',
        whatsappNumber: '8801774366643',
        logoUrl: '/icons/icon-192x192.png',
        faviconUrl: '/favicon.ico',
        defaultTimezone: 'Asia/Dhaka',
        defaultLanguage: 'bn'
      },
      seo: {
        defaultTitle: 'চাকরি সেবা — সরকারি ও বেসরকারি চাকরির খবর ও আবেদন পোর্টাল',
        defaultDescription: 'টেলিটক জব সার্কুলার, ব্যাংক জব, সরকারি মন্ত্রণালয় ও বেসরকারি প্রতিষ্ঠানের চাকরির সকল আপডেট সম্পূর্ণ বিনামূল্যে।',
        defaultKeywords: ['চাকরি সেবা', 'সরকারি চাকরি', 'টেলিটক জব সার্কুলার', 'ব্যাংক জব', 'chakri sheba'],
        defaultOgImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
        robotsTxtContent: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://chakrisheba.com/sitemap.xml'
      },
      workflow: {
        requireVerificationBeforePublish: true,
        autoScrapeInterval: '6h',
        allowCandidateSelfRegistration: true,
        maintenanceMode: false,
        defaultJobVisibility: 'public'
      },
      notifications: {
        smsProvider: 'teletalk',
        emailProvider: 'smtp',
        smsEnabled: true,
        emailEnabled: true,
        inAppEnabled: true,
        dailyDigestHour: 9
      },
      operational: {
        standardServiceFee: 80,
        expressServiceFee: 120,
        urgentServiceFee: 150,
        officialBkashNumber: '01774366643',
        officialNagadNumber: '01812345678',
        officialRocketNumber: '01912345678'
      },
      updatedAt: new Date().toISOString(),
      updatedBy: 'ADMIN-SUPER'
    };

    db.platformSettings = defaultSettings;
    saveDB(db);
    return defaultSettings;
  },

  updatePlatformSettings(updates: Partial<import('./types').PlatformSettings>, adminId = 'ADMIN-SUPER'): import('./types').PlatformSettings {
    const db = loadDB();
    const current = this.getPlatformSettings();
    const merged: import('./types').PlatformSettings = {
      ...current,
      ...updates,
      general: { ...current.general, ...(updates.general || {}) },
      seo: { ...current.seo, ...(updates.seo || {}) },
      workflow: { ...current.workflow, ...(updates.workflow || {}) },
      notifications: { ...current.notifications, ...(updates.notifications || {}) },
      operational: { ...current.operational, ...(updates.operational || {}) },
      updatedAt: new Date().toISOString(),
      updatedBy: adminId || 'ADMIN-SUPER'
    };

    db.platformSettings = merged;
    saveDB(db);

    try {
      this.recordAdminAudit({
        action: 'UPDATE_PLATFORM_SETTINGS',
        adminId: adminId || 'ADMIN-SUPER',
        targetType: 'SYSTEM_SETTINGS',
        targetId: 'GLOBAL_CONFIG',
        notes: 'প্ল্যাটফর্মের কেন্দ্রীয় সেটিংস ও কনফিগারেশন হালনাগাদ করা হয়েছে',
        changes: { settings: { new: updates } }
      });
    } catch {}

    return merged;
  },

};

