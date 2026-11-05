const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src', 'app', 'jobs', '[id]', 'page.tsx');
let code = fs.readFileSync(pagePath, 'utf8');

const target = '  };\r\n\r\n  return (';
const targetAlt = '  };\n\n  return (';

const addition = `  };

  // 4. Voice Search Speakable Schema (Google Assistant & Siri)
  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": job.title,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [
        ".job-hero-headline",
        ".job-summary-facts",
        ".job-editorial-lead"
      ]
    }
  };

  // 5. Semantic Internal Related Jobs (Topic Clusters)
  const allJobs = serverDB.getJobs();
  const relatedJobs = allJobs
    .filter(j => j.id !== job.id && (j.status === 'OPEN' || j.status === 'PUBLISHED' || (j as any).publicationStatus === 'PUBLISHED'))
    .filter(j => j.category === job.category || j.organization === job.organization || j.minEducation === job.minEducation)
    .slice(0, 4);

  return (`;

if (code.includes(target)) {
  code = code.replace(target, addition);
} else if (code.includes(targetAlt)) {
  code = code.replace(targetAlt, addition);
}

fs.writeFileSync(pagePath, code, 'utf8');
console.log('Fixed page schema successfully!');
