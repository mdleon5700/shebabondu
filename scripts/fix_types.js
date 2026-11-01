const fs = require("fs");
const path = require("path");

const typesPath = path.join(__dirname, "../src/lib/education/types.ts");
let typesSrc = fs.readFileSync(typesPath, "utf8");

typesSrc = typesSrc.replace(
  `export type EducationLevelCategory =
  | 'secondary'`,
  `export type EducationLevelCategory =
  | 'junior_secondary'
  | 'secondary'`
);

if (!typesSrc.includes("'junior_secondary'")) {
  typesSrc = typesSrc.replace(
    /export type EducationLevelCategory =[\r\n\s]+\| 'secondary'/,
    "export type EducationLevelCategory =\n  | 'junior_secondary'\n  | 'secondary'"
  );
}

fs.writeFileSync(typesPath, typesSrc, "utf8");
console.log("Updated EducationLevelCategory in types.ts with junior_secondary");