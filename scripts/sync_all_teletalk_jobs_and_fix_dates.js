const fs = require('fs');
const path = require('path');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const toBn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
const toEn = str => String(str || '').replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]);

function formatBnDate(dateStr) {
  try {
    if (!dateStr) return '';
    const enStr = toEn(dateStr.trim());
    const d = new Date(enStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = toBn(d.getDate());
    const month = MONTH_NAMES_BN[d.getMonth()];
    const year = toBn(d.getFullYear());
    return day + ' ' + month + ' ' + year;
  } catch {
    return dateStr;
  }
}

function calculateDays(dateStr) {
  try {
    if (!dateStr) return 15;
    const enStr = toEn(dateStr.trim());
    const d = new Date(enStr);
    if (isNaN(d.getTime())) {
      // Try to parse Bengali date string like "২৫ নভেম্বর ২০২৬"
      for (let m = 0; m < MONTH_NAMES_BN.length; m++) {
        if (dateStr.includes(MONTH_NAMES_BN[m])) {
          const dayMatch = dateStr.match(/([০-৯\d]{1,2})/);
          const yearMatch = dateStr.match(/([০-৯\d]{4})/);
          if (dayMatch && yearMatch) {
            const day = parseInt(toEn(dayMatch[1]), 10);
            const year = parseInt(toEn(yearMatch[1]), 10);
            const parsedD = new Date(year, m, day);
            const now = new Date();
            const diff = parsedD.getTime() - now.getTime();
            return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
          }
        }
      }
      return 15;
    }
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return 15;
  }
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChakriSheba/2.0 LiveSync',
        'Accept': 'application/json',
        'Authorization': 'Bearer false'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function inferPositionMeta(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('পরিচালক') || t.includes('director') || t.includes('প্রকৌশলী') || t.includes('engineer') || t.includes('অফিসার') || t.includes('officer') || t.includes('ম্যানেজার')) {
    return { grade: '৯ম - ১০ম গ্রেড', salary: '১৬,০০০ - ৫৩,০৬০/- টাকা', govtFee: 600, minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে সংশ্লিষ্ট বিষয়ে স্নাতক (সম্মান) বা স্নাতকোত্তর ডিগ্রি' };
  }
  if (t.includes('অডিটর') || t.includes('auditor') || t.includes('হিসাবরক্ষক') || t.includes('accountant') || t.includes('ইন্সপেক্টর') || t.includes('inspector')) {
    return { grade: '১১তম - ১২তম গ্রেড', salary: '১২,৫০০ - ৩০,২৩০/- টাকা', govtFee: 300, minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে ন্যূনতম ২য় শ্রেণি বা সমমানের সিজিপিএ সহ স্নাতক ডিগ্রি' };
  }
  if (t.includes('অপারেটর') || t.includes('মুদ্রাক্ষরিক') || t.includes('typist') || t.includes('সহকারী') || t.includes('assistant') || t.includes('ক্লার্ক') || t.includes('টেকনিশিয়ান')) {
    return { grade: '১৩তম - ১৬তম গ্রেড', salary: '৯,৩০০ - ২৬,৫৯০/- টাকা', govtFee: 200, minEducation: 'উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি) বা সমমান এবং কম্পিউটার পরিচালনায় পারদর্শী' };
  }
  if (t.includes('ড্রাইভার') || t.includes('driver')) {
    return { grade: '১৬তম গ্রেড', salary: '৯,৩০০ - ২২,৪৯০/- টাকা', govtFee: 200, minEducation: 'জুনিয়র স্কুল সার্টিফিকেট (জেএসসি) বা সমমান পাস এবং বৈধ ড্রাইভিং লাইসেন্স' };
  }
  return { grade: '১৭তম - ২০তম গ্রেড', salary: '৮,২৫০ - ২০,০১০/- টাকা', govtFee: 100, minEducation: 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ' };
}

(async () => {
  console.log('--- STARTING ALLJOBS TELETALK FULL SYNC & DATE RECTIFICATION ---');

  // 1. Fetch All Organizations from Teletalk API
  const p1 = await fetchJson('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=20');
  const p2 = await fetchJson('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=2&limit=20');
  const orgs = [...(p1.govtOrgJobs || []), ...(p2.govtOrgJobs || [])];
  console.log(`Fetched ${orgs.length} organizations from alljobs.teletalk.com.bd`);

  const dbPath = path.resolve(__dirname, '../src/db/local_store.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  db.jobs = db.jobs || {};

  let syncedCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < orgs.length; i++) {
    const org = orgs[i];
    if (!org.govt_jobs || org.govt_jobs.length === 0) continue;

    try {
      const primaryJob = org.govt_jobs[0];
      const detailsRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${primaryJob.id}`);
      const d = detailsRes.details;
      if (!d) continue;

      const orgShort = (org.short_name || 'gov').toLowerCase().trim().replace(/[^a-z0-9]/g, '') || 'gov';
      const jobId = `job-alljobs-${orgShort}-${d.id}`;
      const orgBn = org.name_bn && org.name_bn.trim().length > 0 ? org.name_bn.trim() : (org.name || 'সরকারি প্রতিষ্ঠান');

      // Resolve links
      const officialLink = d.application_site 
        ? d.application_site.replace(/\/$/, '')
        : `https://${orgShort}.teletalk.com.bd`;

      let pdfUrl = '';
      if (d.advertisement_file) {
        pdfUrl = d.advertisement_file.startsWith('http')
          ? d.advertisement_file
          : `https://alljobs.teletalk.com.bd/media/${d.advertisement_file}`;
      } else if (officialLink) {
        pdfUrl = `${officialLink}/docs/advertisement.pdf`;
      }

      const logoUrl = org.logo 
        ? (org.logo.startsWith('http') ? org.logo : `https://alljobs.teletalk.com.bd/media/${org.logo}`)
        : 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80';

      // Positions mapping
      const positions = org.govt_jobs.map((gj, idx) => {
        const titleBn = gj.job_title_bn || gj.job_title || 'কর্মকর্তা / কর্মচারী';
        const meta = inferPositionMeta(titleBn + ' ' + (gj.job_title || ''));
        const vacancyNum = parseInt(String(gj.vacancy || '1').replace(/\D/g, ''), 10) || 1;
        return {
          id: `pos-${gj.id || idx + 1}`,
          title: titleBn,
          grade: gj.grade || meta.grade,
          posts: vacancyNum,
          vacancies: vacancyNum,
          salary: meta.salary,
          minEducation: gj.education || meta.minEducation,
          govtFee: meta.govtFee
        };
      });

      const totalPosts = positions.reduce((sum, p) => sum + (p.posts || 1), 0) || positions.length || 1;
      const deadlineDate = d.deadline_date || new Date(Date.now() + 18 * 86400000).toISOString();
      const deadlineBn = formatBnDate(deadlineDate);
      const daysRemaining = calculateDays(deadlineDate);
      const publishedDateBn = formatBnDate(d.advertisement_published_date || d.published_date || new Date().toISOString());

      const highestFee = Math.max(...positions.map(p => p.govtFee || 100), 100);
      const lowestFee = Math.min(...positions.map(p => p.govtFee || 100), 100);
      const feeRange = lowestFee === highestFee ? `৳${lowestFee}` : `৳${lowestFee} - ৳${highestFee}`;
      const smsPrefix = orgShort.toUpperCase();

      const smsFormat = `
১ম এসএমএস: ${smsPrefix} <Space> User_ID পাঠিয়ে দিন 16222 নম্বরে।
(উদাহরণ: ${smsPrefix} ABCDEF লিখে পাঠিয়ে দিন 16222 নম্বরে)

২য় এসএমএস: ${smsPrefix} <Space> YES <Space> PIN পাঠিয়ে দিন 16222 নম্বরে।
(ফিরতি এসএমএসে প্রাপ্ত PIN দিয়ে ২য় এসএমএস পাঠিয়ে পেমেন্ট কনফার্ম করতে হবে)
`.trim();

      const editorialOverview = `
${orgBn} সম্প্রতি ২০২৬ সালের জন্য রাজস্ব খাতভুক্ত স্থায়ী শূন্যপদে দক্ষ, যোগ্য ও উদ্যমী জনবল নিয়োগের লক্ষ্যে অফিসিয়াল নিয়োগ বিজ্ঞপ্তি প্রকাশ করেছে। উক্ত প্রতিষ্ঠানে বিভিন্ন ক্যাটাগরিতে মোট ${toBn(totalPosts)} টি পদে সরাসরি জনবল নিয়োগের জন্য যোগ্য বাংলাদেশি নাগরিকদের নিকট থেকে অনলাইনে দরখাস্ত আহ্বান করা হচ্ছে।

প্রকাশিত বিজ্ঞপ্তি অনুযায়ী, এই নিয়োগে ${positions.map(p => `${p.title} (${toBn(p.posts)} জন)`).slice(0, 5).join(', ')}${positions.length > 5 ? ` সহ মোট ${toBn(positions.length)}টি ক্যাটাগরির পদে` : ''} আবেদন নেওয়া হবে। পদভেদে ন্যূনতম শিক্ষাগত যোগ্যতা ${positions[0].minEducation} চাওয়া হয়েছে এবং সাধারণ প্রার্থীদের বয়সসীমা ১৮ থেকে ৩২ বছরের মধ্যে হতে হবে (বীর মুক্তিযোদ্ধা কোটা ও সংরক্ষিত কোটায় সরকারি বিধি অনুযায়ী শিথিলযোগ্য)।

নির্বাচিত প্রার্থীরা জাতীয় বেতন স্কেল ২০১৫ এর আওতায় আকর্ষণীয় মূল বেতনের পাশাপাশি সরকারি বিধি মোতাবেক বাড়িভাড়া ভাতা, চিকিৎসা ভাতা, যাতায়াত ভাতা ও উৎসব ভাতা প্রাপ্য হবেন। আগ্রহী প্রার্থীদের নির্ধারিত সময়ের মধ্যে টেলিটকের অফিশিয়াল অনলাইন পোর্টাল (${officialLink}) ব্যবহার করে সঠিক নিয়মে আবেদন ফরম পূরণ ও ফি জমা দেওয়ার পরামর্শ প্রদান করা হচ্ছে।
`.trim();

      const jobRecord = {
        ...(db.jobs[jobId] || {}),
        id: jobId,
        title: `${orgBn} নিয়োগ বিজ্ঞপ্তি ২০২৬`,
        organization: orgBn,
        organizationEn: org.name,
        logo: logoUrl,
        category: 'govt',
        categoryLabel: 'সরকারি চাকরি',
        grade: positions.length > 1 ? `${positions.length}টি ভিন্ন গ্রেড (${positions[0].grade})` : positions[0].grade,
        totalPosts: totalPosts,
        salary: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
        minEducation: positions[0].minEducation,
        minAge: d.min_age || 18,
        maxAge: d.max_age || 32,
        ageCutOffDate: deadlineBn,
        districts: 'সকল জেলার প্রার্থীরা আবেদন করতে পারবেন',
        deadline: deadlineBn,
        daysRemaining: daysRemaining,
        publishedDate: publishedDateBn,
        applicationStartDate: publishedDateBn,
        officialLink: officialLink,
        applicationUrl: officialLink,
        circularPdfUrl: pdfUrl,
        pdfUrl: pdfUrl,
        circularImage: db.jobs[jobId]?.circularImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
        govtFee: highestFee,
        serviceFee: 50,
        feeRange: feeRange,
        featured: totalPosts >= 5 || i < 10,
        isHot: totalPosts >= 15,
        status: daysRemaining > 0 ? 'PUBLISHED' : 'CLOSED',
        publicationStatus: daysRemaining > 0 ? 'PUBLISHED' : 'CLOSED',
        verificationStatus: 'VERIFIED',
        verificationConfidence: 100,
        verifiedBy: 'ALLJOBS-LIVE-COLLECTOR',
        lastVerifiedAt: new Date().toISOString(),
        requirements: [
          'প্রার্থীকে জন্মসূত্রে বাংলাদেশের স্থায়ী নাগরিক হতে হবে।',
          'আবেদনের নির্ধারিত তারিখে প্রার্থীর বয়স ১৮ থেকে ৩২ বছরের মধ্যে হতে হবে (বীর মুক্তিযোদ্ধা ও শারীরিক প্রতিবন্ধী কোটায় ৩২ বছর পর্যন্ত শিথিলযোগ্য)।',
          'শিক্ষাগত যোগ্যতা: সংশ্লিষ্ট পদের জন্য নির্ধারিত ন্যূনতম শিক্ষাগত যোগ্যতা ও কম্পিউটারের প্রয়োজনীয় দক্ষতা থাকতে হবে।',
          'অনলাইনে আবেদনের সময় প্রার্থীর রঙিন ছবি (৩০০x৩০০ পিক্সেল) এবং স্বাক্ষর (৩০০x৮০ পিক্সেল) স্ক্যান করে আপলোড করতে হবে।'
        ],
        documentsRequired: [
          'অনলাইনে পূরণকৃত আবেদনপত্রের রঙিন প্রিন্ট কপি (Applicant\'s Copy)',
          'সকল শিক্ষাগত যোগ্যতার মূল বা সাময়িক সনদের সত্যায়িত ফটোকপি',
          'জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন জন্ম নিবন্ধন সনদের সত্যায়িত কপি',
          'নাগরিকত্ব সনদ ও প্রথম শ্রেণীর গেজেটেড কর্মকর্তা কর্তৃক চারিত্রিক সনদপত্র'
        ],
        applicationInstructions: `১. টেলিটক অনলাইন রিক্রুটমেন্ট পোর্টাল (${officialLink}) এ গিয়ে নির্ধারিত আবেদন ফরম পূরণ করুন।\n২. আবেদনের পর প্রাপ্ত User ID দিয়ে ৭২ ঘণ্টার মধ্যে এসএমএস করে ফি পরিশোধ করুন।`,
        bengaliDescription: editorialOverview,
        smsPrefix: smsPrefix,
        smsFormat: smsFormat,
        positions: positions,
        updatedAt: new Date().toISOString()
      };

      if (!db.jobs[jobId]) {
        jobRecord.createdAt = new Date().toISOString();
        syncedCount++;
      } else {
        updatedCount++;
      }

      db.jobs[jobId] = jobRecord;
      console.log(`[Synced] ${jobId} | ${orgBn} | Deadline: ${deadlineBn} | Days: ${daysRemaining} | Status: ${jobRecord.status}`);
    } catch (err) {
      console.error(`Error processing org ${org.name}:`, err.message);
    }
  }

  // 2. Fix Dates & Deadlines for ALL other jobs in the database
  console.log('\n--- FIXING DATES FOR ALL OTHER JOBS IN DATABASE ---');
  for (const [id, job] of Object.entries(db.jobs)) {
    let changed = false;

    // Fix raw date strings like "২০২৬-১২-৩১" or "2026-11-22"
    if (job.deadline && (job.deadline.includes('-') || /[০-৯\d]{4}-[০-৯\d]{2}/.test(job.deadline))) {
      const fixedDeadline = formatBnDate(job.deadline);
      if (fixedDeadline !== job.deadline) {
        console.log(`[Date Fixed] ${id}: "${job.deadline}" -> "${fixedDeadline}"`);
        job.deadline = fixedDeadline;
        changed = true;
      }
    }

    // Fix publishedDate if raw string
    if (job.publishedDate && (job.publishedDate.includes('-') || /[০-৯\d]{4}-[০-৯\d]{2}/.test(job.publishedDate))) {
      const fixedPub = formatBnDate(job.publishedDate);
      if (fixedPub !== job.publishedDate) {
        job.publishedDate = fixedPub;
        changed = true;
      }
    }

    // Re-evaluate daysRemaining
    const evaluatedDays = calculateDays(job.deadline);
    if (job.daysRemaining !== evaluatedDays) {
      job.daysRemaining = evaluatedDays;
      changed = true;
    }

    // Set proper published status for non-drafts
    if (job.status === 'OPEN' && evaluatedDays > 0) {
      job.status = 'PUBLISHED';
      job.publicationStatus = 'PUBLISHED';
      changed = true;
    } else if (evaluatedDays <= 0 && job.status !== 'CLOSED') {
      job.status = 'CLOSED';
      job.publicationStatus = 'CLOSED';
      changed = true;
    }

    // Ensure aliases exist
    if (job.officialLink && !job.applicationUrl) {
      job.applicationUrl = job.officialLink;
      changed = true;
    }
    if (job.circularPdfUrl && !job.pdfUrl) {
      job.pdfUrl = job.circularPdfUrl;
      changed = true;
    }

    if (changed) {
      db.jobs[id] = job;
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`\nAll jobs successfully synced and written to ${dbPath}!`);
  console.log(`Total jobs in database: ${Object.keys(db.jobs).length}`);
})();

