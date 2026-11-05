const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src', 'app', 'jobs', '[id]', 'page.tsx');
let code = fs.readFileSync(pagePath, 'utf8');

const oldFilter = `  const allJobs = serverDB.getJobs();
  const relatedJobs = allJobs
    .filter(j => j.id !== job.id && (j.status === 'OPEN' || j.status === 'PUBLISHED' || (j as any).publicationStatus === 'PUBLISHED'))
    .filter(j => j.category === job.category || j.organization === job.organization || j.minEducation === job.minEducation)
    .slice(0, 4);`;

const newFilter = `  const allJobs = serverDB.getJobs();
  const activeJobs = allJobs.filter(j => j.id !== job.id && (j.status === 'OPEN' || j.status === 'PUBLISHED' || (j as any).publicationStatus === 'PUBLISHED'));
  let relatedJobs = activeJobs.filter(j => j.category === job.category || j.organization === job.organization || j.minEducation === job.minEducation);
  if (relatedJobs.length === 0 && activeJobs.length > 0) {
    relatedJobs = activeJobs.slice(0, 4);
  } else {
    relatedJobs = relatedJobs.slice(0, 4);
  }`;

if (code.includes('const allJobs = serverDB.getJobs();')) {
  code = code.replace(oldFilter, newFilter);
  fs.writeFileSync(pagePath, code, 'utf8');
  console.log('✅ Updated relatedJobs smart fallback!');
}
