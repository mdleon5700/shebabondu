const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

const ALL_ROUTES = [
  // Core Public
  { url: '/', category: 'Public Home' },
  { url: '/jobs', category: 'Public Jobs' },
  { url: '/jobs/job-alljobs-dcjamalpur-15137', category: 'Job Detail' },
  { url: '/apply/job-alljobs-dcjamalpur-15137', category: 'Job Apply' },
  { url: '/government-jobs', category: 'Category' },
  { url: '/bank-jobs', category: 'Category' },
  { url: '/private-jobs', category: 'Category' },
  { url: '/ngo-jobs', category: 'Category' },
  { url: '/teacher-jobs', category: 'Category' },
  { url: '/engineering-jobs', category: 'Category' },
  { url: '/it-jobs', category: 'Category' },
  { url: '/medical-jobs', category: 'Category' },
  { url: '/marketing-jobs', category: 'Category' },
  { url: '/accounting-finance-jobs', category: 'Category' },
  { url: '/part-time-jobs', category: 'Category' },
  { url: '/tutoring-jobs', category: 'Category' },
  { url: '/fresher-jobs', category: 'Category' },
  { url: '/internships', category: 'Category' },
  { url: '/latest-jobs', category: 'Filtered Feed' },
  { url: '/todays-jobs', category: 'Filtered Feed' },
  { url: '/deadline-today', category: 'Filtered Feed' },
  { url: '/deadline-approaching', category: 'Filtered Feed' },
  { url: '/closing-soon', category: 'Filtered Feed' },
  { url: '/featured-jobs', category: 'Filtered Feed' },
  { url: '/updated-circulars', category: 'Filtered Feed' },
  { url: '/daily-jobs', category: 'Archive' },
  
  // Education Level Pages
  { url: '/jobs/ssc-pass', category: 'Education Level' },
  { url: '/jobs/hsc-pass', category: 'Education Level' },
  { url: '/jobs/diploma-pass', category: 'Education Level' },
  { url: '/jobs/bachelor-degree', category: 'Education Level' },
  { url: '/jobs/masters-degree', category: 'Education Level' },
  { url: '/jobs/no-experience', category: 'Education Level' },

  // Exams & Notices
  { url: '/admit-cards', category: 'Exam' },
  { url: '/exam-notices', category: 'Exam' },
  { url: '/exam-results', category: 'Exam' },
  { url: '/written-exam-results', category: 'Exam' },
  { url: '/viva-notices', category: 'Exam' },
  { url: '/exam-preparation', category: 'Exam Prep' },
  { url: '/model-tests', category: 'Exam Prep' },
  { url: '/previous-year-questions', category: 'Exam Prep' },
  { url: '/questions', category: 'Exam Prep' },

  // Organizations
  { url: '/organizations', category: 'Organizations' },
  { url: '/organizations/bpsc', category: 'Organizations' },
  { url: '/organizations/bangladesh-bank', category: 'Organizations' },
  { url: '/organizations/government-directorates', category: 'Organizations' },
  { url: '/organizations/government-ministries', category: 'Organizations' },

  // Categories & Slugs
  { url: '/categories', category: 'Categories' },
  { url: '/categories/bcs', category: 'Categories' },
  { url: '/categories/bank', category: 'Categories' },
  { url: '/categories/railway', category: 'Categories' },
  { url: '/categories/teacher', category: 'Categories' },
  { url: '/job-categories', category: 'Categories' },

  // Career Guides & Content
  { url: '/career-advice', category: 'Career Advice' },
  { url: '/career-guides', category: 'Career Guides' },
  { url: '/career-guides/cv-writing', category: 'Career Guides' },
  { url: '/career-guides/interview-preparation', category: 'Career Guides' },
  { url: '/career-guides/job-exam-preparation', category: 'Career Guides' },
  { url: '/career-guides/job-search-tips', category: 'Career Guides' },
  { url: '/career-guides/online-job-application', category: 'Career Guides' },
  { url: '/career-guides/viva-preparation', category: 'Career Guides' },
  { url: '/blog', category: 'Blog' },

  // Information & Policy
  { url: '/about-us', category: 'Info' },
  { url: '/contact-us', category: 'Info' },
  { url: '/faq', category: 'Info' },
  { url: '/privacy-policy', category: 'Policy' },
  { url: '/terms-and-conditions', category: 'Policy' },
  { url: '/disclaimer', category: 'Policy' },
  { url: '/editorial-policy', category: 'Policy' },
  { url: '/job-verification-policy', category: 'Policy' },
  { url: '/corrections-policy', category: 'Policy' },
  { url: '/job-alerts', category: 'Service' },
  { url: '/report-a-job', category: 'Service' },

  // Auth Pages
  { url: '/login', category: 'Auth' },
  { url: '/register', category: 'Auth' }
];

const CANDIDATE_DASHBOARD_ROUTES = [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/vault',
  '/dashboard/wallet',
  '/dashboard/transactions',
  '/dashboard/applications',
  '/dashboard/application-check',
  '/dashboard/recommended-jobs',
  '/dashboard/saved-jobs',
  '/dashboard/eligible-jobs',
  '/dashboard/admit-cards',
  '/dashboard/exam-calendar',
  '/dashboard/notifications',
  '/dashboard/alerts',
  '/dashboard/cv-builder',
  '/dashboard/preparation',
  '/dashboard/performance',
  '/dashboard/settings'
];

const ADMIN_TABS = [
  'dashboard',
  'system-health',
  'all-applications',
  'payment-verification',
  'processing-queue',
  'completed-rejected',
  'documents',
  'circulars',
  'gemini-browser-spider',
  'source-monitoring',
  'content-studio',
  'publishing-center',
  'category-search-manager',
  'job-feed-manager',
  'deadline-alert-manager',
  'smart-job-matching',
  'imported-drafts',
  'candidate-directory',
  'company-directory',
  'media-library',
  'analytics-center',
  'testing-spider',
  'automation-hub',
  'coupons-discounts',
  'transactions',
  'platform-operations',
  'builder',
  'pages-sections',
  'audit-logs',
  'notifications',
  'settings'
];

function isServerListening() {
  return new Promise(resolve => {
    const req = http.get(BASE_URL, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

(async () => {
  console.log('========================================================================');
  console.log('🔬 CHAKRI SHEBA — EXHAUSTIVE EACH-PAGE DEEP AUDIT');
  console.log('========================================================================');

  let serverProcess = null;
  const alreadyUp = await isServerListening();
  if (!alreadyUp) {
    console.log('Starting Next.js production server...');
    serverProcess = spawn('npm.cmd', ['run', 'start'], {
      shell: true,
      stdio: 'ignore',
      cwd: process.cwd()
    });

    let ready = false;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000));
      if (await isServerListening()) {
        ready = true;
        break;
      }
    }
    if (!ready) {
      console.error('Failed to start server within 30 seconds.');
      process.exit(1);
    }
    console.log('Next.js production server is live on http://localhost:3000\n');
  } else {
    console.log('Next.js production server is already running on http://localhost:3000\n');
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const auditReport = [];

  async function checkPage(url, section) {
    const pageErrors = [];
    const consoleErrors = [];

    page.removeAllListeners('pageerror');
    page.removeAllListeners('console');

    page.on('pageerror', err => pageErrors.push(err.toString()));
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon.ico')) {
        consoleErrors.push(msg.text());
      }
    });

    try {
      const fullUrl = BASE_URL + url;
      const res = await page.goto(fullUrl, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(400);
      const status = res ? res.status() : 0;

      // Allow image loading to settle
      await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        await Promise.all(imgs.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = img.onerror = resolve;
            setTimeout(resolve, 2000);
          });
        }));
      });

      const evalData = await page.evaluate(() => {
        const bodyText = document.body ? document.body.innerText.trim() : '';
        const h1 = document.querySelector('h1') ? document.querySelector('h1').innerText.trim() : '';
        const images = Array.from(document.querySelectorAll('img'));
        const brokenImages = images.filter(img => img.complete && img.naturalWidth === 0 && img.src && !img.src.startsWith('data:')).length;

        const isCrash = bodyText.includes('একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে') ||
                        bodyText.includes('Application error') ||
                        bodyText.includes('Internal Server Error') ||
                        bodyText.includes('TypeError:') ||
                        bodyText.includes('ReferenceError:');

        const is404 = (document.title.includes('404') || bodyText.includes('পৃষ্ঠাটি খুঁজে পাওয়া যায়নি'));
        const isBlank = bodyText.length < 50;

        return {
          title: document.title,
          h1,
          bodyLength: bodyText.length,
          totalImages: images.length,
          brokenImages,
          isCrash,
          is404,
          isBlank
        };
      });

      const entry = {
        url,
        section,
        status,
        title: evalData.title,
        h1: evalData.h1,
        contentLength: evalData.bodyLength,
        images: `${evalData.totalImages} (Broken: ${evalData.brokenImages})`,
        isCrash: evalData.isCrash,
        is404: evalData.is404,
        isBlank: evalData.isBlank,
        brokenImagesCount: evalData.brokenImages,
        pageErrors,
        consoleErrors
      };

      auditReport.push(entry);

      const pass = status === 200 && !evalData.isCrash && !evalData.is404 && !evalData.isBlank && pageErrors.length === 0 && evalData.brokenImages === 0;

      if (pass) {
        console.log(`✅ [PASS] [${section.padEnd(10)}] ${url.padEnd(42)} | Len: ${evalData.bodyLength.toString().padStart(5)} | H1: "${evalData.h1.substring(0, 25)}"`);
      } else {
        console.log(`❌ [FAIL] [${section.padEnd(10)}] ${url.padEnd(42)} | Status: ${status} | Crash: ${evalData.isCrash} | 404: ${evalData.is404} | BrokenImg: ${evalData.brokenImages} | Err: ${pageErrors.length}`);
      }
    } catch (e) {
      auditReport.push({
        url,
        section,
        status: 0,
        isCrash: false,
        is404: false,
        isBlank: false,
        brokenImagesCount: 0,
        error: e.message
      });
      console.log(`❌ [TIMEOUT/ERROR] [${section.padEnd(10)}] ${url.padEnd(42)} | ${e.message}`);
    }
  }

  // 1. AUDIT ALL PUBLIC & CATEGORY ROUTES
  console.log('\n--- 1. PUBLIC, CATEGORY & EDUCATIONAL ROUTES (' + ALL_ROUTES.length + ' pages) ---');
  for (const item of ALL_ROUTES) {
    await checkPage(item.url, item.category);
  }

  // 2. AUDIT ALL CANDIDATE DASHBOARD ROUTES (With logged in candidate)
  console.log('\n--- 2. CANDIDATE DASHBOARD ROUTES (' + CANDIDATE_DASHBOARD_ROUTES.length + ' pages) ---');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: '01712345678', password: '123456', role: 'candidate' })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('cs_auth', JSON.stringify({ isLoggedIn: true, role: 'candidate', userId: data.user?.id, phone: data.user?.phone, name: data.user?.name }));
        if (data.user) localStorage.setItem('cs_candidate_profile', JSON.stringify(data.user));
        if (data.token) document.cookie = `cs_session_token=${encodeURIComponent(data.token)}; path=/; max-age=2592000; SameSite=Lax`;
      }
    } catch (e) {}
  });

  for (const route of CANDIDATE_DASHBOARD_ROUTES) {
    await checkPage(route, 'Candidate');
  }

  // 3. AUDIT ALL ADMIN WORKSPACE TABS (With logged in admin)
  console.log('\n--- 3. ADMIN WORKSPACE HUBS & TABS (' + ADMIN_TABS.length + ' tabs) ---');
  await page.goto(BASE_URL + '/admin', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
    document.cookie = 'cs_session_token=ADMIN-SUPER-SESSION; path=/; max-age=2592000; SameSite=Lax';
  });

  for (const tab of ADMIN_TABS) {
    await checkPage(`/admin?tab=${tab}`, 'Admin');
  }

  // SAVE FULL JSON REPORT
  const reportPath = path.join(__dirname, '..', 'audit_full_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2), 'utf8');

  const total = auditReport.length;
  const failed = auditReport.filter(r => r.isCrash || r.is404 || r.isBlank || (r.pageErrors && r.pageErrors.length > 0) || r.brokenImagesCount > 0 || r.status >= 400 || r.error);
  const passed = total - failed.length;

  console.log('\n========================================================================');
  console.log(`TOTAL PAGES AUDITED: ${total} | PASSED: ${passed} | FAILED/ISSUES: ${failed.length}`);
  console.log('========================================================================');

  if (failed.length > 0) {
    console.log('\n🚨 ISSUES TO FIX:');
    failed.forEach(f => console.log(` - ${f.url} (${f.section}): status=${f.status}, crash=${f.isCrash}, 404=${f.is404}, brokenImg=${f.brokenImagesCount}, err=${f.error || (f.pageErrors ? f.pageErrors.join('; ') : '')}`));
  } else {
    console.log('\n🏆 ALL ' + total + ' PAGES PASSED AUDIT WITH ZERO ERRORS!');
  }

  await browser.close();
  if (serverProcess) {
    try { process.kill(serverProcess.pid); } catch(e) {}
  }
  process.exit(0);
})();
