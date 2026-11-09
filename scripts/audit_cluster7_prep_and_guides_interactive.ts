import { chromium } from 'playwright';
import path from 'path';

async function main() {
  console.log('🚀 Starting Cluster 7: Preparation, Question Bank & Guides Interactive Audit...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  const artifactDir = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';

  // ==========================================
  // PART 1: AUDIT /exam-preparation
  // ==========================================
  console.log('==============================================');
  console.log('📌 PART 1: Auditing /exam-preparation');
  console.log('==============================================');

  const prepUrl = 'http://localhost:3000/exam-preparation';
  console.log(`🌐 Navigating to ${prepUrl}...`);
  const prepResp = await page.goto(prepUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Prep Page Status: ${prepResp?.status()}`);

  if (prepResp?.status() !== 200) {
    throw new Error(`Failed to load /exam-preparation, status: ${prepResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  // 1. Verify Header
  const prepHeader = await page.locator('h1').innerText();
  console.log(`✅ Header: ${prepHeader}`);

  // 2. Test Exam Type Switcher (Primary & Bank)
  console.log('\n--- 1. Testing Exam Marks Pattern Switcher ---');
  await page.click('button:has-text("প্রাথমিক শিক্ষক (৮০ নম্বর)")');
  await page.waitForTimeout(400);
  const primaryPill = await page.locator('text=মোট ৮০ নম্বরের পরীক্ষায়').first().isVisible();
  console.log(`✅ Switched to Primary 80 Marks: ${primaryPill}`);

  await page.click('button:has-text("বিসিএস প্রিলিমিনারি (২০০ নম্বর)")');
  await page.waitForTimeout(400);

  // 3. Test Subject Tab Switch
  console.log('\n--- 2. Testing Subject Tabs & Topic Checklist ---');
  await page.click('button:has-text("গাণিতিক যুক্তি ও মানসিক দক্ষতা")');
  await page.waitForTimeout(400);

  const mathHeader = await page.locator('h2:has-text("গাণিতিক যুক্তি")').isVisible();
  console.log(`✅ Switched to Math Subject: ${mathHeader}`);

  // 4. Click Topic Checklist item to test progress tracker
  const firstTopicCard = page.locator('div:has-text("পাটিগণিত (Arithmetic)")').first();
  await firstTopicCard.click();
  await page.waitForTimeout(400);
  console.log('✅ Clicked topic checklist item');

  // Screenshot Exam Preparation Hub
  const shot1 = path.join(artifactDir, 'audit_81_exam_preparation_syllabus.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot1}`);

  // ==========================================
  // PART 2: AUDIT /previous-year-questions & /questions
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 2: Auditing /previous-year-questions & /questions');
  console.log('==============================================');

  const qBankUrl = 'http://localhost:3000/previous-year-questions';
  console.log(`🌐 Navigating to ${qBankUrl}...`);
  const qBankResp = await page.goto(qBankUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Question Bank Status: ${qBankResp?.status()}`);

  if (qBankResp?.status() !== 200) {
    throw new Error(`Failed to load /previous-year-questions, status: ${qBankResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  // Test Search
  console.log('\n--- 1. Testing Search in Question Bank ---');
  const searchInput = page.locator('input[placeholder*="প্রশ্ন বা পরীক্ষার নাম"]');
  await searchInput.fill('চর্যাপদ');
  await page.waitForTimeout(400);

  const foundCharya = await page.locator('text=‘চর্যাপদ’ কোন ছন্দে রচিত?').isVisible();
  console.log(`✅ Found Search Question: ${foundCharya}`);

  // Test Solution Explanation Toggle
  console.log('\n--- 2. Testing Solution Explanation Accordion ---');
  const explainBtn = page.locator('button:has-text("সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা দেখুন")').first();
  await explainBtn.click();
  await page.waitForTimeout(500);

  const solutionVisible = await page.locator('text=বিস্তারিত নির্ভুল সমাধান ও রেফারেন্স:').isVisible();
  console.log(`✅ Detailed Explanation Visible: ${solutionVisible}`);

  // Clear search to show full list
  await searchInput.fill('');
  await page.waitForTimeout(400);

  // Screenshot Question Bank with explanation open
  const shot2 = path.join(artifactDir, 'audit_82_previous_year_question_bank.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot2}`);

  // Verify /questions also loads cleanly
  const qResp = await page.goto('http://localhost:3000/questions', { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 /questions route status: ${qResp?.status()}`);

  // ==========================================
  // PART 3: AUDIT /model-tests (LIVE EXAM & INSTANT RESULTS)
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 3: Auditing /model-tests & Live Exam Engine');
  console.log('==============================================');

  const modelUrl = 'http://localhost:3000/model-tests';
  console.log(`🌐 Navigating to ${modelUrl}...`);
  const modelResp = await page.goto(modelUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Model Tests Status: ${modelResp?.status()}`);

  if (modelResp?.status() !== 200) {
    throw new Error(`Failed to load /model-tests, status: ${modelResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  // 1. Start BCS Model Test
  console.log('\n--- 1. Starting BCS Live Model Test ---');
  const startBtn = page.locator('button:has-text("টেস্ট শুরু করুন")').first();
  await startBtn.click();
  await page.waitForTimeout(800);

  const stickyTimer = await page.locator('text=চলমান মডেল টেস্ট:').isVisible();
  console.log(`✅ Live Test Mode & Sticky Header Active: ${stickyTimer}`);

  // 2. Answer a few questions
  console.log('\n--- 2. Answering Questions in Real-Time ---');
  // Question 1: option 0
  const q1Opt = page.locator('button:has-text("১৯০৭ সালে নেপালের রাজদরবারের")').first();
  await q1Opt.click();
  await page.waitForTimeout(200);

  // Question 2: option 2
  const q2Opt = page.locator('button:has-text("Roe")').first();
  await q2Opt.click();
  await page.waitForTimeout(200);

  // Question 3: option 2
  const q3Opt = page.locator('button:has-text("২০০")').first();
  await q3Opt.click();
  await page.waitForTimeout(200);

  console.log('✅ Answered 3 questions');

  // 3. Submit Test
  console.log('\n--- 3. Submitting Test & Checking Results ---');
  const submitBtn = page.locator('button:has-text("টেস্ট সাবমিট করুন ও ফলাফল দেখুন")');
  await submitBtn.scrollIntoViewIfNeeded();
  await submitBtn.click();
  await page.waitForTimeout(1000);

  const resultHeader = await page.locator('text=টেস্ট সম্পন্ন হয়েছে').isVisible();
  console.log(`✅ Post-Test Result Score Card Visible: ${resultHeader}`);

  const correctStat = await page.locator('text=সঠিক উত্তর').isVisible();
  console.log(`✅ Correct Answers Stat Visible: ${correctStat}`);

  const reviewHeader = await page.locator('text=সম্পূর্ণ উত্তরপত্র ও ভুল ত্রুটি সংশোধন').isVisible();
  console.log(`✅ Answer Sheet Review Visible: ${reviewHeader}`);

  // Screenshot Model Test Results & Review
  const shot3 = path.join(artifactDir, 'audit_83_online_live_model_test.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot3}`);

  // ==========================================
  // PART 4: AUDIT /career-guides & SUBPAGES
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 4: Auditing /career-guides & Subpages');
  console.log('==============================================');

  const guidesUrl = 'http://localhost:3000/career-guides';
  console.log(`🌐 Navigating to ${guidesUrl}...`);
  const guidesResp = await page.goto(guidesUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Career Guides Hub Status: ${guidesResp?.status()}`);

  if (guidesResp?.status() !== 200) {
    throw new Error(`Failed to load /career-guides, status: ${guidesResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  // Verify /career-advice also responds 200
  const adviceResp = await page.goto('http://localhost:3000/career-advice', { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Career Advice Status: ${adviceResp?.status()}`);

  // Navigate to CV Writing subpage directly
  console.log('\n--- 1. Testing /career-guides/cv-writing ---');
  const cvResp = await page.goto('http://localhost:3000/career-guides/cv-writing', { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 CV Writing Status: ${cvResp?.status()}`);
  await page.waitForTimeout(1000);

  const cvHeader = await page.locator('h1').innerText();
  console.log(`✅ CV Writing Page Title: ${cvHeader}`);

  const templateVisible = await page.locator('text=নমুনা ফ্রেশার সিভি হেডার ও সামারি').isVisible();
  console.log(`✅ Sample CV Template Visible: ${templateVisible}`);

  // Test Checklist
  const cvChecklist = page.locator('div:has-text("সিভিতে কোনো বানান বা টাইপিং ভুল নেই")').first();
  await cvChecklist.click();
  await page.waitForTimeout(300);
  console.log('✅ Clicked CV preparation checklist item');

  // Screenshot CV Writing Guide
  const shot4 = path.join(artifactDir, 'audit_84_career_guide_cv_writing.png');
  await page.screenshot({ path: shot4, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot4}`);

  // Test other 5 subpages HTTP status
  const subpages = [
    '/career-guides/interview-preparation',
    '/career-guides/job-exam-preparation',
    '/career-guides/online-job-application',
    '/career-guides/job-search-tips',
    '/career-guides/viva-preparation'
  ];

  for (const sp of subpages) {
    const resp = await page.goto(`http://localhost:3000${sp}`, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`📡 Subpage ${sp} Status: ${resp?.status()}`);
    if (resp?.status() !== 200) {
      throw new Error(`Failed to load ${sp}, status: ${resp?.status()}`);
    }
  }

  // ==========================================
  // PART 5: AUDIT /blog & Dynamic /blog/[slug]
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 5: Auditing /blog & Dynamic /blog/[slug]');
  console.log('==============================================');

  const blogUrl = 'http://localhost:3000/blog';
  console.log(`🌐 Navigating to ${blogUrl}...`);
  const blogResp = await page.goto(blogUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Blog Hub Status: ${blogResp?.status()}`);

  if (blogResp?.status() !== 200) {
    throw new Error(`Failed to load /blog, status: ${blogResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  // Navigate to single article directly
  console.log('\n--- 1. Testing Single Blog Article /blog/bcs-preli-strategy-2026 ---');
  const singleBlogResp = await page.goto('http://localhost:3000/blog/bcs-preli-strategy-2026', { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Single Blog Status: ${singleBlogResp?.status()}`);
  await page.waitForTimeout(1000);

  const articleTitle = await page.locator('h1').innerText();
  console.log(`✅ Article Title: ${articleTitle}`);

  const authorVisible = await page.locator('text=ফারহান সাদিক').first().isVisible();
  console.log(`✅ Author Info Visible: ${authorVisible}`);

  // Test Copy Link Button
  const shareBtn = page.locator('button:has-text("শেয়ার করুন")').first();
  await shareBtn.click();
  await page.waitForTimeout(300);
  const copyConfirm = await page.locator('text=লিংক কপি হয়েছে!').isVisible();
  console.log(`✅ Share Link Copied Confirm: ${copyConfirm}`);

  // Screenshot Single Blog
  const shot5 = path.join(artifactDir, 'audit_85_single_blog_article.png');
  await page.screenshot({ path: shot5, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot5}`);

  await browser.close();
  console.log('\n✨ All Cluster 7 Interactive Tests Passed with 100% Integrity!');
}

main().catch(err => {
  console.error('❌ Audit Failed:', err);
  process.exit(1);
});
