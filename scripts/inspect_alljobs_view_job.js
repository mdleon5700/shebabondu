const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://alljobs.teletalk.com.bd/jobs/government', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Find the "View job" links
  const viewJobLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).filter(a => a.innerText.includes('View job')).map(a => a.href);
  });
  console.log('View job links count:', viewJobLinks.length);
  console.log('Sample View job links:', viewJobLinks.slice(0, 5));

  if (viewJobLinks.length > 0) {
    console.log('Navigating to first link:', viewJobLinks[0]);
    await page.goto(viewJobLinks[0], { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Destination URL:', page.url());
    const innerText = await page.evaluate(() => document.body.innerText);
    console.log('Inner text snippet:', innerText.slice(0, 800));
  }

  await browser.close();
}

run().catch(console.error);

