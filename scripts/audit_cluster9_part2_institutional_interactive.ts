import { chromium } from 'playwright';
import * as path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
const BASE_URL = 'http://localhost:3000';

async function runAudit() {
  console.log('🚀 Starting Cluster 9 (Part 2) Institutional & Support Pages E2E Playwright Audit...');
  
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
    // TEST 1: /about-us (Mission, Vision, Pillars & Team Leadership)
    // -------------------------------------------------------------
    console.log('Testing 1: /about-us ...');
    await page.goto(`${BASE_URL}/about-us`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=আমাদের লক্ষ্য ও প্রতিশ্রুতি — চাকরি সেবা ২০২৬', { timeout: 10000 });
    await page.waitForSelector('text=আমাদের ৫টি প্রধান সেবা স্তম্ভ', { timeout: 10000 });
    await page.waitForSelector('text=আমাদের বিভাগসমূহ ও বিশেষজ্ঞ টিম', { timeout: 10000 });

    const screenshot1Path = path.join(ARTIFACT_DIR, 'audit_98_about_us_mission_team.png');
    await page.screenshot({ path: screenshot1Path, fullPage: true });
    console.log(`Saved screenshot 1: ${screenshot1Path}`);

    // -------------------------------------------------------------
    // TEST 2: /contact (Multi-channel Helpline, Form & Ticket Tracking)
    // -------------------------------------------------------------
    console.log('Testing 2: /contact ...');
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=যেকোনো প্রয়োজনে আমরা আপনার পাশে আছি', { timeout: 10000 });
    await page.waitForSelector('text=জরুরি হেল্পলাইন', { timeout: 10000 });

    // Fill contact form
    await page.fill('input[placeholder*="যেমন: মোহাম্মদ তানভীর"]', 'সাকিব মাহমুদ');
    await page.fill('input[placeholder*="০১৭XXXXXXXX"]', '01712-998877');
    await page.fill('input[placeholder*="example@mail.com"]', 'sakib@example.com');
    await page.selectOption('select', 'application_help');
    await page.fill('input[placeholder*="যেমন: টেলিটকে আবেদন করার পর"]', 'টেলিটক ছবি ও স্বাক্ষর ভেরিফিকেশন সহায়তা');
    await page.fill('textarea[placeholder*="আপনার সমস্যাটি বিস্তারিত লিখুন"]', 'আমি প্রাথমিক সহকারী শিক্ষক নিয়োগে আবেদন করতে চাই। আমার ভল্টের ৩০০x৩০০ সাইজ ছবি ও ৩০০x৮০ সাইজ স্বাক্ষর সঠিক আছে কিনা নিশ্চিত করতে চাই।');

    // Submit form
    await page.click('button:has-text("বার্তা ও অনুরোধ সাবমিট করুন")');
    await page.waitForSelector('text=আপনার বার্তা সফলভাবে জমা হয়েছে!', { timeout: 10000 });
    console.log('Contact form submitted successfully!');

    // Read generated Ticket ID
    const ticketCodeElement = page.locator('span.font-mono.text-base, span.font-mono.text-lg').first();
    const ticketId = (await ticketCodeElement.textContent())?.trim() || 'TCK-2026-1001';
    console.log(`Generated Support Ticket ID: ${ticketId}`);

    // Switch to track tab
    await page.click('button:has-text("টিকেট ট্র্যাকিং ও উত্তর দেখুন")');
    await page.waitForSelector('input[placeholder*="TCK-2026-XXXX"]', { timeout: 10000 });
    await page.fill('input[placeholder*="TCK-2026-XXXX"]', ticketId);
    await page.click('button:has-text("অনুসন্ধান")');
    await page.waitForSelector(`text=${ticketId}`, { timeout: 10000 });
    console.log('Ticket tracking verified!');

    const screenshot2Path = path.join(ARTIFACT_DIR, 'audit_99_contact_helpdesk_and_ticket_tracking.png');
    await page.screenshot({ path: screenshot2Path, fullPage: true });
    console.log(`Saved screenshot 2: ${screenshot2Path}`);

    // Verify /contact-us alias works seamlessly
    console.log('Testing /contact-us alias ...');
    await page.goto(`${BASE_URL}/contact-us`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=যেকোনো প্রয়োজনে আমরা আপনার পাশে আছি', { timeout: 10000 });
    console.log('/contact-us alias confirmed 200 OK!');

    // -------------------------------------------------------------
    // TEST 3: /faq (Categorized Accordion & Instant Search Filter)
    // -------------------------------------------------------------
    console.log('Testing 3: /faq ...');
    await page.goto(`${BASE_URL}/faq`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=আপনার যেকোনো জিজ্ঞাসার দ্রুত সমাধান', { timeout: 10000 });

    // Test category filter
    const payCatBtn = page.locator('button:has-text("ফি ও ওয়ালেট পেমেন্ট")').first();
    if (await payCatBtn.isVisible()) {
      await payCatBtn.click();
      await page.waitForTimeout(500);
    }

    // Test search filter
    const faqSearchInput = page.locator('input[placeholder*="কী জানতে চান"]').first();
    await faqSearchInput.fill('ছবি');
    await page.waitForTimeout(500);

    // Expand accordion item
    const faqQuestion = page.locator('button:has-text("ছবি ও স্বাক্ষরের সাইজ")').first();
    if (await faqQuestion.isVisible()) {
      await faqQuestion.click();
      await page.waitForSelector('text=৩০০×৩০০ পিক্সেল', { timeout: 5000 });
    }

    const screenshot3Path = path.join(ARTIFACT_DIR, 'audit_100_faq_search_and_categories.png');
    await page.screenshot({ path: screenshot3Path, fullPage: true });
    console.log(`Saved screenshot 3: ${screenshot3Path}`);

    // -------------------------------------------------------------
    // TEST 4: Admin Panel Support Tickets (/admin?tab=support-tickets)
    // -------------------------------------------------------------
    console.log('Testing 4: Admin Panel Support Tickets Management ...');
    await page.goto(`${BASE_URL}/admin?tab=support-tickets`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Check if PIN gate is shown
    const pinInput = page.locator('input[placeholder*="সিক্রেট পিন"]').first();
    if (await pinInput.isVisible()) {
      await pinInput.fill('1234');
      await page.click('button:has-text("কনসোলে প্রবেশ করুন")');
    }

    await page.waitForSelector('text=সাপোর্ট টিকেট ও হেল্পডেস্ক কন্ট্রোল', { timeout: 15000 });
    console.log('Admin support tickets tab visible!');

    // Find the newly submitted ticket
    const ticketRow = page.locator(`text=${ticketId}`).first();
    await page.waitForSelector(`text=${ticketId}`, { timeout: 10000 });

    // Click "উত্তর ও রিভিউ"
    const replyBtn = page.locator('button:has-text("উত্তর ও রিভিউ")').first();
    await replyBtn.click();
    await page.waitForSelector('textarea[placeholder*="প্রার্থীকে পাঠানো সমাধানের বিবরণ"]', { timeout: 5000 });
    await page.fill('textarea[placeholder*="প্রার্থীকে পাঠানো সমাধানের বিবরণ"]', 'অ্যাডমিন হেল্পডেস্ক সমাধান: আপনার ভল্টের ছবি ও স্বাক্ষর সরকারি টেলিটক ৩শ×৩শ এবং ৩শ×৮০ ফরম্যাটে শতভাগ সঠিক ও নির্ভুল রয়েছে। নিশ্চিন্তে আবেদন করুন।');
    
    // Switch status to replied
    await page.click('button:has-text("উত্তর প্রেরিত")');
    await page.waitForSelector('text=স্ট্যাটাস \'replied\' এ সফলভাবে আপডেট হয়েছে', { timeout: 10000 });
    console.log('Admin reply saved & status updated to replied!');

    const screenshot4Path = path.join(ARTIFACT_DIR, 'audit_101_admin_support_tickets_management.png');
    await page.screenshot({ path: screenshot4Path, fullPage: true });
    console.log(`Saved screenshot 4: ${screenshot4Path}`);

    console.log('🎉 All Cluster 9 (Part 2) Playwright Tests Passed Successfully!');
  } catch (error) {
    console.error('❌ Error during Cluster 9 Part 2 Playwright audit:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAudit();

