const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const routes = [
    '/',
    '/jobs',
    '/government-jobs',
    '/private-jobs',
    '/categories',
    '/results',
    '/guidelines',
    '/apply',
    '/login',
    '/register',
    '/admin'
  ];

  for (const r of routes) {
    const pageErrors = [];
    page.removeAllListeners('pageerror');
    page.on('pageerror', err => pageErrors.push(err.toString()));

    try {
      const res = await page.goto('https://shebabondu.onrender.com' + r, { waitUntil: 'networkidle', timeout: 30000 });
      const body = await page.evaluate(() => document.body.innerText);
      const isError = body.includes('একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে') || body.includes('Application error');
      const is404 = body.includes('404') && body.includes('পৃষ্ঠাটি খুঁজে পাওয়া যায়নি');
      console.log(`Route: ${r.padEnd(20)} | Status: ${res ? res.status() : 'null'} | PageErrors: ${pageErrors.length} | Crash: ${isError} | 404: ${is404}`);
      if (isError || pageErrors.length > 0) {
        console.log('  Crash text:', body.substring(0, 150));
        console.log('  Errors:', pageErrors);
      }
    } catch(e) {
      console.log(`Route: ${r.padEnd(20)} | FAILED: ${e.message}`);
    }
  }

  await browser.close();
})();

