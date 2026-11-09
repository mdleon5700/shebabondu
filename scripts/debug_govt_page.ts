import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/categories/government-jobs');
  const c = await page.content();
  console.log('c1:', c.includes('সরকারি চাকরি সার্কুলার ২০২৬'));
  console.log('c2:', c.includes('উপ-ক্যাটাগরিসমূহ'));
  console.log('c3:', c.includes('বিসিএস'));
  console.log('c3 full:', c.includes('বিসিএস নিয়োগ'));
  
  // Find subcategory links:
  const links = await page.locator('a[href*="/categories/"]').evaluateAll(els => els.map(e => ({ href: e.getAttribute('href'), text: e.textContent?.trim() })));
  console.log('Links found:', links);
  await browser.close();
}
test();
