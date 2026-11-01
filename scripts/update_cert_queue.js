const fs = require("fs");
const path = require("path");

const queuePath = path.join(__dirname, "../src/app/api/admin/certificates/queue/route.ts");
let queueSrc = fs.readFileSync(queuePath, "utf8");

queueSrc = queueSrc.replace(
  `import { serverDB } from '@/lib/db';`,
  `import { serverDB } from '@/lib/db';
import { SyntheticUserManager } from '@/lib/testing/synthetic/synthetic-user-manager';`
);

queueSrc = queueSrc.replace(
  `const candidates = serverDB.getCandidates();`,
  `const realCandidates = serverDB.getCandidates();
    const synthCandidates = SyntheticUserManager.getAllSyntheticUsers();
    const candidates = [...realCandidates, ...(synthCandidates as unknown as any[])];`
);

fs.writeFileSync(queuePath, queueSrc, "utf8");
console.log("Updated Certificate Queue route to include synthetic candidates");