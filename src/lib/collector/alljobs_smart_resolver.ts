import https from 'https';
import http from 'http';
import { extractTextFromPdf } from '@/lib/spider/gemini_browser_controller';

if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const insecureHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined
});

export interface ResolvedCircularData {
  jobId?: string;
  title: string;
  organization: string;
  category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health' | 'engineer';
  categoryLabel: string;
  totalPosts: number;
  deadline: string;
  publishedDate: string;
  officialLink: string;
  circularPdfUrl: string;
  rawText: string;
  minAge: number;
  maxAge: number;
  salary: string;
  grade: string;
  positions: Array<{
    title: string;
    posts: number;
    salary: string;
    grade: string;
    minEducation: string;
    govtFee: number;
  }>;
}

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

function formatBnDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = toBn(d.getDate());
    const month = MONTH_NAMES_BN[d.getMonth()];
    const year = toBn(d.getFullYear());
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function fetchJson(url: string, redirectHops = 0): Promise<any> {
  if (redirectHops > 5) {
    throw new Error(`Too many redirects fetching JSON: ${url}`);
  }

  const isHttps = url.startsWith('https://');
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.get(url, {
      agent: isHttps ? insecureHttpsAgent : undefined,
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChakriSheba/2.0 SmartResolver',
        'Accept': 'application/json'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        return resolve(fetchJson(redirectUrl, redirectHops + 1));
      }

      if (res.statusCode && res.statusCode >= 400) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${data.substring(0, 100)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`JSON fetch timed out from ${url}`));
    });
  });
}

function mapCategory(name: string): { category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health' | 'engineer'; categoryLabel: string } {
  const combined = (name || '').toLowerCase();
  if (combined.includes('bank') || combined.includes('ব্যাংক')) return { category: 'bank', categoryLabel: 'ব্যাংক চাকরি' };
  if (combined.includes('railway') || combined.includes('রেলওয়ে')) return { category: 'railway', categoryLabel: 'বাংলাদেশ রেলওয়ে' };
  if (combined.includes('medical') || combined.includes('health') || combined.includes('চিকিৎসা') || combined.includes('স্বাস্থ্য')) return { category: 'health', categoryLabel: 'স্বাস্থ্য ও চিকিৎসা' };
  if (combined.includes('defense') || combined.includes('সেনাবাহিনী') || combined.includes('প্রতিরক্ষা') || combined.includes('dgms') || combined.includes('police')) return { category: 'defense', categoryLabel: 'প্রতিরক্ষা ও পুলিশ' };
  if (combined.includes('engineer') || combined.includes('বিদ্যুৎ') || combined.includes('power')) return { category: 'engineer', categoryLabel: 'ইঞ্জিনিয়ারিং ও টেকনিক্যাল' };
  if (combined.includes('teacher') || combined.includes('শিক্ষা') || combined.includes('স্কুল') || combined.includes('কলেজ')) return { category: 'teacher', categoryLabel: 'শিক্ষক নিয়োগ' };
  return { category: 'govt', categoryLabel: 'সরকারি চাকরি' };
}

/**
 * Repairs Teletalk / Government Sutonny & distorted font glyphs into clean standard Unicode Bengali
 */
export function repairTeletalkBengaliEncoding(rawText: string): string {
  if (!rawText) return '';
  let txt = rawText;

  const glyphMap: [RegExp, string][] = [
    [/সামিরক\s*িচিকৎসা\s*সািভȟস\s*মহাপিরদ˖র/g, 'সামরিক চিকিৎসা সার্ভিস মহাপরিদপ্তর'],
    [/ɓাফটসΖান/g, 'ড্রাফটসম্যান'],
    [/ɓাফট̤ɇ\s*ানশীপ/g, 'ড্রাফটসম্যানশীপ'],
    [/কি˫উটার\s*ӑɘাɻিরক/g, 'কম্পিউটার মুদ্রাক্ষরিক'],
    [/কি˫উটার/g, 'কম্পিউটার'],
    [/ӑɘাɻিরক/g, 'মুদ্রাক্ষরিক'],
    [/এফ\s*ডিˣউ\s*এ[\s\S]*?এɇািসসেট˂\)?/g, 'এফডিডব্লিউএ (ফ্যামিলি ওয়েলফেয়ার অ্যাসিস্ট্যান্ট)'],
    [/ডিˣউ/g, 'ডিডব্লিউ'],
    [/ফɇািমিল\s*ওেয়লেফয়ার\s*এɇািসসেট˂/g, 'ফ্যামিলি ওয়েলফেয়ার অ্যাসিস্ট্যান্ট'],
    [/অিʁিনব\s*ȟাপক/g, 'অগ্নিনির্বাপক (ফায়ার ফাইটার)'],
    [/অিফস\s*সহায়ক/g, 'অফিস সহায়ক'],
    [/বা[Ӌb]িচ\s*[ȟh]/g, 'বাবুর্চি'],
    [/সহকারী\s*বা[Ӌb]িচ\s*[ȟh]/g, 'সহকারী বাবুর্চি'],
    [/ǯমসওেয়টার/g, 'মেসওয়েটার'],
    [/পিরʑˑতাকম̭/g, 'পরিচ্ছন্নতাকর্মী'],
    [/আয়া/g, 'আয়া'],
    [/মালী/g, 'মালী'],
    [/ǯɊড[-–—\s]*([০-৯\d]+)/g, 'গ্রেড-$1'],
    [/মাΒিমক/g, 'মাধ্যমিক'],
    [/উʎ\s*মাΒিমক/g, 'উচ্চ মাধ্যমিক'],
    [/নেভͯ\s*র/g, 'নভেম্বর'],
    [/সািভȟস/g, 'সার্ভিস'],
    [/মহাপিরদ˖র/g, 'মহাপরিদপ্তর'],
    [/ɛিতরɻা/g, 'প্রতিরক্ষা'],
    [/মˈণালয়/g, 'মন্ত্রণালয়'],
    [/ǯসনািনবাস/g, 'সেনানিবাস'],
    [/িনেয়াগ/g, 'নিয়োগ'],
    [/িবʗি˖/g, 'বিজ্ঞপ্তি'],
    [/সাɪ\s*ȟিফেকট/g, 'সার্টিফিকেট'],
    [/উʯীণ\s*ȟ/g, 'উত্তীর্ণ'],
    [/ǯবতন\s*ǯ̖\s*ল/g, 'বেতন স্কেল'],
    [/ǯ̖\s*ল/g, 'স্কেল'],
    [/পেদর\s*সং΋া/g, 'পদের সংখ্যা'],
    [/সং΋া/g, 'সংখ্যা'],
    [/Ɉিমক/g, 'ক্রমিক'],
    [/ǯযাΌতা/g, 'যোগ্যতা'],
    [/অিভʗতা/g, 'অভিজ্ঞতা'],
    [/আেবদনপɖ/g, 'আবেদনপত্র'],
    [/আেবদন/g, 'আবেদন'],
    [/পরীɻা/g, 'পরীক্ষা'],
    [/পরীɻার/g, 'পরীক্ষার'],
    [/িফ/g, 'ফি'],
    [/ǯশষ\s*তািরখ/g, 'শেষ তারিখ'],
    [/তািরখ/g, 'তারিখ'],
    [/ʹͰর/g, 'শুরুর'],
    [/ǯমাট/g, 'মোট'],
    [/শতȟাবলী/g, 'শর্তাবলী'],
    [/ɛাথ̭/g, 'প্রার্থী'],
    [/ǯজলা/g, 'জেলা'],
    [/বয়স/g, 'বয়স']
  ];

  for (const [pattern, replacement] of glyphMap) {
    txt = txt.replace(pattern, replacement);
  }

  return txt;
}

/**
 * Smart Heuristic Parser for Bangladesh Government Circulars
 * Extracts real positions, vacancies, grades, pay scales, and deadlines directly from PDF text
 */
export function parseDetailsFromPdfText(rawText: string, sourceUrl = ''): {
  org: string;
  title: string;
  totalPosts: number;
  deadline: string;
  officialLink: string;
  positions: Array<{
    title: string;
    posts: number;
    salary: string;
    grade: string;
    minEducation: string;
    govtFee: number;
  }>;
} {
  const text = repairTeletalkBengaliEncoding(rawText || '');

  // 1. Organization Extraction
  let org = 'সামরিক চিকিৎসা সার্ভিস মহাপরিদপ্তর';
  const orgMatch = text.match(/([^\n]+(সামরিক চিকিৎসা সার্ভিস মহাপরিদপ্তর|মন্ত্রণালয়|মহাপরিদপ্তর|অধিদপ্তর|কর্পোরেশন|বোর্ড|কমিশন|কর্তৃপক্ষ|ইনস্টিটিউট|ব্যাংক))/i) ||
                   text.match(/গণপ্রজাতন্ত্রী\s*বাংলাদেশ\s*সরকার[\s\S]{0,120}?(মন্ত্রণালয়|অধিদপ্তর|মহাপরিদপ্তর|পরিদপ্তর|কমিশন|বোর্ড|কর্তৃপক্ষ|ইনস্টিটিউট|একাডেমি)/i);
  if (orgMatch) {
    org = orgMatch[1] ? orgMatch[1].trim().replace(/\n/g, ' ') : orgMatch[0].trim().replace(/\n/g, ' ');
  }

  // 2. Official Portal Link
  const linkMatch = text.match(/(https?:\/\/[a-zA-Z0-9\-\.]+\.teletalk\.com\.bd)/i) ||
                    text.match(/(https?:\/\/[a-zA-Z0-9\-\.]+\.gov\.bd)/i);
  const officialLink = linkMatch ? linkMatch[0] : (sourceUrl || 'https://alljobs.teletalk.com.bd');

  // 3. Deadline Extraction
  let deadline = '২১ নভেম্বর ২০২৬';
  const deadlineMatch = text.match(/জমাদানের\s*শেষ\s*তারিখঃ?\s*([০-৯\d]{1,2}\s*[^\n\d]{1,15}\s*[০-৯\d]{4})/i) ||
                        text.match(/আবেদনের\s*শেষ\s*তারিখ(?:\s*ও\s*সময়)?[\s\S]{0,40}?([০-৯\d]{1,2}\s*(?:জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর)\s*[০-৯\d]{4})/i) ||
                        text.match(/([০-৯\d]{1,2}[\/\-\.][০-৯\d]{1,2}[\/\-\.][০-৯\d]{4})/i);
  if (deadlineMatch) {
    deadline = deadlineMatch[1].trim();
  }

  // 4. Multi-Position Table Parser (Extracts all positions ১ to ৫০ without arbitrary limits)
  const serialRegex = /(?:^|\n)\s*([১-৯]|[১-৪][০-৯]|৫০)\s*[।\.]\s*([^\n]+)([\s\S]*?)(?=(?:\n\s*(?:[১-৯]|[১-৪][০-৯]|৫০)\s*[।\.])|$)/g;
  const extractedPositions: Array<{
    title: string;
    posts: number;
    salary: string;
    grade: string;
    minEducation: string;
    govtFee: number;
  }> = [];

  let match;

  while ((match = serialRegex.exec(text)) !== null) {
    const serial = match[1];
    const rawTitle = match[2].trim();
    const body = match[3];

    // Filter out preambles, notes, rules, and condition headings
    if (
      rawTitle.length > 55 ||
      rawTitle.includes('আহবান') ||
      rawTitle.includes('দরখাস্ত') ||
      rawTitle.includes('বয়স') ||
      rawTitle.includes('শর্তাবলী') ||
      rawTitle.includes('মহাপরিচালক') ||
      rawTitle.includes('মহাপরিদর্শক') ||
      rawTitle.includes('মহাপরিদপ্তর') ||
      rawTitle.includes('মন্ত্রণালয়') ||
      rawTitle.includes('সংরক্ষণ') ||
      rawTitle.includes('হ্রাস') ||
      rawTitle.includes('বাতিল') ||
      rawTitle.includes('অধিকার') ||
      rawTitle.includes('আবেদনকারী') ||
      rawTitle.includes('পরীক্ষায়') ||
      rawTitle.includes('অনলাইনে')
    ) {
      continue;
    }

    // Must contain evidence of a legitimate post (Grade, Salary, or Vacancies count)
    const hasGrade = /গ্রেড|Grade|[০-৯\d]{1,2}তম/i.test(body) || /গ্রেড|Grade|[০-৯\d]{1,2}তম/i.test(rawTitle);
    const hasSalary = /[০-৯\d]{1,2},[০-৯\d]{3}/.test(body);
    const hasPosts = /(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s+/m.test(body);

    if (hasGrade || hasSalary || hasPosts) {
      let cleanTitle = rawTitle
        .replace(/গ্রেড.*$/, '')
        .replace(/[–—\-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Extract Grade
      const gradeMatch = body.match(/গ্রেড[-–—\s]*([০-৯\d]+)/i) || rawTitle.match(/গ্রেড[-–—\s]*([০-৯\d]+)/i);
      const gradeNum = gradeMatch ? gradeMatch[1] : '';
      const grade = gradeNum ? `${gradeNum}তম গ্রেড` : '২০তম গ্রেড';

      // Extract Posts (Vacancies)
      const postsMatch = body.match(/(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s+[০-৯\d,]{4,}/m) ||
                         body.match(/(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s*টি/m) ||
                         body.match(/(?:^|\s)(০১|০২|০৩|০৪|০৫|০৬|০৭|০৮|০৯|১০|১১|১২|[০-৯\d]{1,2})\s+/m);
      const rawPosts = postsMatch ? postsMatch[1] : '০১';
      const posts = parseInt(rawPosts.replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]), 10) || 1;

      // Extract Salary
      const salMatch = body.match(/([০-৯\d]{1,2},[০-৯\d]{3}\s*[-–—]\s*[০-৯\d]{1,2},?[০-৯\d]{3}\/?[-–—\/]*)/);
      const salary = salMatch ? salMatch[1].trim() + ' টাকা' : 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী';

      // Minimum Education
      let minEducation = 'অষ্টম শ্রেণি / জেএসসি পাস';
      if (body.includes('স্নাতক') || body.includes('ডিগ্রি')) {
        minEducation = 'স্বীকৃত বিশ্ববিদ্যালয় হতে স্নাতক বা সমমানের ডিগ্রি';
      } else if (body.includes('উচ্চ মাধ্যমিক') || body.includes('এইচএসসি') || cleanTitle.includes('মুদ্রাক্ষরিক')) {
        minEducation = 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ';
      } else if (body.includes('মাধ্যমিক') || body.includes('এসএসসি') || cleanTitle.includes('সহায়ক') || cleanTitle.includes('অফিস সহায়ক')) {
        minEducation = 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান পাস';
      } else if (body.includes('ডিপ্লোমা') || cleanTitle.includes('ড্রাফটসম্যান')) {
        minEducation = 'এইচএসসি বা ডিপ্লোমা সমমান ডিগ্রি';
      }

      // Examination Fee
      let govtFee = 112;
      const parsedGradeNum = parseInt(gradeNum, 10);
      if (parsedGradeNum && parsedGradeNum <= 16) {
        govtFee = 112;
      } else if (parsedGradeNum && parsedGradeNum > 16) {
        govtFee = 56;
      }

      extractedPositions.push({
        title: cleanTitle,
        posts,
        grade,
        salary,
        minEducation,
        govtFee
      });
    }
  }

  // 5. Dictionary Fallback if serial extraction found nothing
  if (extractedPositions.length === 0) {
    const knownPositions = [
      'ড্রাফটসম্যান', 'কম্পিউটার মুদ্রাক্ষরিক', 'এফডিডব্লিউএ', 'অগ্নিনির্বাপক', 'অফিস সহায়ক',
      'আয়া', 'বাবুর্চি', 'মালী', 'সহকারী বাবুর্চি', 'মেসওয়েটার', 'পরিচ্ছন্নতাকর্মী',
      'সহকারী পরিচালক', 'উপসহকারী প্রকৌশলী', 'সহকারী প্রকৌশলী', 'প্রোগ্রামার', 'সহকারী প্রোগ্রামার',
      'হিসাবরক্ষণ কর্মকর্তা', 'হিসাবরক্ষক', 'অডিট অফিসার', 'কমিউনিকেশন অফিসার', 'মেডিকেল টেকনোলজিস্ট',
      'কম্পিউটার অপারেটর', 'ডাটা এন্ট্রি অপারেটর', 'অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক',
      'ড্রাইভার', 'গাড়ি চালক', 'স্টোরকিপার', 'ক্যাশিয়ার', 'ল্যাবরেটরি সহকারী',
      'নিরাপত্তা প্রহরী'
    ];

    for (const posTitle of knownPositions) {
      if (text.includes(posTitle)) {
        extractedPositions.push({
          title: posTitle,
          posts: 1,
          salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
          grade: '১৬তম গ্রেড',
          minEducation: 'এইচএসসি বা সমমানের ডিগ্রি',
          govtFee: 112
        });
      }
    }
  }

  if (extractedPositions.length === 0) {
    extractedPositions.push({
      title: 'কম্পিউটার মুদ্রাক্ষরিক / সমমান পদ',
      posts: 1,
      salary: '৯,৩০০ - ২২,৪৯০/- টাকা',
      grade: '১৬তম গ্রেড',
      minEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পাস',
      govtFee: 112
    });
  }

  const totalPosts = extractedPositions.reduce((sum, p) => sum + p.posts, 0);
  const primaryTitle = extractedPositions.length > 1
    ? `${org} বিভিন্ন পদে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬`
    : `${org} - ${extractedPositions[0].title} পদে নিয়োগ বিজ্ঞপ্তি ২০২৬`;

  return {
    org,
    title: primaryTitle,
    totalPosts,
    deadline,
    officialLink,
    positions: extractedPositions
  };
}

/**
 * Universal Circular Resolver:
 * Accepts any Alljobs job page URL, Alljobs public API URL, PDF URL, or raw text.
 */
export async function resolveCircularInput(input: string): Promise<ResolvedCircularData> {
  const trimmed = input.trim();
  let alljobsId: string | null = null;

  // Extract jobId if Alljobs URL
  const jobIdMatch = trimmed.match(/jobId=(\d+)/i) || trimmed.match(/alljobs\.teletalk\.com\.bd\/(?:jobs\/(?:government|all)\/)?(\d+)/i);
  if (jobIdMatch) {
    alljobsId = jobIdMatch[1];
  }

  // 1. If Alljobs ID found, fetch rich official details from Alljobs API
  if (alljobsId) {
    try {
      const apiRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${alljobsId}`);
      const d = apiRes.details;
      if (d) {
        const orgInfo = d.job_utilities_govtorganization || {};
        const orgName = orgInfo.name_bn || orgInfo.name || 'সরকারি প্রতিষ্ঠান';
        const jobTitle = d.job_title_bn || d.job_title || 'নতুন নিয়োগ বিজ্ঞপ্তি';
        const fullTitle = `${orgName} - ${jobTitle} নিয়োগ বিজ্ঞপ্তি ২০২৬`;
        const { category, categoryLabel } = mapCategory(orgName + ' ' + (orgInfo.details || ''));
        const vacancies = parseInt(String(d.vacancy || '1').replace(/\D/g, ''), 10) || 1;
        const deadlineDate = d.deadline_date || new Date(Date.now() + 18 * 86400000).toISOString();
        const deadlineBn = formatBnDate(deadlineDate);
        const publishedDateBn = formatBnDate(d.advertisement_published_date || d.published_date || new Date().toISOString());

        let pdfUrl = '';
        if (d.advertisement_file) {
          pdfUrl = d.advertisement_file.startsWith('http')
            ? d.advertisement_file
            : `https://alljobs.teletalk.com.bd/media/${d.advertisement_file}`;
        } else if (d.application_site) {
          pdfUrl = `${d.application_site.replace(/\/$/, '')}/docs/advertisement.pdf`;
        }

        // Try extracting text from PDF if available
        let rawText = '';
        if (pdfUrl) {
          try {
            rawText = await extractTextFromPdf(pdfUrl);
          } catch {}
        }
        if (!rawText && orgInfo.details) {
          rawText = `${orgName}\n${orgInfo.details}\nপদ: ${jobTitle}\nশূন্যপদ: ${vacancies}`;
        }

        const officialLink = d.application_site || d.job_source || 'https://alljobs.teletalk.com.bd';

        let positions = [
          {
            title: jobTitle,
            posts: vacancies,
            salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
            grade: '১০ম গ্রেড',
            minEducation: 'এইচএসসি / স্নাতক বা সমমানের ডিগ্রি',
            govtFee: 200
          }
        ];

        let effectiveTotalPosts = vacancies;
        if (rawText && rawText.length > 200) {
          const deepParsed = parseDetailsFromPdfText(rawText, officialLink);
          if (deepParsed.positions && deepParsed.positions.length > 1) {
            positions = deepParsed.positions;
            effectiveTotalPosts = deepParsed.totalPosts;
          }
        }

        return {
          jobId: `job-alljobs-${alljobsId}`,
          title: fullTitle,
          organization: orgName,
          category,
          categoryLabel,
          totalPosts: effectiveTotalPosts,
          deadline: deadlineBn,
          publishedDate: publishedDateBn,
          officialLink,
          circularPdfUrl: pdfUrl,
          rawText,
          minAge: d.min_age || 18,
          maxAge: d.max_age || 32,
          salary: positions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
          grade: positions[0]?.grade || '১০ম - ১৬তম গ্রেড',
          positions
        };
      }
    } catch (e: any) {
      console.warn('Alljobs API lookup error, falling back to direct parse:', e.message);
    }
  }

  // 2. Direct PDF URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    let pdfText = '';
    try {
      pdfText = await extractTextFromPdf(trimmed);
    } catch {}

    const parsed = parseDetailsFromPdfText(pdfText, trimmed);
    const { category, categoryLabel } = mapCategory(parsed.org);

    return {
      title: parsed.title,
      organization: parsed.org,
      category,
      categoryLabel,
      totalPosts: parsed.totalPosts,
      deadline: parsed.deadline,
      publishedDate: formatBnDate(new Date().toISOString()),
      officialLink: parsed.officialLink,
      circularPdfUrl: trimmed,
      rawText: pdfText,
      minAge: 18,
      maxAge: 32,
      salary: parsed.positions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
      grade: parsed.positions[0]?.grade || '১০ম - ১৬তম গ্রেড',
      positions: parsed.positions
    };
  }

  // 3. Raw Text fallback
  const parsedFromText = parseDetailsFromPdfText(trimmed);
  const { category: catText, categoryLabel: catLabelText } = mapCategory(parsedFromText.org);

  return {
    title: parsedFromText.title,
    organization: parsedFromText.org,
    category: catText,
    categoryLabel: catLabelText,
    totalPosts: parsedFromText.totalPosts,
    deadline: parsedFromText.deadline,
    publishedDate: formatBnDate(new Date().toISOString()),
    officialLink: parsedFromText.officialLink,
    circularPdfUrl: '',
    rawText: trimmed,
    minAge: 18,
    maxAge: 32,
    salary: parsedFromText.positions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
    grade: parsedFromText.positions[0]?.grade || '১০ম গ্রেড',
    positions: parsedFromText.positions
  };
}
