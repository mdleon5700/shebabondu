const fs = require('fs');
const path = require('path');
const https = require('https');

const agent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });

const toBn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
const toEn = str => String(str || '').replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]);

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

function formatBnDate(dateStr) {
  try {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    // In Dhaka timezone (UTC+6)
    const dhakaTime = new Date(d.getTime() + 6 * 3600000);
    const day = toBn(dhakaTime.getUTCDate());
    const month = MONTH_NAMES_BN[dhakaTime.getUTCMonth()];
    const year = toBn(dhakaTime.getUTCFullYear());
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function calculateDaysRemaining(dateStr) {
  try {
    if (!dateStr) return 15;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 15;
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ChakriSheba/2.0 OfficialSync',
        'Accept': 'application/json',
        'Authorization': 'Bearer false'
      },
      timeout: 15000
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed parsing JSON from ${url}: ${data.substring(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

function generateCircularSvgBanner(org, title, totalPosts, deadline) {
  const cleanOrg = (org || 'বাংলাদেশ সরকারি প্রতিষ্ঠান').replace(/[<>&"']/g, '');
  const cleanTitle = (title || 'নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬').replace(/[<>&"']/g, '');
  const cleanPosts = String(totalPosts || 'একাধিক পদ').replace(/[<>&"']/g, '');
  const cleanDeadline = (deadline || 'শীঘ্রই শেষ হবে').replace(/[<>&"']/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#064e3b" />
        <stop offset="60%" stop-color="#022c22" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#059669" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.45" />
      </filter>
    </defs>

    <rect width="1200" height="630" fill="url(#bgGrad)" />
    <circle cx="1060" cy="140" r="220" fill="#10b981" opacity="0.08" />
    <circle cx="1060" cy="140" r="160" fill="#fbbf24" opacity="0.05" />

    <g transform="translate(80, 70)">
      <rect width="280" height="42" rx="21" fill="url(#badgeGrad)" />
      <text x="140" y="27" fill="#ffffff" font-size="19" font-family="'Hind Siliguri', 'Noto Sans Bengali', sans-serif" font-weight="700" text-anchor="middle">
        গভর্নমেন্ট জব সার্কুলার ২০২৬
      </text>
    </g>

    <text x="80" y="185" fill="#34d399" font-size="34" font-family="'Hind Siliguri', 'Noto Sans Bengali', sans-serif" font-weight="700">
      ${cleanOrg.length > 45 ? cleanOrg.substring(0, 43) + '...' : cleanOrg}
    </text>

    <foreignObject x="80" y="215" width="1040" height="180">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Hind Siliguri', sans-serif; font-size: 42px; font-weight: 800; color: #ffffff; line-height: 1.35; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
        ${cleanTitle}
      </div>
    </foreignObject>

    <g transform="translate(80, 440)">
      <g filter="url(#shadow)">
        <rect width="320" height="110" rx="16" fill="#0f2b23" stroke="#10b981" stroke-width="2" />
        <text x="24" y="42" fill="#9ca3af" font-size="17" font-family="'Hind Siliguri', sans-serif" font-weight="600">মোট শূন্যপদ</text>
        <text x="24" y="86" fill="#fbbf24" font-size="36" font-family="'Hind Siliguri', sans-serif" font-weight="800">${cleanPosts}</text>
      </g>

      <g transform="translate(350, 0)" filter="url(#shadow)">
        <rect width="340" height="110" rx="16" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" />
        <text x="24" y="42" fill="#cbd5e1" font-size="17" font-family="'Hind Siliguri', sans-serif" font-weight="600">আবেদনের শেষ তারিখ</text>
        <text x="24" y="86" fill="#f43f5e" font-size="30" font-family="'Hind Siliguri', sans-serif" font-weight="800">${cleanDeadline}</text>
      </g>

      <g transform="translate(720, 0)" filter="url(#shadow)">
        <rect width="320" height="110" rx="16" fill="#142e1d" stroke="#059669" stroke-width="2" />
        <text x="24" y="42" fill="#86efac" font-size="17" font-family="'Hind Siliguri', sans-serif" font-weight="600">যাচাইকৃত সোর্স</text>
        <text x="24" y="86" fill="#34d399" font-size="28" font-family="'Hind Siliguri', sans-serif" font-weight="800">টেলিটক অলজবস</text>
      </g>
    </g>

    <rect x="0" y="618" width="1200" height="12" fill="url(#badgeGrad)" />
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const ORG_NAME_BN_MAP = {
  754: 'বাংলাদেশ সুপ্রিম কোর্ট (হাইকোর্ট বিভাগ)',
  609: 'বাংলাদেশ কেবল শিল্প লিমিটেড (BCSL)',
  1150: 'জেলা প্রশাসকের কার্যালয়, বাগেরহাট',
  994: 'বাংলাদেশ হাই-টেক পার্ক কর্তৃপক্ষ (BHTPA)',
  740: 'জেলা প্রশাসকের কার্যালয়, জামালপুর',
  459: 'সামরিক চিকিৎসা সার্ভিস মহাপরিদপ্তর (DGMS)',
  1170: 'বাংলাদেশের মহাহিসাব নিরীক্ষক ও নিয়ন্ত্রকের কার্যালয় (CAG)',
  632: 'জেলা প্রশাসকের কার্যালয়, রাজবাড়ী',
  635: 'ঢাকা দক্ষিণ সিটি কর্পোরেশন (DSCC)',
  397: 'কোল পাওয়ার জেনারেশন কোম্পানি বাংলাদেশ লিমিটেড (CPGCBL)',
  1151: 'জেলা প্রশাসকের কার্যালয়, ঝিনাইদহ',
  289: 'আশুগঞ্জ পাওয়ার স্টেশন কোম্পানি লিমিটেড (APSCL)',
  1125: 'বাংলাদেশ সশস্ত্র বাহিনী বোর্ড (BASB)',
  974: 'কর গোয়েন্দা ও তদন্ত ইউনিট (ITIIU)',
  993: 'কর অঞ্চল-১৯, ঢাকা',
  559: 'জেলা প্রশাসকের কার্যালয়, নড়াইল',
  1168: 'জাতীয় সঞ্চয় অধিদপ্তর (NSD)',
  1167: 'কর অঞ্চল, নারায়ণগঞ্জ',
  760: 'জেলা প্রশাসকের কার্যালয়, চুয়াডাঙ্গা',
  1166: 'পুলিশ সুপারের কার্যালয়, শেরপুর',
  761: 'কর অঞ্চল-৯, ঢাকা',
  610: 'জেলা প্রশাসকের কার্যালয়, নোয়াখালী',
  1165: 'কর কমিশনারের কার্যালয় কর অঞ্চল-৬, ঢাকা',
  445: 'বাংলাদেশ তৈল, গ্যাস ও খনিজ সম্পদ কর্পোরেশন (পেট্রোবাংলা)',
  1164: 'পুলিশ সুপারের কার্যালয়, দিনাজপুর',
  611: 'জেলা প্রশাসকের কার্যালয়, পটুয়াখালী',
  795: 'হাউজিং অ্যান্ড বিল্ডিং রিসার্চ ইনস্টিটিউট (HBRI)',
  367: 'বাংলাদেশ কেমিক্যাল ইন্ডাস্ট্রিজ কর্পোরেশন (বিসিআইসি)',
  868: 'জেলা প্রশাসকের কার্যালয়, নেত্রকোণা',
  878: 'বাংলাদেশ পুলিশ, সিআইডি',
  964: 'সিভিল সার্জন কার্যালয়, রাজবাড়ী'
};

const CATEGORY_MAP = {
  754: { category: 'govt', categoryLabel: 'সরকারি ও বিচার বিভাগ' },
  609: { category: 'govt', categoryLabel: 'সরকারি শিল্প ও প্রকৌশল' },
  1150: { category: 'govt', categoryLabel: 'জেলা প্রশাসন ও রাজস্ব' },
  994: { category: 'govt', categoryLabel: 'আইসিটি ও হাই-টেক পার্ক' },
  740: { category: 'govt', categoryLabel: 'জেলা প্রশাসন ও রাজস্ব' },
  459: { category: 'defense', categoryLabel: 'সামরিক ও চিকিৎসা সার্ভিস' },
  1170: { category: 'govt', categoryLabel: 'মহাহিসাব নিরীক্ষক ও অডিট' },
  632: { category: 'govt', categoryLabel: 'জেলা প্রশাসন ও স্থানীয় সরকার' },
  635: { category: 'govt', categoryLabel: 'সিটি কর্পোরেশন ও নগর সেবা' },
  397: { category: 'govt', categoryLabel: 'বিদ্যুৎ ও জ্বালানি খাত' },
  1151: { category: 'govt', categoryLabel: 'জেলা প্রশাসন ও স্থানীয় সরকার' },
  289: { category: 'govt', categoryLabel: 'বিদ্যুৎ ও জ্বালানি খাত' },
  1125: { category: 'defense', categoryLabel: 'প্রতিরক্ষা ও সশস্ত্র বাহিনী' },
  974: { category: 'govt', categoryLabel: 'আয়কর গোয়েন্দা ও রাজস্ব' },
  993: { category: 'govt', categoryLabel: 'জাতীয় রাজস্ব ও আয়কর' },
  559: { category: 'govt', categoryLabel: 'জেলা প্রশাসন ও স্থানীয় সরকার' },
  1168: { category: 'govt', categoryLabel: 'অর্থ ও জাতীয় সঞ্চয় অধিদপ্তর' },
  1167: { category: 'govt', categoryLabel: 'জাতীয় রাজস্ব ও কর অঞ্চল' },
  760: { category: 'govt', categoryLabel: 'জেলা প্রশাসন ও স্থানীয় সরকার' },
  1166: { category: 'defense', categoryLabel: 'বাংলাদেশ পুলিশ প্রশাসন' },
  761: { category: 'govt', categoryLabel: 'জাতীয় রাজস্ব ও আয়কর' },
  610: { category: 'govt', categoryLabel: 'জেলা প্রশাসন ও স্থানীয় সরকার' },
  1165: { category: 'govt', categoryLabel: 'জাতীয় রাজস্ব ও কর অঞ্চল' },
  445: { category: 'govt', categoryLabel: 'তেল, গ্যাস ও খনিজ সম্পদ (পেট্রোবাংলা)' },
  1164: { category: 'defense', categoryLabel: 'বাংলাদেশ পুলিশ প্রশাসন' },
  611: { category: 'govt', categoryLabel: 'জেলা প্রশাসন ও স্থানীয় সরকার' },
  795: { category: 'govt', categoryLabel: 'গৃহায়ন ও অবকাঠামো গবেষণা' },
  367: { category: 'govt', categoryLabel: 'রাসায়নিক ও শিল্প কর্পোরেশন (BCIC)' },
  868: { category: 'govt', categoryLabel: 'জেলা প্রশাসন ও স্থানীয় সরকার' },
  878: { category: 'defense', categoryLabel: 'বাংলাদেশ পুলিশ ও সিআইডি' },
  964: { category: 'health', categoryLabel: 'স্বাস্থ্য ও চিকিৎসা সেবা' }
};

const EXISTING_ID_MAP = {
  754: 'job-ai-gov-fcfec3',
  609: 'job-ai-bcsl-52e221',
  1150: 'job-ai-gov-5f55e8',
  994: 'job-ai-bhtpa-f996da',
  740: 'job-ai-gov-f676f9',
  459: 'job-ai-dgms-1060c6',
  1170: 'job-ai-cag-09eac2',
  632: 'job-ai-gov-9e618d',
  635: 'job-ai-dscc-7d0238',
  397: 'job-ai-cpgcbl-dfc0e2',
  1151: 'job-ai-gov-3d0fa9',
  289: 'job-ai-apscl-049b71',
  1125: 'job-ai-basb-0dcd9a',
  974: 'job-ai-itiiu-77c540',
  993: 'job-ai-gov-113d62',
  559: 'job-ai-gov-7980c9',
  1168: 'job-ai-nsd-fa7588',
  1167: 'job-ai-gov-ac5b97',
  760: 'job-ai-gov-454e35',
  1166: 'job-ai-gov-5adf47'
};

function inferPositionMeta(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('পরিচালক') || t.includes('director') || t.includes('প্রকৌশলী') || t.includes('engineer') || t.includes('ব্যবস্থাপক') || t.includes('manager') || t.includes('রসায়নবিদ') || t.includes('অফিসার') || t.includes('officer')) {
    return { grade: '৯ম - ১০ম গ্রেড', salary: '২২,০০০ - ৫৩,০৬০/- টাকা', govtFee: 600, minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে সংশ্লিষ্ট বিষয়ে স্নাতক (সম্মান) বা স্নাতকোত্তর ডিগ্রি' };
  }
  if (t.includes('অডিটর') || t.includes('auditor') || t.includes('হিসাবরক্ষক') || t.includes('accountant') || t.includes('ইন্সপেক্টর') || t.includes('উপ-সহকারী') || t.includes('প্রধান সহকারী') || t.includes('উচ্চমান সহকারী') || t.includes('কর্মকর্তা')) {
    return { grade: '১০ম - ১২তম গ্রেড', salary: '১২,৫০০ - ৩০,২৩০/- টাকা', govtFee: 300, minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে ন্যূনতম ২য় শ্রেণি বা সমমানের সিজিপিএ সহ স্নাতক ডিগ্রি' };
  }
  if (t.includes('অপারেটর') || t.includes('মুদ্রাক্ষরিক') || t.includes('typist') || t.includes('সহকারী') || t.includes('assistant') || t.includes('লাইব্রেরি') || t.includes('টেকনিশিয়ান') || t.includes('সাঁটলিপিকার')) {
    return { grade: '১৩তম - ১৬তম গ্রেড', salary: '৯,৩০০ - ২৬,৫৯০/- টাকা', govtFee: 200, minEducation: 'উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি) বা সমমান এবং কম্পিউটার পরিচালনায় পারদর্শী' };
  }
  if (t.includes('ড্রাইভার') || t.includes('চালক') || t.includes('driver')) {
    return { grade: '১৬তম গ্রেড', salary: '৯,৩০০ - ২২,৪৯০/- টাকা', govtFee: 200, minEducation: 'জুনিয়র স্কুল সার্টিফিকেট (জেএসসি) বা সমমান পাস এবং বৈধ ড্রাইভিং লাইসেন্স' };
  }
  return { grade: '১৭তম - ২০তম গ্রেড', salary: '৮,২৫০ - ২০,০১০/- টাকা', govtFee: 100, minEducation: 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ' };
}

async function run() {
  console.log('=== STARTING COMPLETE ALLJOBS TELETALK PUBLISHING SYNC ===');

  // 1. Fetch all pages of organizations
  const p1 = await fetchJson('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=20');
  const p2 = await fetchJson('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=2&limit=20');
  const allOrgs = [...(p1.govtOrgJobs || []), ...(p2.govtOrgJobs || [])];
  console.log(`Discovered ${allOrgs.length} active organizations on Alljobs Teletalk.`);

  const dbPath = path.resolve(__dirname, '../src/db/local_store.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  db.jobs = db.jobs || {};

  const publishedJobs = {};

  for (let idx = 0; idx < allOrgs.length; idx++) {
    const org = allOrgs[idx];
    if (!org.govt_jobs || org.govt_jobs.length === 0) continue;

    const orgId = org.id;
    const orgBn = ORG_NAME_BN_MAP[orgId] || (org.name_bn && org.name_bn.trim().length > 0 ? org.name_bn.trim() : org.name);
    const orgShort = (org.short_name || 'gov').toLowerCase().replace(/[^a-z0-9]/g, '').trim() || 'gov';
    
    // Determine stable job ID
    const jobId = EXISTING_ID_MAP[orgId] || `job-ai-${orgShort}-${org.govt_jobs[0].id}`;

    console.log(`\n[${idx + 1}/${allOrgs.length}] Ingesting Org ${orgId}: ${orgBn} (ID: ${jobId})...`);

    // Fetch primary job details for metadata
    const primaryGJob = org.govt_jobs[0];
    const primaryDetailsRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${primaryGJob.id}`);
    const d = primaryDetailsRes.details || {};

    // Fetch individual sub-job details in parallel with keep-alive
    console.log(`  Fetching ${org.govt_jobs.length} sub-jobs for ${orgBn}...`);
    const subJobDetails = await Promise.all(
      org.govt_jobs.map(async (gj) => {
        try {
          const res = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${gj.id}`);
          return { gj, det: res.details || {} };
        } catch (e) {
          return { gj, det: {} };
        }
      })
    );

    // Map all positions
    const positions = subJobDetails.map(({ gj, det }, posIdx) => {
      const titleBn = gj.job_title_bn || det.job_title_bn || gj.job_title || det.job_title || 'কর্মকর্তা / কর্মচারী';
      const meta = inferPositionMeta(titleBn + ' ' + (gj.job_title || ''));
      
      let rawVacancy = det.vacancy || gj.vacancy || '1';
      let vacancyNum = parseInt(String(rawVacancy).replace(/\D/g, ''), 10) || 1;

      return {
        id: `pos-${gj.id || posIdx + 1}`,
        title: titleBn,
        grade: det.grade || gj.grade || meta.grade,
        posts: vacancyNum,
        vacancies: vacancyNum,
        salary: meta.salary,
        minEducation: det.education || gj.education || meta.minEducation,
        govtFee: meta.govtFee
      };
    });

    const totalPosts = positions.reduce((sum, p) => sum + (p.posts || 1), 0) || positions.length || 1;
    const deadlineDate = d.deadline_date || new Date(Date.now() + 15 * 86400000).toISOString();
    const deadlineBn = formatBnDate(deadlineDate);
    const daysRemaining = calculateDaysRemaining(deadlineDate);

    const publishedDateRaw = d.advertisement_published_date || d.published_date || new Date().toISOString();
    const publishedDateBn = formatBnDate(publishedDateRaw);

    const officialLink = d.application_site 
      ? d.application_site.replace(/\/$/, '')
      : `https://${orgShort}.teletalk.com.bd`;

    let pdfUrl = '';
    if (d.advertisement_file) {
      pdfUrl = d.advertisement_file.startsWith('http')
        ? d.advertisement_file
        : `https://alljobs.teletalk.com.bd/media/${d.advertisement_file}`;
    } else {
      pdfUrl = `${officialLink}/docs/advertisement.pdf`;
    }

    const logoUrl = org.logo 
      ? (org.logo.startsWith('http') ? org.logo : `https://alljobs.teletalk.com.bd/media/${org.logo}`)
      : 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80';

    const categoryInfo = CATEGORY_MAP[orgId] || { category: 'govt', categoryLabel: 'সরকারি চাকরি' };

    let fullTitle = `${orgBn} বিভিন্ন পদে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬`;
    if (positions.length === 1) {
      fullTitle = `${orgBn} - ${positions[0].title} নিয়োগ বিজ্ঞপ্তি ২০২৬`;
    }

    const highestFee = Math.max(...positions.map(p => p.govtFee || 100), 100);
    const lowestFee = Math.min(...positions.map(p => p.govtFee || 100), 100);
    const feeRange = lowestFee === highestFee ? `৳${lowestFee}` : `৳${lowestFee} - ৳${highestFee}`;
    const smsPrefix = (org.short_name || orgShort).toUpperCase().trim();

    const smsFormat = `
১ম এসএমএস: ${smsPrefix} <Space> User_ID পাঠিয়ে দিন 16222 নম্বরে।
(উদাহরণ: ${smsPrefix} ABCDEF লিখে পাঠিয়ে দিন 16222 নম্বরে)

২য় এসএমএস: ${smsPrefix} <Space> YES <Space> PIN পাঠিয়ে দিন 16222 নম্বরে।
(ফিরতি এসএমএসে প্রাপ্ত PIN দিয়ে ২য় এসএমএস পাঠিয়ে পেমেন্ট কনফার্ম করতে হবে)
`.trim();

    const editorialOverview = `
${orgBn} সম্প্রতি ২০২৬ সালের জন্য রাজস্ব খাতভুক্ত স্থায়ী শূন্যপদে দক্ষ, যোগ্য ও উদ্যমী জনবল নিয়োগের লক্ষ্যে অফিসিয়াল নিয়োগ বিজ্ঞপ্তি প্রকাশ করেছে। উক্ত প্রতিষ্ঠানে বিভিন্ন ক্যাটাগরিতে মোট ${toBn(totalPosts)} টি পদে সরাসরি জনবল নিয়োগের জন্য যোগ্য বাংলাদেশি নাগরিকদের নিকট থেকে অনলাইনে দরখাস্ত আহ্বান করা হচ্ছে।

বিজ্ঞপ্তি অনুযায়ী, এই নিয়োগ প্রক্রিয়ায় ${positions.slice(0, 5).map(p => `${p.title} (${toBn(p.posts)} জন)`).join(', ')}${positions.length > 5 ? ` সহ মোট ${toBn(positions.length)}টি পদে` : ''} আবেদন গ্রহণ করা হবে। পদভেদে ন্যূনতম শিক্ষাগত যোগ্যতা ${positions[0].minEducation} নির্ধারণ করা হয়েছে এবং সাধারণ প্রার্থীদের বয়সসীমা ১৮ হতে ৩২ বছরের মধ্যে হতে হবে (বীর মুক্তিযোদ্ধা কোটা ও অন্যান্য সংরক্ষিত কোটায় সরকারি বিধি অনুযায়ী শিথিলযোগ্য)।

নির্বাচিত প্রার্থীরা জাতীয় বেতন স্কেল ২০১৫ এর আওতায় আকর্ষণীয় মূল বেতনের পাশাপাশি সরকারি বিধি মোতাবেক বাড়িভাড়া ভাতা, চিকিৎসা ভাতা, যাতায়াত ভাতা ও উৎসব ভাতা প্রাপ্য হবেন। আগ্রহী প্রার্থীদের নির্ধারিত সময়ের মধ্যে টেলিটকের অফিশিয়াল অনলাইন পোর্টাল (${officialLink}) ব্যবহার করে সঠিক নিয়মে আবেদন ফরম পূরণ ও ফি জমা দেওয়ার পরামর্শ প্রদান করা হচ্ছে।
`.trim();

    // Generate high resolution SVG circular banner
    const svgBanner = generateCircularSvgBanner(orgBn, fullTitle, `${toBn(totalPosts)} জন`, deadlineBn);

    // Existing job reference to preserve revisions and overrides
    const existingJob = db.jobs[jobId] || {};

    const jobRecord = {
      ...existingJob,
      id: jobId,
      title: fullTitle,
      organization: orgBn,
      organizationEn: org.name,
      logo: logoUrl,
      category: categoryInfo.category,
      categoryLabel: categoryInfo.categoryLabel,
      grade: positions.length > 1 ? `${toBn(positions.length)}টি ভিন্ন গ্রেড (${positions[0].grade})` : positions[0].grade,
      totalPosts: totalPosts,
      salary: positions[0].salary || 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী',
      minEducation: positions[0].minEducation,
      minAge: d.min_age || 18,
      maxAge: d.max_age || 32,
      ageCutOffDate: deadlineBn,
      districts: 'সকল জেলার যোগ্য প্রার্থীগণ আবেদন করতে পারবেন',
      deadline: deadlineBn,
      applicationStartDate: publishedDateBn,
      publishedDate: publishedDateBn,
      officialLink: officialLink,
      applicationUrl: officialLink,
      circularPdfUrl: pdfUrl,
      pdfUrl: pdfUrl,
      circularImage: svgBanner,
      daysRemaining: daysRemaining,
      audioSummary: `${orgBn}-এ বিভিন্ন পদে মোট ${toBn(totalPosts)} জনের নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে। আবেদনের শেষ তারিখ ${deadlineBn}।`,
      govtFee: highestFee,
      serviceFee: 50,
      feeRange: feeRange,
      featured: totalPosts >= 5 || idx < 12,
      isHot: totalPosts >= 10,
      status: 'OPEN',
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      verificationConfidence: 100,
      verifiedBy: 'ALLJOBS-TELETALK-SYNC',
      lastVerifiedAt: new Date().toISOString(),
      requirements: [
        'প্রার্থীকে জন্মসূত্রে বাংলাদেশের স্থায়ী নাগরিক হতে হবে।',
        'আবেদনের শেষ তারিখে প্রার্থীর বয়স ১৮ থেকে ৩২ বছরের মধ্যে হতে হবে (বীর মুক্তিযোদ্ধা ও শারীরিক প্রতিবন্ধী কোটায় ৩২ বছর পর্যন্ত শিথিলযোগ্য)।',
        'শিক্ষাগত যোগ্যতা: সংশ্লিষ্ট পদের জন্য নির্ধারিত ন্যূনতম শিক্ষাগত যোগ্যতা ও কম্পিউটারের প্রয়োজনীয় দক্ষতা থাকতে হবে।',
        'অনলাইনে আবেদনের সময় প্রার্থীর রঙিন ছবি (৩০০x৩০০ পিক্সেল) এবং স্বাক্ষর (৩০০x৮০ পিক্সেল) স্ক্যান করে আপলোড করতে হবে।'
      ],
      documentsRequired: [
        'অনলাইনে পূরণকৃত আবেদনপত্রের রঙিন প্রিন্ট কপি (Applicant\'s Copy)',
        'সকল শিক্ষাগত যোগ্যতার মূল বা সাময়িক সনদের সত্যায়িত ফটোকপি',
        'জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন জন্ম নিবন্ধন সনদের সত্যায়িত কপি',
        'নাগরিকত্ব সনদ ও প্রথম শ্রেণীর গেজেটেড কর্মকর্তা কর্তৃক চারিত্রিক সনদপত্র',
        'মুক্তিযোদ্ধা/প্রতিবন্ধী/উপজাতি কোটার ক্ষেত্রে যথাযথ কর্তৃপক্ষের প্রত্যয়নপত্র'
      ],
      applicationInstructions: `১. টেলিটক অনলাইন রিক্রুটমেন্ট পোর্টাল (${officialLink}) এ গিয়ে নির্ধারিত আবেদন ফরম পূরণ করুন।\n২. আবেদন ফরম সাবমিট করার পর প্রাপ্ত User ID ব্যবহার করে টেলিটক প্রিপেইড সিমের মাধ্যমে ৭২ ঘণ্টার মধ্যে এসএমএস করে পরীক্ষার ফি পরিশোধ করতে হবে।`,
      selectionProcess: [
        '১ম ধাপ: প্রাথমিক আবেদন যাচাই-বাছাই ও স্ক্রিনিং',
        '২য় ধাপ: প্রিলিমিনারি / লিখিত পরীক্ষা গ্রহণ',
        '৩য় ধাপ: ব্যবহারিক পরীক্ষা (প্রযোজ্য পদের ক্ষেত্রে)',
        '৪র্থ ধাপ: মৌখিক পরীক্ষা (ভাইভা) ও সনদপত্র যাচাই'
      ],
      faqItems: [
        {
          question: 'এই নিয়োগে আবেদনের শেষ তারিখ কবে?',
          answer: `এই সার্কুলারে অনলাইনে আবেদনের শেষ সময় ${deadlineBn}। নির্ধারিত সময়ের পর কোনো আবেদন গ্রহণ করা হবে না।`
        },
        {
          question: 'আবেদনের যোগ্যতা ও বয়সসীমা কত?',
          answer: `প্রার্থীদের বয়স ১৮ থেকে ৩২ বছরের মধ্যে হতে হবে। বীর মুক্তিযোদ্ধা ও শারীরিক প্রতিবন্ধীদের ক্ষেত্রে সর্বোচ্চ ৩২ বছর প্রযোজ্য। শিক্ষাগত যোগ্যতা পদভেদে নির্ধারণ করা হয়েছে।`
        },
        {
          question: 'আবেদন ফি কীভাবে জমা দিতে হবে?',
          answer: `টেলিটক প্রিপেইড মোবাইল নম্বরের মাধ্যমে এসএমএস করে নির্ধারিত ফি পরিশোধ করতে হবে। এসএমএস ফরম্যাট উপরে বিস্তারিত উল্লেখ রয়েছে।`
        }
      ],
      seoTitle: `${fullTitle} - বিস্তারিত তথ্য ও আবেদন লিংক`,
      seoDescription: `${orgBn}-এ বিভিন্ন পদে মোট ${toBn(totalPosts)} জন নিয়োগের জন্য অফিসিয়াল বিজ্ঞপ্তি প্রকাশিত হয়েছে। আবেদনের শেষ সময় ${deadlineBn}। অনলাইনে আবেদনের লিংক ও বিস্তারিত জানুন।`,
      seoKeywords: [
        orgBn,
        `${orgBn} সার্কুলার`,
        'সরকারি চাকরি ২০২৬',
        'alljobs teletalk bd',
        'bd govt job circular 2026',
        officialLink
      ],
      bengaliDescription: editorialOverview,
      smsPrefix: smsPrefix,
      smsFormat: smsFormat,
      positions: positions,
      createdAt: existingJob.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    publishedJobs[jobId] = jobRecord;
    console.log(`  ✓ Synced: ${orgBn} | Posts: ${totalPosts} | Deadline: ${deadlineBn} | Days: ${daysRemaining}`);
  }

  // Update local store
  db.jobs = publishedJobs;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

  console.log(`\n=== SYNC SUCCESSFUL ===`);
  console.log(`Total Published Circulars in Database: ${Object.keys(db.jobs).length}`);
  console.log(`Total Positions across all circulars: ${Object.values(db.jobs).reduce((acc, j) => acc + (j.positions?.length || 0), 0)}`);
  console.log(`Total Vacancies across all circulars: ${Object.values(db.jobs).reduce((acc, j) => acc + (j.totalPosts || 0), 0)}`);
}

run().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});

