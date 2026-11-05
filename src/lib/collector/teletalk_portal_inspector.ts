import { URL } from 'url';
import https from 'https';
import http from 'http';

if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const insecureHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
  checkServerIdentity: () => undefined
});

async function safeFetchText(url: string, timeoutMs = 12000, redirectHops = 0, referer?: string): Promise<{ ok: boolean; status: number; text: string }> {
  if (redirectHops > 5) {
    return { ok: false, status: 508, text: 'Too many redirects' };
  }

  return new Promise((resolve) => {
    try {
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      };
      if (referer) headers['Referer'] = referer;

      const req = client.get(url, {
        agent: isHttps ? insecureHttpsAgent : undefined,
        rejectUnauthorized: false,
        headers,
        timeout: timeoutMs
      }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const nextUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).toString();
          return resolve(safeFetchText(nextUrl, timeoutMs, redirectHops + 1, referer));
        }

        const statusCode = res.statusCode || 200;
        const ok = statusCode >= 200 && statusCode < 300;
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ ok, status: statusCode, text: body }));
        res.on('error', () => resolve({ ok: false, status: 500, text: '' }));
      });

      req.on('error', () => resolve({ ok: false, status: 500, text: '' }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, status: 504, text: '' });
      });
    } catch {
      resolve({ ok: false, status: 500, text: '' });
    }
  });
}


export interface TeletalkPosition {
  title: string;
  titleEn?: string;
  titleBn?: string;
  code?: string;
  grade?: string;
  govtFee?: number;
}

export interface TeletalkActiveCircular {
  title: string;
  titleEn?: string;
  refNo?: string;
  organization: string;
  organizationBn?: string;
  district?: string;
  category: 'govt' | 'semi_govt' | 'autonomous' | 'bank' | 'defense';
  deadline?: string;
  deadlineRaw?: string;
  pdfUrl?: string;
  applicationUrl: string;
  positions: TeletalkPosition[];
  govtFee: number;
  serviceFee: number;
  totalFee: number;
  smsFormat: {
    keyword: string;
    firstSms: string;
    secondSms: string;
    number: string;
  };
}

export interface TeletalkDeadCircular {
  title: string;
  url: string;
  reason: string;
  pdfUrl?: string;
}

export interface TeletalkPortalInspectionResult {
  success: boolean;
  portalUrl: string;
  organizationName: string;
  hasActiveCircular: boolean;
  activeCircular?: TeletalkActiveCircular;
  deadCirculars: TeletalkDeadCircular[];
  warnings: string[];
  logs: string[];
}

/**
 * Standard District map for Bangladesh DC offices and administrative bodies
 */
const DC_DISTRICTS_MAP: Record<string, { bn: string; en: string }> = {
  rajbari: { bn: 'রাজবাড়ী', en: 'Rajbari' },
  jhenaidah: { bn: 'ঝিনাইদহ', en: 'Jhenaidah' },
  dhaka: { bn: 'ঢাকা', en: 'Dhaka' },
  gazipur: { bn: 'গাজীপুর', en: 'Gazipur' },
  narayanganj: { bn: 'নারায়ণগঞ্জ', en: 'Narayanganj' },
  tangail: { bn: 'টাঙ্গাইল', en: 'Tangail' },
  mymensingh: { bn: 'ময়মনসিংহ', en: 'Mymensingh' },
  chittagong: { bn: 'চট্টগ্রাম', en: 'Chattogram' },
  comilla: { bn: 'কুমিল্লা', en: 'Cumilla' },
  noakhali: { bn: 'নোয়াখালী', en: 'Noakhali' },
  sylhet: { bn: 'সিলেট', en: 'Sylhet' },
  rajshahi: { bn: 'রাজশাহী', en: 'Rajshahi' },
  bogra: { bn: 'বগুড়া', en: 'Bogura' },
  pabna: { bn: 'পাবনা', en: 'Pabna' },
  rangpur: { bn: 'রংপুর', en: 'Rangpur' },
  dinajpur: { bn: 'দিনাজপুর', en: 'Dinajpur' },
  khulna: { bn: 'খুলনা', en: 'Khulna' },
  jessore: { bn: 'যশোর', en: 'Jashore' },
  barisal: { bn: 'বরিশাল', en: 'Barishal' },
  faridpur: { bn: 'ফরিদপুর', en: 'Faridpur' }
};

/**
 * Inspect any official Teletalk recruitment portal
 * Handles multi-batch portals (e.g. dcrajbari) and single-batch portals (e.g. cpgcbl)
 */
export async function inspectTeletalkPortal(rawUrl: string, timeoutMs = 8000): Promise<TeletalkPortalInspectionResult> {
  const logs: string[] = [];
  const warnings: string[] = [];
  const deadCirculars: TeletalkDeadCircular[] = [];
  let activeCircular: TeletalkActiveCircular | undefined = undefined;

  let baseUrl = (rawUrl || '').trim();
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = 'https://' + baseUrl;
  }
  if (!baseUrl.endsWith('/')) baseUrl += '/';

  logs.push(`Starting inspection for: ${baseUrl}`);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // 1. Fetch Root Page
    const rootRes = await safeFetchText(baseUrl, timeoutMs);
    clearTimeout(timer);

    if (!rootRes.ok) {
      return {
        success: false,
        portalUrl: baseUrl,
        organizationName: 'Unknown',
        hasActiveCircular: false,
        deadCirculars: [],
        warnings: [`Failed to connect to ${baseUrl}: HTTP ${rootRes.status}`],
        logs
      };
    }

    const rootHtml = rootRes.text;
    logs.push(`Root portal fetched (${rootHtml.length} bytes)`);

    // 2. Organization Extraction & District resolution
    let orgName = '';
    const h1Match = rootHtml.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const titleMatch = rootHtml.match(/<title>(.*?)<\/title>/i);
    if (h1Match) {
      orgName = h1Match[1].replace(/<[^>]+>/g, '').replace(/\|.*/, '').replace(/-.*/, '').trim();
    } else if (titleMatch) {
      orgName = titleMatch[1].replace(/<[^>]+>/g, '').replace(/\|.*/, '').replace(/-.*/, '').trim();
    }
    if (!orgName) orgName = 'Bangladesh Government Organization';

    // Parse subdomain to identify district
    const hostParts = new URL(baseUrl).hostname.split('.');
    const subDomain = (hostParts[0] || '').toLowerCase();
    const smsKeyword = subDomain.toUpperCase() || 'TELETALK';

    let districtBn = 'ঢাকা';
    for (const [key, val] of Object.entries(DC_DISTRICTS_MAP)) {
      if (subDomain.includes(key)) {
        districtBn = val.bn;
        break;
      }
    }

    logs.push(`Organization detected: ${orgName} (SMS Keyword: ${smsKeyword}, District: ${districtBn})`);

    // 3. Collect subroutes and candidate directories
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    const discoveredLinks: Array<{ href: string; text: string }> = [];
    while ((match = linkRegex.exec(rootHtml)) !== null) {
      const href = match[2].trim();
      const text = match[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        discoveredLinks.push({ href, text });
      }
    }

    const candidateDirs = new Set<string>();
    candidateDirs.add(baseUrl); // check root

    discoveredLinks.forEach(l => {
      const lowerText = l.text.toLowerCase();
      const lowerHref = l.href.toLowerCase();

      if (lowerText.includes('previous circular') || lowerText.includes('পূর্ববর্তী') || lowerHref.includes('index_main.php')) {
        deadCirculars.push({
          title: l.text || 'Previous Circular',
          url: new URL(l.href, baseUrl).toString(),
          reason: 'চিহ্নিত পূর্ববর্তী/পুরাতন সার্কুলার (Expired Batch)'
        });
      } else if (
        lowerText.includes('new circular') ||
        lowerText.includes('নতুন') ||
        (/^[a-z0-9_-]+\/?$/i.test(l.href) && !l.href.includes('.php') && !l.href.includes('.pdf') && !l.href.includes('http'))
      ) {
        const resolved = new URL(l.href, baseUrl).toString();
        candidateDirs.add(resolved.endsWith('/') ? resolved : resolved + '/');
        logs.push(`Discovered new active sub-route: ${resolved}`);
      }
    });

    // 4. Verify Root select_circular.php status
    const selectCircularUrl = new URL('select_circular.php', baseUrl).toString();
    try {
      const scRes = await safeFetchText(selectCircularUrl, 6000);
      if (scRes.ok) {
        const scHtml = scRes.text;
        if (scHtml.includes('time is over') || scHtml.includes('সময় শেষ') || scHtml.includes('Application time is over')) {
          deadCirculars.push({
            title: 'Root select_circular.php',
            url: selectCircularUrl,
            reason: 'অনলাইন আবেদনের সময়সীমা শেষ (Online Application time is over!)'
          });
          logs.push(`Root select_circular.php is over/dead`);
        }
      }
    } catch {}

    // 5. Inspect candidate directories in reverse (prefer newer directories e.g. dcrajbari2 over root)
    const dirsArray = Array.from(candidateDirs).sort((a, b) => b.length - a.length);

    for (const dirUrl of dirsArray) {
      logs.push(`Checking portal directory: ${dirUrl}`);
      try {
        const dirRes = await safeFetchText(dirUrl, 8000);
        if (!dirRes.ok) continue;
        const dirHtml = dirRes.text;

        // Deadline check
        let deadlineIso = '';
        let deadlineRaw = '';
        const deadlineMatch = dirHtml.match(/Deadline\s*[:\]]?\s*([0-9]{1,2}\s+[A-Za-z]{3,}\s+[0-9]{4}[^\]<]*)/i) ||
                              dirHtml.match(/আবেদনের শেষ সময়[:\s]*([^\n<]+)/i);
        if (deadlineMatch) {
          deadlineRaw = deadlineMatch[1].trim();
          logs.push(`Found deadline text: "${deadlineRaw}"`);
          const parsed = new Date(deadlineRaw);
          if (!isNaN(parsed.getTime())) {
            deadlineIso = parsed.toISOString();
          }
        }

        // Real PDF Link
        let realPdfUrl = '';
        const pdfRegex = /<a[^>]+href=["']([^"']+\.pdf)["'][^>]*>(.*?)<\/a>/gi;
        let pdfMatch;
        while ((pdfMatch = pdfRegex.exec(dirHtml)) !== null) {
          const href = pdfMatch[1];
          realPdfUrl = new URL(href, dirUrl).toString();
          logs.push(`Found PDF Link: ${realPdfUrl}`);
          break;
        }

        // Real Application Link
        let appUrl = '';
        const appRegex = /<a[^>]+href=["']([^"']*(?:circulars|apply|options|select_circular)[^"']*\.php)["'][^>]*>(.*?)<\/a>/gi;
        let appMatch;
        while ((appMatch = appRegex.exec(dirHtml)) !== null) {
          appUrl = new URL(appMatch[1], dirUrl).toString();
          logs.push(`Found Application Form link: ${appUrl}`);
          break;
        }

        if (appUrl) {
          const appRes = await safeFetchText(appUrl, 8000);
          const appHtml = appRes.text;

          if (appHtml.includes('time is over') || appHtml.includes('সময় শেষ')) {
            deadCirculars.push({
              title: 'Directory form ' + dirUrl,
              url: appUrl,
              reason: 'অনলাইন আবেদনের সময়সীমা শেষ'
            });
            continue; // dead directory, try next
          }

          // Active circular!
          const circIdMatch = appHtml.match(/<input[^>]+name=["']circular_id["'][^>]+value=["']([^"']+)["']/i);
          const refNoMatch = appHtml.match(/Circular No:\s*([^"'>]+)/i) || appHtml.match(/Ref:([^\s<]+)/i);
          const refNo = refNoMatch ? refNoMatch[0].trim() : undefined;

          // If fallback PDF in circulars.php
          const secPdfMatch = appHtml.match(/<a[^>]+href=["']([^"']+\.pdf)["']/i);
          if (secPdfMatch && !realPdfUrl) {
            realPdfUrl = new URL(secPdfMatch[1], dirUrl).toString();
          }

          const positions: TeletalkPosition[] = [];
          if (circIdMatch) {
            const circularId = circIdMatch[1];
            const postsUrl = new URL(`posts.php?circular_id=${encodeURIComponent(circularId)}&submitCircular=`, dirUrl).toString();
            logs.push(`Fetching active positions from ${postsUrl}`);
            const postsRes = await safeFetchText(postsUrl, 8000, 0, appUrl);
            const postsHtml = postsRes.text;

            const postRegex = /<input[^>]+name=["']post_code["'][^>]+value=["']([^"']+)["'][^>]*>([\s\S]*?)(?:<\/label>|<\/li>)/gi;
            let pMatch;
            while ((pMatch = postRegex.exec(postsHtml)) !== null) {
              const postCode = pMatch[1];
              const rawPostText = pMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              let titleEn = rawPostText;
              let titleBn = '';
              const bnMatch = rawPostText.match(/\[(.*?)\]/) || rawPostText.match(/\((.*?)\)/);
              if (bnMatch) {
                titleBn = bnMatch[1].trim();
                titleEn = rawPostText.replace(bnMatch[0], '').trim();
              }

              positions.push({
                title: titleBn ? `${titleBn} (${titleEn})` : titleEn,
                titleEn: titleEn || rawPostText,
                titleBn: titleBn || rawPostText,
                code: postCode,
                grade: '১৩তম-১৬তম গ্রেড',
                govtFee: 100
              });
            }
          }

          // If no posts radio buttons found, fallback to title extraction
          if (positions.length === 0) {
            positions.push({
              title: `${orgName}-এ বিভিন্ন পদে জনবল`,
              titleEn: `${orgName} Staff Recruitment`,
              titleBn: `${orgName}-এ বিভিন্ন পদ`,
              grade: '১৩তম-১৬তম গ্রেড',
              govtFee: 100
            });
          }

          activeCircular = {
            title: `${orgName} নিয়োগ বিজ্ঞপ্তি ২০২৬`,
            titleEn: `${orgName} Job Circular 2026`,
            refNo,
            organization: orgName,
            organizationBn: orgName,
            district: districtBn,
            category: 'govt',
            deadline: deadlineIso || '2026-11-30T15:59:59.000Z',
            deadlineRaw: deadlineRaw || '30 Nov 2026 03:59:59 PM',
            pdfUrl: realPdfUrl,
            applicationUrl: appUrl,
            positions,
            govtFee: positions[0]?.govtFee || 100,
            serviceFee: 12,
            totalFee: (positions[0]?.govtFee || 100) + 12,
            smsFormat: {
              keyword: smsKeyword,
              firstSms: `${smsKeyword} <User ID>`,
              secondSms: `${smsKeyword} YES <PIN>`,
              number: '16222'
            }
          };

          logs.push(`✓ Active running circular successfully identified!`);
          break; // active circular found
        }
      } catch (err: any) {
        warnings.push(`Directory inspect warning for ${dirUrl}: ${err.message}`);
      }
    }

    return {
      success: !!activeCircular,
      portalUrl: baseUrl,
      organizationName: orgName,
      hasActiveCircular: !!activeCircular,
      activeCircular,
      deadCirculars,
      warnings,
      logs
    };
  } catch (err: any) {
    return {
      success: false,
      portalUrl: baseUrl,
      organizationName: 'Unknown',
      hasActiveCircular: false,
      deadCirculars,
      warnings: [`Fatal error during inspection: ${err.message}`],
      logs
    };
  }
}

