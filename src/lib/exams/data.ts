import { AdmitCardItem, ExamNoticeItem, VivaNoticeItem, ExamResultItem } from './types';

export const initialAdmitCards: AdmitCardItem[] = [
  {
    id: 'admit-bpsc-46th',
    title: '৪৬তম বিসিএস লিখিত পরীক্ষা ২০২৬ প্রবেশপত্র',
    organization: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)',
    category: 'govt',
    categoryLabel: 'বিসিএস ও সরকারি',
    postsCount: 3140,
    portalUrl: 'http://bpsc.teletalk.com.bd',
    portalName: 'bpsc.teletalk.com.bd',
    teletalkPrefix: 'BPSC',
    status: 'active',
    statusLabel: 'ডাউনলোড চলছে',
    examDate: '২৮ নভেম্বর ২০২৬',
    deadlineText: '২৭ নভেম্বর রাত ১১:৫৯ পর্যন্ত',
    instructions: 'রঙিন প্রিন্ট কপি বাধ্যতামূলক। পরীক্ষার হলে ক্যালকুলেটর বা ইলেকট্রনিক ডিভাইস বহন সম্পূর্ণ নিষিদ্ধ।'
  },
  {
    id: 'admit-bb-ad-2026',
    title: 'সহকারী পরিচালক (জেনারেল) প্রিলিমিনারি পরীক্ষা এডমিট কার্ড',
    organization: 'বাংলাদেশ ব্যাংক (Bangladesh Bank)',
    category: 'bank',
    categoryLabel: 'ব্যাংক ও আর্থিক',
    postsCount: 225,
    portalUrl: 'https://erecruitment.bb.org.bd',
    portalName: 'erecruitment.bb.org.bd',
    teletalkPrefix: 'BB',
    status: 'active',
    statusLabel: 'ডাউনলোড চলছে',
    examDate: '২১ নভেম্বর ২০২৬',
    deadlineText: '২০ নভেম্বর পর্যন্ত',
    instructions: 'বাংলাদেশ ব্যাংক ই-রিক্রুটমেন্টে Tracking ID ও Password দিয়ে এডমিট কার্ড সংগ্রহ করতে হবে।'
  },
  {
    id: 'admit-dpe-teacher-3rd',
    title: 'সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ ৩য় ধাপ প্রবেশপত্র',
    organization: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)',
    category: 'teacher',
    categoryLabel: 'শিক্ষক নিয়োগ',
    postsCount: 6531,
    portalUrl: 'http://dpe.teletalk.com.bd',
    portalName: 'dpe.teletalk.com.bd',
    teletalkPrefix: 'DPE',
    status: 'active',
    statusLabel: 'ডাউনলোড চলছে',
    examDate: '২৯ নভেম্বর ২০২৬',
    deadlineText: '২৮ নভেম্বর পর্যন্ত',
    instructions: 'ইউজার আইডি ও পাসওয়ার্ড দিয়ে রঙিন এডমিট কার্ড ডাউনলোড করে প্রিন্ট রাখতে হবে।'
  },
  {
    id: 'admit-bfri-ad-15178',
    title: 'সহকারী পরিচালক (সাধারণ) ও বৈজ্ঞানিক কর্মকর্তা এডমিট কার্ড',
    organization: 'বাংলাদেশ মৎস্য গবেষণা ইনস্টিটিউট (BFRI)',
    category: 'autonomous',
    categoryLabel: 'স্বায়ত্তশাসিত',
    postsCount: 28,
    portalUrl: 'http://fri.teletalk.com.bd',
    portalName: 'fri.teletalk.com.bd',
    teletalkPrefix: 'FRI',
    status: 'active',
    statusLabel: 'ডাউনলোড চলছে',
    examDate: '৩০ নভেম্বর ২০২৬',
    deadlineText: '২৯ নভেম্বর পর্যন্ত',
    instructions: 'টেলিটক পোর্টালে ইউজার আইডি দিয়ে রঙিন প্রবেশপত্র সংগ্রহ করুন।'
  },
  {
    id: 'admit-sonali-senior-off',
    title: 'সোনালী ব্যাংক সিনিয়র অফিসার লিখিত পরীক্ষার প্রবেশপত্র',
    organization: 'ব্যাংকার্স সিলেকশন কমিটি (BSCS)',
    category: 'bank',
    categoryLabel: 'ব্যাংক ও আর্থিক',
    postsCount: 450,
    portalUrl: 'https://erecruitment.bb.org.bd',
    portalName: 'erecruitment.bb.org.bd',
    teletalkPrefix: 'BSCS',
    status: 'upcoming',
    statusLabel: 'শীঘ্রই প্রকাশ পাবে',
    examDate: '০৫ ডিসেম্বর ২০২৬',
    deadlineText: '১৮ নভেম্বর থেকে ডাউনলোড শুরু',
    instructions: 'অনলাইনে রোল নম্বর ও ট্র্যাকিং আইডি প্রস্তুত রাখুন।'
  },
  {
    id: 'admit-railway-asm-2026',
    title: 'সহকারী স্টেশন মাস্টার (ASM) পদের লিখিত পরীক্ষা প্রবেশপত্র',
    organization: 'বাংলাদেশ রেলওয়ে (Bangladesh Railway)',
    category: 'railway',
    categoryLabel: 'রেলওয়ে ও পরিবহন',
    postsCount: 235,
    portalUrl: 'http://br.teletalk.com.bd',
    portalName: 'br.teletalk.com.bd',
    teletalkPrefix: 'BR',
    status: 'active',
    statusLabel: 'ডাউনলোড চলছে',
    examDate: '০৬ ডিসেম্বর ২০২৬',
    deadlineText: '০৫ ডিসেম্বর পর্যন্ত',
    instructions: 'পরীক্ষা শুরুর ন্যূনতম ১ ঘণ্টা পূর্বে নির্ধারিত পরীক্ষা কেন্দ্রে উপস্থিত হতে হবে।'
  }
];

export const initialExamNotices: ExamNoticeItem[] = [
  {
    id: 'notice-bpsc-46th-written',
    title: '৪৬তম বিসিএস পরীক্ষা-২০২৬ এর লিখিত পরীক্ষার রুটিন ও আসনবিন্যাস',
    organization: 'বাংলাদেশ সরকারি কর্ম কমিশন সচিবালয়',
    type: 'written',
    typeLabel: 'লিখিত পরীক্ষা',
    badge: 'জরুরি',
    examDate: '২৮ নভেম্বর - ০৪ ডিসেম্বর ২০২৬',
    examTime: 'প্রতিদিন সকাল ১০:০০ টা - দুপুর ১:০০ টা',
    centersCount: 'ঢাকা ও ৭টি বিভাগীয় শহরের কেন্দ্রসমূহ',
    totalCandidates: '২২,০০০ জন পরীক্ষার্থী',
    pdfUrl: 'https://bpsc.portal.gov.bd/sites/default/files/files/bpsc.portal.gov.bd/notices/46th_bcs_written_schedule.pdf',
    seatPlanSummary: [
      { centerName: 'ঢাকা কলেজ, মিরপুর রোড', rollRange: '১০০০০১ হতে ১০২৫০০', totalSeats: 2500, address: 'ধানমন্ডি, ঢাকা' },
      { centerName: 'ইডেন মহিলা কলেজ', rollRange: '১০২৫০১ হতে ১০৫০০০', totalSeats: 2500, address: 'আজিমপুর, ঢাকা' },
      { centerName: 'সরকারি তিতুমীর কলেজ', rollRange: '১০৫০০১ হতে ১০৭৫০০', totalSeats: 2500, address: 'মহাখালী, ঢাকা' },
      { centerName: 'চট্টগ্রাম কলেজ', rollRange: '১০৭৫০১ হতে ১১০০০০', totalSeats: 2500, address: 'চকবাজার, চট্টগ্রাম' }
    ],
    instructions: [
      'পরীক্ষার হলে কোনো প্রকার বই-পুস্তক, হাতঘড়ি, ক্যালকুলেটর বা ব্যাগ আনা নিষিদ্ধ।',
      'পরীক্ষা শুরুর ৩০ মিনিট পূর্বে নির্ধারিত আসনে বসতে হবে।',
      'প্রবেশপত্রের ছবি ও স্বাক্ষরের সাথে মূল হাজিরা শিটের মিল থাকা আবশ্যক।'
    ]
  },
  {
    id: 'notice-bb-ad-preli',
    title: 'সহকারী পরিচালক (জেনারেল) পদের প্রিলিমিনারি পরীক্ষার তারিখ ও সময় ঘোষণা',
    organization: 'বাংলাদেশ ব্যাংক ব্যাংকার্স সিলেকশন কমিটি',
    type: 'preliminary',
    typeLabel: 'MCQ পরীক্ষা',
    badge: 'নতুন',
    examDate: '২১ নভেম্বর ২০২৬ (শুক্রবার)',
    examTime: 'বিকাল ০৩:৩০ টা হতে ০৪:৩০ টা (১ ঘণ্টা)',
    centersCount: 'ঢাকার ২০টি শিক্ষা প্রতিষ্ঠানে',
    totalCandidates: '১,১৫,০০০ জন',
    pdfUrl: 'https://erecruitment.bb.org.bd/notices/ad_general_preli_schedule.pdf',
    seatPlanSummary: [
      { centerName: 'মতিঝিল সরকারি বালক উচ্চ বিদ্যালয়', rollRange: '২০০০০১ হতে ২০৩০০০', totalSeats: 3000, address: 'মতিঝিল, ঢাকা' },
      { centerName: 'আইডিয়াল স্কুল অ্যান্ড কলেজ', rollRange: '২০৩০০১ হতে ২০৬০০০', totalSeats: 3000, address: 'মতিঝিল, ঢাকা' },
      { centerName: 'ভিকারুননিসা নূন স্কুল অ্যান্ড কলেজ', rollRange: '২০৬০০১ হতে ২০৯০০০', totalSeats: 3000, address: 'বেইলি রোড, ঢাকা' }
    ],
    instructions: [
      '১০০ নম্বরের এমসিকিউ পরীক্ষায় প্রতিটি ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা যাবে।',
      'প্রবেশপত্রের দুটি রঙিন কপি সঙ্গে আনতে হবে।'
    ]
  },
  {
    id: 'notice-dpe-seatplan',
    title: 'প্রাথমিক সহকারী শিক্ষক নিয়োগ ৩য় ধাপের পরীক্ষা ও আসনবন্টন সংক্রান্ত নোটিশ',
    organization: 'প্রাথমিক ও গণশিক্ষা মন্ত্রণালয় (DPE)',
    type: 'seat_plan',
    typeLabel: 'আসনবিন্যাস',
    badge: 'সক্রিয়',
    examDate: '২৯ নভেম্বর ২০২৬ (শুক্রবার)',
    examTime: 'সকাল ১০:০০ টা হতে ১১:০০ টা',
    centersCount: 'ঢাকা ও চট্টগ্রাম বিভাগের সকল জেলা',
    totalCandidates: '৩,৫০,০০০ জন',
    pdfUrl: 'https://dpe.portal.gov.bd/sites/default/files/files/dpe.portal.gov.bd/notices/primary_3rd_seatplan.pdf',
    seatPlanSummary: [
      { centerName: 'জেলা ভিত্তিক সরকারি উচ্চ বিদ্যালয়সমূহ', rollRange: 'নিজ জেলা রোল অনুযায়ী', totalSeats: 350000, address: 'সংশ্লিষ্ট জেলা শহর' }
    ],
    instructions: [
      'কালো কালির বলপেন ছাড়া অন্য কোনো কলম ব্যবহার করা যাবে না।',
      'ওএমআর শিটের রোল ও প্রশ্ন সেট কোড সঠিকভাবে বৃত্ত ভরাট করতে হবে।'
    ]
  },
  {
    id: 'notice-railway-practical',
    title: 'বাংলাদেশ রেলওয়ের ডাটা এন্ট্রি অপারেটর ও স্টেনোগ্রাফার পদের ব্যবহারিক পরীক্ষা',
    organization: 'বাংলাদেশ রেলওয়ে পশ্চিমাঞ্চল',
    type: 'practical',
    typeLabel: 'ব্যবহারিক পরীক্ষা',
    badge: 'সংশোধিত',
    examDate: '০২ ডিসেম্বর ২০২৬',
    examTime: 'সকাল ৯:০০ টা হতে পর্যায়ক্রমে',
    centersCount: 'কম্পিউটার ল্যাব, রেলওয়ে প্রধান কার্যালয়',
    totalCandidates: '১,২০০ জন',
    pdfUrl: 'https://railway.portal.gov.bd/notices/data_entry_practical_routine.pdf',
    instructions: [
      'টাইপিং স্পিড পরীক্ষায় বাংলায় প্রতি মিনিটে ন্যূনতম ২০ এবং ইংরেজিতে ২৮ শব্দ নিশ্চিত করতে হবে।',
      'মূল প্রবেশপত্র ও পরিচয়পত্র উপস্থাপন বাধ্যতামূলক।'
    ]
  }
];

export const initialVivaNotices: VivaNoticeItem[] = [
  {
    id: 'viva-bb-cash-officer',
    title: 'বাংলাদেশ ব্যাংক অফিসার (ক্যাশ) পদের মৌখিক পরীক্ষার সময়সূচি ২০২৬',
    organization: 'বাংলাদেশ ব্যাংক',
    department: 'হিউম্যান রিসোর্সেস ডিপার্টমেন্ট',
    postsCount: 180,
    startDate: '১৬ নভেম্বর ২০২৬',
    endDate: '২৫ নভেম্বর ২০২৬',
    reportingTime: 'সকাল ০৯:০০ টা ও দুপুর ০১:৩০ টা',
    venue: 'বাংলাদেশ ব্যাংক প্রধান কার্যালয়, মতিঝিল, ঢাকা',
    pdfUrl: 'https://erecruitment.bb.org.bd/notices/cash_officer_viva_schedule.pdf',
    boardSchedules: [
      { boardNo: 'বোর্ড নং ১ (১০১ নং কক্ষ)', date: '১৬ নভেম্বর ২০২৬', time: 'সকাল ০৯:৩০ টা', rollRange: '১০০০০১ হতে ১০০১৫০', candidatesCount: 150 },
      { boardNo: 'বোর্ড নং ২ (১০২ নং কক্ষ)', date: '১৬ নভেম্বর ২০২৬', time: 'সকাল ০৯:৩০ টা', rollRange: '১০০১৫১ হতে ১০০৩০০', candidatesCount: 150 },
      { boardNo: 'বোর্ড নং ১ (১০১ নং কক্ষ)', date: '১৭ নভেম্বর ২০২৬', time: 'সকাল ০৯:৩০ টা', rollRange: '১০০৩০১ হতে ১০০৪৫০', candidatesCount: 150 },
      { boardNo: 'বোর্ড নং ২ (১০২ নং কক্ষ)', date: '১৭ নভেম্বর ২০২৬', time: 'সকাল ০৯:৩০ টা', rollRange: '১০০৪৫১ হতে ১০০৬০০', candidatesCount: 150 }
    ],
    requiredDocuments: [
      'অনলাইনে দাখিলকৃত আবেদনপত্রের প্রিন্ট কপি (Applicant Copy)।',
      'এসএসসি, এইচএসসি ও স্নাতক পর্যায়ের সকল মূল সনদপত্র ও একাডেমিক মার্কশিট।',
      'প্রথম শ্রেণির গেজেটেড কর্মকর্তা কর্তৃক প্রদত্ত চারিত্রিক সনদপত্র।',
      'জাতীয় পরিচয়পত্র (NID) স্মার্ট কার্ডের মূল কপি ও ১ সেট সত্যায়িত ফটোকপি।',
      'সদ্য তোলা ৩ কপি পাসপোর্ট সাইজের সত্যায়িত রঙিন ছবি।'
    ]
  },
  {
    id: 'viva-bpsc-non-cadre',
    title: '১০ম ও ৯ম গ্রেডের বিভিন্ন নন-ক্যাডার পদের মৌখিক পরীক্ষার তারিখ ও বোর্ড শিডিউল',
    organization: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)',
    department: 'নন-ক্যাডার উইং',
    postsCount: 520,
    startDate: '২০ নভেম্বর ২০২৬',
    endDate: '০৫ ডিসেম্বর ২০২৬',
    reportingTime: 'সকাল ০৯:০০ টা',
    venue: 'বিপিএসসি সচিবালয়, আগারগাঁও, শেরেবাংলা নগর, ঢাকা-১২০৭',
    pdfUrl: 'https://bpsc.portal.gov.bd/sites/default/files/files/bpsc.portal.gov.bd/notices/non_cadre_viva_dates.pdf',
    boardSchedules: [
      { boardNo: 'বোর্ড ৩ (৪র্থ তলা)', date: '২০ নভেম্বর ২০২৬', time: 'সকাল ১০:০০ টা', rollRange: '২০০০০১ হতে ২০০০৮০', candidatesCount: 80 },
      { boardNo: 'বোর্ড ৪ (৪র্থ তলা)', date: '২০ নভেম্বর ২০২৬', time: 'সকাল ১০:০০ টা', rollRange: '২০০০৮১ হতে ২০০১৬০', candidatesCount: 80 },
      { boardNo: 'বোর্ড ৫ (৫ম তলা)', date: '২১ নভেম্বর ২০২৬', time: 'সকাল ১০:০০ টা', rollRange: '২০০১৬১ হতে ২০০২৪০', candidatesCount: 80 }
    ],
    requiredDocuments: [
      'বিপিএসসি ফর্ম-৩ (BPSC Form-3) এর পূরণকৃত তিন সেট কপি।',
      'শিক্ষাগত যোগ্যতার মূল সনদ ও গ্রেড পয়েন্ট সার্টিফিকেট।',
      'কোটা সনদপত্র (মুক্তিযোদ্ধা, ক্ষুদ্র নৃ-গোষ্ঠী বা প্রতিবন্ধী কোটা প্রযোজ্য ক্ষেত্রে)।',
      'বর্তমান চাকুরিরত প্রার্থীদের ক্ষেত্রে যথাযথ কর্তৃপক্ষের অনাপত্তি ছাড়পত্র (NOC)।'
    ]
  },
  {
    id: 'viva-dgfp-fwa',
    title: 'পরিবার কল্যাণ সহকারী (FWA) পদের চূড়ান্ত মৌখিক পরীক্ষার সময়সূচি',
    organization: 'পরিবার পরিকল্পনা অধিদপ্তর (DGFP)',
    department: 'প্রশাসন শাখা',
    postsCount: 320,
    startDate: '২২ নভেম্বর ২০২৬',
    endDate: '২৮ নভেম্বর ২০২৬',
    reportingTime: 'সকাল ০৯:৩০ টা',
    venue: 'জেলা পরিবার পরিকল্পনা কার্যালয় (নিজ জেলা)',
    pdfUrl: 'https://dgfp.portal.gov.bd/notices/fwa_viva_schedule.pdf',
    boardSchedules: [
      { boardNo: 'জেলা ভাইভা বোর্ড', date: '২২ নভেম্বর ২০২৬', time: 'সকাল ১০:০০ টা', rollRange: '৩০০০০১ হতে ৩০০১০০', candidatesCount: 100 },
      { boardNo: 'জেলা ভাইভা বোর্ড', date: '২৩ নভেম্বর ২০২৬', time: 'সকাল ১০:০০ টা', rollRange: '৩০০১০১ হতে ৩০০২০০', candidatesCount: 100 }
    ],
    requiredDocuments: [
      'প্রবেশপত্র ও প্রার্থীর মূল আবেদন কপি।',
      'এসএসসি বা সমমান পাসের মূল সনদপত্র।',
      'স্থানীয় চেয়ারম্যান/মেয়র কর্তৃক নাগরিকত্ব ও স্থায়ী বাসিন্দা সনদ।',
      'বিবাহিত নারী প্রার্থীদের ক্ষেত্রে স্বামীর স্থায়ী ঠিকানার প্রত্যয়নপত্র।'
    ]
  }
];

export const initialExamResults: ExamResultItem[] = [
  {
    id: 'result-bpsc-45th-written',
    title: '৪৫তম বিসিএস পরীক্ষার লিখিত পরীক্ষার ফলাফল ও উত্তীর্ণদের তালিকা',
    organization: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)',
    type: 'written',
    typeLabel: 'লিখিত ফলাফল',
    publishedDate: '০৬ নভেম্বর ২০২৬',
    passedCount: 12709,
    totalAppeared: 45200,
    pdfUrl: 'https://bpsc.portal.gov.bd/sites/default/files/files/bpsc.portal.gov.bd/results/45th_bcs_written_results.pdf',
    nextStepNotice: 'উত্তীর্ণ প্রার্থীদের মৌখিক পরীক্ষা (ভাইভা) আগামী জানুয়ারি ২০২৭ থেকে শুরু হবে। বিস্তারিত শিডিউল শীঘ্রই প্রকাশ করা হবে।',
    passedRolls: [
      '101234', '101239', '101245', '101258', '101260',
      '102340', '102345', '102350', '102362', '102380',
      '103401', '103415', '103422', '103433', '103450',
      '104112', '104119', '104128', '104135', '104140',
      '105200', '105215', '105220', '105234', '105249'
    ]
  },
  {
    id: 'result-bb-cash-preli',
    title: 'বাংলাদেশ ব্যাংক অফিসার (ক্যাশ) প্রিলিমিনারি পরীক্ষার ফলাফল',
    organization: 'বাংলাদেশ ব্যাংক',
    type: 'preliminary',
    typeLabel: 'প্রিলিমিনারি ফলাফল',
    publishedDate: '০৪ নভেম্বর ২০২৬',
    passedCount: 5420,
    totalAppeared: 82000,
    pdfUrl: 'https://erecruitment.bb.org.bd/results/cash_officer_preli_results.pdf',
    nextStepNotice: 'লিখিত পরীক্ষা আগামী ২০ ডিসেম্বর ২০২৬ অনুষ্ঠিত হবে। প্রবেশপত্র বাংলাদেশ ব্যাংক ওয়েবসাইট থেকে ডাউনলোড করা যাবে।',
    passedRolls: [
      '201010', '201025', '201040', '201055', '201088',
      '202100', '202115', '202130', '202145', '202180',
      '203200', '203210', '203225', '203240', '203280',
      '204300', '204315', '204330', '204345', '204390'
    ]
  },
  {
    id: 'result-dpe-teacher-final',
    title: 'সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ ২য় ধাপের চূড়ান্ত ফলাফল ও সুপারিশ',
    organization: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)',
    type: 'final',
    typeLabel: 'চূড়ান্ত ফলাফল',
    publishedDate: '০১ নভেম্বর ২০২৬',
    passedCount: 4160,
    totalAppeared: 28000,
    pdfUrl: 'https://dpe.portal.gov.bd/sites/default/files/files/dpe.portal.gov.bd/results/primary_2nd_phase_final.pdf',
    nextStepNotice: 'নির্বাচিত প্রার্থীদের আগামী ১৫ নভেম্বর ২০২৬ এর মধ্যে নিজ জেলা প্রাথমিক শিক্ষা অফিসে স্বাস্থ্য পরীক্ষা ও পুলিশ ভেরিফিকেশন ফর্ম জমা দিতে হবে।',
    passedRolls: [
      '301100', '301120', '301135', '301140', '301155',
      '302200', '302210', '302225', '302240', '302250',
      '303300', '303315', '303330', '303345', '303360'
    ]
  },
  {
    id: 'result-railway-asm-written',
    title: 'সহকারী স্টেশন মাস্টার (ASM) পদের লিখিত পরীক্ষার ফলাফল ও মৌখিক পরীক্ষার তারিখ',
    organization: 'বাংলাদেশ রেলওয়ে রিক্রুটমেন্ট',
    type: 'written',
    typeLabel: 'লিখিত ফলাফল',
    publishedDate: '২৯ অক্টোবর ২০২৬',
    passedCount: 850,
    totalAppeared: 12400,
    pdfUrl: 'https://railway.portal.gov.bd/results/asm_written_qualified_list.pdf',
    nextStepNotice: 'মৌখিক পরীক্ষা আগামী ১৮ নভেম্বর হতে রেল ভবন, ঢাকায় শুরু হবে।',
    passedRolls: [
      '401011', '401022', '401033', '401044', '401055',
      '402011', '402022', '402033', '402044', '402055'
    ]
  }
];

