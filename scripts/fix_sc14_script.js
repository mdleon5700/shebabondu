const fs = require("fs");
const path = require("path");

const sc14Path = path.join(__dirname, "../src/lib/testing/scenarios/14-education-crud-lifecycle.ts");
let sc14Src = fs.readFileSync(sc14Path, "utf8");

sc14Src = sc14Src.replace(
  `const submitBtn = page.locator('button[type="submit"]:has-text("লগইন"), button:has-text("লগইন করুন")').first();`,
  `const submitBtn = page.locator('form button[type="submit"]:has-text("লগইন করুন")').first();`
);

sc14Src = sc14Src.replace(
  `    actions.push('Switching to Education Management Tab');
    const eduTabBtn = page.locator('button:has-text("শিক্ষাগত যোগ্যতা")').first();
    await eduTabBtn.click();`,
  `    actions.push('Switching to Education Management Tab');
    const eduTabBtn = page.locator('button:has-text("শিক্ষাগত যোগ্যতা")').first();
    await eduTabBtn.waitFor({ state: 'visible', timeout: 12000 });
    await eduTabBtn.click();`
);

fs.writeFileSync(sc14Path, sc14Src, "utf8");
console.log("Updated Scenario 14 with precise login button selector and wait");