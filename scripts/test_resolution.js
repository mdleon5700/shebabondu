const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
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

function inferPositionGradeAndSalary(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('পরিচালক') || t.includes('director') || t.includes('সহকারী সচিব') || t.includes('প্রকৌশলী') || t.includes('engineer') || t.includes('অফিসার') || t.includes('officer') || t.includes('ম্যানেজার') || t.includes('manager')) {
    return { grade: '৯ম - ১০ম গ্রেড', salary: '১৬,০০০ - ৫৩,০৬০/- টাকা', govtFee: 600, minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে সংশ্লিষ্ট বিষয়ে স্নাতক (সম্মান) বা স্নাতকোত্তর ডিগ্রি' };
  }
  if (t.includes('অডিটর') || t.includes('auditor') || t.includes('হিসাবরক্ষক') || t.includes('accountant') || t.includes('ইন্সপেক্টর') || t.includes('inspector') || t.includes('সাব-ইন্সপেক্টর')) {
    return { grade: '১১তম - ১২তম গ্রেড', salary: '১২,৫০০ - ৩০,২৩০/- টাকা', govtFee: 300, minEducation: 'স্বীকৃত বিশ্ববিদ্যালয় হতে বাণিজ্য/বিজ্ঞান/মানবিকে ন্যূনতম ২য় শ্রেণি বা সমমানের সিজিপিএ সহ স্নাতক ডিগ্রি' };
  }
  if (t.includes('অপারেটর') || t.includes('operator') || t.includes('মুদ্রাক্ষরিক') || t.includes('typist') || t.includes('সহকারী') || t.includes('assistant') || t.includes('ক্লার্ক') || t.includes('clerk') || t.includes('টেকনিশিয়ান') || t.includes('technician') || t.includes('ড্রাফটসম্যান')) {
    return { grade: '১৩তম - ১৬তম গ্রেড', salary: '৯,৩০০ - ২৬,৫৯০/- টাকা', govtFee: 200, minEducation: 'উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ এবং কম্পিউটার ব্যবহারে পারদর্শী' };
  }
  if (t.includes('ড্রাইভার') || t.includes('driver') || t.includes('চালক')) {
    return { grade: '১৬তম গ্রেড', salary: '৯,৩০০ - ২২,৪৯০/- টাকা', govtFee: 200, minEducation: 'জুনিয়র স্কুল সার্টিফিকেট (জেএসসি) বা সমমান পাস এবং বৈধ ড্রাইভিং লাইসেন্সধারী' };
  }
  return { grade: '১৭তম - ২০তম গ্রেড', salary: '৮,২৫০ - ২০,০১০/- টাকা', govtFee: 100, minEducation: 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ' };
}

async function testResolution() {
  const testUrls = [
    'https://alljobs.teletalk.com.bd/jobs/government/15176', // Supreme Court HCD
    'https://alljobs.teletalk.com.bd/jobs/government/15160', // BCSL
    'https://alljobs.teletalk.com.bd/jobs/organization/1150', // DC Bagerhat
    'https://bcsl.teletalk.com.bd' // Direct portal
  ];

  const orgListRes = await fetchJson('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=50');
  const orgList = orgListRes.govtOrgJobs;

  for (const url of testUrls) {
    console.log('\n--- Testing URL:', url);
    let jobId = null;
    let orgId = null;

    const jm = url.match(/jobs\/government\/(\d+)/i) || url.match(/jobId=(\d+)/i);
    if (jm) jobId = jm[1];
    const om = url.match(/jobs\/organization\/(\d+)/i) || url.match(/orgId=(\d+)/i);
    if (om) orgId = om[1];
    const sm = url.match(/https?:\/\/([a-zA-Z0-9\-_]+)\.teletalk\.com\.bd/i);
    const sub = sm ? sm[1].toLowerCase() : '';

    let matchedOrg = null;
    let detail = null;

    if (jobId) {
      const dRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${jobId}`);
      detail = dRes.details;
      matchedOrg = orgList.find(o => 
        o.id === detail?.job_utilities_govtorganization?.id ||
        (o.govt_jobs && o.govt_jobs.some(j => String(j.id) === String(jobId)))
      );
    } else if (orgId) {
      matchedOrg = orgList.find(o => String(o.id) === String(orgId));
      if (matchedOrg && matchedOrg.govt_jobs?.length > 0) {
        const dRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${matchedOrg.govt_jobs[0].id}`);
        detail = dRes.details;
      }
    } else if (sub && sub !== 'alljobs') {
      matchedOrg = orgList.find(o => o.short_name?.toLowerCase() === sub || sub.includes(o.short_name?.toLowerCase()));
      if (matchedOrg && matchedOrg.govt_jobs?.length > 0) {
        const dRes = await fetchJson(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/public-details?id=${matchedOrg.govt_jobs[0].id}`);
        detail = dRes.details;
      }
    }

    if (matchedOrg) {
      console.log('✅ Matched Org:', matchedOrg.name, '| Short:', matchedOrg.short_name);
      console.log('Total Positions Found:', matchedOrg.govt_jobs?.length);
      console.log('Positions Preview:', matchedOrg.govt_jobs?.slice(0, 3).map(j => j.job_title_bn || j.job_title));
      console.log('Application Portal:', detail?.application_site);
      console.log('Deadline:', detail?.deadline_date);
    } else {
      console.log('❌ Could not match org for:', url);
    }
  }
}

testResolution().catch(console.error);

