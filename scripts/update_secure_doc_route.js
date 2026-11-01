const fs = require('fs');
const file = 'src/app/api/candidate/documents/secure/[id]/route.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('SyntheticUserManager')) {
  content = content.replace(
    "import { serverDB } from '@/lib/db';",
    "import { serverDB } from '@/lib/db';\nimport { SyntheticUserManager } from '@/lib/testing/synthetic/synthetic-user-manager';"
  );
  
  const targetCheck = `    if (!targetDoc) {
      return NextResponse.json({ error:`;
  const replacementCheck = `    if (!targetDoc) {
      const synthDoc = SyntheticUserManager.findDocument(docId);
      if (synthDoc) {
        targetDoc = synthDoc.doc;
        ownerCandidateId = synthDoc.candidateId;
      }
    }

    if (!targetDoc) {
      return NextResponse.json({ error:`;
  
  content = content.replace(targetCheck, replacementCheck);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated secure document route');
} else {
  console.log('Already imported');
}
