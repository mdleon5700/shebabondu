const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://alljobs.teletalk.com.bd/jobs/government', { waitUntil: 'networkidle', timeout: 30000 });
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('=== PAGE TEXT SAMPLE ===');
  console.log(text.slice(0, 1500));
  
  // Find all links, buttons, headers
  const summary = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.innerText.trim());
    const countEl = document.querySelector('*[class*="count"], *[class*="total"], span');
    return {
      headings: headings.slice(0, 30),
      countText: countEl ? countEl.innerText : null
    };
  });
  console.log('=== SUMMARY ===', summary);

  await browser.close();
}

run().catch(console.error);

