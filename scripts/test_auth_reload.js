const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await page.goto('http://localhost:3000');
  
  const guestRightHtml = await page.evaluate(() => {
    return document.querySelector('header div.ml-auto')?.innerHTML;
  });
  console.log('Guest right area HTML:', guestRightHtml);

  // Set candidate auth and reload so it renders fresh
  await page.evaluate(() => {
    localStorage.setItem('cs_auth', JSON.stringify({
      isLoggedIn: true,
      role: 'candidate',
      name: 'তাহমিদ ইকবাল',
      phone: '01788990011',
      userId: 'usr_candidate_demo'
    }));
  });
  await page.reload();
  await page.waitForTimeout(500);

  const candidateRightHtml = await page.evaluate(() => {
    return document.querySelector('header div.ml-auto')?.innerHTML;
  });
  console.log('Candidate right area HTML after reload:', candidateRightHtml);

  const candidateInfo = await page.evaluate(() => {
    const right = document.querySelector('header div.ml-auto');
    const nav = document.querySelector('header nav');
    return {
      rightWidth: right?.offsetWidth,
      rightLeft: right?.getBoundingClientRect().left,
      navWidth: nav?.offsetWidth,
      navRight: nav?.getBoundingClientRect().right,
      navChildren: Array.from(nav?.children || []).map(c => ({
        text: c.innerText.trim(),
        w: c.offsetWidth,
        rect: c.getBoundingClientRect()
      }))
    };
  });
  console.log('Candidate right area info:', JSON.stringify(candidateInfo, null, 2));

  await browser.close();
})();

