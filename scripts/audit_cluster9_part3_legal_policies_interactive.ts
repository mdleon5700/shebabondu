import { chromium } from 'playwright';
import * as path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
const BASE_URL = 'http://localhost:3000';

async function runAudit() {
  console.log('🚀 Starting Cluster 9 (Part 3) Legal & Policy Pages E2E Playwright Audit...');
  
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
    // TEST 1: /privacy-policy (Data Protection & Privacy Policy)
    // -------------------------------------------------------------
    console.log('Testing 1: /privacy-policy ...');
    await page.goto(`${BASE_URL}/privacy-policy`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=ব্যবহারকারীর তথ্যের সর্বোচ্চ গোপনীয়তা রক্ষা নীতি', { timeout: 15000 });
    await page.waitForSelector('text=আমরা যেসকল তথ্য সংগ্রহ করি', { timeout: 15000 });
    await page.waitForSelector('text=AES-256 বিট শক্তিশালী এনক্রিপশন', { timeout: 15000 });

    const screenshot1Path = path.join(ARTIFACT_DIR, 'audit_102_privacy_policy.png');
    await page.screenshot({ path: screenshot1Path, fullPage: true });
    console.log(`Saved screenshot 1: ${screenshot1Path}`);

    // Verify /privacy alias
    console.log('Testing /privacy alias ...');
    await page.goto(`${BASE_URL}/privacy`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=ব্যবহারকারীর তথ্যের সর্বোচ্চ গোপনীয়তা রক্ষা নীতি', { timeout: 15000 });
    console.log('/privacy alias confirmed 200 OK!');

    // -------------------------------------------------------------
    // TEST 2: /terms-and-conditions (Terms of Service)
    // -------------------------------------------------------------
    console.log('Testing 2: /terms-and-conditions ...');
    await page.goto(`${BASE_URL}/terms-and-conditions`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=প্ল্যাটফর্মের ব্যবহারের শর্তাবলী ও নিয়মনীতি', { timeout: 15000 });
    await page.waitForSelector('text=প্রার্থীর সত্য তথ্য প্রদানের দায়বদ্ধতা', { timeout: 15000 });
    await page.waitForSelector('text=টেলিটক ও সরকারি আবেদন সহকারী প্রক্রিয়া', { timeout: 15000 });

    const screenshot2Path = path.join(ARTIFACT_DIR, 'audit_103_terms_and_conditions.png');
    await page.screenshot({ path: screenshot2Path, fullPage: true });
    console.log(`Saved screenshot 2: ${screenshot2Path}`);

    // Verify /terms alias
    console.log('Testing /terms alias ...');
    await page.goto(`${BASE_URL}/terms`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=প্ল্যাটফর্মের ব্যবহারের শর্তাবলী ও নিয়মনীতি', { timeout: 15000 });
    console.log('/terms alias confirmed 200 OK!');

    // -------------------------------------------------------------
    // TEST 3: /disclaimer (Legal Notice & Official Gazette Disclosure)
    // -------------------------------------------------------------
    console.log('Testing 3: /disclaimer ...');
    await page.goto(`${BASE_URL}/disclaimer`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=আইনি তথ্য দায়মুক্তি ও অফিসিয়াল গেজেট সম্পর্কিত ঘোষণা', { timeout: 15000 });
    await page.waitForSelector('text=সরকারি বা প্রাতিষ্ঠানিক সম্পর্কহীনতার সুস্পষ্ট ঘোষণা', { timeout: 15000 });
    await page.waitForSelector('text=তথ্যের উৎস ও মূল গেজেট অনুসরণ', { timeout: 15000 });

    const screenshot3Path = path.join(ARTIFACT_DIR, 'audit_104_disclaimer_notice.png');
    await page.screenshot({ path: screenshot3Path, fullPage: true });
    console.log(`Saved screenshot 3: ${screenshot3Path}`);

    // -------------------------------------------------------------
    // TEST 4: /editorial-policy (Editorial Standards & Objectivity)
    // -------------------------------------------------------------
    console.log('Testing 4: /editorial-policy ...');
    await page.goto(`${BASE_URL}/editorial-policy`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=সম্পাদকীয় নীতিমালা এবং নির্ভুল তথ্য উপস্থাপনের প্রতিশ্রুতি', { timeout: 15000 });
    await page.waitForSelector('text=তথ্যের অনুমোদিত উৎসসমূহ', { timeout: 15000 });
    await page.waitForSelector('text=বাণিজ্যিক বিজ্ঞাপন বনাম সরকারি বিজ্ঞপ্তি পৃথকীকরণ', { timeout: 15000 });

    const screenshot4Path = path.join(ARTIFACT_DIR, 'audit_105_editorial_policy.png');
    await page.screenshot({ path: screenshot4Path, fullPage: true });
    console.log(`Saved screenshot 4: ${screenshot4Path}`);

    // -------------------------------------------------------------
    // TEST 5: /corrections-policy (Corrections & Retractions)
    // -------------------------------------------------------------
    console.log('Testing 5: /corrections-policy ...');
    await page.goto(`${BASE_URL}/corrections-policy`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=তথ্যে কোনো ত্রুটি দেখা দিলে তা দ্রুত সংশোধন ও প্রত্যাহার করার নিয়মাবলী', { timeout: 15000 });
    await page.waitForSelector('text=সংশোধন বাস্তবায়নের সুনির্দিষ্ট সময়সীমা', { timeout: 15000 });
    await page.waitForSelector('text=সর্বোচ্চ ২ ঘণ্টার মধ্যে', { timeout: 15000 });

    const screenshot5Path = path.join(ARTIFACT_DIR, 'audit_106_corrections_policy.png');
    await page.screenshot({ path: screenshot5Path, fullPage: true });
    console.log(`Saved screenshot 5: ${screenshot5Path}`);

    // -------------------------------------------------------------
    // TEST 6: /job-verification-policy (3-Tier Hybrid AI & Manual Audit)
    // -------------------------------------------------------------
    console.log('Testing 6: /job-verification-policy ...');
    await page.goto(`${BASE_URL}/job-verification-policy`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=প্রতিটি সার্কুলার কীভাবে এআই ও ম্যানুয়াল অডিটের মাধ্যমে গেজেট মিলিয়ে যাচাই করা হয়', { timeout: 15000 });
    await page.waitForSelector('text=৩-স্তরের হাইব্রিড যাচাইকরণ আর্কিটেকচার', { timeout: 15000 });
    await page.waitForSelector('text=VERIFIED_ACCURATE', { timeout: 15000 });

    const screenshot6Path = path.join(ARTIFACT_DIR, 'audit_107_job_verification_policy.png');
    await page.screenshot({ path: screenshot6Path, fullPage: true });
    console.log(`Saved screenshot 6: ${screenshot6Path}`);

    // -------------------------------------------------------------
    // TEST 7: /refund-policy (Added Missing Policy: 100% Refund & Cancellation)
    // -------------------------------------------------------------
    console.log('Testing 7: /refund-policy ...');
    await page.goto(`${BASE_URL}/refund-policy`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=রিফান্ড, ফি ফেরত ও ক্যান্সেলেশন নীতিমালা', { timeout: 15000 });
    await page.waitForSelector('text=রিফান্ড ও ১০০% মানি-ব্যাক গ্যারান্টি', { timeout: 15000 });
    await page.waitForSelector('text=২৪ ঘণ্টার মধ্যে', { timeout: 15000 });

    const screenshot7Path = path.join(ARTIFACT_DIR, 'audit_108_refund_policy.png');
    await page.screenshot({ path: screenshot7Path, fullPage: true });
    console.log(`Saved screenshot 7: ${screenshot7Path}`);

    // Verify /refund alias
    console.log('Testing /refund alias ...');
    await page.goto(`${BASE_URL}/refund`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('text=রিফান্ড, ফি ফেরত ও ক্যান্সেলেশন নীতিমালা', { timeout: 15000 });
    console.log('/refund alias confirmed 200 OK!');

    console.log('🎉 All 7 Legal Policy Pages and Aliases Passed E2E Audit Successfully!');
  } catch (error) {
    console.error('❌ Error during Legal Policy Playwright audit:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAudit();
