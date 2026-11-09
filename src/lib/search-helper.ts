/**
 * Smart Search Helper for Chakri Sheba
 * Provides robust bilingual (Bengali <-> English), multi-field, and position-level matching
 */

import { JobCircular } from './types';

const BILINGUAL_MAP: Record<string, string[]> = {
  'জামালপুর': ['jamalpur', 'dcjamalpur'],
  'jamalpur': ['জামালপুর'],
  'রাজবাড়ী': ['rajbari', 'dcrajbari'],
  'rajbari': ['রাজবাড়ী'],
  'ঝিনাইদহ': ['jhenaidah', 'dcjhenaidah'],
  'jhenaidah': ['ঝিনাইদহ'],
  'নড়াইল': ['narail', 'dcnarail'],
  'narail': ['নড়াইল'],
  'নারায়ণগঞ্জ': ['narayanganj'],
  'narayanganj': ['নারায়ণগঞ্জ'],
  'চুয়াডাঙ্গা': ['chuadanga', 'dcchuadanga'],
  'chuadanga': ['চুয়াডাঙ্গা'],
  'শেরপুর': ['sherpur', 'dcsherpur', 'sposherpur'],
  'sherpur': ['শেরপুর'],
  'নোয়াখালী': ['noakhali', 'dcnoakhali'],
  'noakhali': ['নোয়াখালী'],
  'দিনাজপুর': ['dinajpur', 'policedinaj'],
  'dinajpur': ['দিনাজপুর'],
  'বগুড়া': ['bogura', 'bogra', 'dcbogura'],
  'bogura': ['বগুড়া'],
  'পটুয়াখালী': ['patuakhali', 'dcpatuakhali'],
  'patuakhali': ['পটুয়াখালী'],
  'নেত্রকোণা': ['netrokona', 'dcnetrokona'],
  'netrokona': ['নেত্রকোণা'],
  'কুমিল্লা': ['cumilla', 'comilla', 'tzc'],
  'cumilla': ['কুমিল্লা'],
  'রাজশাহী': ['rajshahi', 'csrajshahi'],
  'rajshahi': ['রাজশাহী'],
  'চট্টগ্রাম': ['chattogram', 'chittagong', 'tz3ctg'],
  'ঢাকা': ['dhaka', 'dscc', 'dncc', 'tax9', 'tax6', 'tax19', 'tax21'],
  'dhaka': ['ঢাকা'],
  'পেট্রোবাংলা': ['petrobangla', 'bogmc'],
  'petrobangla': ['পেট্রোবাংলা', 'bogmc'],
  'আশুগঞ্জ': ['ashuganj', 'apscl'],
  'ashuganj': ['আশুগঞ্জ', 'apscl'],
  'বিদ্যুৎ': ['power', 'cpgcbl', 'apscl'],
  'power': ['বিদ্যুৎ', 'ইলেকট্রিক'],
  'ট্যাক্স': ['tax', 'taxes', 'কর'],
  'tax': ['ট্যাক্স', 'কর'],
  'অডিট': ['audit', 'cag'],
  'audit': ['অডিট', 'নিরীক্ষা'],
  'পুলিশ': ['police', 'cid', 'sposherpur', 'policedinaj'],
  'police': ['পুলিশ'],
  'ব্যাংক': ['bank'],
  'bank': ['ব্যাংক'],
  'রেলওয়ে': ['railway', 'রেল'],
  'railway': ['রেলওয়ে', 'রেল'],
  'মেডিকেল': ['medical', 'dgms', 'স্বাস্থ্য', 'হাসপাতাল'],
  'medical': ['মেডিকেল', 'স্বাস্থ্য'],
  'কম্পিউটার': ['computer'],
  'computer': ['কম্পিউটার'],
  'অপারেটর': ['operator'],
  'operator': ['অপারেটর'],
  'সহকারী': ['assistant'],
  'assistant': ['সহকারী'],
  'অফিসার': ['officer'],
  'officer': ['অফিসার'],
  'ইঞ্জিনিয়ার': ['engineer'],
  'engineer': ['ইঞ্জিনিয়ার'],
  'শিক্ষক': ['teacher', 'school', 'college', 'ntrca'],
  'teacher': ['শিক্ষক']
};

// Bengali numeral converters
export const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
export const toEnDigits = (s: string) => String(s || '').replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]);

/**
 * Robust salary range parser supporting all 20 National Pay Grades (BDT 8,250 to BDT 78,000+)
 */
export function parseSalaryRange(salary: string): { min: number; max: number } {
  if (!salary) return { min: 0, max: 0 };
  const en = toEnDigits(salary);
  const nums = en.match(/\d[\d,]*/g);
  if (!nums || nums.length === 0) return { min: 0, max: 0 };
  const cleanNums = nums.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => n >= 5000 && n <= 200000);
  if (cleanNums.length === 0) return { min: 0, max: 0 };
  return { min: cleanNums[0], max: cleanNums[cleanNums.length - 1] };
}

/**
 * Extract numerical grade values from grade strings (e.g. '৯ম - ২০তম গ্রেড' -> [9, 20])
 */
export function extractGradeNums(gradeStr?: string): number[] {
  if (!gradeStr) return [];
  const en = toEnDigits(gradeStr);
  const matches = en.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Robust grade matcher supporting single grades ('৯ম গ্রেড'), range queries ('১১তম - ১৬তম'),
 * and composite circular ranges ('৯ম - ২০তম গ্রেড')
 */
export function matchGradeComprehensive(jobGrade?: string, selectedGrade?: string): boolean {
  if (!selectedGrade || selectedGrade === 'all') return true;
  if (!jobGrade) return false;
  if (jobGrade.includes(selectedGrade)) return true;

  const nums = extractGradeNums(jobGrade);
  if (nums.length === 0) return false;

  const minG = Math.min(...nums);
  const maxG = Math.max(...nums);

  if (selectedGrade === '৯ম গ্রেড') {
    return nums.includes(9) || (minG <= 9 && maxG >= 9);
  }
  if (selectedGrade === '১০ম গ্রেড') {
    return nums.includes(10) || (minG <= 10 && maxG >= 10);
  }
  if (selectedGrade === '১১তম - ১৬তম' || selectedGrade === '১১তম-১৬তম') {
    return nums.some(n => n >= 11 && n <= 16) || (minG <= 16 && maxG >= 11);
  }
  if (selectedGrade === '১৭তম - ২০তম' || selectedGrade === '১৭তম-২০তম') {
    return nums.some(n => n >= 17 && n <= 20) || (minG <= 20 && maxG >= 17);
  }

  // Fallback string matching
  const gradeKey = selectedGrade.replace(' গ্রেড', '').trim();
  return jobGrade.includes(gradeKey);
}

/**
 * Normalizes Bengali Unicode characters to resolve Avro / Bijoy / Gboard character variances
 * (e.g. Nukta + Ja vs Ya, Da + Nukta vs Dda, etc.)
 */
export function normalizeBangla(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFC')
    .replace(/\u09af\u09bc/g, '\u09df') // য় (Letter Ya)
    .replace(/\u09a1\u09bc/g, '\u09dc') // ড় (Letter Rra)
    .replace(/\u09a2\u09bc/g, '\u09dd'); // ঢ় (Letter Rrha)
}

export function matchJobQuery(job: JobCircular, rawQuery: string): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;

  const normalizedQuery = normalizeBangla(rawQuery.toLowerCase().trim());
  const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  // Build a searchable corpus for this job
  const corpusParts: string[] = [
    job.title || '',
    job.organization || '',
    job.categoryLabel || '',
    job.category || '',
    job.districts || '',
    job.minEducation || '',
    job.salary || '',
    job.grade || '',
    job.audioSummary || ''
  ];

  // Include positions
  if (Array.isArray(job.positions)) {
    for (const pos of job.positions) {
      if (pos.title) corpusParts.push(pos.title);
      if (pos.grade) corpusParts.push(pos.grade);
      if (pos.minEducation) corpusParts.push(pos.minEducation);
      if ((pos as any).education) corpusParts.push((pos as any).education);
    }
  }

  // Include requirements
  if (Array.isArray(job.requirements)) {
    corpusParts.push(...job.requirements);
  }

  const fullCorpus = normalizeBangla(corpusParts.join(' ').toLowerCase());

  // Every word term in the query must match (either directly or via bilingual synonyms)
  return searchTerms.every(term => {
    // 1. Direct substring match
    if (fullCorpus.includes(term)) return true;

    // 2. Bilingual / Synonym match
    const rawSynonyms = BILINGUAL_MAP[term] || [];
    const synonyms = rawSynonyms.map(s => normalizeBangla(s));
    for (const syn of synonyms) {
      if (fullCorpus.includes(syn)) return true;
    }

    return false;
  });
}
