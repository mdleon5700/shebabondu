const fs = require('fs');

// 1. Fix engine.ts
let engineContent = fs.readFileSync('src/lib/matching/engine.ts', 'utf8');
if (!engineContent.includes('public static calculateExactAge')) {
  const calcAgeIndex = engineContent.indexOf('public static calculateAge(');
  const exactAgeCode = `public static calculateExactAge(dobStr?: string, cutOffDateStr?: string): { years: number; months: number; days: number; totalYearsExact: number } | null {
    if (!dobStr || !dobStr.trim()) return null;
    let birthDate: Date;
    const parts = dobStr.split(/[\\-\\/\\.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        birthDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    } else {
      birthDate = new Date(dobStr);
    }
    if (isNaN(birthDate.getTime())) return null;

    let cutOff: Date;
    if (cutOffDateStr) {
      const cParts = cutOffDateStr.split(/[\\-\\/\\.]/);
      if (cParts.length === 3 && cParts[0].length === 4) {
        cutOff = new Date(Number(cParts[0]), Number(cParts[1]) - 1, Number(cParts[2]));
      } else {
        cutOff = new Date(cutOffDateStr);
      }
    } else {
      cutOff = new Date();
    }
    if (isNaN(cutOff.getTime())) return null;

    if (birthDate > cutOff) return { years: 0, months: 0, days: 0, totalYearsExact: 0 };

    let years = cutOff.getFullYear() - birthDate.getFullYear();
    let months = cutOff.getMonth() - birthDate.getMonth();
    let days = cutOff.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthDays = new Date(cutOff.getFullYear(), cutOff.getMonth(), 0).getDate();
      days += prevMonthDays;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalYearsExact = years + (months / 12) + (days / 365.25);
    return { years, months, days, totalYearsExact };
  }

  `;
  engineContent = engineContent.substring(0, calcAgeIndex) + exactAgeCode + engineContent.substring(calcAgeIndex);
  fs.writeFileSync('src/lib/matching/engine.ts', engineContent, 'utf8');
  console.log('✅ Added calculateExactAge to SmartJobMatchingEngine in engine.ts');
}

// 2. Fix scenario 29
let s29 = fs.readFileSync('src/lib/testing/scenarios/29-bangladesh-location-filter-audit.ts', 'utf8');
s29 = s29.replace("publicationStatus: 'PUBLISHED'", "publicationStatus: 'PUBLISHED' as any");
fs.writeFileSync('src/lib/testing/scenarios/29-bangladesh-location-filter-audit.ts', s29, 'utf8');
console.log('✅ Fixed scenario 29');

// 3. Fix scenario 31
let s31 = fs.readFileSync('src/lib/testing/scenarios/31-sorting-pagination-user-panel-discovery-audit.ts', 'utf8');
s31 = s31.replace(/'x-candidate-id': candidate\.id/g, "'x-candidate-id': candidate.id || ''");
fs.writeFileSync('src/lib/testing/scenarios/31-sorting-pagination-user-panel-discovery-audit.ts', s31, 'utf8');
console.log('✅ Fixed scenario 31');
