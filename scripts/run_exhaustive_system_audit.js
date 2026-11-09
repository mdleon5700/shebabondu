const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const artifactDir = path.resolve('C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd');

async function runExhaustiveAudit() {
  console.log('=== STARTING EXHAUSTIVE SYSTEM & UI BROWSER AUDIT ===\n');

  const browser = await chromium.launch({ headless: true });
  const auditReport = [];
  const globalConsoleErrors = [];

  // Helper function for page audit
  async function auditPage(name, url, options = {}) {
    const { viewport = { width: 1440, height: 900 }, setup = null, screenshotName = null, checks = [] } = options;
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    const pageErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageErrors.push(msg.text());
        globalConsoleErrors.push({ page: name, error: msg.text() });
      }
    });

    try {
      if (setup) await setup(page, context);

      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500);

      const status = res ? res.status() : 'NO_RESPONSE';
      let checkResults = {};
      for (const check of checks) {
        checkResults[check.name] = await check.fn(page);
      }

      let shotPath = null;
      if (screenshotName) {
        shotPath = path.join(artifactDir, screenshotName);
        await page.screenshot({ path: shotPath, fullPage: false });
      }

      const passed = status === 200 && Object.values(checkResults).every(v => v === true || v > 0);
      auditReport.push({
        Name: name,
        URL: url,
        Status: status,
        ConsoleErrors: pageErrors.length,
        Checks: JSON.stringify(checkResults),
        Passed: passed ? 'PASSED' : 'FAILED',
        Screenshot: screenshotName || 'None'
      });
      console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} (${url}) - Status: ${status} | Errors: ${pageErrors.length}`);
    } catch (err) {
      auditReport.push({
        Name: name,
        URL: url,
        Status: 'ERROR',
        ConsoleErrors: pageErrors.length,
        Checks: err.message,
        Passed: 'ERROR',
        Screenshot: 'None'
      });
      console.error(`[ERROR] ${name}:`, err.message);
    } finally {
      await context.close();
    }
  }

  // 1. Homepage Desktop
  await auditPage('1. Homepage (Desktop)', 'http://localhost:3000', {
    screenshotName: 'audit_01_homepage_desktop.png',
    checks: [
      { name: 'hasTitle', fn: async p => (await p.title()).length > 0 },
      { name: 'hasHeroHeading', fn: async p => (await p.content()).includes('চাকরি সেবা') || (await p.content()).includes('নিয়োগ বিজ্ঞপ্তি') }
    ]
  });

  // 2. Homepage Mobile (390x844)
  await auditPage('2. Homepage (Mobile)', 'http://localhost:3000', {
    viewport: { width: 390, height: 844 },
    screenshotName: 'audit_02_homepage_mobile.png',
    checks: [
      { name: 'rendersContent', fn: async p => (await p.content()).length > 1000 }
    ]
  });

  // 3. Jobs Listing Page
  await auditPage('3. Jobs Listing (/jobs)', 'http://localhost:3000/jobs', {
    screenshotName: 'audit_03_jobs_listing.png',
    checks: [
      { name: 'hasCards', fn: async p => await p.locator('article, .job-card, a[href^="/jobs/"]').count() > 5 },
      { name: 'hasPetrobangla', fn: async p => (await p.content()).includes('পেট্রোবাংলা') },
      { name: 'hasBCIC', fn: async p => (await p.content()).includes('বিসিআইসি') }
    ]
  });

  // 4. Single Job Detail - Petrobangla (job-ai-bogmc-14989)
  await auditPage('4. Job Detail - Petrobangla', 'http://localhost:3000/jobs/job-ai-bogmc-14989', {
    screenshotName: 'audit_04_job_detail_petrobangla.png',
    checks: [
      { name: 'hasDeadline', fn: async p => (await p.content()).includes('১৭ নভেম্বর ২০২৬') },
      { name: 'hasTotalPosts', fn: async p => (await p.content()).includes('৭৫৩') },
      { name: 'hasPositions', fn: async p => (await p.content()).includes('সহকারী ব্যবস্থাপক') }
    ]
  });

  // 5. Single Job Detail - Supreme Court (job-ai-gov-fcfec3)
  await auditPage('5. Job Detail - Supreme Court', 'http://localhost:3000/jobs/job-ai-gov-fcfec3', {
    screenshotName: 'audit_05_job_detail_supremecourt.png',
    checks: [
      { name: 'hasDeadline', fn: async p => (await p.content()).includes('২৩ নভেম্বর ২০২৬') },
      { name: 'hasOrgName', fn: async p => (await p.content()).includes('সুপ্রিম কোর্ট') }
    ]
  });

  // 6. Login Page & Form
  await auditPage('6. Candidate Login (/login)', 'http://localhost:3000/login', {
    screenshotName: 'audit_06_candidate_login.png',
    checks: [
      { name: 'hasIdentifierInput', fn: async p => await p.locator('input[type="text"], input[name="identifier"]').count() > 0 },
      { name: 'hasPasswordInput', fn: async p => await p.locator('input[type="password"]').count() > 0 }
    ]
  });

  // Helper setup for authenticated candidate session
  const candidateAuthSetup = async (page) => {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="text"], input[name="identifier"]', '01712-345678');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
  };

  // 7. Candidate Dashboard
  await auditPage('7. Candidate Dashboard (/dashboard)', 'http://localhost:3000/dashboard', {
    setup: candidateAuthSetup,
    screenshotName: 'audit_07_candidate_dashboard.png',
    checks: [
      { name: 'hasCandidateName', fn: async p => (await p.content()).includes('তানভীর') || (await p.content()).includes('Tanvir') },
      { name: 'hasWalletBalance', fn: async p => (await p.content()).includes('৳') || (await p.content()).includes('ব্যালেন্স') }
    ]
  });

  // 8. Candidate Applications List
  await auditPage('8. Candidate Applications (/dashboard/applications)', 'http://localhost:3000/dashboard/applications', {
    setup: candidateAuthSetup,
    screenshotName: 'audit_08_candidate_applications.png',
    checks: [
      { name: 'hasApplications', fn: async p => (await p.content()).includes('সুপ্রিম কোর্ট') || (await p.content()).includes('পেট্রোবাংলা') },
      { name: 'hasCompletedBadge', fn: async p => (await p.content()).includes('সফল') || (await p.content()).includes('সম্পন্ন') }
    ]
  });

  // 9. Candidate Profile
  await auditPage('9. Candidate Profile (/dashboard/profile)', 'http://localhost:3000/dashboard/profile', {
    setup: candidateAuthSetup,
    screenshotName: 'audit_09_candidate_profile.png',
    checks: [
      { 
        name: 'hasProfileData', 
        fn: async p => {
          const text = await p.content();
          const hasEdu = text.includes('এসএসসি') || text.includes('দাখিল') || text.includes('শিক্ষা');
          const inputValues = await p.evaluate(() => Array.from(document.querySelectorAll('input')).map(i => i.value).join(' '));
          const hasPhone = inputValues.includes('01712') || text.includes('01712');
          return hasEdu && hasPhone;
        }
      }
    ]
  });

  // 10. Candidate CV Builder
  await auditPage('10. Candidate CV Builder (/dashboard/cv-builder)', 'http://localhost:3000/dashboard/cv-builder', {
    setup: candidateAuthSetup,
    screenshotName: 'audit_10_candidate_cv_builder.png',
    checks: [
      { name: 'rendersCanvas', fn: async p => (await p.content()).includes('সিভি') || (await p.content()).includes('CV') }
    ]
  });

  // 11. Candidate Document Vault
  await auditPage('11. Candidate Vault (/dashboard/vault)', 'http://localhost:3000/dashboard/vault', {
    setup: candidateAuthSetup,
    screenshotName: 'audit_11_candidate_vault.png',
    checks: [
      { name: 'rendersVault', fn: async p => (await p.content()).includes('ডকুমেন্ট') || (await p.content()).includes('ভল্ট') }
    ]
  });

  // 12. Admin Dashboard Desktop
  await auditPage('12. Admin Dashboard (/admin)', 'http://localhost:3000/admin', {
    screenshotName: 'audit_12_admin_dashboard.png',
    checks: [
      { name: 'hasAdminTitle', fn: async p => (await p.content()).includes('অ্যাডমিন') || (await p.content()).includes('কন্ট্রোল প্যানেল') },
      { name: 'hasJobStats', fn: async p => (await p.content()).includes('সার্কুলার') || (await p.content()).includes('আবেদন') }
    ]
  });

  // 13. Admin Dashboard Mobile (390x844)
  await auditPage('13. Admin Dashboard (Mobile)', 'http://localhost:3000/admin', {
    viewport: { width: 390, height: 844 },
    screenshotName: 'audit_13_admin_mobile.png',
    checks: [
      { name: 'rendersMobileView', fn: async p => (await p.content()).length > 1000 }
    ]
  });

  await browser.close();

  console.log('\n=== FINAL EXHAUSTIVE AUDIT SUMMARY ===');
  console.table(auditReport);
  console.log(`\nTotal Tested Pages/Views: ${auditReport.length}`);
  const allPassed = auditReport.every(r => r.Passed === 'PASSED');
  console.log(`Overall System Audit Status: ${allPassed ? 'ALL PASSED (100% HEALTHY)' : 'SOME FAILED'}`);
  console.log(`Total Global Console Errors: ${globalConsoleErrors.length}`);
  if (globalConsoleErrors.length > 0) {
    console.log('Errors:', globalConsoleErrors.slice(0, 10));
  }
}

runExhaustiveAudit().catch(console.error);
