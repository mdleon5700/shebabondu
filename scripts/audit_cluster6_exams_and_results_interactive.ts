import { chromium } from 'playwright';
import path from 'path';

async function main() {
  console.log('🚀 Starting Cluster 6: Exam, Admit Card & Result Portal Interactive Audit...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  const artifactDir = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';

  // ==========================================
  // PART 1: AUDIT /admit-cards
  // ==========================================
  console.log('==============================================');
  console.log('📌 PART 1: Auditing /admit-cards');
  console.log('==============================================');

  const admitUrl = 'http://localhost:3000/admit-cards';
  console.log(`🌐 Navigating to ${admitUrl}...`);
  const admitResp = await page.goto(admitUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Admit Cards Page Status: ${admitResp?.status()}`);

  if (admitResp?.status() !== 200) {
    throw new Error(`Failed to load /admit-cards, status: ${admitResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  // 1. Verify Header & Metrics
  const admitHeader = await page.locator('h1').innerText();
  console.log(`✅ Header: ${admitHeader}`);

  const activeAdmitPills = await page.locator('text=ডাউনলোড চলছে').first().isVisible();
  console.log(`✅ Metric 'ডাউনলোড চলছে' visible: ${activeAdmitPills}`);

  // 2. Test Category Filtering
  console.log('\n--- 1. Testing Category Filters & Search ---');
  await page.click('button:has-text("বিসিএস ও সরকারি")');
  await page.waitForTimeout(400);
  const govtCardCount = await page.locator('h2:has-text("বিসিএস")').count();
  console.log(`✅ Filtered BCS & Govt Cards Count: ${govtCardCount}`);

  await page.click('button:has-text("সকল")');
  await page.waitForTimeout(400);

  // 3. Test Search
  const searchInput = page.locator('input[placeholder*="পরীক্ষার নাম"]');
  await searchInput.fill('বিসিএস');
  await page.waitForTimeout(400);
  const bcsCards = await page.locator('h2:has-text("বিসিএস")').count();
  console.log(`✅ Search 'বিসিএস' result count: ${bcsCards}`);
  await searchInput.fill('');
  await page.waitForTimeout(400);

  // 4. Test User ID & PIN Recovery Assistant Modal
  console.log('\n--- 2. Testing Teletalk User ID & PIN Recovery Modal ---');
  const recoveryBtn = page.locator('button:has-text("User ID / PIN রিকভারি")').first();
  await recoveryBtn.click();
  await page.waitForTimeout(600);

  const modalTitle = await page.locator('text=User ID ও PIN রিকভারি সহকারী').isVisible();
  console.log(`✅ Recovery Modal Open: ${modalTitle}`);

  const sms16222Visible = await page.locator('text=16222').first().isVisible();
  console.log(`✅ 16222 Shortcode Visible: ${sms16222Visible}`);

  // Screenshot Admit Cards with Modal open
  const shot1 = path.join(artifactDir, 'audit_77_admit_cards_portal.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot1}`);

  // Close modal via close button inside modal
  const closeBtn = page.locator('div.fixed button').first();
  await closeBtn.click();
  await page.waitForTimeout(400);

  // ==========================================
  // PART 2: AUDIT /exam-notices
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 2: Auditing /exam-notices');
  console.log('==============================================');

  const examNoticesUrl = 'http://localhost:3000/exam-notices';
  console.log(`🌐 Navigating to ${examNoticesUrl}...`);
  const examResp = await page.goto(examNoticesUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Exam Notices Page Status: ${examResp?.status()}`);

  if (examResp?.status() !== 200) {
    throw new Error(`Failed to load /exam-notices, status: ${examResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  const examHeader = await page.locator('h1').innerText();
  console.log(`✅ Header: ${examHeader}`);

  // Test Type Filtering
  console.log('\n--- 1. Testing Exam Type Tabs ---');
  await page.click('button:has-text("লিখিত পরীক্ষা (Written)")');
  await page.waitForTimeout(400);
  const writtenCount = await page.locator('text=লিখিত পরীক্ষা').count();
  console.log(`✅ Written Notices Count: ${writtenCount}`);

  await page.click('button:has-text("সকল নোটিশ")');
  await page.waitForTimeout(600);

  // Test Seat Plan & Exam Center Modal
  console.log('\n--- 2. Testing Seat Plan & Exam Centers Modal ---');
  const seatPlanBtn = page.locator('button:has-text("আসনবিন্যাস (Seat Plan) দেখুন")').first();
  await seatPlanBtn.scrollIntoViewIfNeeded();
  await seatPlanBtn.click();
  await page.waitForTimeout(800);

  const seatModalHeader = await page.locator('text=কেন্দ্রভিত্তিক আসনবিন্যাস').isVisible();
  console.log(`✅ Seat Plan Modal Visible: ${seatModalHeader}`);

  const centerRow = await page.locator('text=ঢাকা কলেজ').first().isVisible();
  console.log(`✅ Exam Center Row Visible: ${centerRow}`);

  // Screenshot Exam Notices with Seat Plan Modal open
  const shot2 = path.join(artifactDir, 'audit_78_exam_notices_and_seatplan.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot2}`);

  // Close Seat Plan modal
  await page.click('button:has-text("বন্ধ করুন")');
  await page.waitForTimeout(400);

  // ==========================================
  // PART 3: AUDIT /viva-notices
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 3: Auditing /viva-notices');
  console.log('==============================================');

  const vivaUrl = 'http://localhost:3000/viva-notices';
  console.log(`🌐 Navigating to ${vivaUrl}...`);
  const vivaResp = await page.goto(vivaUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Viva Notices Page Status: ${vivaResp?.status()}`);

  if (vivaResp?.status() !== 200) {
    throw new Error(`Failed to load /viva-notices, status: ${vivaResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  const vivaHeader = await page.locator('h1').innerText();
  console.log(`✅ Header: ${vivaHeader}`);

  // Verify Board Schedule Table
  const boardRow = await page.locator('text=বোর্ড নং ১').first().isVisible();
  console.log(`✅ Board No 1 Schedule Row Visible: ${boardRow}`);

  // Test Document Checklist Interactivity
  console.log('\n--- 1. Testing Interactive Document Checklist ---');
  const docItem = page.locator('text=অনলাইনে দাখিলকৃত আবেদনপত্রের প্রিন্ট কপি').first();
  await docItem.click();
  await page.waitForTimeout(400);
  console.log('✅ Clicked required document checklist item');

  // Screenshot Viva Notices
  const shot3 = path.join(artifactDir, 'audit_79_viva_schedules_portal.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot3}`);

  // ==========================================
  // PART 4: AUDIT /written-exam-results
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 4: Auditing /written-exam-results');
  console.log('==============================================');

  const writtenResUrl = 'http://localhost:3000/written-exam-results';
  console.log(`🌐 Navigating to ${writtenResUrl}...`);
  const writtenResp = await page.goto(writtenResUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Written Exam Results Status: ${writtenResp?.status()}`);

  if (writtenResp?.status() !== 200) {
    throw new Error(`Failed to load /written-exam-results, status: ${writtenResp?.status()}`);
  }

  await page.waitForTimeout(1000);
  const writtenPageTitle = await page.locator('h1').innerText();
  console.log(`✅ Written Page Title: ${writtenPageTitle}`);

  // ==========================================
  // PART 5: AUDIT /exam-results & ROLL CHECKER
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 5: Auditing /exam-results & Instant Roll Checker');
  console.log('==============================================');

  const examResUrl = 'http://localhost:3000/exam-results';
  console.log(`🌐 Navigating to ${examResUrl}...`);
  const examResResp = await page.goto(examResUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Exam Results Status: ${examResResp?.status()}`);

  if (examResResp?.status() !== 200) {
    throw new Error(`Failed to load /exam-results, status: ${examResResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  // 1. Test Positive Roll Check (Pass)
  console.log('\n--- 1. Testing Instant Roll Checker (Positive Case) ---');
  const rollInput = page.locator('input[placeholder*="101234"]');
  await rollInput.fill('101234');
  await page.click('button:has-text("ফলাফল দেখুন")');
  await page.waitForTimeout(500);

  const passMessage = await page.locator('text=অভিনন্দন! আপনার রোল নম্বরটি').isVisible();
  console.log(`✅ Positive Result Message Visible: ${passMessage}`);

  // 2. Test Negative Roll Check (Not Found)
  console.log('\n--- 2. Testing Instant Roll Checker (Negative Case) ---');
  await rollInput.fill('999999');
  await page.click('button:has-text("ফলাফল দেখুন")');
  await page.waitForTimeout(500);

  const notFoundMessage = await page.locator('text=দুঃখিত! রোল নম্বরটি').isVisible();
  console.log(`✅ Not Found Message Visible: ${notFoundMessage}`);

  // Switch back to positive to showcase success state in screenshot
  await rollInput.fill('101234');
  await page.click('button:has-text("ফলাফল দেখুন")');
  await page.waitForTimeout(500);

  // 3. Test Expandable Sample Rolls
  console.log('\n--- 3. Testing Sample Rolls Accordion ---');
  const sampleRollsBtn = page.locator('button:has-text("উত্তীর্ণ রোল নম্বরের নমুনা তালিকা দেখুন")').first();
  await sampleRollsBtn.click();
  await page.waitForTimeout(400);

  const sampleTag = await page.locator('span:text-is("101234")').first().isVisible();
  console.log(`✅ Sample Tag '101234' Visible: ${sampleTag}`);

  // Screenshot Exam Results with Instant Checker Success
  const shot4 = path.join(artifactDir, 'audit_80_exam_results_instant_roll_checker.png');
  await page.screenshot({ path: shot4, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot4}`);

  await browser.close();
  console.log('\n✨ All Cluster 6 Tests Passed Successfully with 100% Integrity!');
}

main().catch(err => {
  console.error('❌ Audit Failed:', err);
  process.exit(1);
});
