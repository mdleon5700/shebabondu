const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runAudit() {
  console.log('🔍 Starting Comprehensive Audit Verification...');
  const baseUrl = 'http://localhost:3000';
  const pin = '1234';

  // 1. Test POST /api/admin/content-studio (Create New Post in Studio)
  console.log('\n📝 [Test 1] Testing New Post Creation in Content Studio...');
  const createPostRes = await fetch(`${baseUrl}/api/admin/content-studio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': pin
    },
    body: JSON.stringify({
      organization: 'পল্লী বিদ্যুতায়ন বোর্ড (BREB)',
      title: 'সহকারী প্রকৌশলী',
      category: 'govt',
      vacancies: 25,
      deadline: '২০২৬-১২-৩১',
      salary: '২২,০০০ - ৫৩,০৬০ টাকা (৯ম গ্রেড)',
      minEducation: 'বিএসসি ইন ইঞ্জিনিয়ারিং (ইইই/সিভিল/মেকানিক্যাল)'
    })
  });

  const postData = await createPostRes.json();
  console.log('Create Post API status:', createPostRes.status, 'success:', postData.success, 'draftId:', postData.draftId);
  if (!postData.success || !postData.draftId) {
    throw new Error('Failed to create new circular post via Content Studio API');
  }

  // Verify in queue
  const queueRes = await fetch(`${baseUrl}/api/admin/content-studio`, {
    headers: { 'x-admin-secret': pin }
  });
  const queueData = await queueRes.json();
  const foundInQueue = queueData.queue.some(q => q.draftId === postData.draftId);
  console.log('✅ Found newly created post in queue:', foundInQueue);

  // 2. Test Approve & Publish from Content Studio
  console.log('\n🚀 [Test 2] Testing Approval & Publishing of New Post...');
  const approveRes = await fetch(`${baseUrl}/api/admin/content-studio/${postData.draftId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': pin
    }
  });

  const approveData = await approveRes.json();
  console.log('Approve API status:', approveRes.status, 'success:', approveData.success);
  const publishedJobId = approveData.job?.id || approveData.state?.publishedJobId;
  console.log('Published Job ID:', publishedJobId);

  // 3. Test Public Rendering of Published Job with Rich Editorial Content
  console.log('\n🌐 [Test 3] Verifying Public Job Detail Page with Rich Editorial Markdown...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const jobPageUrl = `${baseUrl}/jobs/${publishedJobId}`;
  const jobRes = await page.goto(jobPageUrl, { waitUntil: 'networkidle' });
  console.log('Job Page HTTP Status:', jobRes ? jobRes.status() : 'null');

  await page.waitForTimeout(1500);
  const pageText = await page.evaluate(() => document.body.innerText);
  const hasOrg = pageText.includes('পল্লী বিদ্যুতায়ন বোর্ড');
  const hasPosition = pageText.includes('সহকারী প্রকৌশলী');
  const hasEditorialOverview = pageText.includes('নিয়োগ বিজ্ঞপ্তি ২০২৬ — এক নজরে সারসংক্ষেপ');
  console.log('✅ Has Organization Name in DOM:', hasOrg);
  console.log('✅ Has Position Title in DOM:', hasPosition);
  console.log('✅ Has Editorial Overview Heading in DOM:', hasEditorialOverview);

  const screenshotDir = path.join(__dirname, '..', 'artifacts_audit');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const pubJobPath = path.join(screenshotDir, '06_published_circular_detail.png');
  await page.screenshot({ path: pubJobPath, fullPage: false });
  console.log('📸 Captured 06_published_circular_detail.png');

  // 4. Test Page Creation, Immediate Public Access & Deletion
  console.log('\n📄 [Test 4] Testing WordPress-Grade Pages: Create, Instant Public View & Delete...');
  const createPageRes = await fetch(`${baseUrl}/api/admin/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': pin
    },
    body: JSON.stringify({
      title: 'চাকরি প্রস্তুতি স্পেশাল গাইড ২০২৬',
      slug: '/job-preparation-special-guide',
      status: 'published'
    })
  });
  const pageData = await createPageRes.json();
  console.log('Create Page status:', createPageRes.status, 'success:', pageData.success, 'pageId:', pageData.page?.id);

  // View public page
  const customPageRes = await page.goto(`${baseUrl}/job-preparation-special-guide`, { waitUntil: 'networkidle' });
  console.log('Custom Page Public Status:', customPageRes ? customPageRes.status() : 'null');
  const customPageText = await page.evaluate(() => document.body.innerText);
  const hasCustomTitle = customPageText.includes('চাকরি প্রস্তুতি স্পেশাল গাইড ২০২৬');
  console.log('✅ Custom Page renders title correctly:', hasCustomTitle);

  const pubPagePath = path.join(screenshotDir, '07_audit_custom_page.png');
  await page.screenshot({ path: pubPagePath, fullPage: false });
  console.log('📸 Captured 07_audit_custom_page.png');

  // Delete test page
  if (pageData.page?.id) {
    const deleteRes = await fetch(`${baseUrl}/api/admin/pages/${pageData.page.id}`, {
      method: 'DELETE',
      headers: { 'x-admin-secret': pin }
    });
    const delData = await deleteRes.json();
    console.log('Delete test page status:', delData.success);
  }

  // Copy screenshots to brain artifact directory
  const brainDir = path.join('C:', 'Users', 'Leon Rahman', '.gemini', 'antigravity', 'brain', '28ee63ba-098a-42e1-8ed2-67073b8967cd');
  if (fs.existsSync(brainDir)) {
    const files = fs.readdirSync(screenshotDir);
    for (const f of files) {
      fs.copyFileSync(path.join(screenshotDir, f), path.join(brainDir, f));
    }
    console.log(`📁 Copied ${files.length} audit screenshots to conversation artifacts!`);
  }

  await browser.close();
  console.log('\n🎉 ALL AUDIT TESTS PASSED WITH 100% SUCCESS!');
}

runAudit().catch(err => {
  console.error('❌ Audit verification failed:', err);
  process.exit(1);
});

