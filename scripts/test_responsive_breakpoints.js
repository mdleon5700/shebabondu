const { chromium } = require('playwright');

async function testResponsiveBreakpoints() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const viewports = [
    { name: 'Full HD', width: 1920, height: 1080 },
    { name: 'Standard Desktop', width: 1440, height: 900 },
    { name: 'Standard Laptop', width: 1280, height: 720 },
    { name: 'Small Laptop / iPad Pro', width: 1024, height: 768 },
    { name: 'iPad / Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:3000/about-us', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    // Apply the responsive CSS fix
    const res = await page.evaluate((vpWidth) => {
      // Inject temporary test style
      const style = document.createElement('style');
      style.textContent = `
        html, body { overflow-x: hidden !important; max-width: 100vw !important; }
        header { max-width: 100vw !important; overflow-x: clip !important; }
        header nav { font-size: 14px !important; gap: 2px !important; }
        header nav a { font-size: 14px !important; padding: 6px 8px !important; }
      `;
      document.head.appendChild(style);

      return {
        winWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        isOverflowing: document.documentElement.scrollWidth > window.innerWidth
      };
    }, vp.width);

    console.log(`${vp.name} (${vp.width}px): docScrollWidth = ${res.docScrollWidth}, isOverflowing = ${res.isOverflowing}`);
    await page.close();
  }

  await browser.close();
}

testResponsiveBreakpoints();
