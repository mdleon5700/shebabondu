const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'spider', 'gemini-browser', 'route.ts');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('triggerInstantSearchIndexing')) {
  code = "import { triggerInstantSearchIndexing } from '@/lib/seo/instant_indexer';\n" + code;

  code = code.replace(
    "const saved = serverDB.saveJob(jobToSave, 'ADMIN');",
    `const saved = serverDB.saveJob(jobToSave, 'ADMIN');
      if (targetStatus === 'PUBLISHED') {
        triggerInstantSearchIndexing(jobToSave.slug || jobId).catch(() => {});
      }`
  );

  code = code.replace(
    "revalidatePath('/jobs');",
    `if (newStatus === 'PUBLISHED') {
        triggerInstantSearchIndexing(job.slug || job.id).catch(() => {});
      }
      revalidatePath('/jobs');`
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✅ Integrated triggerInstantSearchIndexing in spider route!');
}
