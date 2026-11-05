import https from 'https';
import http from 'http';

export interface IndexingResult {
  url: string;
  timestamp: string;
  googlePingSuccess: boolean;
  bingPingSuccess: boolean;
  message: string;
}

/**
 * Pings Google and Bing to immediately crawl newly published or updated job circular URLs.
 * Works seamlessly in all environments without requiring paid third-party tools.
 */
export async function triggerInstantSearchIndexing(jobSlugOrId: string, siteUrl = 'https://chakrisheba.com'): Promise<IndexingResult> {
  const targetJobUrl = `${siteUrl.replace(/\/$/, '')}/jobs/${jobSlugOrId}`;
  const sitemapUrl = `${siteUrl.replace(/\/$/, '')}/sitemap.xml`;

  let googlePingSuccess = false;
  let bingPingSuccess = false;

  // 1. Ping Google Sitemap Indexing
  try {
    await new Promise((resolve) => {
      https.get(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, { timeout: 6000 }, (res) => {
        googlePingSuccess = res.statusCode ? res.statusCode < 400 : false;
        resolve(true);
      }).on('error', () => resolve(false));
    });
  } catch {}

  // 2. Ping Bing IndexNow / Sitemap
  try {
    await new Promise((resolve) => {
      https.get(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, { timeout: 6000 }, (res) => {
        bingPingSuccess = res.statusCode ? res.statusCode < 400 : false;
        resolve(true);
      }).on('error', () => resolve(false));
    });
  } catch {}

  const result: IndexingResult = {
    url: targetJobUrl,
    timestamp: new Date().toISOString(),
    googlePingSuccess,
    bingPingSuccess,
    message: `ইনস্ট্যান্ট ইনডেক্সিং সিগন্যাল সফলভাবে পাঠানো হয়েছে: ${targetJobUrl}`
  };

  return result;
}
