const { chromium } = require('playwright');

async function testNavbarTweak() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  // Apply tweak in DOM
  const result = await page.evaluate(() => {
    // 1. Add overflow-x-hidden to body
    document.body.classList.add('overflow-x-hidden');
    document.documentElement.classList.add('overflow-x-hidden');

    // 2. Adjust nav font and padding
    const nav = document.querySelector('header nav');
    if (nav) {
      nav.classList.remove('text-[17px]', 'gap-1.5');
      nav.classList.add('text-[15px]', 'gap-1');
      nav.querySelectorAll('a').forEach(a => {
        a.classList.remove('text-[17px]', 'px-3');
        a.classList.add('text-[15px]', 'px-2');
      });
    }

    const rightActions = document.querySelector('header .hidden.sm\\:flex.items-center.gap-2\\.5');
    if (rightActions) {
      rightActions.querySelectorAll('a').forEach(a => {
        a.classList.remove('text-[17px]');
        a.classList.add('text-[15px]', 'px-3', 'py-2');
      });
    }

    return {
      docScrollWidth: document.documentElement.scrollWidth,
      winWidth: window.innerWidth,
      isOverflowing: document.documentElement.scrollWidth > window.innerWidth
    };
  });

  console.log('Tweak Result at 1280px:', JSON.stringify(result, null, 2));
  await browser.close();
}

testNavbarTweak();
