const fs = require("fs");
const path = require("path");

const sc11Path = path.join(__dirname, "../src/lib/testing/scenarios/11-nationwide-synthetic-personas.ts");
let sc11 = fs.readFileSync(sc11Path, "utf8");

sc11 = sc11.replace(
  `    actions.push(\`Navigating to profile: \${baseUrl}/dashboard/profile\`);
    await page.goto(\`\${baseUrl}/dashboard/profile\`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);`,
  `    actions.push(\`Navigating to profile: \${baseUrl}/dashboard/profile\`);
    await page.goto(\`\${baseUrl}/dashboard/profile\`, { waitUntil: 'domcontentloaded' });
    await Promise.race([
      page.waitForResponse(resp => resp.url().includes('/api/profile') && resp.status() === 200, { timeout: 8000 }).catch(() => {}),
      page.waitForTimeout(3500)
    ]);
    await page.waitForTimeout(1200);`
);

fs.writeFileSync(sc11Path, sc11, "utf8");
console.log("Updated Scenario 11 wait logic");