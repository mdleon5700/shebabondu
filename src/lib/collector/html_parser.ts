import { JobSource } from '@/lib/types';
import { RawDiscoveredNotice, NormalizedCircularCandidate } from './types';
import { validateSafeUrl } from './security';
import { normalizeCircularNotice, convertBnToEnDigits, sanitizeText } from './normalizer';

export interface ParsedHtmlNotice extends RawDiscoveredNotice {
  startDate?: string;
  pdfUrl?: string;
  detailsUrl?: string;
  rawEvidenceText?: string;
  needsReview?: boolean;
  reviewReason?: string;
  isCancelledNotice?: boolean;
}

export interface ParsedHtmlResult {
  success: boolean;
  sourceId: string;
  candidates: NormalizedCircularCandidate[];
  rawNotices: ParsedHtmlNotice[];
  discoveredCount: number;
  validCount: number;
  needsReviewCount: number;
  errors: string[];
  isSpaShellDetected?: boolean;
}

const ALLOWED_CIRCULAR_DOMAINS = new Set([
  'alljobs.teletalk.com.bd',
  'bpsc.teletalk.com.bd',
  'erecruitment.bb.org.bd',
  'teletalk.com.bd',
  'portal.gov.bd'
]);

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

function validateAndResolveUrl(rawUrl: string, baseUrl: string): { safe: boolean; url?: string; reason?: string } {
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
  const domainAllowed = ALLOWED_CIRCULAR_DOMAINS.has(host) || 
    Array.from(ALLOWED_CIRCULAR_DOMAINS).some(d => host.endsWith('.' + d));

  if (!domainAllowed) {
    return { safe: false, reason: `Domain "${host}" is not on the approved official recruitment source allowlist.` };
  }

  return { safe: true, url: resolved };
}

function extractBalancedSegments(html: string): string[] {
  const segments: string[] = [];
  const startRegex = /<(div|article|section|li|tr)[^>]*class=["']([^"']*(?:job-card|circular-item|job-item|circular-box|card)[^"']*)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = startRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const startIndex = match.index + match[0].length;
    let depth = 1;
    const tokenRegex = new RegExp(`</?${tagName}(?:\\s+[^>]*)?>`, 'gi');
    tokenRegex.lastIndex = startIndex;

    let tokenMatch: RegExpExecArray | null;
    while ((tokenMatch = tokenRegex.exec(html)) !== null) {
      const token = tokenMatch[0].toLowerCase();
      if (token.startsWith('</')) {
        depth--;
        if (depth === 0) {
          segments.push(html.slice(startIndex, tokenMatch.index));
          startRegex.lastIndex = tokenMatch.index + tokenMatch[0].length;
          break;
        }
      } else if (!token.endsWith('/>')) {
        depth++;
      }
    }
  }

  // Fallback: table rows
  if (segments.length === 0) {
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    while ((match = rowRegex.exec(html)) !== null) {
      const rowInner = match[1];
      if (/<td[^>]*>/i.test(rowInner) && (rowInner.includes('পদ') || rowInner.includes('বিজ্ঞপ্তি') || rowInner.includes('Job') || rowInner.includes('Circular'))) {
        segments.push(rowInner);
      }
    }
  }

  // Single card without container classes
  if (segments.length === 0 && (html.includes('পদের নাম') || html.includes('প্রতিষ্ঠানের নাম') || html.includes('স্মারক নং') || html.includes('আবেদনের শেষ'))) {
    segments.push(html);
  }

  return segments;
}

export function extractPaginationUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const linkRegex = /<a[^>]+href=["']([^"']*(?:page=[0-9]+|\/page\/[0-9]+)[^"']*)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    const checked = validateAndResolveUrl(match[1], baseUrl);
    if (checked.safe && checked.url && !urls.includes(checked.url)) {
      urls.push(checked.url);
    }
  }
  return urls;
}

export function extractEmbeddedJsonNotices(html: string, source: JobSource): ParsedHtmlNotice[] {
  const notices: ParsedHtmlNotice[] = [];
  const ldJsonRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = ldJsonRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item && (item['@type'] === 'JobPosting' || item.type === 'JobPosting')) {
          const checkedUrl = validateAndResolveUrl(item.url || '', source.sourceUrl);
          notices.push({
            title: item.title || 'অজ্ঞাত পদ',
            organization: item.hiringOrganization?.name || source.name,
            deadline: item.validThrough || 'অপেক্ষমাণ',
            publishedDate: item.datePosted,
            sourceUrl: checkedUrl.safe && checkedUrl.url ? checkedUrl.url : source.sourceUrl,
            rawEvidenceText: JSON.stringify(item).slice(0, 300)
          });
        }
      }
    } catch {}
  }

  const nextDataRegex = /<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i;
  const nextMatch = nextDataRegex.exec(html);
  if (nextMatch) {
    try {
      const parsed = JSON.parse(nextMatch[1]);
      const jobList = parsed?.props?.pageProps?.jobs || parsed?.props?.pageProps?.circulars || parsed?.props?.pageProps?.data || [];
      if (Array.isArray(jobList)) {
        for (const j of jobList) {
          if (j && (j.title || j.jobTitle || j.position)) {
            const checkedUrl = validateAndResolveUrl(j.sourceUrl || j.detailsUrl || j.url || '', source.sourceUrl);
            const checkedPdf = j.pdfUrl ? validateAndResolveUrl(j.pdfUrl, source.sourceUrl) : undefined;
            notices.push({
              refNo: j.refNo || j.circularNo || j.memoNo,
              title: j.title || j.jobTitle || j.position,
              organization: j.organization || j.company || j.orgName || source.name,
              deadline: j.deadline || j.closingDate || 'অপেক্ষমাণ',
              vacancies: j.vacancies || j.totalPosts || 1,
              sourceUrl: checkedUrl.safe && checkedUrl.url ? checkedUrl.url : source.sourceUrl,
              pdfUrl: checkedPdf && checkedPdf.safe ? checkedPdf.url : undefined,
              rawEvidenceText: JSON.stringify(j).slice(0, 300)
            });
          }
        }
      }
    } catch {}
  }
  return notices;
}


export function extractTeletalkPortalNotices(html: string, source: JobSource): ParsedHtmlNotice[] {
  const notices: ParsedHtmlNotice[] = [];
  const isTeletalk = html.includes('teletalk.com.bd') || 
                     html.includes('Powered By: Teletalk') || 
                     html.includes('Powered By Teletalk') ||
                     html.includes('Web Based Recruitment System') ||
                     html.includes('select_circular.php') ||
                     html.includes('circulars.php');

  if (!isTeletalk) return notices;

  let orgName = source.name;
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (h1Match) {
    orgName = h1Match[1].replace(/<[^>]+>/g, '').replace(/\|.*/, '').replace(/-.*/, '').trim();
  } else if (titleMatch) {
    orgName = titleMatch[1].replace(/<[^>]+>/g, '').replace(/\|.*/, '').replace(/-.*/, '').trim();
  }

  let deadline = 'অপেক্ষমাণ';
  const dlMatch = html.match(/Deadline\s*[:\]]?\s*([0-9]{1,2}\s+[A-Za-z]{3,}\s+[0-9]{4}[^\]<]*)/i) ||
                  html.match(/আবেদনের শেষ সময়[:\s]*([^\n<]+)/i);
  if (dlMatch) {
    deadline = dlMatch[1].trim();
  }

  let pdfUrl: string | undefined = undefined;
  const pdfMatch = html.match(/<a[^>]+href=["']([^"']+\.pdf)["'][^>]*>(.*?)<\/a>/i);
  if (pdfMatch) {
    try {
      pdfUrl = new URL(pdfMatch[1], source.sourceUrl).toString();
    } catch {}
  }

  let appUrl = source.sourceUrl;
  const appMatch = html.match(/<a[^>]+href=["']([^"']*(?:circulars|apply|options|select_circular|posts)\.php)["']/i);
  if (appMatch) {
    try {
      appUrl = new URL(appMatch[1], source.sourceUrl).toString();
    } catch {}
  }

  const refMatch = html.match(/Circular No:\s*([^"'>]+)/i) || html.match(/Ref:([^\s<]+)/i);
  const refNo = refMatch ? refMatch[0].trim() : undefined;

  const postMatches: string[] = [];
  const postRegex = /<input[^>]+name=["']post_code["'][^>]+value=["']([^"']+)["'][^>]*>([\s\S]*?)(?:<\/label>|<\/li>)/gi;
  let pMatch;
  while ((pMatch = postRegex.exec(html)) !== null) {
    const rawPost = pMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (rawPost) postMatches.push(rawPost);
  }

  const isOver = html.includes('Online Application time is over!') || html.includes('সময় শেষ');

  if (postMatches.length > 0) {
    for (const post of postMatches) {
      notices.push({
        refNo,
        title: post,
        organization: orgName,
        deadline,
        sourceUrl: appUrl,
        pdfUrl,
        isCancelledNotice: isOver,
        rawEvidenceText: `Teletalk Portal Post: ${post} | Deadline: ${deadline}`
      });
    }
  } else {
    notices.push({
      refNo,
      title: `${orgName} বিভিন্ন পদে নিয়োগ বিজ্ঞপ্তি ২০২৬`,
      organization: orgName,
      deadline,
      sourceUrl: appUrl,
      pdfUrl,
      isCancelledNotice: isOver,
      rawEvidenceText: `Teletalk Recruitment Portal: ${orgName} | PDF: ${pdfUrl || 'None'}`
    });
  }

  return notices;
}

export function parseTeletalkHtml(html: string, source: JobSource): ParsedHtmlResult {
  const errors: string[] = [];
  const rawNotices: ParsedHtmlNotice[] = [];
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

  // Strip scripts, styles, and comments
  const cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                        .replace(/<!--[\s\S]*?-->/g, '');

  const isSpa = /<div\s+id=["']root["']\s*>\s*<\/div>/i.test(cleanHtml) ||
                /<div\s+id=["']app["']\s*>\s*<\/div>/i.test(cleanHtml);

  // Check for structured embedded JSON (JSON-LD or SPA State) before failing
  const embeddedJsonNotices = extractEmbeddedJsonNotices(html, source);
  if (embeddedJsonNotices.length > 0) {
    for (const jsonNotice of embeddedJsonNotices) {
      rawNotices.push(jsonNotice);
      const norm = normalizeCircularNotice(jsonNotice, source);
      if (norm.valid && norm.candidate) {
        candidates.push(norm.candidate);
      } else {
        errors.push(`Normalization failed for embedded notice "${jsonNotice.title}": ${norm.errors.join(', ')}`);
      }
    }
    return {
      success: true,
      sourceId: source.id,
      candidates,
      rawNotices,
      discoveredCount: rawNotices.length,
      validCount: candidates.length,
      needsReviewCount: 0,
      errors
    };
  }

  const segments = extractBalancedSegments(cleanHtml);

  // Resilient Native Teletalk Portal Detection (e.g. dcrajbari, cpgcbl)
  if (segments.length === 0) {
    const portalNotices = extractTeletalkPortalNotices(cleanHtml, source);
    if (portalNotices.length > 0) {
      for (const notice of portalNotices) {
        rawNotices.push(notice);
        const norm = normalizeCircularNotice(notice, source);
        if (norm.valid && norm.candidate) {
          candidates.push(norm.candidate);
        } else {
          errors.push(`Normalization error for "${notice.title}": ${norm.errors.join(', ')}`);
        }
      }
      return {
        success: true,
        sourceId: source.id,
        candidates,
        rawNotices,
        discoveredCount: rawNotices.length,
        validCount: candidates.length,
        needsReviewCount: rawNotices.filter(n => n.needsReview).length,
        errors
      };
    }
  }

  if (segments.length === 0 && isSpa) {
    return {
      success: true,
      sourceId: source.id,
      candidates: [],
      rawNotices: [],
      discoveredCount: 0,
      validCount: 0,
      needsReviewCount: 0,
      errors: ['SPA shell detected without pre-rendered server-side circular listings.'],
      isSpaShellDetected: true
    };
  }

  let needsReviewCount = 0;

  for (const segment of segments) {
    const textContent = stripTags(segment);
    if (!textContent || textContent.length < 10) continue;

    // --- A. Extract Job Title ---
    let title = '';
    const titleRegexes = [
      /<(?:h[1-6]|span|div|a)[^>]*class=["'][^"']*(?:job-title|title|position)[^"']*["'][^>]*>([\s\S]*?)<\/(?:h[1-6]|span|div|a)>/i,
      /পদের নাম[:\s]+([^\n<]+)/i,
      /Job Title[:\s]+([^\n<]+)/i,
      /Position[:\s]+([^\n<]+)/i,
      /<a[^>]+href=["'][^"']*(?:detail|apply|circular)[^"']*["'][^>]*>([\s\S]*?)<\/a>/i
    ];

    for (const rx of titleRegexes) {
      const m = rx.exec(segment);
      if (m && m[1]) {
        const candidateTitle = stripTags(m[1]);
        if (candidateTitle.length >= 3 && !candidateTitle.includes('বিস্তারিত') && !candidateTitle.includes('Apply Now')) {
          title = candidateTitle;
          break;
        }
      }
    }

    // --- B. Extract Organization ---
    let organization = '';
    const orgRegexes = [
      /<(?:div|span|p)[^>]*class=["'][^"']*(?:organization|org|company|ministry)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|p)>/i,
      /প্রতিষ্ঠানের নাম[:\s]+([^\n<]+)/i,
      /মন্ত্রণালয়\/দপ্তর[:\s]+([^\n<]+)/i,
      /Organization[:\s]+([^\n<]+)/i,
      /Company[:\s]+([^\n<]+)/i
    ];

    for (const rx of orgRegexes) {
      const m = rx.exec(segment);
      if (m && m[1]) {
        const candidateOrg = stripTags(m[1]);
        if (candidateOrg.length >= 2) {
          organization = candidateOrg;
          break;
        }
      }
    }

    // --- C. Extract Circular Ref / Memo No ---
    let refNo: string | undefined = undefined;
    const refRegexes = [
      /স্মারক নং[:\s]+([^\n<,]+)/i,
      /স্মারক নম্বর[:\s]+([^\n<,]+)/i,
      /নিয়োগ বিজ্ঞপ্তি নং[:\s]+([^\n<,]+)/i,
      /বিজ্ঞপ্তি নং[:\s]+([^\n<,]+)/i,
      /Circular No[:\s]+([^\n<,]+)/i,
      /Ref No[:\s]+([^\n<,]+)/i,
      /data-ref=["']([^"']+)["']/i
    ];

    for (const rx of refRegexes) {
      const m = rx.exec(segment);
      if (m && m[1]) {
        const val = stripTags(m[1]).replace(/^[\s:-]+/, '').trim();
        if (val.length >= 2 && !val.includes('নেই') && !val.includes('N/A')) {
          refNo = val;
          break;
        }
      }
    }

    // --- D. Extract Application Deadline ---
    let deadline: string | undefined = undefined;
    const deadlineRegexes = [
      /আবেদনের শেষ তারিখ[:\s]+([^\n<]+)/i,
      /আবেদনের শেষ সময়[:\s]+([^\n<]+)/i,
      /শেষ তারিখ[:\s]+([^\n<]+)/i,
      /Deadline[:\s]+([^\n<]+)/i,
      /Closing Date[:\s]+([^\n<]+)/i,
      /data-deadline=["']([^"']+)["']/i
    ];

    for (const rx of deadlineRegexes) {
      const m = rx.exec(segment);
      if (m && m[1]) {
        const val = stripTags(m[1]).replace(/^[\s:-]+/, '').trim();
        if (val.length >= 4) {
          deadline = val;
          break;
        }
      }
    }

    // --- E. Extract Publication & Start Date ---
    let publishedDate: string | undefined = undefined;
    const pubRegex = /(?:প্রকাশের তারিখ|Published)[:\s]+([^\n<]+)/i;
    const pubMatch = pubRegex.exec(segment);
    if (pubMatch && pubMatch[1]) {
      publishedDate = stripTags(pubMatch[1]).trim();
    }

    let startDate: string | undefined = undefined;
    const startRegex = /(?:আবেদন শুরুর তারিখ|Start Date)[:\s]+([^\n<]+)/i;
    const startMatch = startRegex.exec(segment);
    if (startMatch && startMatch[1]) {
      startDate = stripTags(startMatch[1]).trim();
    }

    // --- F. Extract Vacancies ---
    let vacancies = 1;
    const vacRegex = /(?:পদসংখ্যা|Vacanc(?:y|ies)|Total Posts)[:\s]+([০-৯0-9]+)/i;
    const vacMatch = vacRegex.exec(segment);
    if (vacMatch && vacMatch[1]) {
      const ascii = convertBnToEnDigits(vacMatch[1]);
      const parsedVac = parseInt(ascii, 10);
      if (!isNaN(parsedVac) && parsedVac > 0) vacancies = parsedVac;
    }

    // --- G. Extract URLs (Details URL & PDF URL) ---
    let detailsUrl = source.sourceUrl;
    let pdfUrl: string | undefined = undefined;

    // Search for PDF link
    const pdfRegex = /<a[^>]+href=["']([^"']+\.pdf[^"']*)["'][^>]*>/i;
    const pdfMatch = pdfRegex.exec(segment);
    if (pdfMatch && pdfMatch[1]) {
      const checkedPdf = validateAndResolveUrl(pdfMatch[1], source.sourceUrl);
      if (checkedPdf.safe && checkedPdf.url) {
        pdfUrl = checkedPdf.url;
      }
    }

    // Search for Details / Apply link
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let aMatch: RegExpExecArray | null;
    while ((aMatch = linkRegex.exec(segment)) !== null) {
      const href = aMatch[1];
      const linkLabel = stripTags(aMatch[2]).toLowerCase();
      if (linkLabel.includes('বিস্তারিত') || linkLabel.includes('apply') || linkLabel.includes('details') || linkLabel.includes('view')) {
        const checkedLink = validateAndResolveUrl(href, source.sourceUrl);
        if (checkedLink.safe && checkedLink.url) {
          detailsUrl = checkedLink.url;
          break;
        }
      }
    }

    // --- H. Review Flagging ---
    let needsReview = false;
    let reviewReason: string | undefined = undefined;

    if (!title) {
      needsReview = true;
      reviewReason = 'পদের নাম সনাক্ত করা যায়নি';
      title = 'অজ্ঞাত পদ (পর্যালোচনা আবশ্যক)';
    }

    if (!organization) {
      needsReview = true;
      reviewReason = reviewReason ? `${reviewReason}; প্রতিষ্ঠানের নাম সনাক্ত করা যায়নি` : 'প্রতিষ্ঠানের নাম সনাক্ত করা যায়নি';
      organization = source.name;
    }

    if (!deadline) {
      needsReview = true;
      reviewReason = reviewReason ? `${reviewReason}; আবেদনের শেষ তারিখ অনুপস্থিত` : 'আবেদনের শেষ তারিখ অনুপস্থিত';
      deadline = 'অপেক্ষমাণ (পর্যালোচনা আবশ্যক)';
    }

    const isCancelledNotice = Boolean(
      title.includes('স্থগিত') || 
      title.includes('বাতিল') || 
      textContent.includes('স্থগিতকরণ বিজ্ঞপ্তি') || 
      textContent.includes('নিয়োগ স্থগিত') ||
      textContent.includes('বিজ্ঞপ্তি বাতিল')
    );

    if (isCancelledNotice) {
      needsReview = true;
      reviewReason = reviewReason ? `${reviewReason}; নিয়োগ বিজ্ঞপ্তি স্থগিত বা বাতিল সংক্রান্ত নোটিশ` : 'নিয়োগ বিজ্ঞপ্তি স্থগিত বা বাতিল সংক্রান্ত নোটিশ';
    }

    if (needsReview) needsReviewCount++;

    const rawNotice: ParsedHtmlNotice = {
      refNo,
      title,
      organization,
      sourceUrl: detailsUrl,
      evidenceUrl: pdfUrl,
      deadline,
      vacancies,
      publishedDate,
      startDate,
      pdfUrl,
      detailsUrl,
      rawEvidenceText: textContent.slice(0, 300),
      needsReview,
      reviewReason,
      isCancelledNotice
    };

    rawNotices.push(rawNotice);

    // Normalize for candidate queue
    const norm = normalizeCircularNotice(rawNotice, source);
    if (norm.valid && norm.candidate) {
      candidates.push(norm.candidate);
    } else {
      errors.push(`Normalization failed for "${title}": ${norm.errors.join(', ')}`);
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
