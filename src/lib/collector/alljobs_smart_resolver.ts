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

  // 2. Direct PDF URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    let pdfText = '';
    try {
      pdfText = await extractTextFromPdf(trimmed);
    } catch {}

    const orgMatch = pdfText.match(/গণপ্রজাতন্ত্রী বাংলাদেশ সরকার[\s\S]{0,100}?(মন্ত্রণালয়|অধিদপ্তর|মহাপরিচালক|কমিশন|বোর্ড)/i) ||
                     pdfText.match(/([^\n]+(মহাপরিদপ্তর|মন্ত্রণালয়|কর্পোরেশন|বোর্ড|কমিশন|কর্তৃপক্ষ|ইনস্টিটিউট))/i);
    const org = orgMatch ? orgMatch[0].trim().replace(/\n/g, ' ') : 'বাংলাদেশ সরকারি প্রতিষ্ঠান';
    const { category, categoryLabel } = mapCategory(org);

    return {
      title: `${org} নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬`,
      organization: org,
      category,
      categoryLabel,
      totalPosts: 1,
      deadline: 'বিজ্ঞপ্তি অনুযায়ী',
      publishedDate: formatBnDate(new Date().toISOString()),
      officialLink: trimmed,
      circularPdfUrl: trimmed,
      rawText: pdfText,
      minAge: 18,
      maxAge: 32,
      salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
      grade: '১০ম গ্রেড',
      positions: [
        {
          title: 'অফিস সহকারী / সমমান পদ',
          posts: 1,
          salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
          grade: '১০ম গ্রেড',
          minEducation: 'স্নাতক / উচ্চ মাধ্যমিক পাস',
          govtFee: 200
        }
      ]
    };
  }

  // 3. Raw Text fallback
  return {
    title: 'নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬',
    organization: 'বাংলাদেশ সরকারি প্রতিষ্ঠান',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি',
    totalPosts: 1,
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    publishedDate: formatBnDate(new Date().toISOString()),
    officialLink: 'https://alljobs.teletalk.com.bd',
    circularPdfUrl: '',
    rawText: trimmed,
    minAge: 18,
    maxAge: 32,
    salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
    grade: '১০ম গ্রেড',
    positions: [
      {
        title: 'সহকারী কর্মকর্তা / সমমান পদ',
        posts: 1,
        salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
        grade: '১০ম গ্রেড',
        minEducation: 'স্নাতক / সমমান',
        govtFee: 200
      }
    ]
  };
}
