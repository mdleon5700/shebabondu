import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const ADMIN_PIN = 'CHAKRISEBA_SECURE_ADMIN_2026';

async function runAudit() {
  console.log('🚀 Starting Cluster 2: Application Lifecycle & Teletalk Queue Deep Audit...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Step 1: Authenticate Admin
  console.log('\nStep 1: Authenticating Admin and loading Master Applications Table...');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  try {
    const pinInput = page.locator('input[type="password"]').first();
    if (await pinInput.isVisible()) {
      await pinInput.fill(ADMIN_PIN);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2500);
    }
  } catch (e) {}

  // Ensure localStorage has admin auth tokens
  await page.evaluate((pin) => {
    localStorage.setItem('cs_admin_pin', pin);
    localStorage.setItem('cs_admin_auth', 'verified');
  }, ADMIN_PIN);

  // Step 2: Audit Master Applications List (/admin?tab=all-applications)
  console.log('\nStep 2: Auditing Master Applications List (/admin?tab=all-applications)...');
  await page.goto(`${BASE_URL}/admin?tab=all-applications`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // If still on login screen, login now
  try {
    const pinInput = page.locator('input[type="password"]').first();
    if (await pinInput.isVisible()) {
      await pinInput.fill(ADMIN_PIN);
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2500);
    }
  } catch (e) {}

  // 1. Verify Header Title
  const tableTitle = page.locator('h2:has-text("সকল আবেদন তালিকা")').first();
  console.log('Master Applications Table title visible:', await tableTitle.isVisible());
  if (!(await tableTitle.isVisible())) {
    throw new Error('Master Applications Table title is missing!');
  }

  // 2. Verify Search and Excel Export
  const searchInput = page.locator('input[placeholder*="নাম, ফোন, পদ বা TrxID দিয়ে খুঁজুন"]');
  console.log('Search Input visible:', await searchInput.isVisible());
  const exportBtn = page.locator('button:has-text("এক্সেল এক্সপোর্ট")');
  console.log('Excel Export button visible:', await exportBtn.isVisible());

  // 3. Verify Status Filter Pills
  const statusPills = [
    'সবগুলো',
    'অপেক্ষমাণ পেমেন্ট',
    'প্রসেসিং কিউ',
    'সম্পন্ন',
    'বাতিল'
  ];
  for (const sp of statusPills) {
    const pill = page.locator(`button:has-text("${sp}")`).first();
    console.log(`Status filter pill "${sp}" visible: ${await pill.isVisible()}`);
    if (!(await pill.isVisible())) {
      throw new Error(`Status filter pill "${sp}" is missing!`);
    }
  }

  // 4. Verify Vault Drawer opens on row click
  const vaultDrawerBtn = page.locator('button:has-text("ভল্ট ড্রয়ার")').first();
  if (await vaultDrawerBtn.isVisible()) {
    console.log('Clicking "ভল্ট ড্রয়ার" button to open slide-over candidate vault drawer...');
    await vaultDrawerBtn.click();
    await page.waitForTimeout(1500);

    const drawerHeader = page.locator('h3:has-text("মোঃ")').or(page.locator('role=dialog')).first();
    console.log('Candidate Vault Drawer opened:', await drawerHeader.isVisible());
    
    // Close drawer
    const closeBtn = page.locator('button[title="ড্রয়ার বন্ধ করুন"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  await page.screenshot({ path: 'audit_127_all_applications_master.png' });

  // Step 3: Auditing Payment Verification Queue (/admin?tab=payment-verification)
  console.log('\nStep 3: Auditing Payment Verification Queue (/admin?tab=payment-verification)...');
  await page.goto(`${BASE_URL}/admin?tab=payment-verification`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const paymentTitle = page.locator('h2:has-text("পেমেন্ট ভেরিফিকেশন কিউ")');
  console.log('Payment Verification Queue title visible:', await paymentTitle.isVisible());
  if (!(await paymentTitle.isVisible())) {
    throw new Error('Payment Verification Queue title missing!');
  }

  // Verify Gateway Filter Pills
  const gatewayPills = ['সব পেন্ডিং', 'বিকাশ', 'নগদ', 'ওয়ালেট'];
  for (const gp of gatewayPills) {
    const pill = page.locator(`button:has-text("${gp}")`).first();
    console.log(`Gateway filter pill "${gp}" visible: ${await pill.isVisible()}`);
    if (!(await pill.isVisible())) {
      throw new Error(`Gateway filter pill "${gp}" is missing!`);
    }
  }

  // Verify Pending Revenue Summary
  const revenueSummary = page.locator('text=অপেক্ষমাণ মোট রাজস্ব');
  console.log('Pending Revenue Summary visible:', await revenueSummary.isVisible());

  await page.screenshot({ path: 'audit_127_payment_verification_queue.png' });

  // Step 4: Auditing Teletalk Processing & Admit Card Queue (/admin?tab=processing-queue)
  console.log('\nStep 4: Auditing Teletalk Processing & Admit Card Queue (/admin?tab=processing-queue)...');
  await page.goto(`${BASE_URL}/admin?tab=processing-queue`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const processingTitle = page.locator('h2:has-text("টেলিটক প্রসেসিং কিউ")');
  console.log('Teletalk Processing Queue title visible:', await processingTitle.isVisible());
  if (!(await processingTitle.isVisible())) {
    throw new Error('Teletalk Processing Queue title missing!');
  }

  // Verify Channel Selector Pills
  const channelPills = ['সব প্রসেসিং', 'টেলিটক', 'বাংলাদেশ ব্যাংক', 'কর্পোরেট', 'HR ইমেইল', 'পোর্টাল'];
  for (const cp of channelPills) {
    const pill = page.locator(`button:has-text("${cp}")`).first();
    console.log(`Channel filter pill "${cp}" visible: ${await pill.isVisible()}`);
    if (!(await pill.isVisible())) {
      throw new Error(`Channel filter pill "${cp}" is missing!`);
    }
  }

  // Verify Sorter & Urgent Deadline Indicator
  const deadlineUrgentPill = page.locator('text=আজ শেষ');
  console.log('Deadline Urgency Indicator visible:', await deadlineUrgentPill.isVisible());

  // Test 1-Click Quick Copier Modal
  const quickCopyBtn = page.locator('button:has-text("কুইক কপি")').first();
  if (await quickCopyBtn.isVisible()) {
    console.log('Testing 1-Click Quick Copier modal...');
    await quickCopyBtn.click();
    await page.waitForTimeout(1500);

    const copyModalTitle = page.locator('text=১-ক্লিক ফরম ফিলাপ অ্যাসিস্ট্যান্ট');
    console.log('Quick Copier Modal loaded:', await copyModalTitle.isVisible());

    const copyAllBtn = page.locator('button:has-text("সম্পূর্ণ তথ্য মাস্টার কপি")');
    console.log('"সম্পূর্ণ তথ্য মাস্টার কপি" button visible:', await copyAllBtn.isVisible());
    await page.screenshot({ path: 'audit_127_teletalk_quick_copier_modal.png' });

    // Close quick copy modal
    const closeCopierBtn = page.locator('button:has-text("বন্ধ করুন")').first();
    if (await closeCopierBtn.isVisible()) {
      await closeCopierBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  await page.screenshot({ path: 'audit_127_teletalk_processing_queue.png' });

  // Step 5: Auditing Applicant Documents Vault & Verification Queue (/admin?tab=documents)
  console.log('\nStep 5: Auditing Applicant Documents Vault (/admin?tab=documents)...');
  await page.goto(`${BASE_URL}/admin?tab=documents`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Verify Sub-View Switcher
  const subView1Btn = page.locator('button:has-text("অফিশিয়াল অ্যাপ্লিক্যান্ট কপি ও স্লিপ রিপোজিটরি")');
  const subView2Btn = page.locator('button:has-text("সনদপত্র, ছবি ও স্বাক্ষর ভেরিফিকেশন কিউ")');
  console.log('Sub-View 1 Button visible:', await subView1Btn.isVisible());
  console.log('Sub-View 2 Button visible:', await subView2Btn.isVisible());

  if (!(await subView1Btn.isVisible()) || !(await subView2Btn.isVisible())) {
    throw new Error('Documents Hub Sub-View switcher buttons missing!');
  }

  // Verify Sub-View 1 Content (Applicant Copies & Dropzone)
  const dropzoneTitle = page.locator('text=কুইক ড্রপজোন: অফিশিয়াল অ্যাপ্লিক্যান্ট কপি আপলোড ও অটো-লিঙ্ক');
  console.log('Dropzone Banner visible in Sub-View 1:', await dropzoneTitle.isVisible());
  await page.screenshot({ path: 'audit_127_documents_vault_applicant_copies.png' });

  // Switch to Sub-View 2 (Certificate & Biometrics Verification Queue)
  console.log('\nSwitching to Sub-View 2 (Certificate & Biometrics Verification Queue)...');
  await subView2Btn.click();
  await page.waitForTimeout(2500);

  const certQueueTitle = page.locator('h1:has-text("সনদপত্র ভেরিফিকেশন ও কোয়ালিফিকেশন রিভিউ কিউ")');
  console.log('Certificate Verification Queue loaded:', await certQueueTitle.isVisible());
  if (!(await certQueueTitle.isVisible())) {
    throw new Error('Certificate Verification Queue failed to render in Sub-View 2!');
  }

  // Verify Filter Tabs
  const certFilters = ['সকল সনদপত্র', 'অপেক্ষমান', 'ভেরিফাইড', 'বাতিলকৃত', 'সংশোধন প্রয়োজন'];
  for (const cf of certFilters) {
    const fBtn = page.locator(`button:has-text("${cf}")`).first();
    console.log(`Certificate filter "${cf}" visible: ${await fBtn.isVisible()}`);
    if (!(await fBtn.isVisible())) {
      throw new Error(`Certificate filter "${cf}" missing!`);
    }
  }

  await page.screenshot({ path: 'audit_127_certificate_and_biometrics_verification_queue.png' });

  // Step 6: Multi-Directional Two-Way Pipeline Verification
  console.log('\nStep 6: Testing End-to-End Application Lifecycle Pipeline (Apply ➜ Verify Payment ➜ Complete)...');
  
  // 1. Log in candidate to get token
  console.log('Authenticating candidate for test application...');
  const candLoginRes = await page.request.post(`${BASE_URL}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: { phone: '01712345678', password: '123456' }
  });
  const candLoginJson = await candLoginRes.json();
  const candToken = candLoginJson.token;
  console.log('Candidate login status:', candLoginRes.status(), candToken ? '✅ Token acquired' : '❌ Failed');

  const testTrxId = 'TRX-AUDIT-' + Math.floor(100000 + Math.random() * 900000);
  console.log(`Creating test application with TrxID: ${testTrxId}, Post: ক্যাশিয়ার...`);

  const createRes = await page.request.post(`${BASE_URL}/api/applications`, {
    headers: {
      'Authorization': `Bearer ${candToken}`,
      'Content-Type': 'application/json'
    },
    data: {
      candidateName: 'মোঃ তানভীর হাসান',
      candidatePhone: '01712-345678',
      candidateDistrict: 'ঢাকা',
      jobId: 'job-alljobs-15184',
      jobTitle: 'ক্যাশিয়ার পদে নিয়োগ বিজ্ঞপ্তি ২০২৬',
      organization: 'বাংলাদেশ মৎস্য গবেষণা ইনস্টিটিউট',
      postName: 'ক্যাশিয়ার',
      paymentMethod: 'bKash',
      trxId: testTrxId,
      totalAmount: 280,
      governmentFee: 200,
      serviceCharge: 80
    }
  });

  const createJson = await createRes.json();
  const testAppId = createJson.createdApp?.id || createJson.existingAppId || createJson.application?.id || createJson.id;
  console.log('Create Application Status:', createRes.status(), testAppId ? `✅ App ID: ${testAppId}` : '❌ Failed');

  if (!testAppId) {
    throw new Error('Failed to create or retrieve test application for pipeline audit!');
  }

  // 2. Admin approves payment via PATCH /api/applications/:id
  console.log(`Approving payment for Application ${testAppId}...`);
  const approvePayRes = await page.request.patch(`${BASE_URL}/api/applications/${testAppId}`, {
    headers: {
      'x-admin-secret': ADMIN_PIN,
      'Content-Type': 'application/json'
    },
    data: {
      status: 'processing',
      notes: 'অডিট টেস্ট: পেমেন্ট সফলভাবে অনুমোদিত।'
    }
  });
  console.log('Payment Approval Status:', approvePayRes.status(), approvePayRes.ok() ? '✅ Approved' : '❌ Failed');

  // 3. Admin submits Teletalk Credentials and PDF via PATCH /api/applications/:id
  console.log(`Completing Teletalk submission for Application ${testAppId}...`);
  const completeSubRes = await page.request.patch(`${BASE_URL}/api/applications/${testAppId}`, {
    headers: {
      'x-admin-secret': ADMIN_PIN,
      'Content-Type': 'application/json'
    },
    data: {
      status: 'completed',
      verificationType: 'officially_verified',
      teleTalkTrackingId: 'BPSC-AUDIT-9921',
      teleTalkPassword: 'PASS-84920',
      applicantCopyPdfUrl: 'https://alljobs.teletalk.com.bd/applicant-copy/BPSC-AUDIT-9921.pdf',
      notes: 'অডিট টেস্ট: টেলিটক আবেদন সম্পন্ন ও অফিসিয়াল কপি রিলিজ হয়েছে।'
    }
  });
  console.log('Teletalk Completion Status:', completeSubRes.status(), completeSubRes.ok() ? '✅ Completed' : '❌ Failed');

  // 4. Verify Completed Application Details
  const verifyRes = await page.request.get(`${BASE_URL}/api/applications/${testAppId}`, {
    headers: { 'x-admin-secret': ADMIN_PIN }
  });
  const verifyJson = await verifyRes.json();
  console.log(`Verified Status in DB: ${verifyJson.application?.status} (Tracking ID: ${verifyJson.application?.teleTalkTrackingId})`);

  if (verifyJson.application?.status !== 'completed' || verifyJson.application?.teleTalkTrackingId !== 'BPSC-AUDIT-9921') {
    throw new Error('Application Lifecycle Pipeline failed to persist completed status and Teletalk credentials!');
  }

  console.log('\n🎉 CLUSTER 2 (APPLICATION LIFECYCLE & TELETALK QUEUE) AUDIT PASSED 100%!');

  await browser.close();
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
