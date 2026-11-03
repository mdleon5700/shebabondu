const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('--- TESTING DESKTOP MENU CLICKS ---');
  await page.goto('https://shebabondu.onrender.com/', { waitUntil: 'networkidle' });

  // Test hovering and clicking "সকল চাকরি"
  const allJobsBtn = await page.$('nav a:has-text("সকল চাকরি")');
  if (allJobsBtn) {
    console.log('Hovering "সকল চাকরি"...');
    await allJobsBtn.hover();
    await page.waitForTimeout(500);
    const dropdownVisible = await page.$('div:has-text("চলমান সকল বিজ্ঞপ্তি")');
    console.log('Dropdown visible on hover:', Boolean(dropdownVisible));

    console.log('Clicking "সকল চাকরি"...');
    await allJobsBtn.click();
    await page.waitForTimeout(1000);
    console.log('URL after click:', page.url());
  }

  // Test "সরকারি চাকরি"
  const govtJobsBtn = await page.$('nav a:has-text("সরকারি চাকরি")');
  if (govtJobsBtn) {
    console.log('Clicking "সরকারি চাকরি"...');
    await govtJobsBtn.click();
    await page.waitForTimeout(1000);
    console.log('URL after click:', page.url());
  }

  console.log('--- TESTING MOBILE MENU TOGGLE ---');
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('https://shebabondu.onrender.com/', { waitUntil: 'networkidle' });

  const toggleBtn = await mobilePage.$('button[aria-label="Toggle Menu"]');
  console.log('Mobile toggle button found:', Boolean(toggleBtn));
  if (toggleBtn) {
    console.log('Clicking mobile toggle button...');
    await toggleBtn.click();
    await mobilePage.waitForTimeout(500);
    const mobileDrawer = await mobilePage.$('div.xl\\:hidden');
    console.log('Mobile drawer visible after click:', Boolean(mobileDrawer));
    if (mobileDrawer) {
      const drawerText = await mobileDrawer.innerText();
      console.log('Drawer text preview:', drawerText.substring(0, 150));
    }
  }

  console.log('--- TESTING ADMIN PANEL LOGIN ---');
  await page.goto('https://shebabondu.onrender.com/admin', { waitUntil: 'networkidle' });
  console.log('Admin page title:', await page.title());
  const pinInput = await page.$('input[type="password"]');
  console.log('PIN input found:', Boolean(pinInput));
  if (pinInput) {
    console.log('Typing PIN "1234"...');
    await pinInput.fill('1234');
    const submitBtn = await page.$('button[type="submit"]');
    console.log('Submitting login...');
    await submitBtn.click();
    await page.waitForTimeout(2000);
    const bodyAfterSubmit = await page.evaluate(() => document.body.innerText);
    const hasConsole = bodyAfterSubmit.includes('অ্যাডমিন ড্যাশবোর্ড') || bodyAfterSubmit.includes('ড্যাশবোর্ড') || bodyAfterSubmit.includes('KPI');
    const hasError = bodyAfterSubmit.includes('ভুল') || bodyAfterSubmit.includes('ত্রুটি');
    console.log('Has Admin Dashboard after submit:', hasConsole);
    console.log('Has error after submit:', hasError);
    if (!hasConsole) {
      console.log('Body preview after submit:', bodyAfterSubmit.substring(0, 300));
    }
  }

  await browser.close();
})();

