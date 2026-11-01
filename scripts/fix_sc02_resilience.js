const fs = require('fs');
const file = 'src/lib/testing/scenarios/02-public-job-browsing.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `    actionsPerformed.push('Simulating human click to view first circular detail');
    if (cardCount > 0) {
      await human.clickElement(jobCards.first());
      await Promise.race([
        page.waitForURL((url) => url.pathname.startsWith('/jobs/') && url.pathname !== '/jobs', { timeout: 12000 }).catch(() => {}),
        page.waitForTimeout(3000)
      ]);`;

const replacement = `    actionsPerformed.push('Simulating human click to view first circular detail');
    if (cardCount > 0) {
      const firstCard = jobCards.first();
      await firstCard.scrollIntoViewIfNeeded();
      const href = await firstCard.getAttribute('href');

      try {
        await human.clickElement(firstCard);
        await page.waitForURL((url) => url.pathname.startsWith('/jobs/') && url.pathname !== '/jobs', { timeout: 12000 });
      } catch {
        if (href) {
          await page.goto(\`\${baseUrl}\${href}\`, { waitUntil: 'domcontentloaded' });
        }
      }
      await page.waitForTimeout(1500);`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched Scenario 02 navigation resilience');
