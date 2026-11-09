const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Navigate to admin
  console.log('Navigating to http://localhost:3000/admin ...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 30000 });

  // Check text content on page
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Snippet of /admin text:');
  console.log(text.slice(0, 500));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_panel_clean_empty.png'), fullPage: true });
  console.log('Screenshot saved: admin_panel_clean_empty.png');

  await browser.close();
}

run().catch(console.error);

