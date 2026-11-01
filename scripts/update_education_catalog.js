const fs = require("fs");
const path = require("path");

// 1. Update types.ts
const typesPath = path.join(__dirname, "../src/lib/education/types.ts");
let typesSrc = fs.readFileSync(typesPath, "utf8");

typesSrc = typesSrc.replace(
  `export type EducationLevelCategory =
  | 'secondary'`,
  `export type EducationLevelCategory =
  | 'junior_secondary'
  | 'secondary'`
);
fs.writeFileSync(typesPath, typesSrc, "utf8");
console.log("Updated types.ts EducationLevelCategory");

// 2. Update catalog.ts
const catalogPath = path.join(__dirname, "../src/lib/education/catalog.ts");
let catSrc = fs.readFileSync(catalogPath, "utf8");

// Add junior_secondary to BD_EDUCATION_LEVELS
catSrc = catSrc.replace(
  `export const BD_EDUCATION_LEVELS: Array<{
  category: EducationLevelCategory;
  nameBn: string;
  nameEn: string;
  rank: number;
}> = [`,
  `export const BD_EDUCATION_LEVELS: Array<{
  category: EducationLevelCategory;
  nameBn: string;
  nameEn: string;
  rank: number;
}> = [
  { category: 'junior_secondary', nameBn: 'জুনিয়র স্কুল সার্টিফিকেট (JSC / JDC / অষ্টম শ্রেণি)', nameEn: 'Junior Secondary (JSC / JDC)', rank: 1 },`
);

// Add JSC and JDC to BD_DEGREE_PROGRAMS
const jscPrograms = `export const BD_DEGREE_PROGRAMS: DegreeProgramDefinition[] = [
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
  },`;

catSrc = catSrc.replace(
  `export const BD_DEGREE_PROGRAMS: DegreeProgramDefinition[] = [`,
  jscPrograms
);

// Add diploma in medical & nursing
const newDiplomas = `    availableDisciplines: [
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
  },`;

catSrc = catSrc.replace(
  `    availableDisciplines: [
      'কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি',
      'সিভিল ইঞ্জিনিয়ারিং',
      'ইলেকট্রিক্যাল ইঞ্জিনিয়ারিং',
      'মেকানিক্যাল ইঞ্জিনিয়ারিং',
      'ইলেকট্রনিক্স ইঞ্জিনিয়ারিং',
      'টেলিকমিউনিকেশন',
      'পাওয়ার ইঞ্জিনিয়ারিং',
      'আর্কিটেকচার'
    ]
  },`,
  newDiplomas
);

// Add Kamil to postgraduate
const kamilProgram = `  {
    code: 'kamil',
    levelCategory: 'postgraduate',
    name: 'Kamil (Postgraduate / Islamic Arabic University)',
    nameBn: 'কামিল (মাস্টার্স সমমান / ইসলামী আরবি বিশ্ববিদ্যালয়)',
    defaultScale: 4.00,
    standardDurationYears: 2,
    availableDisciplines: ['হাদিস (Hadith)', 'তাফসির (Tafsir)', 'ফিকহ (Fiqh)', 'আদব (Adab)']
  },`;

catSrc = catSrc.replace(
  `  {
    code: 'masters_regular',`,
  `${kamilProgram}\n  {\n    code: 'masters_regular',`
);

// Update resolveLevelCategory to handle JSC/JDC
catSrc = catSrc.replace(
  `    if (lower.includes('এসএসসি') || lower.includes('ssc') || lower.includes('দাখিল') || lower.includes('dakhil') || lower.includes('o-level')) {
      return 'secondary';
    }`,
  `    if (lower.includes('জেএসসি') || lower.includes('jsc') || lower.includes('জেডিসি') || lower.includes('jdc') || lower.includes('অষ্টম')) {
      return 'junior_secondary';
    }
    if (lower.includes('এসএসসি') || lower.includes('ssc') || lower.includes('দাখিল') || lower.includes('dakhil') || lower.includes('o-level')) {
      return 'secondary';
    }`
);

fs.writeFileSync(catalogPath, catSrc, "utf8");
console.log("Updated catalog.ts with JSC, JDC, Medical/Nursing Diplomas, and Kamil");