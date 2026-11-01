import { JobSource } from '@/lib/types';
import { RawDiscoveredNotice, NormalizedCircularCandidate } from './types';
import { validateSafeUrl } from './security';
import { normalizeCircularNotice, convertBnToEnDigits, sanitizeText } from './normalizer';

export interface ParsedBpscNotice extends RawDiscoveredNotice {
  examCode?: string;
  pdfUrl?: string;
  detailsUrl?: string;
  rawEvidenceText?: string;
  evidenceHash?: string;
  needsReview?: boolean;
  reviewReason?: string;
  extractionWarnings?: string[];
}

export interface ParsedBpscResult {
  success: boolean;
  sourceId: string;
  candidates: NormalizedCircularCandidate[];
  rawNotices: ParsedBpscNotice[];
  discoveredCount: number;
  validCount: number;
  needsReviewCount: number;
  errors: string[];
}

const ALLOWED_BPSC_DOMAINS = new Set([
  'bpsc.teletalk.com.bd',
  'bpsc.gov.bd',
  'www.bpsc.gov.bd',
  'teletalk.com.bd',
  'portal.gov.bd'
]);

const BPSC_NOISE_PATTERNS = [
  /&copy;/i,
  /all rights reserved/i,
  /government of the people/i,
  /^bangladesh public service commission$/i,
  /notice\/result/i,
  /form\s*-\s*3/i,
  /syllabus/i,
  /hit_log/i,
  /examination 200[0-9]/i,
  /^bcs$/i,
  /^non cadre$/i,
  /^departmental/i
];

function isNoiseBpscTitle(title: string): boolean {
  if (!title || title.length < 3) return true;
  return BPSC_NOISE_PATTERNS.some(p => p.test(title.trim()));
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

function validateAndResolveBpscUrl(rawUrl: string, baseUrl = 'https://bpsc.teletalk.com.bd'): { safe: boolean; url?: string; reason?: string } {
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
  const domainAllowed = ALLOWED_BPSC_DOMAINS.has(host) || 
    Array.from(ALLOWED_BPSC_DOMAINS).some(d => host.endsWith('.' + d));

  if (!domainAllowed) {
    return { safe: false, reason: `Domain "${host}" is not on the approved BPSC source allowlist.` };
  }

  return { safe: true, url: resolved };
}

export function parseBpscHtml(html: string, source: JobSource): ParsedBpscResult {
  const errors: string[] = [];
  const rawNotices: ParsedBpscNotice[] = [];
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

  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  let needsReviewCount = 0;
  const processedSignatures = new Set<string>();

  // STRATEGY 1: Official BPSC Portal Category Tables
  const portalLinkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*class=["'][^"']*mainlink[^"']*["'][^>]*>([\s\S]*?)(?:<\/a>|(?=<td|<tr|$))/gi;
  let linkMatch: RegExpExecArray | null;

  while ((linkMatch = portalLinkRegex.exec(cleanHtml)) !== null) {
    const rawHref = linkMatch[1];
    const linkInner = linkMatch[2];
    const rawTitle = stripTags(linkInner);

    if (isNoiseBpscTitle(rawTitle)) continue;

    const checkedUrl = validateAndResolveBpscUrl(rawHref, source.sourceUrl);
    const detailsUrl = checkedUrl.safe && checkedUrl.url ? checkedUrl.url : source.sourceUrl;

    let title = rawTitle;
    let org = 'Bangladesh Public Service Commission (BPSC)';
    let grade: string | undefined = undefined;
    let vacancies: number | undefined = undefined;
    let deadline = '';
    let refNo: string | undefined = undefined;
    let fee: number | undefined = undefined;

    // Check surrounding text for facts
    const matchIdx = linkMatch.index;
    const surrounding = cleanHtml.slice(Math.max(0, matchIdx - 200), Math.min(cleanHtml.length, matchIdx + 400));
    
    const dlMatch = /(?:closing|deadline|শেষ তারিখ)[:\s]+([\d০-৯]{1,2}[^\n<|]+)/i.exec(surrounding);
    if (dlMatch && dlMatch[1]) {
      deadline = stripTags(dlMatch[1]).trim();
    }
    const vacMatch = /(?:total posts|posts|vacanc[a-z]*|পদসংখ্যা|পদ)[:\s]+([০-৯0-9]+)/i.exec(surrounding);
    if (vacMatch && vacMatch[1]) {
      const v = parseInt(convertBnToEnDigits(vacMatch[1]), 10);
      if (!isNaN(v) && v > 0) vacancies = v;
    }
    const refMatch = /(?:circular no|memo no|স্মারক নং)[:\s]+([^|\n<]+)/i.exec(surrounding);
    if (refMatch && refMatch[1]) {
      refNo = refMatch[1].trim();
    }
    const feeMatch = /(?:fee|ফি|পরীক্ষার ফি)[:\s]+([০-৯0-9]+)/i.exec(surrounding);
    if (feeMatch && feeMatch[1]) {
      const f = parseInt(convertBnToEnDigits(feeMatch[1]), 10);
      if (!isNaN(f) && f > 0) fee = f;
    }

    const titleKey = title.slice(0, 30).toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '');
    const sig = `${titleKey}|${deadline}`;
    if (!processedSignatures.has(sig)) {
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

      const rawNotice: ParsedBpscNotice = {
        refNo,
        title,
        organization: org,
        sourceUrl: detailsUrl,
        grade,
        vacancies,
        salary: undefined,
        deadline,
        govtFee: fee,
        category: 'govt',
        detailsUrl,
        rawEvidenceText: rawTitle,
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

  // STRATEGY 2: Structured BPSC Circular / Non-Cadre Table Rows
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
        let org = 'Bangladesh Public Service Commission (BPSC)';
        let refNo: string | undefined = undefined;
        let grade: string | undefined = undefined;
        let vacancies: number | undefined = undefined;
        let deadline = '';
        let fee: number | undefined = undefined;
        let detailsUrl = source.sourceUrl;
        let pdfUrl: string | undefined = undefined;

        // Check for PDF or apply links
        const linkMatches = row.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi) || [];
        for (const lm of linkMatches) {
          const hrefM = /href=["']([^"']+)["']/i.exec(lm);
          if (hrefM && hrefM[1]) {
            const rawHref = hrefM[1];
            if (rawHref.toLowerCase().endsWith('.pdf') || rawHref.includes('.pdf?')) {
              const checked = validateAndResolveBpscUrl(rawHref, source.sourceUrl);
              if (checked.safe && checked.url) pdfUrl = checked.url;
            } else if (rawHref.includes('bpsc') || rawHref.includes('teletalk') || rawHref.includes('ncad') || rawHref.includes('apply')) {
              const checked = validateAndResolveBpscUrl(rawHref, source.sourceUrl);
              if (checked.safe && checked.url) detailsUrl = checked.url;
            }
          }
        }

        for (let i = 0; i < Math.min(3, cellTexts.length); i++) {
          const text = cellTexts[i];
          if (text.length >= 3 && !title && !/^(sl|no|\d+)$/i.test(text)) {
            if (text.includes('মন্ত্রণালয়') || text.includes('অধিদপ্তর') || text.includes('Ministry') || text.includes('Department')) {
              org = text;
            } else {
              title = text;
            }
          } else if (text && (text.includes('মন্ত্রণালয়') || text.includes('Ministry')) && org === 'Bangladesh Public Service Commission (BPSC)') {
            org = text;
          }
        }

        if (isNoiseBpscTitle(title)) continue;

        for (const text of cellTexts) {
          if (text && /(?:০৫\.|bpsc|স্মারক|memo)/i.test(text) && !refNo && !/^(grade|গ্রেড|পদ|post|closing|deadline)/i.test(text)) {
            refNo = text.replace(/^(স্মারক নং|স্মারক নম্বর|memo no)[:\s]*/i, '').trim();
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
          const titleKey = title.slice(0, 30).toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '');
          const isAlreadyProcessed = Array.from(processedSignatures).some(s => s.startsWith(titleKey));
          const sig = `${titleKey}|${deadline}`;
          if (!processedSignatures.has(sig) && !isAlreadyProcessed) {
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

            const rawNotice: ParsedBpscNotice = {
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
              category: 'govt',
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
