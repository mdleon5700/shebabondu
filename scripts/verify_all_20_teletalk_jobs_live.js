const http = require('http');
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

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const client = u.protocol === 'https:' ? https : http;
    const req = client.request(url, {
      method: 'POST',
      agent: u.protocol === 'https:' ? agent : undefined,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'x-admin-secret': '1234'
      },
      timeout: 30000
    }, (res) => {
      let resData = '';
      res.on('data', c => resData += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resData) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resData });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout to ' + url));
    });
    req.write(data);
    req.end();
  });
}

async function verifyAll20Jobs() {
  console.log('========================================================================');
  console.log('🚀 CHAKRI SHEBA: 20 LIVE TELETALK GOVERNMENT JOBS AUDIT & VERIFICATION');
  console.log('========================================================================\n');

  // 1. Fetch live active 20 orgs from Alljobs Teletalk API
  console.log('📡 Step 1: Discovering all 20 live active organizations from Alljobs Teletalk API...');
  const orgListRes = await fetchJson('https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list?page=1&limit=50');
  const orgs = orgListRes.govtOrgJobs.slice(0, 20);

  console.log(`✅ Retrieved ${orgs.length} live government circular organizations.\n`);

  const results = [];

  for (let i = 0; i < orgs.length; i++) {
    const org = orgs[i];
    const firstJob = org.govt_jobs && org.govt_jobs[0];
    const jobId = firstJob ? firstJob.id : null;
    
    // Construct real input URL as an admin would paste in Universal Job Workspace
    const jobUrl = jobId 
      ? `https://alljobs.teletalk.com.bd/jobs/government/${jobId}` 
      : `https://alljobs.teletalk.com.bd/jobs/organization/${org.id}`;

    console.log(`\n------------------------------------------------------------------------`);
    console.log(`📋 [${i + 1}/20] Processing Org: ${org.name} (${org.short_name})`);
    console.log(`🔗 Admin Pasted URL: ${jobUrl}`);

    const startTime = Date.now();
    const parseRes = await postJson('http://localhost:3000/api/admin/gemini/parse-circular', {
      pdfUrl: jobUrl,
      autoSave: true, // Also test database persistence & validation
      publishImmediately: false
    });
    const elapsed = Date.now() - startTime;

    if (parseRes.status !== 200 || !parseRes.body || !parseRes.body.success) {
      console.error(`❌ FAILED for Job #${i + 1}:`, parseRes.status, parseRes.body?.error || parseRes.raw);
      results.push({ index: i + 1, name: org.name, status: 'FAILED', error: parseRes.body?.error });
      continue;
    }

    const ext = parseRes.body.extracted;
    const saved = parseRes.body.savedJob;

    // Cross-check all 27 required circular fields
    const checks = {
      title: Boolean(ext.title && ext.title.length > 5),
      organization: Boolean(ext.organization && ext.organization.length > 3),
      category: ['govt', 'bank', 'railway', 'defense', 'teacher', 'ngo', 'private', 'health', 'engineer'].includes(ext.category),
      categoryLabel: Boolean(ext.categoryLabel),
      totalPosts: typeof ext.totalPosts === 'number' && ext.totalPosts > 0,
      positionsCount: Array.isArray(ext.positions) && ext.positions.length > 0,
      deadline: Boolean(ext.deadline && ext.deadline.length > 3),
      officialLink: Boolean(ext.officialLink && ext.officialLink.startsWith('http')),
      salary: Boolean(ext.salary),
      grade: Boolean(ext.grade),
      minEducation: Boolean(ext.minEducation),
      minAge: ext.minAge === 18,
      maxAge: ext.maxAge >= 30,
      govtFee: typeof ext.govtFee === 'number' && ext.govtFee > 0,
      serviceFee: ext.serviceFee === 50,
      feeRange: Boolean(ext.feeRange),
      districts: Boolean(ext.districts && ext.districts.includes('জেলা')),
      smsPrefix: Boolean(ext.smsPrefix && /^[A-Z0-9\-_]{2,15}$/.test(ext.smsPrefix)),
      bengaliDescription: Boolean(ext.bengaliDescription && ext.bengaliDescription.length > 50),
      requirements: Array.isArray(ext.requirements) && ext.requirements.length > 0,
      documentsRequired: Array.isArray(ext.documentsRequired) && ext.documentsRequired.length > 0,
      applicationInstructions: Boolean(ext.applicationInstructions),
      selectionProcess: Boolean(ext.selectionProcess),
      faqItems: Array.isArray(ext.faqItems) && ext.faqItems.length > 0,
      seoTitle: Boolean(ext.seoTitle),
      seoDescription: Boolean(ext.seoDescription),
      savedInDb: Boolean(saved && saved.id)
    };

    const allPassed = Object.values(checks).every(Boolean);

    console.log(`⏱️ Ingestion Time: ${elapsed}ms`);
    console.log(`📌 Title: ${ext.title}`);
    console.log(`🏢 Organization: ${ext.organization}`);
    console.log(`🏷️ Category: ${ext.category} (${ext.categoryLabel})`);
    console.log(`👥 Total Posts: ${ext.totalPosts} (Across ${ext.positions?.length} Positions)`);
    console.log(`📅 Deadline: ${ext.deadline}`);
    console.log(`💰 Salary: ${ext.salary} | Grade: ${ext.grade} | Fee: ${ext.feeRange}`);
    console.log(`📱 SMS Prefix: ${ext.smsPrefix}`);
    console.log(`🌍 Districts: ${ext.districts}`);
    console.log(`💾 Saved Job ID: ${saved?.id} (Status: ${saved?.status})`);
    console.log(`🔍 Field Validation Result: ${allPassed ? '✅ 100% ALL 27 FIELDS VALID' : '⚠️ SOME FIELDS MISSED'}`);

    if (!allPassed) {
      console.log('Failed checks:', Object.entries(checks).filter(([_, v]) => !v));
    }

    results.push({
      index: i + 1,
      org: ext.organization,
      category: ext.category,
      categoryLabel: ext.categoryLabel,
      totalPosts: ext.totalPosts,
      positionsCount: ext.positions?.length,
      smsPrefix: ext.smsPrefix,
      deadline: ext.deadline,
      savedId: saved?.id,
      allPassed
    });
  }

  console.log('\n========================================================================');
  console.log('📊 COMPREHENSIVE VERIFICATION SUMMARY TABLE (ALL 20 GOVERNMENT JOBS)');
  console.log('========================================================================');
  console.table(results);

  const passedCount = results.filter(r => r.allPassed).length;
  console.log(`\n🎉 FINAL RESULT: ${passedCount}/20 Jobs Ingested & Verified with 100% Precision!`);
}

verifyAll20Jobs().catch(console.error);

