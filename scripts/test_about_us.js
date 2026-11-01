const { chromium } = require('playwright');

async function testAboutUs() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:3000/about-us', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  const res = await page.evaluate(() => {
    return {
      docWidth: document.documentElement.scrollWidth,
      winWidth: window.innerWidth,
      headerScrollWidth: document.querySelector('header')?.scrollWidth,
      headerRight: document.querySelector('header .hidden.sm\\:flex.items-center.gap-2\\.5')?.getBoundingClientRect().right
    };
  });

  console.log('About Us Width Check:', JSON.stringify(res, null, 2));
  await browser.close();
}

testAboutUs();
