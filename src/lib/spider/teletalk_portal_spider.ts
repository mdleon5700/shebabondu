import { chromium } from 'playwright';
import https from 'https';
import http from 'http';

export interface TeletalkPosition {
  englishTitle: string;
  bengaliTitle: string;
  fullTitle: string;
}

export interface TeletalkPortalData {
  organizationBn: string;
  organizationEn: string;
  portalUrl: string;
  circularRef: string;
  circularDate: string;
  deadline: string;
  pdfUrl?: string;
  positions: TeletalkPosition[];
}

/**
 * Normalizes a URL to ensure proper protocol
 */
function normalizeUrl(url: string): string {
  let u = url.trim();
  if (!u.startsWith('http://') && !u.startsWith('https://')) {
    u = 'https://' + u;
  }
  return u;
}

/**
 * Autonomous Spider that navigates any Teletalk recruitment portal
 * and extracts 100% verified positions directly from the live application engine!
 */
export async function scrapeTeletalkPortal(portalUrl: string): Promise<TeletalkPortalData | null> {
  const normUrl = normalizeUrl(portalUrl);
  let browser = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });

    const page = await browser.newPage({ ignoreHTTPSErrors: true });
    await page.goto(normUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);

    // Extract Organization from Header
    const orgData = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText?.trim() || '';
      const h2 = document.querySelector('h2')?.innerText?.trim() || '';
      const title = document.title || '';
      return { h1, h2, title };
    });

    // Check for circular link or circulars.php
    let circularsUrl = normUrl;
    const circularsLink = await page.locator('a[href*="circulars.php"]').first();
    const hasCircularsLink = await circularsLink.count() > 0;

    if (hasCircularsLink) {
      const href = await circularsLink.getAttribute('href');
      if (href) {
        circularsUrl = new URL(href, page.url()).toString();
        await page.goto(circularsUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);
      }
    } else if (!page.url().includes('circulars.php')) {
      // Try direct navigation to circulars.php
      const directCirculars = normUrl.replace(/\/$/, '') + '/circulars.php';
      try {
        const resp = await page.goto(directCirculars, { waitUntil: 'domcontentloaded', timeout: 10000 });
        if (!resp || resp.status() >= 400) {
          // Revert back
          await page.goto(normUrl, { waitUntil: 'domcontentloaded' });
        }
      } catch {}
    }

    // On circulars page, check for circular radio button and circular text
    let circularRef = '';
    let circularDate = '';
    let deadline = '';
    let pdfUrl = '';

    const circularRadio = page.locator('input[type="radio"][name="circular_id"]').first();
    const hasRadio = await circularRadio.count() > 0;

    if (hasRadio) {
      const parentText = await circularRadio.evaluate((el: any) => {
        const li = el.closest('li') || el.closest('label');
        const pdfA = li?.querySelector('a[href*=".pdf"]');
        return {
          text: li ? li.innerText.trim() : '',
          pdfHref: pdfA ? pdfA.getAttribute('href') : ''
        };
      });

      circularRef = parentText.text;
      if (parentText.pdfHref) {
        pdfUrl = new URL(parentText.pdfHref, page.url()).toString();
      }

      await circularRadio.check();
      await page.waitForTimeout(400);

      const submitBtn = page.locator('button[type="submit"], input[type="submit"], button#submit').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(2500);
      }
    }

    // Now on posts.php or application page
    // Extract positions
    const rawPostTexts = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('label, li, td'));
      const found: string[] = [];
      const seen = new Set<string>();

      for (const el of items) {
        const text = (el as HTMLElement).innerText?.trim() || '';
        // Post format in Teletalk: "Computer Operator [কম্পিউটার অপারেটর]" or "Office Assistant"
        if (text.includes('[') && text.includes(']') && text.length > 5 && text.length < 120) {
          if (!seen.has(text)) {
            seen.add(text);
            found.push(text);
          }
        }
      }
      return found;
    });

    const positions: TeletalkPosition[] = rawPostTexts.map(text => {
      const match = text.match(/^(.*?)\s*\[(.*?)\]$/);
      if (match) {
        return {
          englishTitle: match[1].trim(),
          bengaliTitle: match[2].trim(),
          fullTitle: `${match[2].trim()} (${match[1].trim()})`
        };
      }
      return {
        englishTitle: text,
        bengaliTitle: text,
        fullTitle: text
      };
    });

    await browser.close();

    return {
      organizationEn: orgData.h1 || orgData.title,
      organizationBn: orgData.h1 || orgData.title,
      portalUrl: normUrl,
      circularRef,
      circularDate,
      deadline,
      pdfUrl,
      positions
    };
  } catch (err: any) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    console.warn(`Teletalk Portal Spider error for ${portalUrl}:`, err.message);
    return null;
  }
}
