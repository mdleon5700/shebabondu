const { chromium } = require('playwright');

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin?tab=candidate-directory', { waitUntil: 'networkidle' });
  
  // check pin modal or what is on screen
  const title = await page.title();
  const text = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Title:', title);
  console.log('Text snippet:', text);
  await browser.close();
}

debug();
