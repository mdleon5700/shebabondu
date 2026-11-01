const fs = require("fs");
const path = require("path");

// 1. Update db.ts
const dbPath = path.join(__dirname, "../src/lib/db.ts");
let dbSrc = fs.readFileSync(dbPath, "utf8");

dbSrc = dbSrc.replace(
  `if (candidate.id?.startsWith('SYNTH-') || (candidate as any).isSynthetic || candidate.phone?.startsWith('01889')) {`,
  `if (candidate.id?.startsWith('SYNTH-') || (candidate as any).isSynthetic || candidate.phone?.startsWith('01889') || (candidate.name && (candidate.name.includes('টেস্ট') || candidate.name.includes('Test')))) {`
);
fs.writeFileSync(dbPath, dbSrc, "utf8");
console.log("Updated db.ts synthetic guard");

// 2. Update Scenario 12
const sc12Path = path.join(__dirname, "../src/lib/testing/scenarios/12-browser-registration-lifecycle.ts");
let sc12 = fs.readFileSync(sc12Path, "utf8");

sc12 = sc12.replace(
  /const testPhone = `018\$\{Math\.floor\(10000000 \+ Math\.random\(\) \* 90000000\)\}`;/,
  "const testPhone = `018899${Math.floor(10000 + Math.random() * 90000)}`;"
);
fs.writeFileSync(sc12Path, sc12, "utf8");
console.log("Updated Scenario 12 phone generation to 11-digit synthetic prefix");