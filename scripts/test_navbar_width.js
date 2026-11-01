const { chromium } = require('playwright');

async function testNavbarWidth() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const headerInfo = await page.evaluate(() => {
    const header = document.querySelector('header');
    const nav = document.querySelector('header nav');
    const logo = document.querySelector('header a[href="/"]');
    const rightActions = header ? header.querySelector('.flex-shrink-0:last-child') : null;

    return {
      docScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      headerScrollWidth: header ? header.scrollWidth : 0,
      headerClientWidth: header ? header.clientWidth : 0,
      navWidth: nav ? nav.getBoundingClientRect().width : 0,
      logoWidth: logo ? logo.getBoundingClientRect().width : 0,
      rightActionsWidth: rightActions ? rightActions.getBoundingClientRect().width : 0,
    };
  });

  console.log('Header Info at 1280px:', JSON.stringify(headerInfo, null, 2));
  await browser.close();
}

testNavbarWidth();
