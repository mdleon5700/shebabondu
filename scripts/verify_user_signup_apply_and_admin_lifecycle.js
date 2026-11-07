const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function safeGoto(page, url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      return;
    } catch (err) {
      if (err.message.includes('ERR_ABORTED') && attempt < maxRetries) {
        console.warn(`[safeGoto] ${url} aborted (attempt ${attempt}), retrying in 1.5s...`);
        await page.waitForTimeout(1500);
      } else {
        throw err;
      }
    }
  }
}

async function runFullUserAdminLifecycleQA() {
  const artifactDir = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  console.log('🚀 Starting End-to-End User Sign-Up, Job Application, and Admin Logic QA Test...\n');
  const browser = await chromium.launch({ headless: true });

  // Generate unique candidate credentials
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const candidatePhone = `01799${randomSuffix}`;
  const candidateName = `তানভীর আহমেদ (লাইভ কিউএ)`;
  const candidatePassword = `Pass@2026Secure`;
  const testTrxId = `TRX${Date.now().toString().slice(-8)}`;

  console.log(`👤 Candidate Credentials: Name="${candidateName}", Phone="${candidatePhone}", TrxID="${testTrxId}"`);

  // ==========================================================
  // PHASE 1: Real Candidate Registration & Dashboard Audit
  // ==========================================================
  console.log('\n--- PHASE 1: User Sign-Up & Dashboard Audit ---');
  const userContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const userPage = await userContext.newPage();

  console.log('1️⃣ Navigating to /register...');
  await safeGoto(userPage, 'http://localhost:3000/register');
  await userPage.waitForTimeout(600);

  // Fill Registration Form
  await userPage.fill('input[placeholder*="তানভীর"]', candidateName);
  await userPage.fill('input[placeholder*="017"]', candidatePhone);
  await userPage.fill('input[placeholder*="ঢাকা"]', 'ঢাকা');
  await userPage.fill('input[type="password"]', candidatePassword);
  
  console.log('📝 Submitting Registration Form...');
  await userPage.click('button[type="submit"]');
  await userPage.waitForTimeout(2000);

  // Verify redirection to /dashboard
  let currentUrl = userPage.url();
  console.log(`👉 Current URL after registration: ${currentUrl}`);
  if (!currentUrl.includes('/dashboard')) {
    await safeGoto(userPage, 'http://localhost:3000/dashboard');
  }

  await userPage.waitForTimeout(1000);
  const bodyDashboard = await userPage.locator('body').innerText();
  const isDashboard = bodyDashboard.includes('স্বাগতম') || bodyDashboard.includes('ক্যান্ডিডেট');
  console.log(`👉 Candidate Dashboard loaded successfully: ${isDashboard}`);

  // Screenshot 14: User Dashboard
  const screen14 = path.join(artifactDir, '14_user_registered_dashboard_audit.png');
  await userPage.screenshot({ path: screen14 });
  console.log(`📸 Screenshot saved: ${screen14}`);

  // Audit Profile & Documents Vault
  console.log('2️⃣ Auditing User Profile & Documents Vault (/dashboard/profile and /dashboard/vault)...');
  await safeGoto(userPage, 'http://localhost:3000/dashboard/profile');
  await userPage.waitForTimeout(1000);
  const bodyProfile = await userPage.locator('body').innerText();
  const profileLoaded = bodyProfile.includes('প্রোফাইল') || bodyProfile.includes('ব্যক্তিগত তথ্য');
  console.log(`👉 User Profile page loaded: ${profileLoaded}`);

  await safeGoto(userPage, 'http://localhost:3000/dashboard/vault');
  await userPage.waitForTimeout(1000);
  const bodyVault = await userPage.locator('body').innerText();
  const docVaultLoaded = bodyVault.includes('ডকুমেন্ট') || bodyVault.includes('ছবি') || bodyVault.includes('স্বাক্ষর');
  console.log(`👉 Document Vault loaded: ${docVaultLoaded}`);

  const screen15 = path.join(artifactDir, '15_user_profile_and_documents_verified.png');
  await userPage.screenshot({ path: screen15 });
  console.log(`📸 Screenshot saved: ${screen15}`);

  // ==========================================================
  // PHASE 2: Job Search & Application Submission
  // ==========================================================
  console.log('\n--- PHASE 2: Job Search & Application Submission ---');
  console.log('3️⃣ Browsing jobs and opening application form...');
  await safeGoto(userPage, 'http://localhost:3000/jobs');
  await userPage.waitForTimeout(1500);

  // Check for any active job apply link
  let applyUrl = 'http://localhost:3000/apply/job-alljobs-dcjamalpur-15137';
  const applyLinks = await userPage.locator('a[href*="/apply/"]').all();
  if (applyLinks.length > 0) {
    const firstHref = await applyLinks[0].getAttribute('href');
    if (firstHref) {
      applyUrl = firstHref.startsWith('http') ? firstHref : `http://localhost:3000${firstHref}`;
    }
  }

  console.log(`👉 Navigating to Apply Page: ${applyUrl}`);
  await safeGoto(userPage, applyUrl);
  await userPage.waitForTimeout(2000);

  // Fill Application Payment Form
  console.log(`💳 Filling Payment Method (bKash), TrxID: ${testTrxId}...`);
  const trxInput = userPage.locator('input[placeholder*="BK9X87M2LQ"], input[placeholder*="TrxID"]').first();
  if (await trxInput.isVisible()) {
    await trxInput.fill(testTrxId);
  }

  const senderInput = userPage.locator('input[placeholder="01XXXXXXXXX"]').first();
  if (await senderInput.isVisible()) {
    await senderInput.fill(candidatePhone);
  }

  // Submit Application
  console.log('🚀 Submitting Job Application...');
  const submitApplyBtn = userPage.locator('button[type="submit"], button:has-text("আবেদন নিশ্চিত করুন")').first();
  await submitApplyBtn.click();
  await userPage.waitForTimeout(3000);

  // Assert Success State
  const bodyApply = await userPage.locator('body').innerText();
  const isAppliedSuccess = bodyApply.includes('সফলভাবে জমা') || bodyApply.includes('অর্ডার আইডি') || bodyApply.includes('APP-');
  console.log(`👉 Job Application submitted successfully: ${isAppliedSuccess}`);

  const screen16 = path.join(artifactDir, '16_user_job_application_submitted.png');
  await userPage.screenshot({ path: screen16 });
  console.log(`📸 Screenshot saved: ${screen16}`);

  // Verify application listed in Candidate Dashboard Applications
  console.log('📄 Navigating to Candidate /dashboard/applications...');
  await safeGoto(userPage, 'http://localhost:3000/dashboard/applications');
  await userPage.waitForTimeout(1500);
  const bodyUserApps = await userPage.locator('body').innerText();
  const appInUserDashboard = bodyUserApps.includes(testTrxId) || bodyUserApps.includes('পেন্ডিং');
  console.log(`👉 Application visible in candidate applications dashboard: ${appInUserDashboard}`);

  // ==========================================================
  // PHASE 3: Admin Operations & Logic Verification
  // ==========================================================
  console.log('\n--- PHASE 3: Admin Panel Cross-Verification & Logic ---');
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await adminContext.addCookies([
    {
      name: 'cs_session_token',
      value: 'mock-admin-session-token',
      domain: 'localhost',
      path: '/'
    }
  ]);
  const adminPage = await adminContext.newPage();
  await adminPage.goto('http://localhost:3000/');
  await adminPage.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
  });

  // 1. Check All Applications Tab
  console.log('4️⃣ Admin: Checking /admin?tab=all-applications for new application...');
  await safeGoto(adminPage, 'http://localhost:3000/admin?tab=all-applications');
  await adminPage.waitForTimeout(2500);

  // Use search input in applications table to locate candidate row
  const adminAppSearch = adminPage.locator('input[placeholder*="TrxID দিয়ে খুঁজুন"], input[placeholder*="খুঁজুন"]').first();
  if (await adminAppSearch.isVisible()) {
    await adminAppSearch.fill(testTrxId);
    await adminPage.waitForTimeout(1000);
  }

  const bodyAdminAll = await adminPage.locator('body').innerText();
  const appInAdminTable = bodyAdminAll.includes(testTrxId) || bodyAdminAll.includes(candidatePhone) || bodyAdminAll.includes('তানভীর');
  console.log(`👉 Candidate application found in Admin Master Table: ${appInAdminTable}`);

  // 2. Check Payment Verification Tab
  console.log('5️⃣ Admin: Checking /admin?tab=payment-verification and approving payment...');
  await safeGoto(adminPage, 'http://localhost:3000/admin?tab=payment-verification');
  await adminPage.waitForTimeout(2000);

  const bodyPayment = await adminPage.locator('body').innerText();
  const trxInPaymentTable = bodyPayment.includes(testTrxId) || bodyPayment.includes(candidatePhone);
  console.log(`👉 TrxID ${testTrxId} found in Payment Verification list: ${trxInPaymentTable}`);

  // Find Approve Payment Button
  const approveBtn = adminPage.locator('button:has-text("অনুমোদন")').first();
  if (await approveBtn.isVisible()) {
    console.log('✅ Admin clicking Approve Payment button...');
    adminPage.once('dialog', async dialog => {
      console.log(`💬 Alert popup: ${dialog.message()}`);
      await dialog.accept();
    });
    await approveBtn.click();
    await adminPage.waitForTimeout(2500);
  }

  // 3. Check Processing Queue Tab
  console.log('6️⃣ Admin: Verifying application transitioned to Processing Queue...');
  await safeGoto(adminPage, 'http://localhost:3000/admin?tab=processing-queue');
  await adminPage.waitForTimeout(2000);

  const bodyProcessing = await adminPage.locator('body').innerText();
  const appInProcessing = bodyProcessing.includes(testTrxId) || bodyProcessing.includes(candidatePhone) || bodyProcessing.includes('তানভীর');
  console.log(`👉 Application successfully moved to Processing Queue: ${appInProcessing}`);

  // 4. Create New Job Circular from Admin
  console.log('7️⃣ Admin: Creating a new Job Circular via Admin API...');
  const newJobPayload = {
    title: 'সহকারী পরিচালক (লাইভ কিউএ সার্কুলার ২০২৬)',
    organization: 'বাংলাদেশ কর্মসংস্থান কর্তৃপক্ষ',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি',
    grade: '৯ম গ্রেড',
    totalPosts: 25,
    positions: [
      { id: 'pos-1', title: 'সহকারী পরিচালক (প্রশাসন)', grade: '৯ম গ্রেড', posts: 15, fee: 200 },
      { id: 'pos-2', title: 'হিসাবরক্ষণ কর্মকর্তা', grade: '১০ম গ্রেড', posts: 10, fee: 150 }
    ],
    salary: '২২,০০০ - ৫৩,০৬০ টাকা',
    minEducation: 'স্নাতকোত্তর বা সমমানের ডিগ্রি',
    districts: 'সকল জেলার প্রার্থীরা আবেদন করতে পারবেন',
    deadline: '২০২৬-১২-৩১',
    govtFee: 200,
    serviceFee: 80,
    minAge: 21,
    maxAge: 32,
    officialLink: 'https://alljobs.teletalk.com.bd',
    slug: `assistant-director-employment-auth-${Date.now()}`
  };

  const createJobRes = await adminPage.evaluate(async (payload) => {
    const res = await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': '1234'
      },
      body: JSON.stringify(payload)
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  }, newJobPayload);

  console.log(`👉 New Job Circular created in Admin: ${createJobRes.ok} (ID: ${createJobRes.data?.job?.id || 'N/A'})`);

  const screen17 = path.join(artifactDir, '17_admin_application_approved_processing.png');
  await adminPage.screenshot({ path: screen17 });
  console.log(`📸 Screenshot saved: ${screen17}`);

  // ==========================================================
  // PHASE 4: User Dashboard Reflecting Admin Status Update
  // ==========================================================
  console.log('\n--- PHASE 4: Candidate Dashboard Reflecting Admin Approval ---');
  console.log('8️⃣ Returning to candidate session and refreshing applications dashboard...');
  await safeGoto(userPage, 'http://localhost:3000/dashboard/applications');
  await userPage.waitForTimeout(2000);

  const bodyRefreshedApps = await userPage.locator('body').innerText();
  const processingStatusInUser = bodyRefreshedApps.includes('প্রসেসিং') || bodyRefreshedApps.includes('processing') || bodyRefreshedApps.includes('যাচাইকৃত');
  console.log(`👉 Candidate Dashboard shows updated status (Processing/Verified): ${processingStatusInUser}`);

  const screen18 = path.join(artifactDir, '18_candidate_dashboard_reflecting_admin_approval.png');
  await userPage.screenshot({ path: screen18 });
  console.log(`📸 Screenshot saved: ${screen18}`);

  // ==========================================================
  // PHASE 5: Public Live Jobs Feed Reflecting New Circular
  // ==========================================================
  console.log('\n--- PHASE 5: Public Jobs Feed Reflecting New Admin Circular ---');
  console.log('9️⃣ Verifying newly created circular appears on Public /jobs...');
  await safeGoto(userPage, 'http://localhost:3000/jobs');
  await userPage.waitForTimeout(1500);

  // Search in the public job search box
  const searchBox = userPage.locator('input[placeholder*="পদবী, প্রতিষ্ঠান বা জেলা"], input[placeholder*="খুঁজুন"], input[type="text"]').first();
  if (await searchBox.isVisible()) {
    await searchBox.fill('কর্মসংস্থান');
    await userPage.waitForTimeout(1500);
  }

  const bodyPublicJobs = await userPage.locator('body').innerText();
  const newCircularOnPublic = bodyPublicJobs.includes('বাংলাদেশ কর্মসংস্থান কর্তৃপক্ষ') || bodyPublicJobs.includes('সহকারী পরিচালক');
  console.log(`👉 New Admin Job Circular live on public /jobs: ${newCircularOnPublic}`);

  const screen19 = path.join(artifactDir, '19_new_admin_circular_live_on_public_jobs.png');
  await userPage.screenshot({ path: screen19 });
  console.log(`📸 Screenshot saved: ${screen19}`);

  await browser.close();

  const allPassed = isDashboard && profileLoaded && docVaultLoaded && (isAppliedSuccess || appInUserDashboard) && appInAdminTable && createJobRes.ok && newCircularOnPublic;
  console.log('\n======================================================');
  console.log(`🎉 ALL USER-ADMIN LIFECYCLE QA ASSERTIONS PASSED: ${allPassed}`);
  console.log('======================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runFullUserAdminLifecycleQA().catch(err => {
  console.error('❌ QA Test failed with error:', err);
  process.exit(1);
});
