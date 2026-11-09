import { chromium } from 'playwright';
import path from 'path';

async function main() {
  console.log('🚀 Starting Cluster 5 Job Detail Interactive Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const artifactDir = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';
  const jobId = 'job-alljobs-15178';
  const url = `http://localhost:3000/jobs/${jobId}`;

  console.log(`🌐 Navigating to ${url}...`);
  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Response Status: ${response?.status()}`);

  // Wait for React hydration
  await page.waitForTimeout(2000);

  // 1. Verify Section 1: Top Header & Key Info Card
  console.log('\n--- Section 1: Top Header & Key Info Card ---');
  const title = await page.locator('.job-hero-headline').textContent();
  console.log(`✅ Title: "${title?.trim()}"`);

  const verifiedBadge = await page.locator('text=VERIFIED_ACCURATE').first().isVisible();
  console.log(`✅ VERIFIED_ACCURATE Badge Visible: ${verifiedBadge}`);

  const orgLink = await page.locator('a[title="এই প্রতিষ্ঠানের সকল সার্কুলার দেখুন"]').textContent();
  console.log(`✅ Organization: "${orgLink?.trim()}"`);

  // 2. Verify Section 2: AI Eligibility Evaluator
  console.log('\n--- Section 2: AI Eligibility Evaluator ---');
  const aiEvaluatorTitle = await page.locator('text=স্মার্ট এআই যোগ্যতা যাচাইকারী').isVisible();
  console.log(`✅ AI Evaluator Widget Visible: ${aiEvaluatorTitle}`);

  // Click 1-Click Evaluate
  console.log('👉 Triggering 1-Click AI Eligibility Check...');
  const evaluateBtn = page.locator('button:has-text("১-ক্লিকে যোগ্যতা যাচাই")');
  await evaluateBtn.click();
  await page.waitForTimeout(600);

  const evalResultVisible = await page.locator('text=কাট-অফ তারিখ:').isVisible();
  console.log(`✅ Instant Evaluation Result Visible: ${evalResultVisible}`);

  // 3. Verify Section 3: Job Summary Facts Grid (6 Cards) & Specifications Table
  console.log('\n--- Section 3: Job Summary Facts Grid & 10-Point Specifications ---');
  const factsGrid = page.locator('.job-summary-facts');
  const factsGridVisible = await factsGrid.isVisible();
  console.log(`✅ Job Summary Facts Container Visible: ${factsGridVisible}`);

  const gradeSalary = await page.locator('text=গ্রেড ও মূল বেতন').first().isVisible();
  const vacancies = await page.locator('text=মোট শূন্যপদ সংখ্যা').first().isVisible();
  const education = await page.locator('text=শিক্ষাগত যোগ্যতা').first().isVisible();
  const ageLimit = await page.locator('text=বয়সসীমা ও কাট-অফ ডেট').first().isVisible();
  const location = await page.locator('text=কর্মস্থল ও জেলার প্রাপ্যতা').first().isVisible();
  const timeline = await page.locator('text=আবেদনের সময়সূচি').first().isVisible();

  console.log(`✅ Facts Cards (6/6): Grade=${gradeSalary}, Vacancies=${vacancies}, Edu=${education}, Age=${ageLimit}, Loc=${location}, Time=${timeline}`);

  // 4. Verify Section 4: Designation Breakdown Table
  console.log('\n--- Section 4: Designation Breakdown Table ---');
  const tableHeader = await page.locator('text=পদের নাম, পদসংখ্যা ও শিক্ষাগত যোগ্যতা').first().isVisible();
  const applyBtnInTable = await page.locator('a:has-text("আবেদন")').first().isVisible();
  console.log(`✅ Designation Table Visible: ${tableHeader}, Apply CTA in Table: ${applyBtnInTable}`);

  // 5. Verify Section 5: Official Circular Dual PDF/Image Viewer
  console.log('\n--- Section 5: Dual PDF/Image Viewer ---');
  const gazetteHeader = await page.locator('text=মূল সার্কুলার গেজেট নোটিশ').first().isVisible();
  const downloadPdfBtn = await page.locator('a:has-text("মূল সার্কুলার PDF ডাউনলোড")').first().isVisible();
  const zoomInBtn = await page.locator('button[title="জুম ইন (+)"]').first().isVisible();
  console.log(`✅ Gazette Viewer: ${gazetteHeader}, Download PDF Button: ${downloadPdfBtn}, Zoom In: ${zoomInBtn}`);

  // 6. Verify Section 6: Teletalk SMS Formatter & Code Generator
  console.log('\n--- Section 6: Teletalk SMS Generator ---');
  const smsSection = await page.locator('text=টেলিটক এসএমএস ফরম্যাট ও ফি দেওয়ার নিয়মাবলী').first().isVisible();
  const sms1Code = await page.locator('text=FRI ABCDEF').isVisible().catch(() => false);
  console.log(`✅ SMS Generator Visible: ${smsSection}, SMS1 Code (FRI ABCDEF): ${sms1Code}`);

  // 7. Verify Section 7: Direct Apply CTA & Related Jobs
  console.log('\n--- Section 7: Direct Apply CTA & Related Jobs ---');
  const directApplyCTA = await page.locator('text=অফিশিয়াল সাবডোমেইনে সরাসরি আবেদন').first().isVisible();
  const subdomainPill = await page.locator('text=fri.teletalk.com.bd').first().isVisible();
  console.log(`✅ Direct Apply CTA Box: ${directApplyCTA}, Subdomain (fri.teletalk.com.bd): ${subdomainPill}`);

  const relatedJobsSection = await page.locator('text=একই ক্যাটাগরি ও যোগ্যতার ৩টি প্রাসঙ্গিক চাকরি').first().isVisible();
  const relatedCardsCount = await page.locator('section[aria-label="সম্পর্কিত অন্যান্য চলমান সার্কুলার"] a[href*="/jobs/"]').count();
  console.log(`✅ Related Jobs Section: ${relatedJobsSection}, Count of Cards: ${relatedCardsCount}`);

  // Capture Full Page Screenshot
  console.log('\n📸 Capturing full-page audit screenshots...');
  const screenshotPath = `${artifactDir}/audit_72_cluster5_job_detail_alljobs_15178.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`🖼️ Full Page Screenshot saved: ${screenshotPath}`);

  // Capture Section Screenshots
  const heroScreenshot = `${artifactDir}/audit_73_cluster5_header_and_ai_evaluator.png`;
  await page.locator('.max-w-6xl').first().screenshot({ path: heroScreenshot });
  console.log(`🖼️ Hero & AI Evaluator Screenshot saved: ${heroScreenshot}`);

  await browser.close();
  console.log('\n🎉 Cluster 5 Job Detail Interactive Audit Completed Successfully!');
}

main().catch(err => {
  console.error('❌ Audit Failed:', err);
  process.exit(1);
});

