import { JobSource } from '@/lib/types';
import { RawDiscoveredNotice, NormalizedCircularCandidate } from './types';
import { validateSafeUrl } from './security';
import { normalizeCircularNotice, convertBnToEnDigits, sanitizeText } from './normalizer';

export interface ParsedBbNotice extends RawDiscoveredNotice {
  jobId?: string;
  pdfUrl?: string;
  detailsUrl?: string;
  rawEvidenceText?: string;
  evidenceHash?: string;
  needsReview?: boolean;
  reviewReason?: string;
  extractionWarnings?: string[];
}

export interface ParsedBbResult {
  success: boolean;
  sourceId: string;
  candidates: NormalizedCircularCandidate[];
  rawNotices: ParsedBbNotice[];
  discoveredCount: number;
  validCount: number;
  needsReviewCount: number;
  errors: string[];
  isCaptchaBlocked?: boolean;
}

const ALLOWED_BB_DOMAINS = new Set([
  'erecruitment.bb.org.bd',
  'bb.org.bd',
  'www.bb.org.bd',
  'teletalk.com.bd'
]);

const BB_NOISE_PATTERNS = [
  /^bb website/i,
  /^job circulars\/?notices/i,
  /^job circulars$/i,
  /^online application/i,
  /^circular\/notice\/advertisement/i,
  /^edit cv/i,
  /^change password/i,
  /^forget password/i,
  /^search cv/i,
  /^faq$/i,
  /^job admin/i,
  /^admit card/i,
  /^viva card/i,
  /^print tracking/i,
  /^apply online$/i,
  /^details\.\.?$/i,
  /^apply$/i
];

function isNoiseTitle(title: string): boolean {
  if (!title || title.length < 3) return true;
  return BB_NOISE_PATTERNS.some(p => p.test(title.trim()));
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

function stripTags(html: string): string {
  if (!html) return '';
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function validateAndResolveBbUrl(rawUrl: string, baseUrl = 'https://erecruitment.bb.org.bd'): { safe: boolean; url?: string; reason?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, reason: 'Empty URL' };
  }

  const cleanRaw = rawUrl.trim();
  if (cleanRaw.startsWith('javascript:') || cleanRaw.startsWith('data:') || cleanRaw.startsWith('vbscript:')) {
    return { safe: false, reason: 'Unsupported or unsafe URL protocol' };
  }

  let resolved: string;
  try {
    resolved = new URL(cleanRaw, baseUrl).toString();
  } catch (err: any) {
    return { safe: false, reason: `Invalid URL format: ${err.message}` };
  }

  const secCheck = validateSafeUrl(resolved);
  if (!secCheck.safe || !secCheck.url) {
    return { safe: false, reason: secCheck.reason || 'Blocked by security policy' };
  }

  const host = secCheck.url.hostname.toLowerCase();
  const domainAllowed = ALLOWED_BB_DOMAINS.has(host) || 
    Array.from(ALLOWED_BB_DOMAINS).some(d => host.endsWith('.' + d));

  if (!domainAllowed) {
    return { safe: false, reason: `Domain "${host}" is not on the approved Bangladesh Bank source allowlist.` };
  }

  return { safe: true, url: resolved };
}

export function parseBbHtml(html: string, source: JobSource): ParsedBbResult {
  const errors: string[] = [];
  const rawNotices: ParsedBbNotice[] = [];
  const candidates: NormalizedCircularCandidate[] = [];

  if (!html || typeof html !== 'string' || !html.trim()) {
    return {
      success: true,
      sourceId: source.id,
      candidates: [],
      rawNotices: [],
      discoveredCount: 0,
      validCount: 0,
      needsReviewCount: 0,
      errors: ['Supplied HTML is empty.']
    };
  }

  // Detect anti-bot captcha/challenge pages
  if (html.includes('TSPD') || (html.includes('What code is in the image?') && html.includes('submit'))) {
    return {
      success: true,
      sourceId: source.id,
      candidates: [],
      rawNotices: [],
      discoveredCount: 0,
      validCount: 0,
      needsReviewCount: 0,
      errors: ['Bot challenge/captcha detected on Bangladesh Bank portal endpoint.'],
      isCaptchaBlocked: true
    };
  }

  // Clean scripts, styles, comments
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  let needsReviewCount = 0;
  const processedSignatures = new Set<string>();

  // STRATEGY 1: Structured HTML Table Rows (<tr ...> ... </tr>)
  const tableRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  const tableRows: string[] = [];

  while ((rowMatch = tableRowRegex.exec(cleanHtml)) !== null) {
    const rowContent = rowMatch[1];
    if (/<td[^>]*>/i.test(rowContent) && !/<th[^>]*>/i.test(rowContent)) {
      tableRows.push(rowContent);
    }
  }

  if (tableRows.length === 0 && cleanHtml.includes('<tr')) {
    const unclosedRowRegex = /<tr[^>]*>([\s\S]*?)(?=<tr|$)/gi;
    let uMatch: RegExpExecArray | null;
    while ((uMatch = unclosedRowRegex.exec(cleanHtml)) !== null) {
      if (/<td[^>]*>/i.test(uMatch[1])) {
        tableRows.push(uMatch[1]);
      }
    }
  }

  if (tableRows.length > 0) {
    for (const row of tableRows) {
      const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      let cellTexts = cells.map(c => stripTags(c));
      if (cellTexts.length < 2 && row.includes('<td')) {
        cellTexts = row.split(/<td[^>]*>/i).slice(1).map(c => stripTags(c)).filter(t => t.length > 0);
      }
      if (cellTexts.length >= 2) {
        if (cellTexts.every(t => !t || t.length === 0)) continue;

        let title = '';
        let org = 'Bangladesh Bank';
        let refNo: string | undefined = undefined;
        let grade: string | undefined = undefined;
        let vacancies: number | undefined = undefined;
        let deadline = '';
        let fee: number | undefined = undefined;
        let detailsUrl = source.sourceUrl;
        let pdfUrl: string | undefined = undefined;

        // Extract links from row
        const linkMatches = row.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi) || [];
        for (const lm of linkMatches) {
          const hrefM = /href=["']([^"']+)["']/i.exec(lm);
          if (hrefM && hrefM[1]) {
            const rawHref = hrefM[1];
            if (rawHref.toLowerCase().endsWith('.pdf') || rawHref.includes('.pdf?')) {
              const checked = validateAndResolveBbUrl(rawHref, source.sourceUrl);
              if (checked.safe && checked.url) pdfUrl = checked.url;
            } else if (rawHref.includes('job') || rawHref.includes('apply') || rawHref.includes('career')) {
              const checked = validateAndResolveBbUrl(rawHref, source.sourceUrl);
              if (checked.safe && checked.url) detailsUrl = checked.url;
            }
          }
        }

        for (let i = 0; i < Math.min(3, cellTexts.length); i++) {
          const text = cellTexts[i];
          if (text.length >= 3 && !title && !/^(sl|no|\d+)$/i.test(text)) {
            if (text.includes(' for ')) {
              const parts = text.split(/\s+for\s+/i);
              title = parts[0].trim();
              org = parts[1].trim();
            } else if (text.includes('(') && text.includes('Bank')) {
              title = text;
              org = text.includes('Ansar') ? 'Ansar VDP Unnayan Bank' : 'Bangladesh Bank';
            } else {
              title = text;
            }
          }
        }

        if (isNoiseTitle(title)) continue;

        for (const text of cellTexts) {
          if (text && /(?:bb\/|bscs|job id|স্মারক|\d{5,})/i.test(text) && !refNo && !/^(grade|গ্রেড|পদ|post|closing|deadline)/i.test(text)) {
            refNo = text.replace(/^(স্মারক নং|স্মারক নম্বর|job id)[:\s]*/i, '').trim();
          }
          if (/(?:grade|গ্রেড)[\s-]*([০-৯0-9]+)/i.test(text)) {
            grade = text;
          }
          if (/(?:পদ(?:সংখ্যা)?|post|vacanc[a-z]*)[\s:]*([০-৯0-9]+)/i.test(text)) {
            const m = /(?:পদ(?:সংখ্যা)?|post|vacanc[a-z]*)[\s:]*([০-৯0-9]+)/i.exec(text);
            if (m && m[1]) {
              const vac = parseInt(convertBnToEnDigits(m[1]), 10);
              if (!isNaN(vac) && vac > 0) vacancies = vac;
            }
          } else if (/^[০-৯0-9]+$/.test(text.trim())) {
            const num = parseInt(convertBnToEnDigits(text.trim()), 10);
            if (!isNaN(num) && num > 1 && num < 100000 && num !== 200 && num !== 500 && num !== 700) {
              vacancies = num;
            }
          }
          if (/(?:closing|deadline|শেষ তারিখ)[\s:]*([\d০-৯]{1,2}[^\n]+)/i.test(text) ||
              /\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s+\d{4}/i.test(text) ||
              /[০-৯]{1,2}\s+(?:জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর)/.test(text)) {
            deadline = text.replace(/^(?:closing date|deadline|শেষ তারিখ)[:\s]*/i, '').trim();
          }
          const feeM = /(?:fee|ফি|পরীক্ষার ফি|bdt|টাকা)[\s:]*([০-৯0-9]+)|([০-৯0-9]+)\s*(?:bdt|taka|tk|টাকা|\/-)/i.exec(text);
          if (feeM) {
            const val = feeM[1] || feeM[2];
            if (val) {
              const f = parseInt(convertBnToEnDigits(val), 10);
              if (!isNaN(f) && f >= 0) fee = f;
            }
          }
        }

        if (title && title.length >= 3) {
          const sig = `${title}|${org}|${deadline}`;
          if (!processedSignatures.has(sig)) {
            processedSignatures.add(sig);

            const warnings: string[] = [];
            let needsReview = false;
            let reviewReason: string | undefined = undefined;

            if (!deadline) {
              needsReview = true;
              reviewReason = 'আবেদনের শেষ তারিখ অনুপস্থিত';
              deadline = 'অপেক্ষমাণ (পর্যালোচনা আবশ্যক)';
              warnings.push('আবেদনের শেষ তারিখ অনুপস্থিত');
            }
            if (fee === undefined) {
              warnings.push('আবেদন ফি অনুল্লিখিত (বিজ্ঞপ্তি অনুযায়ী প্রযোজ্য)');
            }
            if (vacancies === undefined) {
              warnings.push('পদসংখ্যা অনুল্লিখিত');
            }

            if (needsReview) needsReviewCount++;

            const rawNotice: ParsedBbNotice = {
              refNo,
              title,
              organization: org,
              sourceUrl: detailsUrl,
              evidenceUrl: pdfUrl,
              grade,
              vacancies,
              salary: undefined,
              deadline,
              govtFee: fee,
              category: 'bank',
              detailsUrl,
              pdfUrl,
              rawEvidenceText: cellTexts.join(' | ').slice(0, 300),
              needsReview,
              reviewReason,
              extractionWarnings: warnings.length > 0 ? warnings : undefined
            };

            rawNotices.push(rawNotice);
            const norm = normalizeCircularNotice(rawNotice, source);
            if (norm.valid && norm.candidate) {
              candidates.push(norm.candidate);
            } else {
              errors.push(`Normalization failed for "${title}": ${norm.errors.join(', ')}`);
            }
          }
        }
      }
    }
  }

  // STRATEGY 2: Live BB List Items (<li>...</li> inside Ongoing Applications and Job Circulars)
  const listItemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let liMatch: RegExpExecArray | null;
  const allLiMatches: string[] = [];

  while ((liMatch = listItemRegex.exec(cleanHtml)) !== null) {
    allLiMatches.push(liMatch[1]);
  }
  if (allLiMatches.length === 0 && cleanHtml.includes('<li')) {
    const unclosedLiRegex = /<li[^>]*>([\s\S]*?)(?=<li|$)/gi;
    let uLi: RegExpExecArray | null;
    while ((uLi = unclosedLiRegex.exec(cleanHtml)) !== null) {
      allLiMatches.push(uLi[1]);
    }
  }

  for (const liContent of allLiMatches) {
    const textContent = stripTags(liContent);

    const isJobLi = textContent.includes('Closing date:') || 
                    textContent.includes('Apply Online') || 
                    textContent.includes('Job ID:') || 
                    textContent.includes('job circular') ||
                    textContent.includes('বিজ্ঞপ্তি') ||
                    textContent.includes('showpdf');

    if (!isJobLi || textContent.length < 10) continue;

    let title = '';
    let grade: string | undefined = undefined;
    let org = 'Bangladesh Bank';
    let deadline = '';
    let refNo: string | undefined = undefined;
    let detailsUrl = source.sourceUrl;
    let pdfUrl: string | undefined = undefined;
    let fee: number | undefined = undefined;
    let vacancies: number | undefined = undefined;

    const openJobM = /openJobList\(['"]([^'"]*)['"]\)/i.exec(liContent);
    if (openJobM && openJobM[1]) {
      refNo = `BB-JOB-${openJobM[1]}`;
    }

    const pdfM = /showpdf\(['"]([^'"]+)['"]\)/i.exec(liContent);
    if (pdfM && pdfM[1]) {
      const pdfTarget = `/career/${pdfM[1]}`;
      const checkedPdf = validateAndResolveBbUrl(pdfTarget, source.sourceUrl);
      if (checkedPdf.safe && checkedPdf.url) {
        pdfUrl = checkedPdf.url;
      }
      if (!refNo && pdfM[1].includes('_')) {
        refNo = pdfM[1].replace(/\.pdf$/i, '');
      }
    }

    const dateM = /(?:closing date|শেষ তারিখ)[:\s]+([^&<\/]+)/i.exec(textContent);
    if (dateM && dateM[1]) {
      deadline = dateM[1].replace(/\[.*?\]/g, '').replace(/details\.\.?/gi, '').replace(/[.,\s]+$/, '').trim();
    }

    const mainSection = textContent.split('/')[0].split('[Apply')[0].trim();
    if (mainSection.includes(' for ')) {
      const parts = mainSection.split(/\s+for\s+/i);
      title = parts[0].trim();
      org = parts[1].replace(/&nbsp;/g, '').replace(/\.\s*details\.*/gi, '').replace(/[.,\s]+$/, '').trim();
    } else if (mainSection.includes(' of ')) {
      const parts = mainSection.split(/\s+of\s+/i);
      title = parts[0].trim();
      org = parts[1].replace(/&nbsp;/g, '').replace(/\.\s*details\.*/gi, '').replace(/[.,\s]+$/, '').trim();
    } else {
      title = mainSection;
    }

    if (isNoiseTitle(title)) continue;

    const gradeM = /\(Grade-?([0-9০-৯]+)\)/i.exec(title);
    if (gradeM && gradeM[1]) {
      grade = `${convertBnToEnDigits(gradeM[1])}ম গ্রেড`;
    }

    title = title.replace(/\(Grade-?[0-9০-৯]+\)/i, '').replace(/\s+/g, ' ').trim();

    const sig = `${title}|${org}|${deadline}`;
    if (title && title.length >= 3 && !processedSignatures.has(sig)) {
      processedSignatures.add(sig);

      const warnings: string[] = [];
      let needsReview = false;
      let reviewReason: string | undefined = undefined;

      if (!deadline) {
        needsReview = true;
        reviewReason = 'আবেদনের শেষ তারিখ অনুপস্থিত';
        deadline = 'শীঘ্রই প্রকাশিত হবে';
        warnings.push('আবেদনের শেষ তারিখ অনুপস্থিত');
      }
      if (fee === undefined) {
        warnings.push('আবেদন ফি অনুল্লিখিত (বিজ্ঞপ্তি অনুযায়ী প্রযোজ্য)');
      }
      if (vacancies === undefined) {
        warnings.push('পদসংখ্যা অনুল্লিখিত');
      }

      if (needsReview) needsReviewCount++;

      const rawNotice: ParsedBbNotice = {
        refNo,
        title,
        organization: org,
        sourceUrl: detailsUrl,
        evidenceUrl: pdfUrl,
        grade,
        vacancies,
        salary: undefined,
        deadline,
        govtFee: fee,
        category: 'bank',
        detailsUrl,
        pdfUrl,
        rawEvidenceText: textContent.slice(0, 300),
        needsReview,
        reviewReason,
        extractionWarnings: warnings.length > 0 ? warnings : undefined
      };

      rawNotices.push(rawNotice);
      const norm = normalizeCircularNotice(rawNotice, source);
      if (norm.valid && norm.candidate) {
        candidates.push(norm.candidate);
      } else {
        errors.push(`Normalization failed for "${title}": ${norm.errors.join(', ')}`);
      }
    }
  }

  return {
    success: true,
    sourceId: source.id,
    candidates,
    rawNotices,
    discoveredCount: rawNotices.length,
    validCount: candidates.length,
    needsReviewCount,
    errors
  };
}
