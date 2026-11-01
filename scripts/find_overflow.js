const { chromium } = require('playwright');

async function findOverflow() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const culprits = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    const overflowing = [];

    function check(el) {
      const rect = el.getBoundingClientRect();
      const cls = typeof el.className === 'string' ? el.className : (el.className?.baseVal || '');
      if (rect.right > winWidth + 2 || el.scrollWidth > winWidth + 2) {
        overflowing.push({
          tag: el.tagName.toLowerCase(),
          className: cls.slice(0, 80),
          id: el.id,
          right: Math.round(rect.right),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          outerHTML: el.outerHTML.slice(0, 120)
        });
      }
      for (const child of el.children) {
        check(child);
      }
    }
    check(document.body);
    return { docWidth, winWidth, count: overflowing.length, culprits: overflowing.slice(0, 15) };
  });

  console.log('Overflow Inspection:', JSON.stringify(culprits, null, 2));
  await browser.close();
}

findOverflow();
