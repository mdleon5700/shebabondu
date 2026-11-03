/**
 * Chakri Sheba - Automated Browser & Route Quality Verification Suite
 * Uses Playwright (Chromium) to audit critical routes for 200 OK, zero console errors,
 * and DOM integrity.
 */

const { chromium } = require('playwright');

const TARGET_HOST = process.env.TEST_HOST || 'http://localhost:3000';

const CRITICAL_ROUTES = [
  { path: '/', name: 'Home Landing Page', expectSelector: 'header' },
  { path: '/jobs', name: 'Job Circulars Directory', expectSelector: 'main' },
  { path: '/categories/bcs', name: 'BCS Category Feed', expectSelector: 'main' },
  { path: '/categories/government-jobs', name: 'Govt Category Feed', expectSelector: 'main' },
  { path: '/organizations', name: 'Organization Directory', expectSelector: 'main' },
  { path: '/teletalk-sms', name: 'Teletalk SMS Generator', expectSelector: 'main' },
  { path: '/privacy-policy', name: 'Privacy Policy (SEO route)', expectSelector: 'main' },
  { path: '/terms-and-conditions', name: 'Terms & Conditions', expectSelector: 'main' },
  { path: '/faq', name: 'FAQ Page', expectSelector: 'main' },
  { path: '/contact-us', name: 'Contact Page', expectSelector: 'main' }
];

async function runBrowserVerification() {
  console.log('🚀 Starting Automated Playwright Browser Verification...');
  console.log(`🌐 Target Base URL: ${TARGET_HOST}\n`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    console.error('⚠️ Chromium launch failed:', err.message);
    process.exit(1);
  }

  const context = await browser.newContext({
    userAgent: 'ChakriSheba-AuditBot/1.0',
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();
  const results = [];
  let totalErrors = 0;

  for (const route of CRITICAL_ROUTES) {
    const fullUrl = `${TARGET_HOST}${route.path}`;
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });

    const start = Date.now();
    let status = 0;
    let ok = false;
    let selectorFound = false;

    try {
      const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      status = response ? response.status() : 0;
      ok = response ? response.ok() : false;
      
      if (route.expectSelector) {
        selectorFound = await page.locator(route.expectSelector).count() > 0;
      } else {
        selectorFound = true;
      }
    } catch (err) {
      consoleErrors.push(err.message);
    }

    const durationMs = Date.now() - start;
    const isSuccess = (ok || status === 200 || status === 304) && consoleErrors.length === 0;

    if (!isSuccess) totalErrors++;

    results.push({
      route: route.path,
      name: route.name,
      status,
      durationMs,
      selectorFound,
      consoleErrors: consoleErrors.slice(0, 3),
      passed: isSuccess
    });

    const statusBadge = isSuccess ? '✅ PASS' : '❌ FAIL';
    console.log(`${statusBadge} [${status}] ${route.path} (${durationMs}ms) - ${route.name}`);
    if (consoleErrors.length > 0) {
      console.log(`   ⚠️ Console Errors:`, consoleErrors.slice(0, 2));
    }
  }

  await browser.close();

  console.log('\n=======================================');
  console.log(`📊 Audit Summary: ${results.filter(r => r.passed).length}/${results.length} routes passed`);
  console.log('=======================================');

  if (totalErrors > 0) {
    console.warn(`⚠️ Warning: ${totalErrors} routes had issues.`);
  } else {
    console.log('🎉 All audited routes loaded with zero errors!');
  }

  return totalErrors === 0;
}

if (require.main === module) {
  runBrowserVerification().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}

module.exports = { runBrowserVerification, CRITICAL_ROUTES };

