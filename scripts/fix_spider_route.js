const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'spider', 'gemini-browser', 'route.ts');
let code = fs.readFileSync(filePath, 'utf8');

// Remove erroneous block in save_extracted_job
code = code.replace(
  `      try {
        if (newStatus === 'PUBLISHED') {
        triggerInstantSearchIndexing(job.slug || job.id).catch(() => {});
      }
      revalidatePath('/jobs');`,
  `      try {
        revalidatePath('/jobs');`
);

// Add to toggle_publish
code = code.replace(
  `      const updated = serverDB.saveJob({
        ...job,
        id: job.id,
        status: newStatus as any,
        updatedAt: new Date().toISOString()
      }, 'ADMIN');`,
  `      const updated = serverDB.saveJob({
        ...job,
        id: job.id,
        status: newStatus as any,
        updatedAt: new Date().toISOString()
      }, 'ADMIN');

      if (newStatus === 'PUBLISHED') {
        triggerInstantSearchIndexing(job.slug || job.id).catch(() => {});
      }`
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed spider route!');
