const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.goto('https://shebabondu.onrender.com/', { waitUntil: 'networkidle' });

  const jobCards = await page.$$eval('a[href*="/jobs/"]', els => els.map(e => ({
    href: e.getAttribute('href'),
    text: e.innerText.replace(/\s+/g, ' ').trim()
  })));
  console.log('Job cards count on homepage:', jobCards.length);
  jobCards.forEach((j, i) => console.log(i + 1, j.href, j.text.substring(0, 60)));

  const catPills = await page.$$eval('button', els => els.map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.includes('চাকরি') || t.includes('জব') || t.includes('বিসিএস')));
  console.log('Category buttons:', catPills);

  // Check what happens when clicking on categories
  const bankBtn = await page.$('button:has-text("ব্যাংক জব")');
  if (bankBtn) {
    await bankBtn.click();
    await page.waitForTimeout(1000);
    const visibleCards = await page.$$eval('a[href*="/jobs/"]', els => els.length);
    const noJobText = await page.evaluate(() => document.body.innerText.includes('কোনো সার্কুলার পাওয়া যায়নি') || document.body.innerText.includes('কোনো চাকরি পাওয়া যায়নি'));
    console.log('After clicking "ব্যাংক জব": visibleCards =', visibleCards, 'noJobText =', noJobText);
  }

  await browser.close();
})();

