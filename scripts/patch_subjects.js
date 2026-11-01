const fs = require('fs');

// Patch normalizer.ts extractSubjects
let normContent = fs.readFileSync('src/lib/matching/normalizer.ts', 'utf8');

const oldExtractSubjectsRegex = /public static extractSubjects\(text: string\): string\[\] \{[\s\S]*?return Array\.from\(new Set\(subjects\)\);\s*\}/;

const newExtractSubjects = `public static extractSubjects(text: string): string[] {
    const subjects: string[] = [];
    const lower = text.toLowerCase();

    // If circular explicitly allows any subject ("যেকোনো বিষয়ে" / "any discipline")
    if (lower.includes('যেকোনো বিষয়') || lower.includes('যে কোন বিষয়') || lower.includes('যেকোনো ডিসিপ্লিন') || lower.includes('any discipline') || lower.includes('any subject')) {
      return [];
    }

    const subjectEntries: [string[], string][] = [
      [['cse', 'সিএসই', 'কম্পিউটার সায়েন্স', 'computer science'], 'Computer Science & Engineering'],
      [['আইসিটি', 'ict', 'তথ্য ও যোগাযোগ প্রযুক্তি'], 'Information & Communication Technology'],
      [['বিজ্ঞান', 'science', 'বিএসসি'], 'Science'],
      [['বাণিজ্য', 'commerce', 'হিসাববিজ্ঞান', 'ব্যবসা', 'bba', 'business'], 'Business Administration'],
      [['ফাইন্যান্স', 'finance'], 'Finance'],
      [['অর্থনীতি', 'economics'], 'Economics'],
      [['কৃষি', 'agriculture'], 'Agriculture'],
      [['আইন', 'llb', 'll.b', 'law'], 'Law'],
      [['ইংরেজি সাহিত্য', 'ইংরেজি বিষয়ে', 'english literature'], 'English'],
      [['বাংলা সাহিত্য', 'বাংলা বিষয়ে', 'bengali literature'], 'Bengali'],
      [['পরিসংখ্যান', 'statistics'], 'Statistics'],
      [['গণিত', 'mathematics'], 'Mathematics'],
      [['তড়িৎ', 'ইলেকট্রিক্যাল', 'eee', 'electrical'], 'Electrical Engineering'],
      [['সিভিল', 'civil engineering'], 'Civil Engineering'],
      [['যান্ত্রিক', 'মেকানিক্যাল', 'mechanical engineering'], 'Mechanical Engineering'],
      [['এমবিবিএস', 'mbbs', 'বিডিএস', 'bds', 'চিকিৎসা'], 'Medical / MBBS']
    ];

    for (const [keywords, label] of subjectEntries) {
      if (keywords.some(kw => lower.includes(kw))) {
        subjects.push(label);
      }
    }
    return Array.from(new Set(subjects));
  }`;

normContent = normContent.replace(oldExtractSubjectsRegex, newExtractSubjects);
fs.writeFileSync('src/lib/matching/normalizer.ts', normContent, 'utf8');
console.log('✅ Updated extractSubjects in normalizer.ts');
