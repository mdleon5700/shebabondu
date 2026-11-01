import crypto from 'crypto';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { JobSource } from '@/lib/types';
import {
  PdfExtractedCircular,
  PdfFetchOptions,
  PdfExtractOptions
} from './types';
import { validateSafeUrl, validateSafeRedirect } from './security';

export interface BoundedPdfDownloadResult {
  success: boolean;
  buffer?: Buffer;
  contentType?: string;
  sizeBytes?: number;
  pdfHash?: string;
  error?: string;
  errorCode?: 'SECURITY_BLOCKED' | 'TIMEOUT' | 'OVERSIZED' | 'INVALID_CONTENT_TYPE' | 'INVALID_SIGNATURE' | 'NETWORK_ERROR';
  finalUrl?: string;
}

export interface PdfTextExtractionResult {
  success: boolean;
  pdfHash: string;
  totalPages: number;
  pagesProcessed: number;
  isScanned: boolean;
  requiresOcr: boolean;
  rawTextByPage: Array<{ pageNumber: number; text: string }>;
  totalTextChars: number;
  warnings: string[];
  error?: string;
  errorCode?: 'PDF_MALFORMED' | 'PDF_ENCRYPTED' | 'PDF_UNREADABLE' | 'EMPTY_FILE';
}

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const DEFAULT_TIMEOUT_MS = 10000;                // 10 seconds
const DEFAULT_MAX_PAGES = 20;                    // Max 20 pages processed
const DEFAULT_MIN_CHARS_TEXT_BASED = 50;         // Minimum text threshold for OCR detection

const ALLOWED_PDF_HOSTS: Record<string, Set<string>> = {
  'bb-erecruitment': new Set(['erecruitment.bb.org.bd', 'bb.org.bd', 'www.bb.org.bd']),
  'bpsc-portal': new Set(['bpsc.teletalk.com.bd', 'www.bpsc.gov.bd', 'bpsc.gov.bd', 'nchoice.teletalk.com.bd']),
  'teletalk-alljobs': new Set(['alljobs.teletalk.com.bd', 'teletalk.com.bd'])
};

/**
 * Validates whether a PDF URL is permitted for a given JobSource.
 */
export function validatePdfUrlForSource(
  rawUrl: string,
  source?: JobSource,
  allowedCustomHosts?: Set<string>
): { safe: boolean; reason?: string; parsedUrl?: URL } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, reason: 'PDF URL must be a non-empty string.' };
  }

  const check = validateSafeUrl(rawUrl);
  if (!check.safe || !check.url) {
    return { safe: false, reason: check.reason || 'Unsafe URL format' };
  }

  // Offline / local testing fixture allowance
  const host = check.url.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1') {
    return { safe: true, parsedUrl: check.url };
  }

  // Host allowlist check
  let allowed: Set<string> | undefined;
  if (source && ALLOWED_PDF_HOSTS[source.id]) {
    allowed = ALLOWED_PDF_HOSTS[source.id];
  } else if (allowedCustomHosts && allowedCustomHosts.size > 0) {
    allowed = allowedCustomHosts;
  } else if (source && source.sourceUrl) {
    try {
      const srcHost = new URL(source.sourceUrl).hostname.toLowerCase();
      allowed = new Set([srcHost]);
    } catch {
      // fallback
    }
  }

  if (allowed && allowed.size > 0) {
    const isAllowed = allowed.has(host) || Array.from(allowed).some(h => host.endsWith('.' + h));
    if (!isAllowed) {
      return {
        safe: false,
        reason: `PDF host "${host}" is not on the approved allowlist for source "${source?.id || 'unknown'}".`
      };
    }
  }

  return { safe: true, parsedUrl: check.url };
}

/**
 * Downloads a PDF with bounded size, strict timeouts, redirect re-validation, and signature checks.
 */
export async function downloadBoundedPdf(
  targetUrl: string,
  source?: JobSource,
  options?: PdfFetchOptions
): Promise<BoundedPdfDownloadResult> {
  const maxSizeBytes = options?.maxSizeBytes || DEFAULT_MAX_SIZE_BYTES;
  const timeoutMs = options?.timeoutMs || DEFAULT_TIMEOUT_MS;
  const maxRedirects = options?.maxRedirects ?? 3;

  let currentUrl = targetUrl;
  let redirectCount = 0;

  while (redirectCount <= maxRedirects) {
    const secCheck = validatePdfUrlForSource(currentUrl, source, options?.allowedHosts);
    if (!secCheck.safe || !secCheck.parsedUrl) {
      return {
        success: false,
        finalUrl: currentUrl,
        error: secCheck.reason || 'Security check failed on PDF URL',
        errorCode: 'SECURITY_BLOCKED'
      };
    }

    try {
      const resp = await fetchSingleBoundedRequest(secCheck.parsedUrl, timeoutMs, maxSizeBytes);

      // Handle Redirects
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        redirectCount++;
        if (redirectCount > maxRedirects) {
          return {
            success: false,
            finalUrl: currentUrl,
            error: `Excessive redirects (exceeded ${maxRedirects} hops)`,
            errorCode: 'SECURITY_BLOCKED'
          };
        }

        const allowedHosts = options?.allowedHosts || (source && ALLOWED_PDF_HOSTS[source.id]);
        const redirCheck = validateSafeRedirect(currentUrl, resp.headers.location, allowedHosts);
        if (!redirCheck.safe || !redirCheck.resolvedUrl) {
          return {
            success: false,
            finalUrl: currentUrl,
            error: redirCheck.reason || 'Redirect destination blocked by security policy',
            errorCode: 'SECURITY_BLOCKED'
          };
        }

        currentUrl = redirCheck.resolvedUrl;
        continue;
      }

      if (resp.statusCode < 200 || resp.statusCode >= 300) {
        return {
          success: false,
          finalUrl: currentUrl,
          error: `HTTP ${resp.statusCode}: ${resp.statusMessage || 'Request failed'}`,
          errorCode: 'NETWORK_ERROR'
        };
      }

      const contentType = (resp.headers['content-type'] || '').toLowerCase();
      const buffer = resp.body;

      // Verify buffer is not empty
      if (!buffer || buffer.length === 0) {
        return {
          success: false,
          finalUrl: currentUrl,
          error: 'Downloaded PDF is empty (0 bytes)',
          errorCode: 'INVALID_SIGNATURE'
        };
      }

      // Check PDF magic bytes (%PDF-)
      const magic = buffer.slice(0, 5).toString('ascii');
      if (magic !== '%PDF-') {
        // Look up to 1024 bytes in case of leading whitespace/comments
        const head = buffer.slice(0, 1024).toString('ascii');
        if (!head.includes('%PDF-')) {
          return {
            success: false,
            finalUrl: currentUrl,
            error: `File does not have a valid PDF signature (%PDF-). Detected content-type: "${contentType}".`,
            errorCode: 'INVALID_SIGNATURE',
            sizeBytes: buffer.length
          };
        }
      }

      const pdfHash = crypto.createHash('sha256').update(buffer).digest('hex');

      return {
        success: true,
        buffer,
        contentType,
        sizeBytes: buffer.length,
        pdfHash,
        finalUrl: currentUrl
      };
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
        return {
          success: false,
          finalUrl: currentUrl,
          error: `PDF download timed out after ${timeoutMs}ms`,
          errorCode: 'TIMEOUT'
        };
      }
      if (err.code === 'OVERSIZED' || err.message?.includes('exceeded maximum limit')) {
        return {
          success: false,
          finalUrl: currentUrl,
          error: `PDF file exceeded maximum size limit of ${Math.round(maxSizeBytes / 1024 / 1024)} MB`,
          errorCode: 'OVERSIZED'
        };
      }
      return {
        success: false,
        finalUrl: currentUrl,
        error: `Network error downloading PDF: ${err.message}`,
        errorCode: 'NETWORK_ERROR'
      };
    }
  }

  return {
    success: false,
    finalUrl: currentUrl,
    error: 'Too many redirects',
    errorCode: 'SECURITY_BLOCKED'
  };
}

/**
 * Low-level HTTP/HTTPS bounded downloader.
 */
function fetchSingleBoundedRequest(
  url: URL,
  timeoutMs: number,
  maxSizeBytes: number
): Promise<{ statusCode: number; statusMessage?: string; headers: http.IncomingHttpHeaders; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.get(url, {
      headers: {
        'User-Agent': 'ChakriSheba-Collector/2.0 (Bangladesh Recruitment Verification; +https://chakrisheba.com)',
        'Accept': 'application/pdf, application/octet-stream;q=0.9, */*;q=0.5'
      },
      timeout: timeoutMs
    }, (res) => {
      // Content-Length guard
      const contentLengthHeader = res.headers['content-length'];
      if (contentLengthHeader) {
        const declaredLength = parseInt(contentLengthHeader, 10);
        if (!isNaN(declaredLength) && declaredLength > maxSizeBytes) {
          res.destroy();
          return reject(new Error(`PDF Content-Length (${declaredLength} bytes) exceeded maximum limit of ${maxSizeBytes} bytes`));
        }
      }

      // Check for redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); // drain response
        return resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: Buffer.alloc(0)
        });
      }

      const chunks: Buffer[] = [];
      let totalReceived = 0;

      res.on('data', (chunk: Buffer) => {
        totalReceived += chunk.length;
        if (totalReceived > maxSizeBytes) {
          res.destroy();
          const err: any = new Error(`PDF stream exceeded maximum limit of ${maxSizeBytes} bytes`);
          err.code = 'OVERSIZED';
          return reject(err);
        }
        chunks.push(chunk);
      });

      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode || 200,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const err: any = new Error(`Request timed out after ${timeoutMs}ms`);
      err.code = 'ETIMEDOUT';
      reject(err);
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Extracts per-page text from a raw PDF buffer using unpdf, enforcing page limits and OCR detection.
 */
export async function extractPdfTextAndPages(
  buffer: Buffer,
  options?: PdfExtractOptions
): Promise<PdfTextExtractionResult> {
  const maxPages = options?.maxPages || DEFAULT_MAX_PAGES;
  const minCharsForTextBased = options?.minCharsForTextBased || DEFAULT_MIN_CHARS_TEXT_BASED;
  const pdfHash = crypto.createHash('sha256').update(buffer).digest('hex');
  const warnings: string[] = [];

  if (!buffer || buffer.length === 0) {
    return {
      success: false,
      pdfHash,
      totalPages: 0,
      pagesProcessed: 0,
      isScanned: false,
      requiresOcr: false,
      rawTextByPage: [],
      totalTextChars: 0,
      warnings: ['PDF ফাইল শূন্য (০ বাইট)'],
      error: 'Empty PDF buffer',
      errorCode: 'EMPTY_FILE'
    };
  }

  // Pre-check magic bytes
  const head = buffer.slice(0, 1024).toString('ascii');
  if (!head.includes('%PDF-')) {
    return {
      success: false,
      pdfHash,
      totalPages: 0,
      pagesProcessed: 0,
      isScanned: false,
      requiresOcr: false,
      rawTextByPage: [],
      totalTextChars: 0,
      warnings: ['অবৈধ PDF সিগনেচার'],
      error: 'Invalid PDF magic bytes (%PDF- not found)',
      errorCode: 'PDF_MALFORMED'
    };
  }

  try {
    const { getDocumentProxy, extractText } = await import('unpdf');

    let pdf: any;
    try {
      pdf = await getDocumentProxy(new Uint8Array(buffer), {
        maxImageSize: 16_777_216 // Limit image decoding memory to ~16MP
      });
    } catch (proxyErr: any) {
      const msg = proxyErr.message || String(proxyErr);
      if (msg.includes('Password') || msg.includes('password') || msg.includes('encrypted')) {
        return {
          success: false,
          pdfHash,
          totalPages: 0,
          pagesProcessed: 0,
          isScanned: false,
          requiresOcr: false,
          rawTextByPage: [],
          totalTextChars: 0,
          warnings: ['PDF ফাইলটি পাসওয়ার্ড বা এনক্রিপশন দ্বারা সুরক্ষিত'],
          error: 'PDF is password-protected or encrypted',
          errorCode: 'PDF_ENCRYPTED'
        };
      }
      return {
        success: false,
        pdfHash,
        totalPages: 0,
        pagesProcessed: 0,
        isScanned: false,
        requiresOcr: false,
        rawTextByPage: [],
        totalTextChars: 0,
        warnings: [`PDF গঠনগতভাবে ত্রুটিপূর্ণ: ${msg}`],
        error: `Invalid PDF structure: ${msg}`,
        errorCode: 'PDF_MALFORMED'
      };
    }

    const totalPages = pdf.numPages || 1;
    let pagesToProcess = totalPages;
    if (totalPages > maxPages) {
      pagesToProcess = maxPages;
      warnings.push(`অতিরিক্ত পৃষ্ঠা সংখ্যা (${totalPages} পৃষ্ঠা); প্রথম ${maxPages} পৃষ্ঠা প্রক্রিয়াজাত করা হয়েছে`);
    }

    const textResult = await extractText(pdf, { mergePages: false });
    const textList: string[] = Array.isArray(textResult.text) ? textResult.text : [textResult.text || ''];

    const rawTextByPage: Array<{ pageNumber: number; text: string }> = [];
    let totalTextChars = 0;

    for (let i = 0; i < pagesToProcess; i++) {
      const pageNum = i + 1;
      const rawPageText = textList[i] || '';
      const cleanText = rawPageText.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim();
      rawTextByPage.push({
        pageNumber: pageNum,
        text: cleanText
      });
      totalTextChars += cleanText.length;
    }

    // OCR / Scanned PDF detection
    let isScanned = false;
    let requiresOcr = false;

    // If total text across all processed pages is very low, this is a scanned / image-only PDF
    if (totalTextChars < minCharsForTextBased) {
      isScanned = true;
      requiresOcr = true;
      warnings.push('ডকুমেন্টটি স্ক্যান করা ইমেজ PDF; সম্পূর্ণ টেক্সট এক্সট্রাকশনের জন্য OCR আবশ্যক (সিস্টেমে OCR ইঞ্জিন অনুপস্থিত)');
    }

    return {
      success: true,
      pdfHash,
      totalPages,
      pagesProcessed: pagesToProcess,
      isScanned,
      requiresOcr,
      rawTextByPage,
      totalTextChars,
      warnings
    };
  } catch (err: any) {
    return {
      success: false,
      pdfHash,
      totalPages: 0,
      pagesProcessed: 0,
      isScanned: false,
      requiresOcr: false,
      rawTextByPage: [],
      totalTextChars: 0,
      warnings: [`PDF টেক্সট প্রসেসিং ব্যর্থ: ${err.message}`],
      error: `Failed to extract text from PDF: ${err.message}`,
      errorCode: 'PDF_UNREADABLE'
    };
  }
}
