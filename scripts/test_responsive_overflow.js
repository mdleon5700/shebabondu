const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const viewports = [
    { name: 'Mobile (375px)', width: 375, height: 667 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Laptop (1280px)', width: 1280, height: 800 },
    { name: 'Desktop (1440px)', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    console.log(`${vp.name.padEnd(20)}: scrollWidth = ${await page.evaluate(() => document.documentElement.scrollWidth)}, innerWidth = ${vp.width} -> Overflow: ${isOverflowing ? '❌ YES' : '✅ NO'}`);
    await context.close();
  }

  await browser.close();
})();

