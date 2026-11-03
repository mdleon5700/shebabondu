const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.toString()));

  console.log('Visiting https://shebabondu.onrender.com/ ...');
  await page.goto('https://shebabondu.onrender.com/', { waitUntil: 'networkidle', timeout: 30000 });

  // 1. Check Navbar links
  console.log('Testing Navbar link clicks...');
  const navLinks = await page.$$eval('header a, nav a', links => links.map(a => ({ text: a.innerText.trim(), href: a.href })));
  console.log('Found nav links:', navLinks.slice(0, 10));

  // 2. Click on "সকল চাকরি"
  const allJobsLink = await page.$('a[href="/jobs"], nav a:has-text("সকল চাকরি")');
  if (allJobsLink) {
    console.log('Clicking "সকল চাকরি"...');
    await allJobsLink.click();
    await page.waitForTimeout(2000);
    console.log('Current URL after click:', page.url());
  }

  // 3. Test search input on /jobs
  const searchInput = await page.$('input[type="text"], input[placeholder*="অনুসন্ধান"]');
  if (searchInput) {
    console.log('Typing in search input...');
    await searchInput.fill('সহকারী');
    await page.waitForTimeout(1000);
    console.log('Search input filled successfully');
  }

  // 4. Test clicking on a job card or details
  const jobCard = await page.$('a[href*="/jobs/"], a[href*="/job/"]');
  if (jobCard) {
    const jobHref = await jobCard.getAttribute('href');
    console.log('Clicking job card with href:', jobHref);
    await jobCard.click();
    await page.waitForTimeout(2000);
    console.log('Current URL after job click:', page.url());
  }

  // 5. Test clicking "আবেদন করুন" button
  const applyBtn = await page.$('a[href*="/apply"], button:has-text("আবেদন")');
  if (applyBtn) {
    console.log('Found apply button');
  }

  console.log('Total console errors during navigation:', consoleErrors);
  console.log('Total page errors during navigation:', pageErrors);

  await browser.close();
})();

