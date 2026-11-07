const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  // Test viewport from user screenshot: full HD 1920x1080 and 1536x864
  for (const width of [1920, 1536, 1366]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto('http://localhost:3000/jobs');
    await page.waitForTimeout(1000);
    
    const innerBox = await page.locator('header > div:nth-child(2)').boundingBox();
    const navBox = await page.locator('header nav').boundingBox();
    const rightBox = await page.locator('header .hidden.sm\\:flex.items-center.gap-2.flex-shrink-0').boundingBox();
    
    // Check all buttons inside rightBox
    const rightButtons = await page.locator('header .hidden.sm\\:flex.items-center.gap-2.flex-shrink-0 > *').all();
    const buttonInfos = [];
    for (const b of rightButtons) {
      const box = await b.boundingBox();
      const text = (await b.innerText()).replace(/\n/g, ' ').trim();
      buttonInfos.push({ text: text.substring(0, 20), x: box?.x, width: box?.width, rightEdge: (box?.x || 0) + (box?.width || 0) });
    }
    
    console.log(`\n=== Viewport ${width}px ===`);
    console.log(`Inner container: left=${innerBox?.x}, width=${innerBox?.width}, right=${(innerBox?.x || 0) + (innerBox?.width || 0)}`);
    console.log(`Nav: left=${navBox?.x}, width=${navBox?.width}, right=${(navBox?.x || 0) + (navBox?.width || 0)}`);
    console.log(`Right actions box: left=${rightBox?.x}, width=${rightBox?.width}, right=${(rightBox?.x || 0) + (rightBox?.width || 0)}`);
    console.log('Right actions buttons:', buttonInfos);
    
    await page.screenshot({ path: `navbar_layout_${width}.png` });
    await page.close();
  }
  await browser.close();
})();

