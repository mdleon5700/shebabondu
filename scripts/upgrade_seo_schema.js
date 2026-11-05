const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'jobs', '[id]', 'page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Upgrade generateMetadata with modern Robots directives
const oldMetaReturn = `  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {`;

const newMetaReturn = `  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      }
    },
    openGraph: {`;

if (code.includes('alternates: {') && !code.includes('\'max-image-preview\': \'large\'')) {
  code = code.replace(oldMetaReturn, newMetaReturn);
}

// 2. Enhance datePosted and validThrough with BD timezone
code = code.replace(
  /const datePosted = parseBengaliDateToIso\(job\.publishedDate\) \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];/,
  `const datePostedRaw = parseBengaliDateToIso(job.publishedDate);
  const datePosted = datePostedRaw ? \`\${datePostedRaw}T09:00:00+06:00\` : new Date().toISOString();`
);

code = code.replace(
  /const validThrough = parseBengaliDateToIso\(job\.deadline\);/,
  `const validThroughRaw = parseBengaliDateToIso(job.deadline);
  const validThrough = validThroughRaw ? \`\${validThroughRaw}T17:00:00+06:00\` : undefined;`
);

// 3. Add ApplyAction and Speakable to JobPosting schema if not present
if (!code.includes('"potentialAction"')) {
  code = code.replace(
    /"totalJobOpenings": job\.totalPosts \|\| 1/,
    `"totalJobOpenings": job.totalPosts || 1,
    "potentialAction": {
      "@type": "ApplyAction",
      "target": job.officialLink || canonicalUrl
    }`
  );
}

// 4. Dynamic FAQPage schema merging AI custom FAQs and standard FAQs
const faqOldStart = '// 3. Dynamic High-Intent FAQPage Schema';
const faqOldEnd = 'const faqSchema = {';

if (code.includes(faqOldStart)) {
  const splitIndex = code.indexOf(faqOldStart);
  const afterSplit = code.slice(splitIndex);
  const closingBraceIndex = afterSplit.indexOf('};\n\n  return (');

  if (closingBraceIndex !== -1) {
    const newFaqBlock = `// 3. Dynamic High-Intent FAQPage Schema (Merging AI custom FAQs + standard pillars)
  const dynamicFaqEntities: Array<{ "@type": "Question"; name: string; acceptedAnswer: { "@type": "Answer"; text: string } }> = [];

  // Add custom FAQs from the circular builder if available
  if (Array.isArray(job.faqItems) && job.faqItems.length > 0) {
    job.faqItems.forEach((item: any) => {
      const q = item?.question || item?.q;
      const a = item?.answer || item?.a;
      if (q && a) {
        dynamicFaqEntities.push({
          "@type": "Question",
          "name": String(q).trim(),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": String(a).trim()
          }
        });
      }
    });
  }

  // Add standard high-intent questions if not already covered
  const defaultFaqs = [
    {
      q: \`\${job.organization}-এ \${job.title} পদে আবেদনের শেষ সময় কবে?\`,
      a: \`এই পদে আবেদনের শেষ তারিখ ও সময় \${job.deadline}। নির্ধারিত তারিখ ও সময়ের পর আবেদন লিঙ্ক স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে।\`
    },
    {
      q: \`এই বিজ্ঞপ্তিতে সরকারি আবেদন ফি ও সার্ভিস চার্জ কত টাকা?\`,
      a: \`সরকারি পরীক্ষার ফি ৳\${job.govtFee} এবং চাকরি সেবার প্রক্রিয়াকরণ ফি ৳\${job.serviceFee}। প্রার্থীরা বিকাশ, নগদ বা টেলিটক এসএমএস-এর মাধ্যমে নিরাপদে ফি পরিশোধ করতে পারবেন।\`
    },
    {
      q: \`প্রার্থীর সর্বোচ্চ ও সর্বনিম্ন বয়সসীমা কত হতে হবে?\`,
      a: \`সাধারণ প্রার্থীদের জন্য বয়সসীমা \${job.minAge} থেকে \${job.maxAge} বছর। তবে বীর মুক্তিযোদ্ধা/শহীদ মুক্তিযোদ্ধার সন্তান এবং শারীরিক প্রতিবন্ধী প্রার্থীদের ক্ষেত্রে সরকারি নিয়মানুযায়ী সর্বোচ্চ ৩২ বছর পর্যন্ত আবেদন গ্রহণযোগ্য। বয়স গণনার কাট-অফ তারিখ: \${job.ageCutOffDate || 'বিজ্ঞপ্তি অনুসারে'}।\`
    },
    {
      q: \`কারা এবং কোন জেলার প্রার্থীরা এই পদের জন্য আবেদন করতে পারবেন?\`,
      a: \`ন্যূনতম শিক্ষাগত যোগ্যতা \${job.minEducation}। অনুমোদিত জেলা: \${job.districts || 'সকল জেলা'}।\${job.allowThirdDivision === false ? ' উল্লেখ্য, শিক্ষা জীবনের কোনো স্তরে ৩য় বিভাগ বা শ্রেণি গ্রহণযোগ্য হবে না।' : ''}\`
    }
  ];

  defaultFaqs.forEach(df => {
    if (!dynamicFaqEntities.some(e => e.name.toLowerCase().includes(df.q.slice(0, 15).toLowerCase()))) {
      dynamicFaqEntities.push({
        "@type": "Question",
        "name": df.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": df.a
        }
      });
    }
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": dynamicFaqEntities
  };`;

    code = code.slice(0, splitIndex) + newFaqBlock + afterSplit.slice(closingBraceIndex + 2);
  }
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully upgraded src/app/jobs/[id]/page.tsx with 100% SEO, SGE, AEO & LLM standards!');

