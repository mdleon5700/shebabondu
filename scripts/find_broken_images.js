const { chromium } = require('playwright');
const { spawn } = require('child_process');

(async () => {
  console.log('Starting Next.js server...');
  const server = spawn('npm.cmd', ['run', 'start'], {
    shell: true,
    stdio: 'ignore',
    cwd: process.cwd()
  });

  // Wait 4s for server
  await new Promise(r => setTimeout(r, 4000));

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  for (const testUrl of ['http://localhost:3000/', 'http://localhost:3000/jobs/job-alljobs-dcjamalpur-15137', 'http://localhost:3000/apply/job-alljobs-dcjamalpur-15137']) {
    console.log(`\n--- Inspecting ${testUrl} ---`);
    await page.goto(testUrl, { waitUntil: 'networkidle' });
    
    // Wait for all images to complete (load or fail)
    await page.evaluate(async () => {
      const selectors = Array.from(document.querySelectorAll('img'));
      await Promise.all(selectors.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = img.onerror = resolve;
          setTimeout(resolve, 3000);
        });
      }));
    });

    const imgDetails = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        alt: img.alt
      }));
    });

    console.log(`Total images on page: ${imgDetails.length}`);
    const broken = imgDetails.filter(i => i.complete && i.naturalWidth === 0);
    const pending = imgDetails.filter(i => !i.complete);
    console.log(`Truly Broken images (complete && naturalWidth === 0): ${broken.length}`);
    console.log(`Pending images (!complete): ${pending.length}`);
    if (broken.length > 0) {
      console.log('Broken images detail:', broken);
    }
  }

  await browser.close();
  try { process.kill(server.pid); } catch(e) {}
  process.exit(0);
})();
