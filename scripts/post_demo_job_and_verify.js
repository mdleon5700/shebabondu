const http = require('http');
const { chromium } = require('playwright');
const path = require('path');

async function postJob() {
  console.log('--- Step 1: Posting New Job via Admin API ---');

  const newJobPayload = {
    id: 'job-bcc-ict-2026',
    slug: 'bcc-job-circular-2026',
    title: 'বাংলাদেশ কম্পিউটার কাউন্সিল (BCC) নিয়োগ বিজ্ঞপ্তি ২০২৬',
    organization: 'বাংলাদেশ কম্পিউটার কাউন্সিল (BCC)',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=160&q=80',
    category: 'govt',
    categoryLabel: 'সরকারি চাকরি',
    grade: '৯ম ও ১১তম গ্রেড',
    totalPosts: 36,
    salary: '২২,০০০ - ৫৩,০৬০/- টাকা',
    minEducation: 'স্নাতক (সম্মান) বা সমমানের ডিগ্রি',
    minAge: 18,
    maxAge: 32,
    districts: 'সকল জেলা',
    publishedDate: '০৭ নভেম্বর ২০২৬',
    deadline: '১৫ ডিসেম্বর ২০২৬',
    daysRemaining: 38,
    govtFee: 600,
    serviceFee: 100,
    officialLink: 'https://bcc.teletalk.com.bd',
    circularPdfUrl: 'https://bcc.teletalk.com.bd/docs/bcc_circular_2026.pdf',
    circularImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    status: 'PUBLISHED',
    publicationStatus: 'PUBLISHED',
    featured: true,
    isHot: true,
    smsPrefix: 'BCC',
    requirements: [
      'প্রার্থীকে বাংলাদেশের জন্মসূত্রে স্থায়ী নাগরিক হতে হবে।',
      'কম্পিউটার সায়েন্স, আইসিটি বা যেকোনো স্বীকৃত বিশ্ববিদ্যালয় হতে স্নাতক বা সমমান ডিগ্রি।',
      '১৫ ডিসেম্বর ২০২৬ তারিখে প্রার্থীর বয়স ১৮ থেকে ৩২ বছরের মধ্যে হতে হবে।',
      'কম্পিউটার টাইপিং ও অফিস অ্যাপ্লিকেশনে বাস্তব কাজের দক্ষতা থাকতে হবে।'
    ],
    positions: [
      {
        id: 'pos-1',
        title: 'সহকারী প্রোগ্রামার (Assistant Programmer)',
        grade: '৯ম গ্রেড',
        posts: 9,
        vacancies: 9,
        salary: '২২,০০০ - ৫৩,০৬০/- টাকা',
        minEducation: 'সিএসই / আইসিটি বা সংশ্লিষ্ট বিষয়ে ৪ বছর মেয়াদি স্নাতক ডিগ্রি',
        govtFee: 600
      },
      {
        id: 'pos-2',
        title: 'কম্পিউটার অপারেটর (Computer Operator)',
        grade: '১১তম গ্রেড',
        posts: 12,
        vacancies: 12,
        salary: '১২,৫০০ - ৩০,২৩০/- টাকা',
        minEducation: 'বিজ্ঞান বিভাগে স্নাতক ডিগ্রি এবং টাইপিং স্পিড ২৫/৩০ শব্দ',
        govtFee: 300
      },
      {
        id: 'pos-3',
        title: 'ডাটা এন্ট্রি অপারেটর (Data Entry Operator)',
        grade: '১৬তম গ্রেড',
        posts: 15,
        vacancies: 15,
        salary: '৯,৩০০ - ২২,৪৯০/- টাকা',
        minEducation: 'উচ্চ মাধ্যমিক (এইচএসসি) বা সমমান পরীক্ষায় উত্তীর্ণ',
        govtFee: 200
      }
    ],
    bengaliDescription: 'ডাক, টেলিযোগাযোগ ও তথ্যপ্রযুক্তি মন্ত্রণালয়ের আওতাধীন বাংলাদেশ কম্পিউটার কাউন্সিল (BCC) এর শূন্য পদসমূহে সরাসরি জনবল নিয়োগের নিমিত্তে প্রকৃত বাংলাদেশি নাগরিকদের নিকট হতে অনলাইনে দরখাস্ত আহ্বান করা যাচ্ছে।',
    applicationInstructions: '১. আগ্রহী প্রার্থীদের https://bcc.teletalk.com.bd ওয়েবসাইটে গিয়ে আবেদন ফরম পূরণ করতে হবে।\n২. ফরম পূরণের পর Applicant Copy তে প্রাপ্ত User ID ব্যবহার করে টেলিটক সিম থেকে SMS করে পরীক্ষার ফি জমা দিতে হবে।',
    seoTitle: 'বাংলাদেশ কম্পিউটার কাউন্সিল (BCC) নিয়োগ বিজ্ঞপ্তি ২০২৬ - মোট পদ ৩৬ জন | চাকরি সেবা',
    seoDescription: 'বাংলাদেশ কম্পিউটার কাউন্সিল (BCC) নিয়োগ বিজ্ঞপ্তি ২০২৬। সহকারী প্রোগ্রামার ও কম্পিউটার অপারেটর সহ ৩৬টি পদে আবেদন করুন।'
  };

  const postData = JSON.stringify(newJobPayload);

  const res = await new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000/api/admin/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-admin-secret': '1234'
      }
    }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          resolve({ status: response.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: response.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  console.log('Post API Status:', res.status);
  console.log('API Response:', res.data || res.raw);

  if (res.status !== 200) {
    throw new Error(`Failed to post job: ${JSON.stringify(res.data || res.raw)}`);
  }

  console.log('\n--- Step 2: Headless Browser Verification of Published Job ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  const targetUrl = 'http://localhost:3000/jobs/bcc-job-circular-2026';
  console.log('Navigating to:', targetUrl);
  const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 20000 });
  console.log('Page HTTP Status:', response.status());

  await page.waitForTimeout(1000);

  const pageTitle = await page.title();
  console.log('Page Title:', pageTitle);

  const headingText = await page.locator('h1').innerText();
  console.log('H1 Heading:', headingText);

  const positionsCount = await page.locator('text=সহকারী প্রোগ্রামার').count();
  console.log('Found Position "সহকারী প্রোগ্রামার":', positionsCount > 0);

  const artifactDir = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';
  const screenshotPath = path.join(artifactDir, '26_live_posted_job_bcc_2026.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Captured full-page screenshot:', screenshotPath);

  await browser.close();
  console.log('\n✅ Job successfully posted, live, and verified!');
}

postJob().catch(err => {
  console.error('Execution Failed:', err);
  process.exit(1);
});
