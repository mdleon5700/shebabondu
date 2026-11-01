const fs = require("fs");
const path = require("path");

const sc11Path = path.join(__dirname, "../src/lib/testing/scenarios/11-nationwide-synthetic-personas.ts");
let sc11 = fs.readFileSync(sc11Path, "utf8");

const oldCode = `    const nameRendered = text.includes(testUser.nameBn) || 
                         (testUser.nameEn ? text.includes(testUser.nameEn) : false) || 
                         inputValues.some((v: string) => v.includes(testUser.nameBn) || (testUser.nameEn ? v.includes(testUser.nameEn) : false));

    const districtRendered = text.includes(testUser.district) || 
                             (testUser.districtEn ? text.includes(testUser.districtEn) : false) || 
                             inputValues.some((v: string) => v.includes(testUser.district) || (testUser.districtEn ? v.includes(testUser.districtEn) : false));`;

const newCode = `    const nameRendered = text.includes(testUser.nameBn) || 
                         (testUser.name ? text.includes(testUser.name) : false) || 
                         inputValues.some((v: string) => v.includes(testUser.nameBn) || (testUser.name ? v.includes(testUser.name) : false));

    const districtRendered = text.includes(testUser.district) || 
                             inputValues.some((v: string) => v.includes(testUser.district));`;

sc11 = sc11.replace(oldCode, newCode);
fs.writeFileSync(sc11Path, sc11, "utf8");
console.log("Updated Scenario 11 fields");