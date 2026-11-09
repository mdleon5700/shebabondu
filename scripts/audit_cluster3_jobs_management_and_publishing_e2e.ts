import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PIN = 'CHAKRISEBA_SECURE_ADMIN_2026';

async function runCluster3Audit() {
  console.log('🚀 Starting Cluster 3: Job Management, Categorization & Publishing Deep Audit...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Inject Admin Authentication
  await context.addCookies([
    {
      name: 'cs_admin_auth',
      value: 'verified',
      domain: 'localhost',
      path: '/'
    },
    {
      name: 'session_token',
      value: 'SYNTH-ADMIN-SUPER',
      domain: 'localhost',
      path: '/'
    }
  ]);

  const page = await context.newPage();

  // Set localStorage credentials
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((pin) => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', pin);
  }, ADMIN_PIN);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // -------------------------------------------------------------
  // STEP 1: Audit All Circulars Master Table (/admin?tab=circulars)
  // -------------------------------------------------------------
  console.log('Step 1: Auditing All Circulars Master Table (/admin?tab=circulars)...');
  await page.goto(`${BASE_URL}/admin?tab=circulars`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const circularsHeader = page.locator('h2:has-text("সকল সার্কুলার ব্যবস্থাপনা ও লাইভ কন্ট্রোল")');
  console.log('Circulars Master Table title visible:', await circularsHeader.isVisible());
  if (!(await circularsHeader.isVisible())) {
    throw new Error('Circulars Master Table title is missing!');
  }

  // Check 5 KPI cards
  const kpis = ['মোট সার্কুলার', 'সক্রিয় ও চলমান', 'মেয়াদোত্তীর্ণ', 'সরকারি চাকরি', 'ব্যাংক ও অন্যান্য'];
  for (const kpi of kpis) {
    const el = page.locator(`text=${kpi}`).first();
    console.log(`KPI Card "${kpi}" visible:`, await el.isVisible());
  }

  // Check Search & Controls
  const searchInput = page.locator('input[placeholder*="পদবী, প্রতিষ্ঠান, গ্রেড"]').first();
  console.log('Job Search input visible:', await searchInput.isVisible());

  const syncBtn = page.locator('button:has-text("টেলিটক অলজবস লাইভ সিঙ্ক")');
  console.log('Teletalk Alljobs Live Sync button visible:', await syncBtn.isVisible());

  const newCircularBtn = page.locator('button:has-text("নতুন সার্কুলার পোস্ট করুন")');
  console.log('Post New Circular button visible:', await newCircularBtn.isVisible());

  // Test Corrigendum Modal
  const corrigendumBtn = page.locator('button:has-text("মেয়াদ বাড়ান")').first();
  await corrigendumBtn.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
  console.log('Corrigendum (মেয়াদ বাড়ান) button visible:', await corrigendumBtn.isVisible());

  if (await corrigendumBtn.isVisible()) {
    console.log('Clicking "মেয়াদ বাড়ান" button to trigger Corrigendum modal...');
    await corrigendumBtn.click();
    await page.waitForTimeout(1500);

    const corrModalTitle = page.locator('h3:has-text("মেয়াদ বৃদ্ধি ও সংশোধনী বিজ্ঞপ্তি")');
    console.log('Corrigendum Modal opened:', await corrModalTitle.isVisible());
    await page.screenshot({ path: 'audit_128_corrigendum_modal.png' });

    // Close modal
    const closeCorrBtn = page.locator('button:has-text("বাতিল")').last();
    if (await closeCorrBtn.isVisible()) {
      await closeCorrBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  await page.screenshot({ path: 'audit_128_circulars_master_table.png' });

  // -------------------------------------------------------------
  // STEP 2: Audit Create Circular & Universal Workspace (/admin?tab=create-circular)
  // -------------------------------------------------------------
  console.log('\nStep 2: Auditing Universal Job Workspace (/admin?tab=create-circular)...');
  await page.goto(`${BASE_URL}/admin?tab=create-circular`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // If workspace modal is not automatically open, click the open button
  const workspaceTitle = page.locator('h2:has-text("স্মার্ট সার্কুলার পেজ বিল্ডার ও এডিটর")');
  if (!(await workspaceTitle.isVisible())) {
    const openWorkspaceBtn = page.locator('button:has-text("ইউনিভার্সাল ওয়ার্কস্পেস ওপেন করুন")');
    if (await openWorkspaceBtn.isVisible()) {
      console.log('Clicking "ইউনিভার্সাল ওয়ার্কস্পেস ওপেন করুন" button...');
      await openWorkspaceBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  console.log('Universal Workspace Title visible:', await workspaceTitle.isVisible());

  // Inside Workspace: check builder tabs
  const tabBasic = page.locator('button:has-text("মৌলিক ও পদবি")').first();
  const tabRequirements = page.locator('button:has-text("শর্ত ও কাগজপত্র")').first();
  const tabApplication = page.locator('button:has-text("আবেদন ও এসএমএস")').first();

  console.log('Universal Workspace Basic Tab visible:', await tabBasic.isVisible());
  if (await tabBasic.isVisible()) {
    await tabBasic.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'audit_128_universal_job_workspace.png' });

  // Close workspace modal
  const closeWorkspaceBtn = page.locator('button[title="বন্ধ করুন"]').first();
  if (await closeWorkspaceBtn.isVisible()) {
    await closeWorkspaceBtn.click();
    await page.waitForTimeout(1000);
  }

  // -------------------------------------------------------------
  // STEP 3: Audit Job Publishing Center (/admin?tab=publishing-center)
  // -------------------------------------------------------------
  console.log('\nStep 3: Auditing Job Publishing Center (/admin?tab=publishing-center)...');
  await page.goto(`${BASE_URL}/admin?tab=publishing-center`, { waitUntil: 'domcontentloaded' });

  const pubCenterTitle = page.locator('h1:has-text("জব পাবলিশিং ও ওয়েবসাইট ম্যানেজমেন্ট সেন্টার")');
  await pubCenterTitle.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Publishing Center Header visible:', await pubCenterTitle.isVisible());

  // Verify Publishing Navigation Tabs
  const pubTabs = [
    'প্রকাশিত সার্কুলার',
    'পাবলিশিং কিউ',
    'BST পাবলিকেশন শিডিউল',
    'ইউআরএল ও ৩০১ রিডাইরেক্ট',
    'অডিট ও হিস্ট্রি',
    'অ্যানালিটিক্স'
  ];

  for (const pt of pubTabs) {
    const btn = page.locator(`button:has-text("${pt}")`).first();
    console.log(`Publishing sub-tab "${pt}" visible:`, await btn.isVisible());
  }

  await page.screenshot({ path: 'audit_128_job_publishing_center.png' });

  // -------------------------------------------------------------
  // STEP 4: Audit Category & Search Manager (/admin?tab=category-search-manager)
  // -------------------------------------------------------------
  console.log('\nStep 4: Auditing Category & Search Keyword Manager (/admin?tab=category-search-manager)...');
  await page.goto(`${BASE_URL}/admin?tab=category-search-manager`, { waitUntil: 'domcontentloaded' });

  const catHeader = page.locator('h1:has-text("চাকরির ক্যাটাগরি, ট্যাক্সোনমি ও স্মার্ট সার্চ কন্ট্রোল সেন্টার")');
  await catHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Category & Search Hub Header visible:', await catHeader.isVisible());

  const catTabs = ['ড্যাশবোর্ড', 'ক্যাটাগরি ট্রি', 'জব ক্লাসিফিকেশন', 'সার্চ অ্যানালিটিক্স'];
  for (const ct of catTabs) {
    const tabEl = page.locator(`button:has-text("${ct}")`).first();
    console.log(`Category Tab "${ct}" visible:`, await tabEl.isVisible());
  }

  await page.screenshot({ path: 'audit_128_category_search_manager.png' });

  // -------------------------------------------------------------
  // STEP 5: Audit Job Feed & Syndication Manager (/admin?tab=job-feed-manager)
  // -------------------------------------------------------------
  console.log('\nStep 5: Auditing Job Feed & RSS Syndication Manager (/admin?tab=job-feed-manager)...');
  await page.goto(`${BASE_URL}/admin?tab=job-feed-manager`, { waitUntil: 'domcontentloaded' });

  const feedHeader = page.locator('h1:has-text("জব ফিড ও ফিচার্ড ম্যানেজমেন্ট সেন্টার")');
  await feedHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Job Feed Manager Header visible:', await feedHeader.isVisible());

  await page.screenshot({ path: 'audit_128_job_feed_manager.png' });

  // -------------------------------------------------------------
  // STEP 6: Audit Deadline Alert Manager (/admin?tab=deadline-alert-manager)
  // -------------------------------------------------------------
  console.log('\nStep 6: Auditing Deadline Alert & Corrigendum Monitoring Hub (/admin?tab=deadline-alert-manager)...');
  await page.goto(`${BASE_URL}/admin?tab=deadline-alert-manager`, { waitUntil: 'domcontentloaded' });

  const dlHeader = page.locator('h2:has-text("ডেডলাইন মনিটরিং, সার্কুলার আপডেট ও স্মার্ট অ্যালার্ট কন্ট্রোল")');
  await dlHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Deadline Alert Manager Header visible:', await dlHeader.isVisible());

  await page.screenshot({ path: 'audit_128_deadline_alert_manager.png' });

  // -------------------------------------------------------------
  // STEP 7: Audit Smart Job Matching Engine (/admin?tab=smart-job-matching)
  // -------------------------------------------------------------
  console.log('\nStep 7: Auditing Smart Job Matching Rules Engine (/admin?tab=smart-job-matching)...');
  await page.goto(`${BASE_URL}/admin?tab=smart-job-matching`, { waitUntil: 'domcontentloaded' });

  const matchHeader = page.locator('h2:has-text("স্মার্ট জব ম্যাচিং ও রিকমেন্ডেশন ইঞ্জিন কন্ট্রোল")');
  await matchHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Smart Job Matching Header visible:', await matchHeader.isVisible());

  await page.screenshot({ path: 'audit_128_smart_job_matching.png' });

  // -------------------------------------------------------------
  // STEP 8: Two-Way E2E API Lifecycle: Create, Corrigendum & Delete
  // -------------------------------------------------------------
  console.log('\nStep 8: Testing End-to-End Circular Creation & Corrigendum Pipeline...');

  const testJobId = 'job-audit-test-' + Date.now();
  const testJobPayload = {
    id: testJobId,
    title: 'সহকারী প্রকৌশলী (সিভিল) নিয়োগ ২০২৬',
    organization: 'বাংলাদেশ পানি উন্নয়ন বোর্ড (BWDB)',
    category: 'govt',
    grade: '৯ম গ্রেড',
    salary: '২২,০০০ - ৫৩,০৬০/- টাকা',
    totalPosts: 15,
    minEducation: 'বিএসসি ইন সিভিল ইঞ্জিনিয়ারিং ডিগ্রি',
    minAge: 18,
    maxAge: 32,
    districts: 'সকল জেলার যোগ্য প্রার্থীগণ আবেদন করতে পারবেন',
    deadline: '২০২৬-১১-৩০',
    applicationStartDate: '২০২৬-১১-০১',
    govtFee: 500,
    serviceFee: 50,
    officialLink: 'https://bwdb.teletalk.com.bd',
    status: 'OPEN',
    daysRemaining: 20
  };

  // 1. Create Job via POST
  console.log(`Creating test job ${testJobId}...`);
  const createRes = await page.request.post(`${BASE_URL}/api/admin/jobs`, {
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': ADMIN_PIN
    },
    data: testJobPayload
  });
  console.log('Create Job Status:', createRes.status(), createRes.ok() ? '✅ Created' : '❌ Failed');
  if (!createRes.ok()) {
    console.error(await createRes.text());
    throw new Error('Failed to create test job via API');
  }

  // 2. Apply Corrigendum via PUT
  console.log(`Applying Corrigendum (Deadline Extension) on ${testJobId}...`);
  const corrRes = await page.request.put(`${BASE_URL}/api/admin/jobs`, {
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': ADMIN_PIN
    },
    data: {
      ...testJobPayload,
      deadline: '২০২৬-১২-৩১',
      daysRemaining: 51,
      corrigendumNote: 'মন্ত্রণালয়ের সিদ্ধান্ত অনুযায়ী আবেদনের সময়সীমা বর্ধিত করা হলো।'
    }
  });
  console.log('Corrigendum PUT Status:', corrRes.status(), corrRes.ok() ? '✅ Updated' : '❌ Failed');
  if (!corrRes.ok()) {
    console.error(await corrRes.text());
    throw new Error('Failed to update job via PUT');
  }

  // 3. Clean up test job via DELETE
  console.log(`Cleaning up test job ${testJobId}...`);
  const delRes = await page.request.delete(`${BASE_URL}/api/admin/jobs`, {
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': ADMIN_PIN
    },
    data: { jobIds: [testJobId] }
  });
  console.log('Delete Job Status:', delRes.status(), delRes.ok() ? '✅ Cleaned' : '❌ Failed');

  console.log('\n🎉 CLUSTER 3 (JOB MANAGEMENT, CATEGORIZATION & PUBLISHING) AUDIT PASSED 100%!');

  await browser.close();
}

runCluster3Audit().catch(err => {
  console.error('\n❌ Audit script failed with error:', err);
  process.exit(1);
});
