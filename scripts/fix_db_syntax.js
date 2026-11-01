const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../src/lib/db.ts");
let dbSrc = fs.readFileSync(dbPath, "utf8");

const badBlock = `    db.documents[candidateId] = updated;
    saveDB(db);
    return updated;
  }



    return updated;



  },`;

const fixedBlock = `    db.documents[candidateId] = updated;
    saveDB(db);
    return updated;
  },`;

dbSrc = dbSrc.replace(badBlock, fixedBlock);
fs.writeFileSync(dbPath, dbSrc, "utf8");
console.log("Fixed syntax in db.ts");