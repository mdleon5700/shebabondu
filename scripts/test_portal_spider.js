const { chromium } = require('playwright');

async function scrapeTeletalkPortal(portalUrl) {
  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });

    const page = await browser.newPage({ ignoreHTTPSErrors: true });
    await page.goto(portalUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);

    const orgData = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText?.trim() || '';
      const h2 = document.querySelector('h2')?.innerText?.trim() || '';
      const title = document.title || '';
      return { h1, h2, title };
    });

    const circularsLink = page.locator('a[href*="circulars.php"]').first();
    if (await circularsLink.count() > 0) {
      const href = await circularsLink.getAttribute('href');
      if (href) {
        await page.goto(new URL(href, page.url()).toString(), { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
      }
    }

    const circularRadio = page.locator('input[type="radio"][name="circular_id"]').first();
    let circularRef = '';
    let pdfUrl = '';

    if (await circularRadio.count() > 0) {
      const parentInfo = await circularRadio.evaluate((el) => {
        const li = el.closest('li') || el.closest('label');
        const pdfA = li?.querySelector('a[href*=".pdf"]');
        return {
          text: li ? li.innerText.trim() : '',
          pdfHref: pdfA ? pdfA.getAttribute('href') : ''
        };
      });

      circularRef = parentInfo.text;
      if (parentInfo.pdfHref) {
        pdfUrl = new URL(parentInfo.pdfHref, page.url()).toString();
      }

      await circularRadio.check();
      await page.waitForTimeout(400);

      const submitBtn = page.locator('button[type="submit"], input[type="submit"], button#submit').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(2500);
      }
    }

    const rawPostTexts = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('label, li, td'));
      const found = [];
      const seen = new Set();

      for (const el of items) {
        const text = el.innerText?.trim() || '';
        if (text.includes('[') && text.includes(']') && text.length > 5 && text.length < 120) {
          if (!seen.has(text)) {
            seen.add(text);
            found.push(text);
          }
        }
      }
      return found;
    });

    const positions = rawPostTexts.map(text => {
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
      portalUrl,
      circularRef,
      pdfUrl,
      positions
    };
  } catch (err) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    console.warn(`Teletalk Portal Spider error:`, err.message);
    return null;
  }
}

(async () => {
  console.log('Testing scrapeTeletalkPortal on dcjamalpur...');
  const res = await scrapeTeletalkPortal('https://dcjamalpur.teletalk.com.bd/dcjamalpur202610');
  console.log('Spider Result:', JSON.stringify(res, null, 2));
})();
