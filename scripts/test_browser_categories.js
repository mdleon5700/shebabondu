const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const urls = [
    'http://localhost:3000/categories',
    'http://localhost:3000/categories/private-jobs',
    'http://localhost:3000/categories/government-jobs',
    'http://localhost:3000/jobs?category=company'
  ];

  for (const url of urls) {
    consoleErrors.length = 0;
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    console.log(`[${res.status()}] ${url}`);
    
    // Check if page rendered cards
    const jobCardsCount = await page.locator('article, .border, a[href^="/jobs/"]').count();
    console.log(`  Found ~${jobCardsCount} cards/links`);
    if (consoleErrors.length > 0) {
      console.log(`  Console errors on ${url}:`, consoleErrors.slice(0, 3));
    }
  }

  await browser.close();
  console.log('Browser tests completed successfully!');
}

run().catch(console.error);

