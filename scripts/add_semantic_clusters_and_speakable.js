const fs = require('fs');
const path = require('path');

// 1. Update src/app/jobs/[id]/page.tsx
const pagePath = path.join(__dirname, '..', 'src', 'app', 'jobs', '[id]', 'page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

// Add speakable schema and relatedJobs calculation
if (!pageCode.includes('speakableSchema')) {
  pageCode = pageCode.replace(
    /const faqSchema = \{[\s\S]*?\};\n/,
    (match) => `${match}
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
`
  );

  pageCode = pageCode.replace(
    /<JobDetailClient job=\{job\} \/>/,
    `<script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
      <JobDetailClient job={job} relatedJobs={relatedJobs} />`
  );
}

fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log('✅ Updated page.tsx with Speakable Schema & Related Jobs!');

// 2. Update src/components/JobDetailClient.tsx
const clientPath = path.join(__dirname, '..', 'src', 'components', 'JobDetailClient.tsx');
let clientCode = fs.readFileSync(clientPath, 'utf8');

// Update props
clientCode = clientCode.replace(
  'export default function JobDetailClient({ job }: { job: JobCircular }) {',
  'export default function JobDetailClient({ job, relatedJobs = [] }: { job: JobCircular; relatedJobs?: JobCircular[] }) {'
);

// Add speakable CSS classes
clientCode = clientCode.replace(
  '<h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">',
  '<h1 className="job-hero-headline text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">'
);

clientCode = clientCode.replace(
  '<section aria-label="নিয়োগ বিজ্ঞপ্তির সারসংক্ষেপ" className="bg-gradient-to-r from-emerald-50/70',
  '<section aria-label="নিয়োগ বিজ্ঞপ্তির সারসংক্ষেপ" className="job-summary-facts bg-gradient-to-r from-emerald-50/70'
);

clientCode = clientCode.replace(
  '<div className="text-[15px] sm:text-[16px] text-slate-800 leading-relaxed',
  '<div className="job-editorial-lead text-[15px] sm:text-[16px] text-slate-800 leading-relaxed'
);

// Add Semantic Related Jobs Section before sticky mobile bar
const relatedSectionCode = `
      {/* 10.5. Semantic Related Jobs & Topic Clusters (Internal Linking Engine) */}
      {relatedJobs && relatedJobs.length > 0 && (
        <section aria-label="সম্পর্কিত অন্যান্য চলমান সার্কুলার" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>সেমান্টিক টপিক ক্লাস্টার ও সম্পর্কিত সার্কুলার</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                একই ক্যাটাগরি ও যোগ্যতার অন্যান্য চলমান চাকরি
              </h2>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline"
            >
              <span>সকল সার্কুলার দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedJobs.map((rel) => (
              <Link
                key={rel.id}
                href={\`/jobs/\${rel.slug || rel.id}\`}
                className="group p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between bg-slate-50/50 hover:bg-white"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {rel.categoryLabel || 'সরকারি'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {rel.totalPosts || 1}টি পদ
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {rel.title}
                  </h3>
                  <div className="text-xs text-slate-600 line-clamp-1">
                    {rel.organization}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{rel.deadline || 'চলমান'}</span>
                  </span>
                  <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    দেখুন →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
`;

if (!clientCode.includes('Semantic Related Jobs & Topic Clusters')) {
  clientCode = clientCode.replace(
    '{/* 11. Sticky Mobile Floating Booking Bar */}',
    `${relatedSectionCode}\n      {/* 11. Sticky Mobile Floating Booking Bar */}`
  );
}

fs.writeFileSync(clientPath, clientCode, 'utf8');
console.log('✅ Updated JobDetailClient.tsx with Semantic Clusters & Speakable Selectors!');

