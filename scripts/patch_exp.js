const fs = require('fs');
let normContent = fs.readFileSync('src/lib/matching/normalizer.ts', 'utf8');

const oldExpRegex = /public static extractExperienceYears\(requirements: string\[\]\): number \{[\s\S]*?return 0;\s*\}/;

const newExpFunc = `public static extractExperienceYears(requirements: string[]): number {
    for (const req of requirements) {
      const lower = req.toLowerCase();
      // Skip age statements
      if (lower.includes('বয়স') || lower.includes('age') || lower.includes('জন্ম')) {
        continue;
      }
      // Must explicitly mention experience
      if (!lower.includes('অভিজ্ঞতা') && !lower.includes('experience')) {
        continue;
      }

      const match = req.match(/([0-9\u09e6-\u09ef]{1,2})\\s*\\u09ac\\u099b\\u09b0/);
      if (match) {
        const rawNum = match[1];
        const bnDigits = ['\\u09e6', '\\u09e7', '\\u09e8', '\\u09e9', '\\u09ea', '\\u09eb', '\\u09ec', '\\u09ed', '\\u09ee', '\\u09ef'];
        let enNum = rawNum;
        for (let i = 0; i < 10; i++) {
          enNum = enNum.split(bnDigits[i]).join(String(i));
        }
        const parsed = parseInt(enNum, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 30) {
          return parsed;
        }
      }
    }
    return 0;
  }`;

normContent = normContent.replace(oldExpRegex, newExpFunc);
fs.writeFileSync('src/lib/matching/normalizer.ts', normContent, 'utf8');
console.log('✅ Updated extractExperienceYears in normalizer.ts');
