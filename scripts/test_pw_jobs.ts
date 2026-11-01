import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/jobs', { waitUntil: 'domcontentloaded' });
  console.log('Navigated, waiting 2.5s for fetchCanonicalJobs...');
  await page.waitForTimeout(2500);

  const links = await page.locator('a[href*="/jobs/"]').all();
  console.log('Total a[href*="/jobs/"] count after 2.5s:', links.length);
  if (links.length > 0) {
    const firstHref = await links[0].getAttribute('href');
    console.log('First href:', firstHref);
  }

  await browser.close();
})();