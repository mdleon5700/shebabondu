/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 12: BANGLADESH EDUCATION PATHWAYS CATALOG
 * Official Bangladesh Degree Programs, Disciplines, Boards & Standard Scales
 */

import { DegreeProgramDefinition, EducationLevelCategory } from './types';

export const BD_EDUCATION_LEVELS: Array<{
  category: EducationLevelCategory;
  nameBn: string;
  nameEn: string;
  rank: number;
}> = [
  { category: 'junior_secondary', nameBn: 'জুনিয়র স্কুল সার্টিফিকেট (JSC / JDC / অষ্টম শ্রেণি)', nameEn: 'Junior Secondary (JSC / JDC)', rank: 1 },
  { category: 'secondary', nameBn: 'মাধ্যমিক (SSC / সমমান)', nameEn: 'Secondary (SSC / Equivalent)', rank: 2 },
  { category: 'higher_secondary', nameBn: 'উচ্চ মাধ্যমিক (HSC / সমমান)', nameEn: 'Higher Secondary (HSC / Equivalent)', rank: 3 },
  { category: 'diploma', nameBn: 'ডিপ্লোমা (পলিটেকনিক / কারিগরি)', nameEn: 'Diploma in Engineering / Technical', rank: 3.5 },
  { category: 'undergraduate', nameBn: 'স্নাতক (অনার্স / পাস / সমমান)', nameEn: 'Undergraduate (Bachelor / Honours)', rank: 4 },
  { category: 'postgraduate', nameBn: 'স্নাতকোত্তর (মাস্টার্স / সমমান)', nameEn: 'Postgraduate (Master’s / Equivalent)', rank: 5 },
  { category: 'advanced', nameBn: 'উচ্চতর গবেষণা (এমফিল / পিএইচডি)', nameEn: 'Advanced Research (MPhil / PhD)', rank: 6 },
  { category: 'other', nameBn: 'অন্যান্য স্বীকৃত যোগ্যতা', nameEn: 'Other Recognized Qualification', rank: 1 }
];

export const BD_DEGREE_PROGRAMS: DegreeProgramDefinition[] = [
  // 0. Junior School Level
  {
    code: 'jsc',
    levelCategory: 'junior_secondary',
    name: 'Junior School Certificate (JSC)',
    nameBn: 'জুনিয়র স্কুল সার্টিফিকেট (জেএসসি)',
    defaultScale: 5.00,
    standardDurationYears: 8,
    availableDisciplines: ['সাধারণ (General)']
  },
  {
    code: 'jdc',
    levelCategory: 'junior_secondary',
    name: 'Junior Dakhil Certificate (JDC)',
    nameBn: 'জুনিয়র দাখিল সার্টিফিকেট (জেডিসি)',
    defaultScale: 5.00,
    standardDurationYears: 8,
    availableDisciplines: ['মাদ্রাসা সাধারণ (Madrasah General)']
  },
  // 1. Secondary Level
  {
    code: 'ssc',
    levelCategory: 'secondary',
    name: 'Secondary School Certificate (SSC)',
    nameBn: 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি)',
    defaultScale: 5.00,
    standardDurationYears: 10,
    availableDisciplines: ['বিজ্ঞান (Science)', 'ব্যবসায় শিক্ষা (Commerce)', 'মানবিক (Humanities)', 'সাধারণ (General)']
  },
  {
    code: 'dakhil',
    levelCategory: 'secondary',
    name: 'Dakhil (Madrasah Education Board)',
    nameBn: 'দাখিল (মাদ্রাসা শিক্ষা বোর্ড)',
    defaultScale: 5.00,
    standardDurationYears: 10,
    availableDisciplines: ['সাধারণ (General)', 'বিজ্ঞান (Science)', 'মুজাব্বিদ (Mujabbid)']
  },
  {
    code: 'ssc_vocational',
    levelCategory: 'secondary',
    name: 'SSC Vocational (Technical Education Board)',
    nameBn: 'এসএসসি ভোকেশনাল (কারিগরি শিক্ষা বোর্ড)',
    defaultScale: 5.00,
    standardDurationYears: 10,
    availableDisciplines: ['কম্পিউটার ও আইটি', 'ইলেকট্রিক্যাল', 'মেকানিক্যাল', 'সিভিল কনস্ট্রাকশন', 'অটোমোবাইল']
  },
  {
    code: 'o_level',
    levelCategory: 'secondary',
    name: 'O-Level / Cambridge / Edexcel',
    nameBn: 'ও-লেভেল (আন্তর্জাতিক সমমান)',
    defaultScale: 4.00,
    standardDurationYears: 10,
    availableDisciplines: ['Science', 'Commerce', 'Humanities']
  },

  // 2. Higher Secondary Level
  {
    code: 'hsc',
    levelCategory: 'higher_secondary',
    name: 'Higher Secondary Certificate (HSC)',
    nameBn: 'উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি)',
    defaultScale: 5.00,
    standardDurationYears: 2,
    availableDisciplines: ['বিজ্ঞান (Science)', 'ব্যবসায় শিক্ষা (Business Studies)', 'মানবিক (Humanities)']
  },
  {
    code: 'alim',
    levelCategory: 'higher_secondary',
    name: 'Alim (Madrasah Education Board)',
    nameBn: 'আলিম (মাদ্রাসা শিক্ষা বোর্ড)',
    defaultScale: 5.00,
    standardDurationYears: 2,
    availableDisciplines: ['সাধারণ (General)', 'বিজ্ঞান (Science)']
  },
  {
    code: 'hsc_vocational',
    levelCategory: 'higher_secondary',
    name: 'HSC Vocational / BM',
    nameBn: 'এইচএসসি (ভোকেশনাল / বিএম)',
    defaultScale: 5.00,
    standardDurationYears: 2,
    availableDisciplines: ['কম্পিউটার অপারেশন', 'অ্যাকাউন্টিং', 'ফিন্যান্সিয়াল ম্যানেজমেন্ট', 'ইলেক্ট্রনিক্স']
  },
  {
    code: 'a_level',
    levelCategory: 'higher_secondary',
    name: 'A-Level / Cambridge / Edexcel',
    nameBn: 'এ-লেভেল (আন্তর্জাতিক সমমান)',
    defaultScale: 4.00,
    standardDurationYears: 2,
    availableDisciplines: ['Science', 'Commerce', 'Humanities']
  },

  // 3. Diploma Level
  {
    code: 'diploma_engg',
    levelCategory: 'diploma',
    name: 'Diploma in Engineering (BTEB)',
    nameBn: 'ডিপ্লোমা ইন ইঞ্জিনিয়ারিং (কারিগরি বোর্ড)',
    defaultScale: 4.00,
    standardDurationYears: 4,
    availableDisciplines: [
      'কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি',
      'সিভিল ইঞ্জিনিয়ারিং',
      'ইলেকট্রিক্যাল ইঞ্জিনিয়ারিং',
      'মেকানিক্যাল ইঞ্জিনিয়ারিং',
      'ইলেকট্রনিক্স ইঞ্জিনিয়ারিং',
      'টেলিকমিউনিকেশন',
      'পাওয়ার ইঞ্জিনিয়ারিং',
      'আর্কিটেকচার'
    ]
  },
  {
    code: 'diploma_medical',
    levelCategory: 'diploma',
    name: 'Diploma in Medical Technology (State Medical Faculty)',
    nameBn: 'ডিপ্লোমা ইন মেডিকেল টেকনোলজি (ম্যাটস / আইএইচটি)',
    defaultScale: 4.00,
    standardDurationYears: 4,
    availableDisciplines: ['ল্যাবরেটরি মেডিসিন', 'রেডিওলজি ও ইমেজিং', 'ফার্মাসি', 'ফিজিওথেরাপি', 'ডেন্টাল টেকনোলজি']
  },
  {
    code: 'diploma_nursing',
    levelCategory: 'diploma',
    name: 'Diploma in Nursing Science and Midwifery (BNMC)',
    nameBn: 'ডিপ্লোমা ইন নার্সিং সায়েন্স অ্যান্ড মিডওয়াইফারি',
    defaultScale: 4.00,
    standardDurationYears: 3,
    availableDisciplines: ['নার্সিং সায়েন্স', 'মিডওয়াইফারি']
  },

  // 4. Undergraduate Level
  {
    code: 'bachelor_honours',
    levelCategory: 'undergraduate',
    name: 'Bachelor of Science / Arts / Commerce (Honours)',
    nameBn: 'স্নাতক (সম্মান / অনার্স) - ৪ বছর মেয়াদী',
    defaultScale: 4.00,
    standardDurationYears: 4,
    availableDisciplines: [
      'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE)',
      'পদার্থবিজ্ঞান (Physics)',
      'রসায়ন (Chemistry)',
      'গণিত (Mathematics)',
      'অর্থনীতি (Economics)',
      'ইংরেজি (English)',
      'বাংলা (Bangla)',
      'অ্যাকাউন্টিং অ্যান্ড ইনফরমেশন সিস্টেমস',
      'ফিন্যান্স অ্যান্ড ব্যাংকিং',
      'মার্কেটিং',
      'ম্যানেজমেন্ট',
      'আন্তর্জাতিক সম্পর্ক',
      'রাষ্ট্রবিজ্ঞান',
      'সমাজবিজ্ঞান',
      'আইন (LLB Honours)'
    ]
  },
  {
    code: 'bsc_engg',
    levelCategory: 'undergraduate',
    name: 'BSc in Engineering (BUET/CUET/KUET/RUET/Public/Private)',
    nameBn: 'বিএসসি ইন ইঞ্জিনিয়ারিং (৪ বছর মেয়াদী)',
    defaultScale: 4.00,
    standardDurationYears: 4,
    availableDisciplines: ['CSE', 'EEE', 'Civil', 'Mechanical', 'IPE', 'ECE', 'Chemical', 'BME']
  },
  {
    code: 'mbbs_bds',
    levelCategory: 'undergraduate',
    name: 'MBBS / BDS (Medical & Dental)',
    nameBn: 'এমবিবিএস / বিডিএস (মেডিকেল ও ডেন্টাল)',
    defaultScale: 4.00,
    standardDurationYears: 5,
    availableDisciplines: ['মেডিসিন ও সার্জারি (MBBS)', 'ডেন্টাল সার্জারি (BDS)']
  },
  {
    code: 'bachelor_pass',
    levelCategory: 'undergraduate',
    name: 'Degree (Pass Course) - 3 Years',
    nameBn: 'ডিগ্রি (পাস কোর্স) - ৩ বছর মেয়াদী',
    defaultScale: 4.00,
    standardDurationYears: 3,
    availableDisciplines: ['বিএ পাস (BA Pass)', 'বিএসএস পাস (BSS Pass)', 'বিবিএস পাস (BBS Pass)', 'বিএসসি পাস (BSc Pass)']
  },
  {
    code: 'bba',
    levelCategory: 'undergraduate',
    name: 'Bachelor of Business Administration (BBA)',
    nameBn: 'ব্যাচেলর অব বিজনেস অ্যাডমিনিস্ট্রেশন (বিবিএ)',
    defaultScale: 4.00,
    standardDurationYears: 4,
    availableDisciplines: ['Finance', 'Accounting', 'Marketing', 'Management', 'HRM', 'MIS']
  },

  // 5. Postgraduate Level
  {
    code: 'kamil',
    levelCategory: 'postgraduate',
    name: 'Kamil (Postgraduate / Islamic Arabic University)',
    nameBn: 'কামিল (মাস্টার্স সমমান / ইসলামী আরবি বিশ্ববিদ্যালয়)',
    defaultScale: 4.00,
    standardDurationYears: 2,
    availableDisciplines: ['হাদিস (Hadith)', 'তাফসির (Tafsir)', 'ফিকহ (Fiqh)', 'আদব (Adab)']
  },
  {
    code: 'masters_regular',
    levelCategory: 'postgraduate',
    name: 'Master’s Degree (MSc / MA / MSS / MCom / MBA / LLM)',
    nameBn: 'স্নাতকোত্তর (মাস্টার্স / এমএসসি / এমবিএ / এলএলএম)',
    defaultScale: 4.00,
    standardDurationYears: 1,
    availableDisciplines: ['MSc', 'MBA', 'MA', 'MSS', 'MCom', 'LLM', 'MEd', 'EMBA']
  },

  // 6. Advanced Research
  {
    code: 'mphil',
    levelCategory: 'advanced',
    name: 'Master of Philosophy (MPhil)',
    nameBn: 'মাস্টার অব ফিলোসফি (এমফিল)',
    defaultScale: 4.00,
    standardDurationYears: 2,
    availableDisciplines: ['Science', 'Arts', 'Social Sciences', 'Business']
  },
  {
    code: 'phd',
    levelCategory: 'advanced',
    name: 'Doctor of Philosophy (PhD)',
    nameBn: 'ডক্টর অব ফিলোসফি (পিএইচডি)',
    defaultScale: 4.00,
    standardDurationYears: 3,
    availableDisciplines: ['Engineering', 'Sciences', 'Humanities', 'Business', 'Medical']
  }
];

export const BD_EDUCATION_BOARDS = [
  'ঢাকা শিক্ষা বোর্ড (Dhaka)',
  'চট্টগ্রাম শিক্ষা বোর্ড (Chittagong)',
  'রাজশাহী শিক্ষা বোর্ড (Rajshahi)',
  'কুমিল্লা শিক্ষা বোর্ড (Comilla)',
  'যশোর শিক্ষা বোর্ড (Jessore)',
  'বরিশাল শিক্ষা বোর্ড (Barisal)',
  'সিলেট শিক্ষা বোর্ড (Sylhet)',
  'দিনাজপুর শিক্ষা বোর্ড (Dinajpur)',
  'ময়মনসিংহ শিক্ষা বোর্ড (Mymensingh)',
  'মাদ্রাসা শিক্ষা বোর্ড (Madrasah Board)',
  'কারিগরি শিক্ষা বোর্ড (BTEB)',
  'জাতীয় বিশ্ববিদ্যালয় (National University)',
  'উন্মুক্ত বিশ্ববিদ্যালয় (BOU)',
  'পাবলিক বিশ্ববিদ্যালয় (Public University)',
  'বেসরকারি বিশ্ববিদ্যালয় (Private University)',
  'আন্তর্জাতিক বোর্ড / সমমান (Foreign/International)'
];

export class BangladeshEducationCatalog {
  public static getProgramsByLevel(category: EducationLevelCategory): DegreeProgramDefinition[] {
    return BD_DEGREE_PROGRAMS.filter(p => p.levelCategory === category);
  }

  public static getProgramByCode(code: string): DegreeProgramDefinition | undefined {
    return BD_DEGREE_PROGRAMS.find(p => p.code.toLowerCase() === code.toLowerCase());
  }

  public static resolveLevelCategory(text: string): EducationLevelCategory {
    const lower = text.toLowerCase();
    if (lower.includes('phd') || lower.includes('ডক্টরেট') || lower.includes('mphil') || lower.includes('এমফিল')) {
      return 'advanced';
    }
    if (lower.includes('মাস্টার্স') || lower.includes('masters') || lower.includes('msc') || lower.includes('mba') || lower.includes('স্নাতকোত্তর')) {
      return 'postgraduate';
    }
    if (lower.includes('স্নাতক') || lower.includes('অনার্স') || lower.includes('bachelor') || lower.includes('bsc') || lower.includes('ডিগ্রি')) {
      return 'undergraduate';
    }
    if (lower.includes('ডিপ্লোমা') || lower.includes('diploma') || lower.includes('পলিটেকনিক')) {
      return 'diploma';
    }
    if (lower.includes('এইচএসসি') || lower.includes('hsc') || lower.includes('আলিম') || lower.includes('alim') || lower.includes('a-level')) {
      return 'higher_secondary';
    }
    if (lower.includes('জেএসসি') || lower.includes('jsc') || lower.includes('জেডিসি') || lower.includes('jdc') || lower.includes('অষ্টম')) {
      return 'junior_secondary';
    }
    if (lower.includes('এসএসসি') || lower.includes('ssc') || lower.includes('দাখিল') || lower.includes('dakhil') || lower.includes('o-level')) {
      return 'secondary';
    }
    return 'other';
  }
}
