const { chromium } = require('@playwright/test');

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);
  
  const toggle = page.locator('button[aria-label="Toggle Menu"]');
  console.log('Toggle visible:', await toggle.isVisible());
  if (await toggle.isVisible()) {
    await toggle.click();
    await page.waitForTimeout(1000);
    const links = await page.locator('nav a').allTextContents();
    console.log('Mobile nav links:', links.map(l => l.trim()));
  }
  await browser.close();
}

debug().catch(console.error);

