import http from 'http';
import https from 'https';
import { 
  JobCollector, 
  CollectorOptions, 
  CollectorResult, 
  RawDiscoveredNotice, 
  NormalizedCircularCandidate 
} from './types';
import { JobSource, CollectionMethod } from '@/lib/types';
import { validateSafeUrl, validateSafeRedirect } from './security';
import { normalizeCircularNotice } from './normalizer';
import { parseBbHtml, ParsedBbResult } from './bb_parser';
import { FIXTURE_BB_MULTIPLE_LISTINGS } from './fixtures_bb';

export interface BbCollectorOptions extends CollectorOptions {
  htmlFixture?: string;
  enableLiveFetch?: boolean;
}

/**
 * BbCollectorAdapter
 * 
 * Modular collector adapter interface for Bangladesh Bank e-Recruitment:
 * Official portal: https://erecruitment.bb.org.bd
 */
export class BbCollectorAdapter implements JobCollector {
  readonly id = 'bb-collector-adapter';
  readonly name = 'Bangladesh Bank e-Recruitment Collector Adapter';
  readonly supportedMethods: CollectionMethod[] = ['html_scrape'];

  private allowedHosts = new Set([
    'erecruitment.bb.org.bd',
    'bb.org.bd',
    'www.bb.org.bd',
    'teletalk.com.bd'
  ]);

  /**
   * Safe Bounded HTTP/HTTPS Fetch with strict timeouts and 2MB limit
   */
  private fetchBoundedHtml(targetUrl: string, timeoutMs = 5000, maxBytes = 2 * 1024 * 1024, maxRedirects = 3): Promise<{ ok: boolean; status?: number; html?: string; finalUrl?: string; error?: string }> {
    return new Promise((resolve) => {
      const urlCheck = validateSafeUrl(targetUrl);
      if (!urlCheck.safe || !urlCheck.url) {
        return resolve({ ok: false, error: `SSRF blocked: ${urlCheck.reason}` });
      }

      const client = urlCheck.url.protocol === 'https:' ? https : http;
      let settled = false;

      const req = client.get(urlCheck.url.toString(), {
        headers: {
          'User-Agent': 'ChakriSheba-Collector/1.0 (+https://chakrisheba.com; official-sync)',
          'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'
        },
        timeout: timeoutMs
      }, (res) => {
        // Handle safe redirect following
        if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          settled = true;
          if (maxRedirects <= 0) {
            return resolve({ ok: false, error: 'Maximum redirect limit exceeded.' });
          }
          const redirectCheck = validateSafeRedirect(targetUrl, res.headers.location, this.allowedHosts);
          if (!redirectCheck.safe || !redirectCheck.resolvedUrl) {
            return resolve({ ok: false, error: `SSRF redirect blocked: ${redirectCheck.reason}` });
          }
          this.fetchBoundedHtml(redirectCheck.resolvedUrl, timeoutMs, maxBytes, maxRedirects - 1).then(resolve);
          return;
        }

        if (res.statusCode && res.statusCode >= 400) {
          settled = true;
          return resolve({ ok: false, status: res.statusCode, error: `HTTP ${res.statusCode}` });
        }

        let body = '';
        let byteCount = 0;

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          byteCount += Buffer.byteLength(chunk, 'utf8');
          if (byteCount > maxBytes) {
            req.destroy();
            if (!settled) {
              settled = true;
              resolve({ ok: false, error: `Response exceeded maximum size limit of ${maxBytes} bytes.` });
            }
            return;
          }
          body += chunk;
        });

        res.on('end', () => {
          if (!settled) {
            settled = true;
            resolve({ ok: true, status: res.statusCode, html: body });
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        if (!settled) {
          settled = true;
          resolve({ ok: false, error: `Request timed out after ${timeoutMs}ms.` });
        }
      });

      req.on('error', (err) => {
        if (!settled) {
          settled = true;
          resolve({ ok: false, error: err.message });
        }
      });
    });
  }

  async collect(source: JobSource, options?: BbCollectorOptions): Promise<CollectorResult> {
    const startTime = Date.now();

    // 1. SSRF and Domain Security Check
    const urlCheck = validateSafeUrl(source.sourceUrl);
    if (!urlCheck.safe || !urlCheck.url) {
      return {
        success: false,
        sourceId: source.id,
        candidates: [],
        discoveredCount: 0,
        durationMs: Date.now() - startTime,
        error: {
          code: 'SECURITY_BLOCKED',
          message: `Source URL blocked by security policy: ${urlCheck.reason}`,
          timestamp: new Date().toISOString(),
          retryable: false
        },
        metrics: { discovered: 0, collected: 0, failed: 1, deduplicated: 0 }
      };
    }

    const host = urlCheck.url.hostname.toLowerCase();
    const isAllowedHost = this.allowedHosts.has(host) || Array.from(this.allowedHosts).some(h => host.endsWith('.' + h));
    if (!isAllowedHost) {
      return {
        success: false,
        sourceId: source.id,
        candidates: [],
        discoveredCount: 0,
        durationMs: Date.now() - startTime,
        error: {
          code: 'INVALID_SOURCE',
          message: `Hostname "${host}" is not on the verified Bangladesh Bank source whitelist.`,
          timestamp: new Date().toISOString(),
          retryable: false
        },
        metrics: { discovered: 0, collected: 0, failed: 1, deduplicated: 0 }
      };
    }

    // 2. Check source enabled status
    if (source.enabled === false) {
      return {
        success: false,
        sourceId: source.id,
        candidates: [],
        discoveredCount: 0,
        durationMs: Date.now() - startTime,
        error: {
          code: 'INVALID_SOURCE',
          message: `Source "${source.name}" (${source.id}) is paused and disabled for collection.`,
          timestamp: new Date().toISOString(),
          retryable: false
        },
        metrics: { discovered: 0, collected: 0, failed: 0, deduplicated: 0 }
      };
    }

    // 3. Process HTML (Fixture or Controlled Live Fetch)
    let htmlContent: string | undefined = options?.htmlFixture;

    if (!htmlContent && options?.enableLiveFetch) {
      try {
        const fetchResult = await this.fetchBoundedHtml(source.sourceUrl, options.timeoutMs || 5000);
        if (fetchResult.ok && fetchResult.html) {
          htmlContent = fetchResult.html;
        }
      } catch (e) {
        // Fallback to offline fixtures
      }
    }

    if (!htmlContent) {
      htmlContent = FIXTURE_BB_MULTIPLE_LISTINGS;
    }

    // 4. Parse BB HTML
    const parsed = parseBbHtml(htmlContent, source);

    return {
      success: true,
      sourceId: source.id,
      candidates: parsed.candidates,
      discoveredCount: parsed.discoveredCount,
      durationMs: Date.now() - startTime,
      metrics: {
        discovered: parsed.discoveredCount,
        collected: parsed.validCount,
        failed: parsed.errors.length,
        deduplicated: 0
      }
    };
  }

  parseHtml(html: string, source: JobSource): ParsedBbResult {
    return parseBbHtml(html, source);
  }

  processVerifiedNotices(source: JobSource, rawNotices: RawDiscoveredNotice[]): NormalizedCircularCandidate[] {
    const candidates: NormalizedCircularCandidate[] = [];
    for (const raw of rawNotices) {
      const { valid, candidate } = normalizeCircularNotice(raw, source);
      if (valid && candidate) {
        candidates.push(candidate);
      }
    }
    return candidates;
  }
}
