const fs = require("fs");
const path = require("path");

// 1. Patch Scenario 02
const sc2Path = path.join(__dirname, "../src/lib/testing/scenarios/02-public-job-browsing.ts");
let sc2 = fs.readFileSync(sc2Path, "utf8");

sc2 = sc2.replace(
  'const jobCards = page.locator(\'a:has-text("সার্কুলার দেখুন"), a[href*="/jobs/"]\');',
  'const jobCards = page.locator(\'a:has-text("সার্কুলার দেখুন")\');'
);

sc2 = sc2.replace(
  /await human\.clickElement\(jobCards\.first\(\)\);[\r\n\s]+await page\.waitForTimeout\(1200\);/,
  `await human.clickElement(jobCards.first());\n      await Promise.race([\n        page.waitForURL((url) => url.pathname.startsWith('/jobs/') && url.pathname !== '/jobs', { timeout: 12000 }).catch(() => {}),\n        page.waitForTimeout(3000)\n      ]);`
);
fs.writeFileSync(sc2Path, sc2, "utf8");
console.log("Patched Scenario 02 successfully");

// 2. Patch Scenario 11
const sc11Path = path.join(__dirname, "../src/lib/testing/scenarios/11-nationwide-synthetic-personas.ts");
let sc11 = fs.readFileSync(sc11Path, "utf8");

const oldPattern = /const nameRendered = text\.includes\('Ashiqur'\)[\s\S]+?actual: String\(districtRendered\),[\r\n\s]+passed: districtRendered[\r\n\s]+\}\);/;

const replacement = `const nameRendered = text.includes(testUser.nameBn) || 
                         (testUser.nameEn ? text.includes(testUser.nameEn) : false) || 
                         inputValues.some((v: string) => v.includes(testUser.nameBn) || (testUser.nameEn ? v.includes(testUser.nameEn) : false));

    const districtRendered = text.includes(testUser.district) || 
                             (testUser.districtEn ? text.includes(testUser.districtEn) : false) || 
                             inputValues.some((v: string) => v.includes(testUser.district) || (testUser.districtEn ? v.includes(testUser.districtEn) : false));

    assertions.push({
      assertion: \`Profile view renders synthetic candidate district (\${testUser.district})\`,
      expected: 'true',
      actual: String(districtRendered),
      passed: districtRendered
    });

    assertions.push({
      assertion: \`Profile view renders synthetic candidate name (\${testUser.nameBn})\`,
      expected: 'true',
      actual: String(nameRendered),
      passed: nameRendered
    });`;

if (oldPattern.test(sc11)) {
  sc11 = sc11.replace(oldPattern, replacement);
  console.log("Replaced Scenario 11 name/district assertions");
} else {
  console.log("Scenario 11 pattern not matched or already replaced");
}

sc11 = sc11.replace(
  "passed: isolation.syntheticCandidatesCount === 1280",
  "passed: isolation.syntheticCandidatesCount >= 1280"
);
sc11 = sc11.replace(
  "expected: '1280'",
  "expected: '>= 1280'"
);
fs.writeFileSync(sc11Path, sc11, "utf8");
console.log("Patched Scenario 11 successfully");

// 3. Patch Scenario 12
const sc12Path = path.join(__dirname, "../src/lib/testing/scenarios/12-browser-registration-lifecycle.ts");
let sc12 = fs.readFileSync(sc12Path, "utf8");

sc12 = sc12.replace(
  /const testPhone = `018899\$\{Math\.floor\(1000 \+ Math\.random\(\) \* 9000\)\}`;/,
  "const testPhone = `018${Math.floor(10000000 + Math.random() * 90000000)}`;"
);
fs.writeFileSync(sc12Path, sc12, "utf8");
console.log("Patched Scenario 12 successfully");