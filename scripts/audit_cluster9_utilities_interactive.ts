import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
const BASE_URL = 'http://localhost:3000';

async function runAudit() {
  console.log('🚀 Starting Cluster 9 Utilities & Candidate Digital Tools Playwright E2E Audit...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: /job-alerts (Free SMS & WhatsApp Job Alerts)
    // -------------------------------------------------------------
    console.log('Testing 1: /job-alerts ...');
    await page.goto(`${BASE_URL}/job-alerts`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=ফ্রি জব অ্যালার্ট সাবস্ক্রিপশন', { timeout: 10000 });

    // Select category and frequency
    const categoryBtn = page.locator('button:has-text("বাংলাদেশ রেলওয়ে নিয়োগ")').first();
    if (await categoryBtn.isVisible()) {
      await categoryBtn.click();
    }

    // Fill phone number
    await page.fill('input[type="tel"]', '01899-776655');

    // Screenshot initial form with live phone preview
    const screenshot1Path = path.join(ARTIFACT_DIR, 'audit_91_job_alerts_subscription.png');
    await page.screenshot({ path: screenshot1Path, fullPage: true });
    console.log(`Saved screenshot 1: ${screenshot1Path}`);

    // Submit alert form
    await page.click('button:has-text("১০০% ফ্রি জব অ্যালার্ট চালু করুন")');
    await page.waitForSelector('text=অভিনন্দন! আপনার ফ্রি জব অ্যালার্ট চালু হয়েছে', { timeout: 10000 });
    console.log('Job alerts subscription verified!');

    // -------------------------------------------------------------
    // TEST 2: /report-a-job (Job Complaint & Fake Circular Report)
    // -------------------------------------------------------------
    console.log('Testing 2: /report-a-job with prefilled parameters ...');
    await page.goto(`${BASE_URL}/report-a-job?jobId=job-petrobangla-am-2026&title=${encodeURIComponent('সহকারী ব্যবস্থাপক (প্রশাসন) - পেট্রোবাংলা')}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=চাকরির বিজ্ঞপ্তি সম্পর্কে রিপোর্ট করুন', { timeout: 10000 });

    // Wait for prefill hydration
    await page.waitForFunction(() => {
      const el = document.querySelector('input[placeholder*="৪৭তম বিসিএস"]') as HTMLInputElement;
      return el && el.value.length > 0;
    }, { timeout: 5000 }).catch(() => {});

    // Fill details
    await page.fill('textarea', 'বিজ্ঞপ্তির প্যারাগ্রাফ ৭ এ উল্লেখিত বয়সের ডেডলাইনের সাথে আসল নীতিমালার গরমিল পরিলক্ষিত হয়েছে। অনুগ্রহ করে যাচাই করুন।');
    await page.fill('input[placeholder="আপনার নাম"]', 'কামাল উদ্দিন');
    await page.fill('input[placeholder="মোবাইল নম্বর"]', '01811-334455');

    // Submit report via form button[type="submit"]
    await page.locator('form button[type="submit"]').click();
    await page.waitForSelector('text=আপনার রিপোর্টটি সফলভাবে গ্রহণ করা হয়েছে!', { timeout: 10000 });
    console.log('Job report successfully submitted!');

    // Switch to Track tab and search for REP-2026-1001
    await page.click('button:has-text("অভিযোগের স্ট্যাটাস ট্র্যাক করুন")');
    await page.fill('input[placeholder*="REP-2026"]', 'REP-2026-1001');
    await page.locator('form button:has-text("অনুসন্ধান")').click();
    await page.waitForSelector('text=৪৭তম বিসিএস ক্যাডার নিয়োগ বিজ্ঞপ্তি ২০২৬', { timeout: 10000 });
    console.log('Job report tracking lookup verified!');

    const screenshot2Path = path.join(ARTIFACT_DIR, 'audit_92_report_job_complaint_and_tracking.png');
    await page.screenshot({ path: screenshot2Path, fullPage: true });
    console.log(`Saved screenshot 2: ${screenshot2Path}`);

    // -------------------------------------------------------------
    // TEST 3: /vault (Document Vault & Resizer)
    // -------------------------------------------------------------
    console.log('Testing 3: /vault ...');
    await page.goto(`${BASE_URL}/vault`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=স্মার্ট ডকুমেন্ট ভল্ট ও টেলিটক ইমেজ রিসাইজার', { timeout: 10000 });

    // Switch resizer preset to signature
    await page.click('button:has-text("স্বাক্ষর (300 × 80)")');
    await page.waitForSelector('text=300 × 80', { timeout: 5000 });

    const screenshot3Path = path.join(ARTIFACT_DIR, 'audit_93_vault_resizer_and_certificates.png');
    await page.screenshot({ path: screenshot3Path, fullPage: true });
    console.log(`Saved screenshot 3: ${screenshot3Path}`);

    // -------------------------------------------------------------
    // TEST 4: /login (Candidate & Admin Authentication)
    // -------------------------------------------------------------
    console.log('Testing 4: /login ...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=চাকরি সেবায় নতুন প্রার্থী?', { timeout: 10000 });

    const screenshot4Path = path.join(ARTIFACT_DIR, 'audit_96_auth_login_and_register.png');
    await page.screenshot({ path: screenshot4Path, fullPage: true });
    console.log(`Saved screenshot 4: ${screenshot4Path}`);

    // Perform 1-click Quick Demo Login
    await page.click('button:has-text("১-ক্লিক ডেমো অ্যাকাউন্ট দিয়ে সরাসরি টেস্ট করুন")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('Candidate successfully logged into dashboard!');

    // -------------------------------------------------------------
    // TEST 5: /wallet (Authenticated Candidate Wallet & Recharge)
    // -------------------------------------------------------------
    console.log('Testing 5: /wallet (authenticated) ...');
    await page.goto(`${BASE_URL}/wallet`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=বর্তমান ব্যালেন্স', { timeout: 10000 });

    // Fill recharge form
    const uniqueTrxId = 'BK' + Date.now().toString().slice(-6) + Math.floor(10 + Math.random() * 90);
    await page.click('button:has-text("৳500")');
    await page.fill('input[placeholder*="BKL9839492"]', uniqueTrxId);
    await page.locator('form button[type="submit"]').click();
    await page.waitForSelector('text=রিচার্জ আবেদন সফলভাবে গ্রহণ করা হয়েছে!', { timeout: 10000 });
    console.log('Candidate wallet recharge verified!');

    const screenshot5Path = path.join(ARTIFACT_DIR, 'audit_94_candidate_wallet_and_recharge.png');
    await page.screenshot({ path: screenshot5Path, fullPage: true });
    console.log(`Saved screenshot 5: ${screenshot5Path}`);

    // -------------------------------------------------------------
    // TEST 6: /dashboard/profile (Personal Profile & Qualifications)
    // -------------------------------------------------------------
    console.log('Testing 6: /dashboard/profile ...');
    await page.goto(`${BASE_URL}/dashboard/profile`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=ব্যক্তিগত প্রোফাইল', { timeout: 10000 });

    const screenshot6Path = path.join(ARTIFACT_DIR, 'audit_95_candidate_profile_management.png');
    await page.screenshot({ path: screenshot6Path, fullPage: true });
    console.log(`Saved screenshot 6: ${screenshot6Path}`);

    // -------------------------------------------------------------
    // TEST 7: Admin Panel Job Reports (/admin?tab=job-reports)
    // -------------------------------------------------------------
    console.log('Testing 7: Admin Panel Job Reports Moderation ...');
    await page.goto(`${BASE_URL}/admin?tab=job-reports`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Check if PIN gate is shown
    const pinInput = page.locator('input[placeholder*="সিক্রেট পিন"]').first();
    if (await pinInput.isVisible()) {
      await pinInput.fill('1234');
      await page.click('button:has-text("কনসোলে প্রবেশ করুন")');
    }

    await page.waitForSelector('text=ভুয়া সার্কুলার ও অভিযোগ পর্যবেক্ষণ', { timeout: 15000 });
    console.log('Admin job reports tab visible!');

    // Click Review on the first report
    const reviewBtn = page.locator('button:has-text("রিভিউ")').first();
    await reviewBtn.click();
    await page.waitForSelector('textarea[placeholder*="প্রেস বিজ্ঞপ্তি"]', { timeout: 5000 });
    await page.fill('textarea[placeholder*="প্রেস বিজ্ঞপ্তি"]', 'অ্যাডমিন অডিট সম্পন্ন: তথ্য যাচাই করে সার্কুলার হালনাগাদ করা হয়েছে।');
    await page.click('button:has-text("✓ সমাধানকৃত চিহ্নিত করুন")');
    await page.waitForSelector('text=স্ট্যাটাস \'resolved\' এ সফলভাবে আপডেট হয়েছে', { timeout: 10000 });
    console.log('Admin resolution recorded!');

    const screenshot7Path = path.join(ARTIFACT_DIR, 'audit_97_admin_job_reports_moderation.png');
    await page.screenshot({ path: screenshot7Path, fullPage: true });
    console.log(`Saved screenshot 7: ${screenshot7Path}`);

    console.log('🎉 All 7 Cluster 9 E2E Playwright Tests Passed Successfully!');
  } catch (error) {
    console.error('❌ Error during Cluster 9 Playwright audit:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAudit();
