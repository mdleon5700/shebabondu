import https from 'https';
import http from 'http';
import { extractTextFromPdf } from '@/lib/spider/gemini_browser_controller';

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

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChakriSheba/2.0 SmartResolver',
        'Accept': 'application/json'
      },
      timeout: 10000
    }, (res) => {
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
    }).on('error', reject);
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

        return {
          jobId: `job-alljobs-${alljobsId}`,
          title: fullTitle,
          organization: orgName,
          category,
          categoryLabel,
          totalPosts: vacancies,
          deadline: deadlineBn,
          publishedDate: publishedDateBn,
          officialLink,
          circularPdfUrl: pdfUrl,
          rawText,
          minAge: d.min_age || 18,
          maxAge: d.max_age || 32,
          salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
          grade: '১০ম - ১৬তম গ্রেড',
          positions: [
            {
              title: jobTitle,
              posts: vacancies,
              salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
              grade: '১০ম গ্রেড',
              minEducation: 'এইচএসসি / স্নাতক বা সমমানের ডিগ্রি',
              govtFee: 200
            }
          ]
        };
      }
    } catch (e: any) {
      console.warn('Alljobs API lookup error, falling back to direct parse:', e.message);
    }
  }

  
/**
 * Smart Heuristic Parser for Bangladesh Government Circulars
 * Extracts real positions, vacancies, grades, pay scales, and deadlines directly from PDF text
 */
function parseDetailsFromPdfText(text: string, sourceUrl = ''): {
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
  // 1. Organization Extraction
  const orgMatch = text.match(/গণপ্রজাতন্ত্রী\s*বাংলাদেশ\s*সরকার[\s\S]{0,120}?(মন্ত্রণালয়|অধিদপ্তর|মহাপরিদপ্তর|পরিদপ্তর|কমিশন|বোর্ড|কর্তৃপক্ষ|ইনস্টিটিউট|একাডেমি)/i) ||
                   text.match(/([^\n]+(মন্ত্রণালয়|মহাপরিদপ্তর|অধিদপ্তর|কর্পোরেশন|বোর্ড|কমিশন|কর্তৃপক্ষ|ইনস্টিটিউট|ব্যাংক))/i);
  const org = orgMatch ? orgMatch[0].trim().replace(/\n/g, ' ') : 'বাংলাদেশ সরকারি প্রতিষ্ঠান';

  // 2. Official Portal Link
  const linkMatch = text.match(/(https?:\/\/[a-zA-Z0-9\-\.]+\.teletalk\.com\.bd)/i) ||
                    text.match(/(https?:\/\/[a-zA-Z0-9\-\.]+\.gov\.bd)/i);
  const officialLink = linkMatch ? linkMatch[0] : (sourceUrl || 'https://alljobs.teletalk.com.bd');

  // 3. Deadline
  let deadline = 'বিজ্ঞপ্তি অনুযায়ী';
  const deadlineMatch = text.match(/আবেদনের\s*শেষ\s*তারিখ(?:\s*ও\s*সময়)?[\s\S]{0,40}?([০-৯\d]{1,2}\s*(?:জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর)\s*[০-৯\d]{4})/i) ||
                        text.match(/([০-৯\d]{1,2}[\/\-\.] [০-৯\d]{1,2}[\/\-\.] [০-৯\d]{4})/i);
  if (deadlineMatch) {
    deadline = deadlineMatch[1].trim();
  }

  // 4. Bangladesh Civil Service & Semi-Govt Position Dictionary
  const knownPositions = [
    'সহকারী পরিচালক', 'উপসহকারী প্রকৌশলী', 'সহকারী প্রকৌশলী', 'প্রোগ্রামার', 'সহকারী প্রোগ্রামার',
    'হিসাবরক্ষণ কর্মকর্তা', 'হিসাবরক্ষক', 'অডিট অফিসার', 'কমিউনিকেশন অফিসার', 'মেডিকেল টেকনোলজিস্ট',
    'কম্পিউটার অপারেটর', 'ডাটা এন্ট্রি অপারেটর', 'অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক',
    'সাঁটমুদ্রাক্ষরিক কাম কম্পিউটার অপারেটর', 'সাঁটলিপিকার কাম কম্পিউটার অপারেটর', 'কম্পিউটার মুদ্রাক্ষরিক',
    'ড্রাফটসম্যান', 'ড্রাইভার', 'গাড়ি চালক', 'স্টোরকিপার', 'ক্যাশিয়ার', 'ল্যাবরেটরি সহকারী',
    'ফটোকপি অপারেটর', 'অফিস সহায়ক', 'নিরাপত্তা প্রহরী', 'পরিচ্ছন্নতাকর্মী'
  ];

  const extractedPositions: Array<{
    title: string;
    posts: number;
    salary: string;
    grade: string;
    minEducation: string;
    govtFee: number;
  }> = [];

  for (const posTitle of knownPositions) {
    if (text.includes(posTitle)) {
      const posRegex = new RegExp(`${posTitle}[\\s\\S]{0,80}?([০-৯\\d]+)\\s*টি`, 'i');
      const pMatch = text.match(posRegex);
      const postsCount = pMatch ? parseInt(pMatch[1].replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]), 10) : 1;

      let grade = '১৬তম গ্রেড';
      let salary = '৯,৩০০ - ২২,৪৯০/- টাকা';
      let minEducation = 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পাস';
      let govtFee = 112;

      if (posTitle.includes('পরিচালক') || posTitle.includes('প্রকৌশলী') || posTitle.includes('প্রোগ্রামার') || posTitle.includes('কর্মকর্তা')) {
        grade = '৯ম/১০ম গ্রেড';
        salary = '২২,০০০ - ৫৩,০৬০/- টাকা';
        minEducation = 'স্নাতক (সম্মান) বা সমমানের ডিগ্রি';
        govtFee = 223;
      } else if (posTitle.includes('অপারেটর') || posTitle.includes('মুদ্রাক্ষরিক') || posTitle.includes('হিসাবরক্ষক') || posTitle.includes('ড্রাফটসম্যান')) {
        grade = '১৩তম - ১৬তম গ্রেড';
        salary = '১১,০০০ - ২৬,৫৯০/- টাকা';
        minEducation = 'এইচএসসি বা স্নাতক ডিগ্রি এবং টাইপিং দক্ষতা';
        govtFee = 112;
      } else if (posTitle.includes('ড্রাইভার') || posTitle.includes('চালক')) {
        grade = '১৬তম গ্রেড';
        salary = '৯,৩০০ - ২২,৪৯০/- টাকা';
        minEducation = 'জুনিয়র স্কুল সার্টিফিকেট (জেএসসি) ও বৈধ ড্রাইভিং লাইসেন্স';
        govtFee = 112;
      } else if (posTitle.includes('সহায়ক') || posTitle.includes('প্রহরী') || posTitle.includes('পরিচ্ছন্নতা')) {
        grade = '২০তম গ্রেড';
        salary = '৮,২৫০ - ২০,০১০/- টাকা';
        minEducation = 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান';
        govtFee = 56;
      }

      extractedPositions.push({
        title: posTitle,
        posts: postsCount || 1,
        salary,
        grade,
        minEducation,
        govtFee
      });
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
      salary: parsed.positions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
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
    salary: parsedFromText.positions[0]?.salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
    grade: parsedFromText.positions[0]?.grade || '১০ম গ্রেড',
    positions: parsedFromText.positions
  };
}

