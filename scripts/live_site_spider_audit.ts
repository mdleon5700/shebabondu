import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

interface AuditFinding {
  id: string;
  url: string;
  panel: 'public' | 'user' | 'admin';
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  category: 'content' | 'visual' | 'responsive' | 'link' | 'seo' | 'console' | 'functional';
  description: string;
  element?: string;
  snippet?: string;
}

const findings: AuditFinding[] = [];
let issueCounter = 1;

function addFinding(
  url: string,
  panel: 'public' | 'user' | 'admin',
  severity: 'P0' | 'P1' | 'P2' | 'P3',
  category: 'content' | 'visual' | 'responsive' | 'link' | 'seo' | 'console' | 'functional',
  description: string,
  element?: string,
  snippet?: string
) {
  findings.push({
    id: `ISSUE-${String(issueCounter++).padStart(3, '0')}`,
    url,
    panel,
    severity,
    category,
    description,
    element,
    snippet: snippet ? snippet.slice(0, 150) : undefined
  });
}

const PUBLIC_ROUTES = [
  '/',
  '/jobs',
  '/categories',
  '/latest-jobs',
  '/daily-jobs',
  '/todays-jobs',
  '/deadline-approaching',
  '/deadline-today',
  '/closing-soon',
  '/featured-jobs',
  '/government-jobs',
  '/bank-jobs',
  '/private-jobs',
  '/it-jobs',
  '/engineering-jobs',
  '/marketing-jobs',
  '/medical-jobs',
  '/teacher-jobs',
  '/ngo-jobs',
  '/tutoring-jobs',
  '/internships',
  '/fresher-jobs',
  '/part-time-jobs',
  '/accounting-finance-jobs',
  '/jobs/no-experience',
  '/jobs/ssc-pass',
  '/jobs/hsc-pass',
  '/jobs/diploma-pass',
  '/jobs/bachelor-degree',
  '/jobs/masters-degree',
  '/organizations',
  '/organizations/bpsc',
  '/organizations/bangladesh-bank',
  '/organizations/government-ministries',
  '/organizations/government-directorates',
  '/career-guides',
  '/career-guides/cv-writing',
  '/career-guides/interview-preparation',
  '/career-guides/job-exam-preparation',
  '/career-guides/job-search-tips',
  '/career-guides/online-job-application',
  '/career-guides/viva-preparation',
  '/career-advice',
  '/blog',
  '/blog/bcs-preli-strategy-2026',
  '/about-us',
  '/contact',
  '/contact-us',
  '/faq',
  '/privacy-policy',
  '/terms-and-conditions',
  '/disclaimer',
  '/editorial-policy',
  '/corrections-policy',
  '/job-verification-policy',
  '/report-a-job',
  '/login',
  '/register',
  '/admit-cards',
  '/exam-notices',
  '/exam-preparation',
  '/exam-results',
  '/model-tests',
  '/previous-year-questions',
  '/questions',
  '/updated-circulars',
  '/viva-notices',
  '/written-exam-results',
  '/jobs/job-877477',
  '/apply/job-877477',
  '/categories/government-jobs',
  '/daily-jobs/2026-10-31'
];

const USER_ROUTES = [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/education',
  '/dashboard/cv-builder',
  '/dashboard/vault',
  '/dashboard/saved-jobs',
  '/dashboard/alerts',
  '/dashboard/eligible-jobs',
  '/dashboard/recommended-jobs',
  '/dashboard/notifications',
  '/dashboard/applications',
  '/dashboard/settings',
  '/dashboard/admit-cards',
  '/dashboard/exam-calendar',
  '/dashboard/preparation',
  '/dashboard/performance',
  '/dashboard/application-check',
  '/dashboard/transactions',
  '/dashboard/wallet'
];

const ADMIN_TABS = [
  'dashboard',
  'candidates',
  'jobs',
  'applications',
  'content-studio',
  'categories',
  'notifications',
  'reports',
  'analytics',
  'governance',
  'audit-center',
  'settings',
  'sources',
  'companies',
  'deadlines',
  'publishing'
];

async function auditPage(
  page: Page,
  urlPath: string,
  panel: 'public' | 'user' | 'admin',
  fullUrl: string
) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  const consoleHandler = (msg: any) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const loc = msg.location()?.url || '';
      if (!text.includes('favicon.ico') && !loc.includes('favicon.ico')) {
        consoleErrors.push(text);
      }
    }
  };

  const pageErrorHandler = (err: any) => {
    pageErrors.push(err.message || String(err));
  };

  page.on('console', consoleHandler);
  page.on('pageerror', pageErrorHandler);

  try {
    const res = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(400);

    const status = res?.status() || 0;
    if (status >= 400) {
      addFinding(urlPath, panel, 'P1', 'functional', `Page returned HTTP ${status}`, undefined, `Status: ${status}`);
    }

    // Check runtime unhandled errors
    if (pageErrors.length > 0) {
      addFinding(urlPath, panel, 'P1', 'console', `Runtime unhandled JS error: ${pageErrors[0]}`, undefined, pageErrors.join('; '));
    }

    // Check console errors
    for (const ce of consoleErrors) {
      if (ce.includes('Hydration failed') || ce.includes('did not match')) {
        addFinding(urlPath, panel, 'P2', 'console', `React hydration mismatch: ${ce.slice(0, 100)}`, undefined, ce);
      } else if (!ce.includes('Failed to load resource: net::ERR_CONNECTION_REFUSED')) {
        addFinding(urlPath, panel, 'P3', 'console', `Console error: ${ce.slice(0, 100)}`, undefined, ce);
      }
    }

    // Inspect DOM content & SEO
    const domData = await page.evaluate(() => {
      // 1. Title & Meta
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const h1Elements = Array.from(document.querySelectorAll('h1')).map(h => (h.textContent || '').trim());

      // 2. Dead links
      const deadLinks: string[] = [];
      document.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (href === '#' || href === '') {
          deadLinks.push(a.outerHTML.slice(0, 80));
        }
      });

      // 3. Broken images
      const brokenImages: string[] = [];
      document.querySelectorAll('img').forEach(img => {
        if (!img.src || (img.complete && img.naturalWidth === 0)) {
          brokenImages.push(img.src || img.getAttribute('src') || 'no-src');
        }
      });

      // 4. Empty headings
      const emptyHeadings: string[] = [];
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        if ((h.textContent || '').trim().length === 0 && !h.querySelector('svg, img')) {
          emptyHeadings.push(h.tagName.toLowerCase());
        }
      });

      // 5. Placeholder text scan in visible body
      const bodyText = document.body.innerText || '';
      const placeholderMatches: string[] = [];
      const testRegex = /\b(lorem ipsum|dolor sit amet|TODO:|undefined|NaN|\[object Object\])\b/i;
      const lines = bodyText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && testRegex.test(trimmed)) {
          placeholderMatches.push(trimmed.slice(0, 80));
        }
      }

      // 6. Horizontal overflow check
      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      const isOverflowing = docWidth > winWidth + 2;

      return {
        title,
        metaDesc,
        h1Elements,
        deadLinks,
        brokenImages,
        emptyHeadings,
        placeholderMatches,
        isOverflowing,
        docWidth,
        winWidth
      };
    });

    // Evaluate findings from DOM
    if (!domData.title || domData.title.trim().length < 3) {
      addFinding(urlPath, panel, 'P2', 'seo', 'Missing or empty <title> tag');
    }
    if (panel === 'public' && (!domData.metaDesc || domData.metaDesc.trim().length < 5)) {
      addFinding(urlPath, panel, 'P3', 'seo', 'Missing or empty meta description');
    }
    if (panel === 'public' && domData.h1Elements.length === 0) {
      addFinding(urlPath, panel, 'P3', 'seo', 'Page has no <h1> heading');
    }

    if (domData.deadLinks.length > 0) {
      addFinding(urlPath, panel, 'P2', 'link', `Found ${domData.deadLinks.length} dead link(s) (href="#" or empty)`, undefined, domData.deadLinks.join(', '));
    }

    if (domData.brokenImages.length > 0) {
      addFinding(urlPath, panel, 'P2', 'visual', `Found ${domData.brokenImages.length} broken image(s)`, undefined, domData.brokenImages.join(', '));
    }

    if (domData.emptyHeadings.length > 0) {
      addFinding(urlPath, panel, 'P3', 'content', `Found empty heading element(s): ${domData.emptyHeadings.join(', ')}`);
    }

    if (domData.placeholderMatches.length > 0) {
      addFinding(urlPath, panel, 'P2', 'content', `Found placeholder/dummy content: ${domData.placeholderMatches[0]}`, undefined, domData.placeholderMatches.join(' | '));
    }

    if (domData.isOverflowing) {
      addFinding(urlPath, panel, 'P2', 'responsive', `Horizontal overflow detected (scrollWidth ${domData.docWidth}px > window ${domData.winWidth}px)`);
    }

  } catch (err: any) {
    addFinding(urlPath, panel, 'P1', 'functional', `Failed to audit route: ${err.message || String(err)}`);
  } finally {
    page.off('console', consoleHandler);
    page.off('pageerror', pageErrorHandler);
  }
}

async function runFullSiteAudit() {
  console.log('=== CHAKRI SHEBA FULL SITE COMPREHENSIVE AUDIT ===');
  const baseUrl = 'http://localhost:3000';
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  console.log(`\n--- 1. AUDITING PUBLIC ROUTES (${PUBLIC_ROUTES.length} routes) ---`);
  const publicContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 ChakriShebaSpider/2.0'
  });
  const publicPage = await publicContext.newPage();

  for (let i = 0; i < PUBLIC_ROUTES.length; i++) {
    const route = PUBLIC_ROUTES[i];
    process.stdout.write(`[${i + 1}/${PUBLIC_ROUTES.length}] ${route} ... `);
    await auditPage(publicPage, route, 'public', `${baseUrl}${route}`);
    console.log('DONE');
  }
  await publicContext.close();

  console.log(`\n--- 2. AUDITING USER PANEL ROUTES (${USER_ROUTES.length} routes) ---`);
  const userContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 ChakriShebaSpider/2.0'
  });
  await userContext.addCookies([
    { name: 'session_token', value: 'SYNTH-USR-DHAKA-001', domain: 'localhost', path: '/' },
    { name: 'cs_session_token', value: 'SYNTH-USR-DHAKA-001', domain: 'localhost', path: '/' }
  ]);
  const userPage = await userContext.newPage();

  for (let i = 0; i < USER_ROUTES.length; i++) {
    const route = USER_ROUTES[i];
    process.stdout.write(`[${i + 1}/${USER_ROUTES.length}] ${route} ... `);
    await auditPage(userPage, route, 'user', `${baseUrl}${route}`);
    console.log('DONE');
  }
  await userContext.close();

  console.log(`\n--- 3. AUDITING ADMIN PANEL TABS (${ADMIN_TABS.length} tabs) ---`);
  const adminContext = await browser.newContext({
    extraHTTPHeaders: { 'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026' },
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 ChakriShebaSpider/2.0'
  });
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
  await adminPage.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
  });
  await adminPage.reload({ waitUntil: 'domcontentloaded' });
  await adminPage.waitForTimeout(600);

  for (let i = 0; i < ADMIN_TABS.length; i++) {
    const tab = ADMIN_TABS[i];
    const route = `/admin?tab=${tab}`;
    process.stdout.write(`[${i + 1}/${ADMIN_TABS.length}] Admin Tab: ${tab} ... `);
    await auditPage(adminPage, route, 'admin', `${baseUrl}${route}`);
    console.log('DONE');
  }
  await adminContext.close();

  console.log('\n--- 4. AUDITING RESPONSIVE VIEWPORTS (Mobile & Tablet) ---');
  const keyResponsiveRoutes = [
    '/',
    '/jobs',
    '/jobs/job-877477',
    '/apply/job-877477',
    '/categories',
    '/dashboard',
    '/dashboard/applications',
    '/admin?tab=dashboard',
    '/admin?tab=jobs'
  ];

  const viewports = [
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  for (const vp of viewports) {
    const vpContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 ChakriShebaSpider/2.0'
    });
    await vpContext.addCookies([
      { name: 'session_token', value: 'SYNTH-USR-DHAKA-001', domain: 'localhost', path: '/' },
      { name: 'cs_session_token', value: 'SYNTH-USR-DHAKA-001', domain: 'localhost', path: '/' }
    ]);
    const vpPage = await vpContext.newPage();

    for (const r of keyResponsiveRoutes) {
      if (r.startsWith('/admin')) {
        await vpPage.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
        await vpPage.evaluate(() => localStorage.setItem('cs_admin_auth', 'verified'));
      }
      await vpPage.goto(`${baseUrl}${r}`, { waitUntil: 'domcontentloaded' });
      await vpPage.waitForTimeout(300);

      const isOverflowing = await vpPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });

      if (isOverflowing) {
        addFinding(r, r.startsWith('/admin') ? 'admin' : (r.startsWith('/dashboard') ? 'user' : 'public'), 'P2', 'responsive', `Horizontal overflow on ${vp.name} (${vp.width}px) viewport`);
      }
    }
    await vpContext.close();
  }

  await browser.close();

  console.log('\n=== AUDIT COMPLETE ===');
  console.log(`Total Findings: ${findings.length}`);
  const summary: Record<string, number> = {};
  for (const f of findings) {
    summary[`${f.severity}-${f.category}`] = (summary[`${f.severity}-${f.category}`] || 0) + 1;
  }
  console.log('Findings Summary by Severity & Category:', summary);

  fs.writeFileSync(
    'C:/Users/Leon Rahman/Documents/chakri-sheba/scripts/live_audit_results.json',
    JSON.stringify(findings, null, 2),
    'utf8'
  );
  console.log('Results written to scripts/live_audit_results.json');
}

runFullSiteAudit().catch(err => {
  console.error('Audit run error:', err);
  process.exit(1);
});
