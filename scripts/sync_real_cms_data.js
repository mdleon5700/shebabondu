const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'db', 'local_store.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Ensure platformSettings is fully populated with 100% matching live navigation & footer
if (!db.platformSettings) db.platformSettings = {};
if (!db.platformSettings.general) db.platformSettings.general = {};

db.platformSettings.general.siteName = "চাকরি সেবা বাংলাদেশ";
db.platformSettings.general.siteDescription = "বাংলাদেশের একমাত্র ১০০% সম্পূর্ণ ফ্রি সরকারি ও বেসরকারি চাকরি পোর্টাল";
db.platformSettings.general.whatsappButtonText = "জরুরি সহায়তা";
db.platformSettings.general.loginButtonText = "লগইন / রেজিস্ট্রেশন";
db.platformSettings.general.supportPhone = "+৮৮০ ১৭৭৪-৩৬৬৬৪৩";
db.platformSettings.general.whatsappNumber = "8801774366643";
db.platformSettings.general.announcementText = "⚡ নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬: সকল সরকারি ও ব্যাংক চাকরির অনলাইন আবেদন চালু রয়েছে!";
db.platformSettings.general.announcementUrl = "/jobs";
db.platformSettings.general.announcementEnabled = true;

const REAL_LIVE_HEADER_ITEMS = [
  {
    id: 'home',
    label: 'হোম',
    href: '/'
  },
  {
    id: 'all-jobs',
    label: 'সকল চাকরি',
    href: '/jobs',
    badge: 'হট',
    dropdown: [
      { label: 'চলমান সকল বিজ্ঞপ্তি', href: '/jobs' },
      { label: 'সর্বশেষ প্রকাশিত চাকরি', href: '/latest-jobs' },
      { label: 'আবেদনের শেষ সময় কাছাকাছি', href: '/deadline-approaching' },
      { label: 'সকল চাকরির প্রতিষ্ঠান', href: '/organizations' },
      { label: 'যোগ্যতা অনুযায়ী চাকরি', href: '/job-categories' }
    ]
  },
  {
    id: 'govt',
    label: 'সরকারি চাকরি',
    href: '/government-jobs',
    dropdown: [
      { label: 'সকল সরকারি চাকরি', href: '/government-jobs' },
      { label: 'বিপিএসসি (BPSC) চাকরি', href: '/organizations/bpsc' },
      { label: 'বাংলাদেশ ব্যাংক নিয়োগ', href: '/organizations/bangladesh-bank' },
      { label: 'সরকারি মন্ত্রণালয়সমূহ', href: '/organizations/government-ministries' },
      { label: 'সরকারি অধিদপ্তরসমূহ', href: '/organizations/government-directorates' }
    ]
  },
  {
    id: 'private',
    label: 'বেসরকারি চাকরি',
    href: '/private-jobs',
    dropdown: [
      { label: 'সকল বেসরকারি চাকরি', href: '/private-jobs' },
      { label: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান', href: '/bank-jobs' },
      { label: 'এনজিও (NGO) চাকরি', href: '/ngo-jobs' },
      { label: 'আইটি ও সফটওয়্যার জবস', href: '/it-jobs' },
      { label: 'মেডিকেল ও ফার্মাসিউটিক্যাল', href: '/medical-jobs' }
    ]
  },
  {
    id: 'categories',
    label: 'চাকরির ক্যাটাগরি',
    href: '/job-categories',
    dropdown: [
      { label: 'সকল ক্যাটাগরি ব্রাউজ করুন', href: '/job-categories' },
      { label: 'শিক্ষক নিয়োগ', href: '/teacher-jobs' },
      { label: 'ইঞ্জিনিয়ারিং চাকরি', href: '/engineering-jobs' },
      { label: 'মার্কেটিং ও সেলস', href: '/marketing-jobs' },
      { label: 'ফ্রেশারদের চাকরি', href: '/fresher-jobs' },
      { label: 'পার্ট-টাইম ও ইন্টার্নশিপ', href: '/part-time-jobs' }
    ]
  },
  {
    id: 'exam',
    label: 'পরীক্ষা ও ফলাফল',
    href: '/exam-notices',
    dropdown: [
      { label: 'পরীক্ষার নোটিশ ও তারিখ', href: '/exam-notices' },
      { label: 'প্রবেশপত্র / Admit Card', href: '/admit-cards' },
      { label: 'লিখিত পরীক্ষার ফলাফল', href: '/written-exam-results' },
      { label: 'মৌখিক পরীক্ষার নোটিশ (Viva)', href: '/viva-notices' },
      { label: 'সকল পরীক্ষার ফলাফল', href: '/exam-results' },
      { label: 'বিগত বছরের প্রশ্ন ও সমাধান', href: '/previous-year-questions' },
      { label: 'অনলাইন মডেল টেস্ট', href: '/model-tests' }
    ]
  },
  {
    id: 'career',
    label: 'ক্যারিয়ার গাইড',
    href: '/career-guides',
    dropdown: [
      { label: 'ক্যারিয়ার গাইড হাব', href: '/career-guides' },
      { label: 'সিভি লেখার সঠিক নিয়ম', href: '/career-guides/cv-writing' },
      { label: 'অনলাইনে চাকরির আবেদন গাইড', href: '/career-guides/online-job-application' },
      { label: 'ইন্টারভিউ ও ভাইভা প্রস্তুতি', href: '/career-guides/interview-preparation' },
      { label: 'চাকরির পরীক্ষার প্রস্তুতি', href: '/career-guides/job-exam-preparation' },
      { label: 'ক্যারিয়ার পরামর্শ ও ব্লগ', href: '/blog' }
    ]
  }
];

const REAL_LIVE_FOOTER_COLUMNS = [
  {
    id: 'col-jobs',
    title: 'চাকরি ও পরীক্ষা',
    links: [
      { label: 'চলমান সকল চাকরি', url: '/jobs' },
      { label: 'সরকারি চাকরির বিজ্ঞপ্তি', url: '/government-jobs' },
      { label: 'বেসরকারি ও কোম্পানি জবস', url: '/private-jobs' },
      { label: 'ব্যাংক ও ফাইন্যান্স চাকরি', url: '/bank-jobs' },
      { label: 'আবেদনের শেষ সময় কাছাকাছি', url: '/deadline-approaching' },
      { label: 'পরীক্ষার নোটিশ ও সময়সূচি', url: '/exam-notices' },
      { label: 'প্রবেশপত্র / অ্যাডমিট কার্ড', url: '/admit-cards' },
      { label: 'বিগত বছরের প্রশ্ন ও সমাধান', url: '/previous-year-questions' },
      { label: 'অনলাইন মডেল টেস্ট', url: '/model-tests' }
    ]
  },
  {
    id: 'col-guides',
    title: 'ক্যারিয়ার গাইড ও সার্ভিস',
    links: [
      { label: 'সকল চাকরির ক্যাটাগরি', url: '/job-categories' },
      { label: 'সকল নিয়োগকারী প্রতিষ্ঠান', url: '/organizations' },
      { label: 'ক্যারিয়ার গাইড হাব', url: '/career-guides' },
      { label: 'সিভি লেখার সঠিক নিয়ম', url: '/career-guides/cv-writing' },
      { label: 'অনলাইনে চাকরির আবেদন গাইড', url: '/career-guides/online-job-application' },
      { label: 'ইন্টারভিউ ও ভাইভা প্রস্তুতি', url: '/career-guides/interview-preparation' },
      { label: 'সব ব্লগ ও ক্যারিয়ার আর্টিকেল', url: '/blog' },
      { label: 'ফ্রি জব এলার্ট নোটিফিকেশন', url: '/job-alerts' }
    ]
  },
  {
    id: 'col-policies',
    title: 'নীতিমালা ও সহায়তা',
    links: [
      { label: 'আমাদের সম্পর্কে (About Us)', url: '/about-us' },
      { label: 'যোগাযোগ করুন (Contact)', url: '/contact-us' },
      { label: 'সাধারণ জিজ্ঞাসা (FAQ)', url: '/faq' },
      { label: 'সম্পাদকীয় নীতিমালা', url: '/editorial-policy' },
      { label: 'চাকরি যাচাই নীতিমালা', url: '/job-verification-policy' },
      { label: 'ভুল তথ্য সংশোধন নীতিমালা', url: '/corrections-policy' },
      { label: 'ভুল বিজ্ঞপ্তি রিপোর্ট করুন', url: '/report-a-job' }
    ]
  }
];

db.platformSettings.general.headerMenuItems = REAL_LIVE_HEADER_ITEMS;
db.platformSettings.general.footerColumns = REAL_LIVE_FOOTER_COLUMNS;
db.platformSettings.general.footerAboutText = 'বাংলাদেশের চাকরিপ্রার্থীদের বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম। ঘরে বসেই সকল সরকারি, ব্যাংক ও শীর্ষ বেসরকারি চাকরির শতভাগ যাচাইকৃত বিজ্ঞপ্তি ও সঠিক নিয়মে অনলাইন আবেদন সহায়তা।';
db.platformSettings.general.footerDisclaimer = 'সতর্কতা: চাকরি সেবা কোনো সরকারি বা নিয়োগকারী প্রতিষ্ঠান নয়। আমরা বিভিন্ন অফিশিয়াল ওয়েবসাইট ও জাতীয় পত্রিকা থেকে সংগৃহীত চাকরির তথ্য ও সার্কুলার প্রকাশ করি এবং চাকরিপ্রার্থীদের সুবিধার্থে সঠিক নিয়মে ফর্ম পূরণে পেশাদার সহায়তা প্রদান করি।';
db.platformSettings.general.copyrightText = '© ২০২৬ চাকরি সেবা বাংলাদেশ (ChakriSheba.com) • সর্বস্বত্ব সংরক্ষিত।';

// 2. Ensure db.pages has 100% real workable content
if (!db.pages) db.pages = {};

// 2a. HOMEPAGE
db.pages['home'] = {
  id: 'home',
  slug: '/',
  title: 'হোমপেজ — চাকরি সেবা',
  metaTitle: 'চাকরি সেবা বাংলাদেশ | সরকারি ও ব্যাংক চাকরির সার্কুলার ও অনলাইন আবেদন ২০২৬',
  metaDescription: 'বাংলাদেশের সকল সরকারি ও বেসরকারি চাকরির নিয়মিত আপডেট এবং ঘরে বসেই নির্ভুল আবেদনের বিশ্বস্ত প্ল্যাটফর্ম।',
  status: 'published',
  version: 10,
  isSystemPage: true,
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  sections: [
    {
      id: 'sec-home-hero',
      type: 'hero',
      title: 'চাকরির খবর জানুন সবার আগে,\nঘরে বসেই নিন ১০০% নির্ভুল আবেদন সেবা!',
      subtitle: 'সরকারি ও বেসরকারি চাকরির সর্বশেষ বিজ্ঞপ্তি, আবেদন প্রক্রিয়া, যোগ্যতা, প্রয়োজনীয় কাগজপত্র এবং পরীক্ষার আপডেট—সবকিছু এক জায়গায়, আপনার জন্য।',
      content: {
        badge: 'সঠিক তথ্য • নির্ভরযোগ্য চাকরির খবর • আপনার ক্যারিয়ারের সঙ্গী',
        ctaText: 'চাকরির বিজ্ঞপ্তি দেখুন',
        ctaUrl: '#circulars-section',
        secondaryCtaText: 'আবেদন প্রক্রিয়া জানুন',
        secondaryCtaUrl: '#how-it-works'
      },
      style: {
        backgroundColor: '#011612',
        textColor: '#ffffff',
        paddingY: 'lg',
        textAlign: 'left'
      },
      isVisible: true
    },
    {
      id: 'sec-home-features',
      type: 'features',
      title: 'চাকরি সেবা বিশেষ সেবাসমূহ',
      subtitle: 'চাকরিপ্রার্থীদের সফল ক্যারিয়ার গঠনে আমাদের অনন্য সুবিধাসমূহ',
      content: {
        items: [
          {
            title: '১০০% নির্ভুল টেলিটক আবেদন',
            desc: 'পেশাদার টিম দিয়ে সঠিক সাইজে ছবি ও স্বাক্ষর রিসাইজ করে আবেদন দাখিল ও ফি পেমেন্ট।'
          },
          {
            title: 'মাস্টার ডকুমেন্ট ভল্ট',
            desc: 'একবার প্রোফাইল সংরক্ষণ করলেই পরবর্তীতে মাত্র ১ ক্লিকে যেকোনো পদে দ্রুত আবেদন।'
          },
          {
            title: 'লাইভ অ্যাপ্লিকেশন ট্র্যাকিং',
            desc: 'বিকাশ/নগদে পেমেন্টের পর উবার-স্টাইল রিয়েল-টাইম ৫ ধাপের ট্র্যাকিং ও এসএমএস অ্যালার্ট।'
          }
        ]
      },
      style: {
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        paddingY: 'md',
        columns: 3
      },
      isVisible: true
    }
  ]
};

// 2b. ABOUT US
db.pages['about-us'] = {
  id: 'about-us',
  slug: '/about-us',
  title: 'আমাদের সম্পর্কে — চাকরি সেবা',
  metaTitle: 'আমাদের সম্পর্কে (About Us) | চাকরি সেবা বাংলাদেশ',
  metaDescription: 'চাকরি সেবা প্ল্যাটফর্মের উদ্দেশ্য, মিশন ও প্রতিশ্রুতি।',
  status: 'published',
  version: 8,
  isSystemPage: true,
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  sections: [
    {
      id: 'sec-about-hero',
      type: 'hero',
      title: 'বাংলাদেশের প্রথম ডিজিটাল জব অ্যাসিস্ট্যান্স প্ল্যাটফর্ম',
      subtitle: 'আমরা চাকরিপ্রার্থীদের সময়, শ্রম এবং ভুলের ঝুঁকি কমিয়ে ক্যারিয়ার গঠনে পাশে থাকি।',
      content: {
        badge: 'আমাদের লক্ষ্য ও প্রতিশ্রুতি'
      },
      style: {
        backgroundColor: '#064e3b',
        textColor: '#ffffff',
        paddingY: 'lg',
        textAlign: 'center'
      },
      isVisible: true
    },
    {
      id: 'sec-about-text',
      type: 'text',
      title: 'আমাদের মিশন ও পেশাদারিত্ব',
      subtitle: 'চাকরি সেবা একটি স্বনামধন্য ও দায়িত্বশীল এডটেক ও ক্যারিয়ার প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য—বাংলাদেশের প্রতিটি অঞ্চলের চাকরিপ্রার্থীর কাছে সরকারি, ব্যাংক ও স্বায়ত্তশাসিত প্রতিষ্ঠানের শতভাগ সঠিক নিয়োগ বিজ্ঞপ্তি পৌঁছে দেওয়া এবং ঘরে বসেই কোনো ভুলত্রুটি ছাড়া আবেদন সম্পন্ন করতে সহায়তা করা। সাধারণ সাইবার ক্যাফেতে ঘণ্টার পর ঘণ্টা লাইনে দাঁড়িয়ে ছবি রিসাইজ করা ও ভুল ফরম পূরণের কারণে হাজারো প্রার্থীর আবেদন বাতিল হয়। আমরা তৈরি করেছি এমন একটি প্ল্যাটফর্ম যেখানে প্রার্থীদের মাস্টার ডকুমেন্ট ভল্ট, অটো-রিসাইজার ও পেশাদার টিম দিয়ে শতভাগ নির্ভুল আবেদন নিশ্চিত করা হয়।',
      content: {
        bodyText: 'আমাদের রিসার্চ টিম প্রতিদিন গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের অফিশিয়াল ওয়েবসাইট, বিপিএসসি গেজেট এবং জাতীয় দৈনিকসমূহ মনিটর করে তথ্য যাচাই-বাছাইয়ের পর প্রকাশ করে থাকে।'
      },
      style: {
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        paddingY: 'md',
        textAlign: 'left'
      },
      isVisible: true
    }
  ]
};

// 2c. CONTACT US
db.pages['contact-us'] = {
  id: 'contact-us',
  slug: '/contact-us',
  title: 'সাহায্য ও যোগাযোগ — চাকরি সেবা',
  metaTitle: 'সাহায্য ও যোগাযোগ | চাকরি সেবা বাংলাদেশ',
  metaDescription: 'আবেদন সংক্রান্ত যেকোনো জিজ্ঞাসা, পেমেন্ট ভেরিফিকেশন বা সহযোগিতার জন্য হেল্পলাইনে যোগাযোগ করুন।',
  status: 'published',
  version: 8,
  isSystemPage: true,
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  sections: [
    {
      id: 'sec-contact-hero',
      type: 'hero',
      title: 'যেকোনো প্রয়োজনে আমরা আপনার পাশে আছি',
      subtitle: 'আবেদন সংক্রান্ত যেকোনো জিজ্ঞাসা, পেমেন্ট ভেরিফিকেশন বা সহযোগিতার জন্য সরাসরি হেল্পলাইনে কল করুন বা হোয়াটসঅ্যাপে মেসেজ দিন।',
      content: {
        badge: '২৪/৭ সাপোর্ট ও সহায়তা'
      },
      style: {
        backgroundColor: '#064e3b',
        textColor: '#ffffff',
        paddingY: 'lg',
        textAlign: 'center'
      },
      isVisible: true
    },
    {
      id: 'sec-contact-features',
      type: 'features',
      title: 'আমাদের সাপোর্ট চ্যানেলসমূহ',
      subtitle: 'দ্রুত সেবা পেতে নিচের যেকোনো মাধ্যমে যোগাযোগ করুন',
      content: {
        items: [
          {
            title: 'জরুরি হেল্পলাইন (+৮৮০ ১৭৭৪-৩৬৬৬৪৩)',
            desc: 'সরাসরি ফোনে কথা বলুন প্রতিদিন সকাল ৯:০০ হতে রাত ১১:০০ পর্যন্ত।'
          },
          {
            title: 'WhatsApp চ্যাট সাপোর্ট (০১৭৭৪-৩৬৬৬৪৩)',
            desc: 'তাৎক্ষণিক সমাধান ও আবেদন রসিদ পেতে যেকোনো সময় হোয়াটসঅ্যাপে মেসেজ দিন।'
          },
          {
            title: 'অফিস ঠিকানা',
            desc: 'ধানমন্ডি ৩২, ঢাকা-১২০৯, বাংলাদেশ। প্রতিদিন অফিস খোলা রয়েছে।'
          }
        ]
      },
      style: {
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        paddingY: 'md',
        columns: 3
      },
      isVisible: true
    }
  ]
};

// 2d. FAQ
db.pages['faq'] = {
  id: 'faq',
  slug: '/faq',
  title: 'সাধারণ জিজ্ঞাসা (FAQ) — চাকরি সেবা',
  metaTitle: 'সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ) | চাকরি সেবা বাংলাদেশ',
  metaDescription: 'চাকরি সেবার সার্ভিস, পেমেন্ট, আবেদন ও নিরাপত্তা সম্পর্কিত সকল সাধারণ প্রশ্নের উত্তর।',
  status: 'published',
  version: 8,
  isSystemPage: true,
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  sections: [
    {
      id: 'sec-faq-hero',
      type: 'hero',
      title: 'সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর (FAQ)',
      subtitle: 'চাকরি সেবা প্ল্যাটফর্মের আবেদন পদ্ধতি, সরকারি ফি এবং কাস্টমার গ্যারান্টি সম্পর্কিত সাধারণ প্রশ্নাবলী।',
      content: {
        badge: 'সহায়তা ও নির্দেশিকা'
      },
      style: {
        backgroundColor: '#0f172a',
        textColor: '#ffffff',
        paddingY: 'lg',
        textAlign: 'center'
      },
      isVisible: true
    },
    {
      id: 'sec-faq-items',
      type: 'faq',
      title: 'জনপ্রিয় সাধারণ প্রশ্নোত্তর',
      subtitle: 'আমাদের সেবা সম্পর্কিত প্রশ্ন ও সমাধান',
      content: {
        items: [
          {
            question: 'চাকরি সেবা প্ল্যাটফর্মের মাধ্যমে কীভাবে আবেদন করবেন?',
            answer: 'পছন্দের বিজ্ঞপ্তিতে গিয়ে "আবেদন করুন" বাটনে ক্লিক করুন। আপনার প্রোফাইল তথ্য স্বয়ংক্রিয়ভাবে পূরণ হয়ে যাবে। এরপর ফি পেমেন্ট সম্পন্ন করলে আমাদের এক্সপার্ট টিম নির্ধারিত সময়ের মধ্যে সরকারি পোর্টালে নির্ভুল আবেদন দাখিল করে আপনাকে ট্র্যাকিং আইডি ও অ্যাপ্লিক্যান্ট কপি প্রদান করবে।'
          },
          {
            question: 'আমার ছবি ও স্বাক্ষরের সাইজ ভুল থাকলে কি আবেদন বাতিল হবে?',
            answer: 'একদমই না! আমাদের প্ল্যাটফর্মে বিল্ট-ইন অটো-রিসাইজার রয়েছে। আপনি মোবাইল থেকে সাধারণ ছবি আপলোড করলেও সিস্টেম নিজে থেকেই টেলিটকের সঠিক ৩০০x৩০০ পিক্সেল ছবি এবং ৩০০x৮০ পিক্সেল স্বাক্ষরে কনভার্ট করে নেয়।'
          },
          {
            question: 'বিকাশ বা নগদে টাকা দেওয়ার পর আবেদনের প্রমাণ কী পাব?',
            answer: 'পেমেন্ট দেওয়ার পর আপনার ড্যাশবোর্ডে উবার-স্টাইল ৫-ধাপের লাইভ ট্র্যাকিং চালু হবে। টিম মেম্বার কাজ শেষ করামাত্রই সরকারি ট্রানজ্যাকশন আইডি ও বারকোড সহ মূল "Applicant Copy PDF" ডাউনলোড লিংক পাবেন এবং আপনার ফোনে এসএমএস চলে যাবে।'
          },
          {
            question: 'আমার এনআইডি ও ব্যক্তিগত তথ্য কি নিরাপদ থাকবে?',
            answer: 'হ্যাঁ, শতভাগ নিরাপদ। আমরা সর্বোচ্চ ব্যাংকিং গ্রেড এনক্রিপশন ব্যবহার করি এবং আপনার তথ্য শুধুমাত্র সংশ্লিষ্ট চাকরির ফর্ম পূরণের বাইরে অন্য কোথাও কখনো শেয়ার করা হয় না।'
          },
          {
            question: 'কোনো কারণে আবেদন ব্যর্থ হলে কি টাকা ফেরত পাব?',
            answer: 'অবশ্যই। কোনো কারণে যদি অফিশিয়াল সার্ভার জটিলতায় আবেদন সম্পন্ন না হতে পারে, তবে আপনার মূল ফি এবং টিম চার্জ সম্পূর্ণ বিনা প্রশ্নে আপনার বিকাশ/নগদে অথবা ওয়ালেটে রিফান্ড করে দেওয়া হয়।'
          }
        ]
      },
      style: {
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        paddingY: 'md',
        textAlign: 'left'
      },
      isVisible: true
    }
  ]
};

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Successfully synchronized real live data into local_store.json!');

