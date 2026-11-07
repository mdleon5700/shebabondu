const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
  });
  await page.reload({ waitUntil: 'networkidle' });

  const children = await page.evaluate(() => {
    const right = document.querySelector('header .hidden.sm\\:flex.items-center.gap-2.flex-shrink-0.ml-auto');
    if (!right) return 'Not found';
    return {
      offsetWidth: right.offsetWidth,
      children: Array.from(right.children).map(c => ({
        tag: c.tagName,
        text: c.textContent.trim().replace(/\s+/g, ' '),
        width: c.getBoundingClientRect().width,
        display: window.getComputedStyle(c).display,
        visibility: window.getComputedStyle(c).visibility
      }))
    };
  });
  console.log('Right Area Children:', JSON.stringify(children, null, 2));
  await browser.close();
})();

