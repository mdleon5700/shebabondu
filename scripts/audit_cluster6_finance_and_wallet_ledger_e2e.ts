import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PIN = 'CHAKRISEBA_SECURE_ADMIN_2026';

async function runCluster6Audit() {
  console.log('🚀 Starting Cluster 6: Finance, Digital Wallet Ledger & Coupons Deep Audit...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Inject Admin Authentication Cookies
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
  await page.goto(`${BASE_URL}/admin?tab=transactions`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((pin) => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', pin);
  }, ADMIN_PIN);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // -------------------------------------------------------------
  // STEP 1: Audit Financial Transactions & Ledger (/admin?tab=transactions)
  // -------------------------------------------------------------
  console.log('Step 1: Auditing Financial Transactions Ledger (/admin?tab=transactions)...');
  const finHeader = page.locator('h1:has-text("আর্থিক লেনদেন ও রাজস্ব ব্যবস্থাপনা")');
  await finHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Financial Transactions header visible: true');

  const masterLedgerHeader = page.locator('text=মাস্টার ট্রানজেকশন খতিয়ান (Ledger)');
  await masterLedgerHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Master Ledger Table visible: true');

  await page.screenshot({ path: 'audit_134_financial_transactions_ledger.png', fullPage: true });
  console.log('📸 Captured: audit_134_financial_transactions_ledger.png\n');

  // -------------------------------------------------------------
  // STEP 2: Audit Official Money Receipts Center (/admin?tab=transactions subtab / receipt)
  // -------------------------------------------------------------
  console.log('Step 2: Auditing Official Money Receipt Center...');
  const invoicesTabBtn = page.locator('button:has-text("ইনভয়েস ও রসিদ")').first();
  await invoicesTabBtn.waitFor({ state: 'visible', timeout: 10000 });
  await invoicesTabBtn.click();
  await page.waitForTimeout(1500);

  const receiptCenter = page.locator('text=অফিসিয়াল ইনভয়েস ও মানি রসিদ সেন্টার').first();
  await receiptCenter.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Money Receipt Center visible: true');

  await page.screenshot({ path: 'audit_134_official_money_receipt_center.png', fullPage: false });
  console.log('📸 Captured: audit_134_official_money_receipt_center.png\n');

  // -------------------------------------------------------------
  // STEP 3: Audit Coupons & Discounts Management (/admin?tab=coupons-discounts)
  // -------------------------------------------------------------
  console.log('Step 3: Auditing Coupons & Discounts Management (/admin?tab=coupons-discounts)...');
  await page.goto(`${BASE_URL}/admin?tab=coupons-discounts`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const couponsHeader = page.locator('text=বিদ্যমান কুপনসমূহ').first();
  await couponsHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Coupons Directory visible: true');

  const createCouponBtn = page.locator('button:has-text("নতুন কুপন")').or(page.locator('button:has-text("কুপন তৈরি")')).first();
  await createCouponBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Create Coupon button visible: true');

  await page.screenshot({ path: 'audit_134_coupons_and_discounts.png', fullPage: true });
  console.log('📸 Captured: audit_134_coupons_and_discounts.png\n');

  // -------------------------------------------------------------
  // STEP 4: Audit Raffle Campaigns (/admin?tab=raffle-campaigns)
  // -------------------------------------------------------------
  console.log('Step 4: Auditing Raffle Campaigns (/admin?tab=raffle-campaigns)...');
  await page.goto(`${BASE_URL}/admin?tab=raffle-campaigns`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const raffleTabBtn = page.locator('button:has-text("র‍্যাফেল ও বোনাস ক্যাম্পেইন")').first();
  if (await raffleTabBtn.isVisible()) {
    await raffleTabBtn.click();
    await page.waitForTimeout(1000);
  }

  const raffleHeader = page.locator('text=বিদ্যমান র‍্যাফেল ও বোনাস ক্যাম্পেইনসমূহ').first();
  await raffleHeader.waitFor({ state: 'visible', timeout: 15000 });
  console.log('Raffle Campaigns Directory visible: true');

  await page.screenshot({ path: 'audit_134_raffle_campaigns.png', fullPage: true });
  console.log('📸 Captured: audit_134_raffle_campaigns.png\n');

  await browser.close();
  console.log('🎉 All Cluster 6 Playwright E2E Audits Passed Successfully!');
}

runCluster6Audit().catch((err) => {
  console.error('❌ Cluster 6 Audit Failed:', err);
  process.exit(1);
});
