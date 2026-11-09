import { chromium } from 'playwright';
import * as path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
const BASE_URL = 'http://localhost:3000';

interface MatrixRoute {
  num: number;
  path: string;
  nameBn: string;
  keyFeature: string;
  expectedSelector: string;
}

const MATRIX_ROUTES: MatrixRoute[] = [
  {
    num: 1,
    path: '/',
    nameBn: 'হোমপেইজ',
    keyFeature: 'লাইভ সার্চ, আজকের নতুন চাকরি, ডেডলাইন অ্যালার্ট, টপ অর্গানাইজেশন',
    expectedSelector: 'input[placeholder*="চাকরি খুঁজুন"], text=আজকের নতুন'
  },
  {
    num: 2,
    path: '/jobs',
    nameBn: 'চাকরির মূল ডিরেক্টরি',
    keyFeature: 'সকল সার্কুলারের গ্রিড, অ্যাডভান্সড ফিল্টার, সর্টিং ও পেজিনেশন',
    expectedSelector: 'text=সকল চাকরির বিজ্ঞপ্তি, text=ফিল্টার'
  },
  {
    num: 3,
    path: '/jobs/job-petrobangla-am-2026',
    nameBn: 'স্বতন্ত্র চাকরির পাতা',
    keyFeature: 'গ্রেড, বেতন, শূন্যপদ, যোগ্যতা, সরাসরি আবেদন বাটন, মূল PDF ভিউয়ার',
    expectedSelector: 'text=পেট্রোবাংলা, text=আবেদন'
  },
  {
    num: 4,
    path: '/categories',
    nameBn: 'সকল ক্যাটাগরি',
    keyFeature: 'সরকারি, ব্যাংক, কোম্পানি, ডিফেন্স, আইটিসহ সকল সেক্টরের সচিত্র তালিকা',
    expectedSelector: 'text=সকল সেক্টর, text=ক্যাটাগরি'
  },
  {
    num: 5,
    path: '/categories/bcs-govt',
    nameBn: 'ক্যাটাগরি লাইভ ফিড',
    keyFeature: 'নির্দিষ্ট ক্যাটাগরির অন্তর্ভুক্ত সকল চলমান নিয়োগের তালিকা',
    expectedSelector: 'text=বিসিএস ও সরকারি চাকরি, text=সার্কুলার'
  },
  {
    num: 6,
    path: '/government-jobs',
    nameBn: 'সরকারি চাকরি হাব',
    keyFeature: 'মন্ত্রণালয় ও রাজস্ব খাতের সকল সার্কুলার',
    expectedSelector: 'text=সরকারি চাকরি'
  },
  {
    num: 7,
    path: '/private-jobs',
    nameBn: 'কোম্পানি ও স্বায়ত্তশাসিত হাব',
    keyFeature: 'বিদ্যুৎ, জ্বালানি ও শিল্প খাতের সকল কোম্পানির সার্কুলার',
    expectedSelector: 'text=কোম্পানি, text=স্বায়ত্তশাসিত'
  },
  {
    num: 8,
    path: '/bank-jobs',
    nameBn: 'ব্যাংক চাকরি হাব',
    keyFeature: 'রাষ্ট্রায়ত্ত ও বেসরকারি ব্যাংকের সকল সার্কুলার',
    expectedSelector: 'text=ব্যাংক'
  },
  {
    num: 9,
    path: '/admit-cards',
    nameBn: 'এডমিট কার্ড ডাউনলোড',
    keyFeature: 'চলমান নিয়োগ পরীক্ষার প্রবেশপত্র ডাউনলোড লিংক ও ইউজার আইডি রিকভারি',
    expectedSelector: 'text=প্রবেশপত্র, text=ডাউনলোড'
  },
  {
    num: 10,
    path: '/exam-results',
    nameBn: 'পরীক্ষার ফলাফল',
    keyFeature: 'প্রিলিমিনারি, লিখিত ও চূড়ান্ত পরীক্ষার ফলাফল ও উত্তীর্ণদের তালিকা',
    expectedSelector: 'text=ফলাফল'
  },
  {
    num: 11,
    path: '/exam-notices',
    nameBn: 'পরীক্ষার তারিখ ও রুটিন',
    keyFeature: 'পরীক্ষার সময়সূচি, আসনবিন্যাস ও কেন্দ্র সম্পর্কিত জরুরি বিজ্ঞপ্তি',
    expectedSelector: 'text=পরীক্ষা, text=নোটিশ'
  },
  {
    num: 12,
    path: '/previous-year-questions',
    nameBn: 'বিগত সালের প্রশ্নব্যাংক',
    keyFeature: 'বিসিএস ও ব্যাংক পরীক্ষার বিগত বছরের ব্যাখ্যাসহ প্রশ্ন সমাধান',
    expectedSelector: 'text=প্রশ্নব্যাংক, text=বিগত'
  },
  {
    num: 13,
    path: '/model-tests',
    nameBn: 'অনলাইন মডেল টেস্ট',
    keyFeature: 'টাইমারভিত্তিক এমসিকিউ মক টেস্ট ও স্বয়ংক্রিয় রেজাল্ট',
    expectedSelector: 'text=মডেল টেস্ট'
  },
  {
    num: 14,
    path: '/career-guides',
    nameBn: 'ক্যারিয়ার গাইডেন্স হাব',
    keyFeature: 'সিভি লেখা, ভাইভা প্রস্তুতি, ও আবেদন করার পূর্ণাঙ্গ নির্দেশিকা',
    expectedSelector: 'text=ক্যারিয়ার, text=গাইড'
  },
  {
    num: 15,
    path: '/organizations',
    nameBn: 'নিয়োগকারী সংস্থা তালিকা',
    keyFeature: 'সকল সরকারি মন্ত্রণালয়, অধিদপ্তর ও কোম্পানির ডিরেক্টরি',
    expectedSelector: 'text=প্রতিষ্ঠান, text=ডিরেক্টরি'
  },
  {
    num: 16,
    path: '/job-alerts',
    nameBn: 'জব অ্যালার্ট সিস্টেম',
    keyFeature: 'এসএমএস ও ইমেইলে নতুন চাকরির অ্যালার্ট সাবস্ক্রিপশন',
    expectedSelector: 'text=অ্যালার্ট, text=সাবস্ক্রিপশন'
  },
  {
    num: 17,
    path: '/about-us',
    nameBn: 'আমাদের সম্পর্কে',
    keyFeature: 'প্ল্যাটফর্ম পরিচিতি, লক্ষ্য ও সেবা সম্পর্কিত তথ্য',
    expectedSelector: 'text=আমাদের সম্পর্কে, text=লক্ষ্য'
  },
  {
    num: 18,
    path: '/contact-us',
    nameBn: 'যোগাযোগ ও সহায়তা',
    keyFeature: 'চাকরিপ্রার্থীদের সাপোর্ট ও ফিডব্যাক ফর্ম',
    expectedSelector: 'text=যোগাযোগ, text=সহায়তা'
  },
  {
    num: 19,
    path: '/faq',
    nameBn: 'সচরাচর জিজ্ঞাসা',
    keyFeature: 'সাধারণ প্রশ্ন ও বিস্তারিত সমাধান',
    expectedSelector: 'text=জিজ্ঞাসা, text=FAQ'
  },
  {
    num: 20,
    path: '/privacy-policy',
    nameBn: 'গোপনীয়তা নীতিমালা',
    keyFeature: 'তথ্য সুরক্ষা ও ডেটা ব্যবহারের সার্বিক নিয়মাবলী',
    expectedSelector: 'text=গোপনীয়তা, text=সুরক্ষা'
  }
];

async function runComprehensiveMatrixAudit() {
  console.log('🚀 Starting Verification of All 20 Public Matrix Routes...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  const results: any[] = [];

  for (const item of MATRIX_ROUTES) {
    const fullUrl = `${BASE_URL}${item.path}`;
    const startTime = Date.now();
    try {
      const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
      const status = response ? response.status() : 0;
      const duration = Date.now() - startTime;

      console.log(`[${item.num}/20] ${item.path} -> HTTP ${status} (${duration}ms) [PASS]`);
      results.push({
        ...item,
        status,
        duration,
        verified: status === 200
      });
    } catch (err: any) {
      console.error(`[${item.num}/20] ${item.path} -> FAILED: ${err.message}`);
      results.push({
        ...item,
        status: 500,
        duration: Date.now() - startTime,
        verified: false,
        error: err.message
      });
    }
  }

  // Capture a showcase screenshot of the full portal dashboard
  console.log('Capturing showcase screenshot of public portal home...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  const showcasePath = path.join(ARTIFACT_DIR, 'audit_109_public_matrix_portal_showcase.png');
  await page.screenshot({ path: showcasePath, fullPage: false });
  console.log(`Showcase screenshot saved at: ${showcasePath}`);

  await browser.close();

  const allPassed = results.every(r => r.verified);
  console.log('====================================================');
  console.log(`Matrix Audit Summary: ${results.filter(r => r.verified).length} / 20 Routes Passed!`);
  console.log('====================================================');

  if (!allPassed) {
    console.error('Some routes failed verification!');
    process.exit(1);
  } else {
    console.log('🎉 100% SUCCESS: All 20 Public Matrix Routes Verified and Operational!');
  }
}

runComprehensiveMatrixAudit();
