const { chromium } = require('playwright');

async function find1504() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const exactCulprits = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width >= 1500 || el.scrollWidth >= 1500 || rect.right >= 1500) {
        list.push({
          tag: el.tagName.toLowerCase(),
          id: el.id,
          cls: (typeof el.className === 'string' ? el.className : '').slice(0, 70),
          width: Math.round(rect.width),
          right: Math.round(rect.right),
          scrollWidth: el.scrollWidth,
          parent: el.parentElement ? el.parentElement.tagName.toLowerCase() : null
        });
      }
    });
    return list;
  });

  console.log('Elements >= 1500px:', JSON.stringify(exactCulprits, null, 2));
  await browser.close();
}

find1504();
