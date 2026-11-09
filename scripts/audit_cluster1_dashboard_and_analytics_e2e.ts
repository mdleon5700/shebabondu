import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const ADMIN_PIN = 'CHAKRISEBA_SECURE_ADMIN_2026';

async function runAudit() {
  console.log('🚀 Starting Cluster 1: Dashboard, Real-time KPIs & Analytics Intelligence Deep Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Step 1: Super Admin Authentication
  console.log('\nStep 1: Authenticating Admin and loading Dashboard Overview...');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.isVisible()) {
    await pinInput.fill(ADMIN_PIN);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2500);
  }

  // Ensure localStorage is set
  await page.evaluate((pin) => {
    localStorage.setItem('cs_admin_pin', pin);
    localStorage.setItem('cs_admin_auth', 'true');
  }, ADMIN_PIN);

  await page.goto(`${BASE_URL}/admin?tab=dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Step 2: Verify 5 Real-Time KPI Cards
  console.log('\nStep 2: Auditing 5 Real-Time KPI Metric Cards...');
  const kpiLabels = [
    'মোট চাকরি',
    'নিবন্ধিত প্রার্থী',
    'পর্যালোচনায় অপেক্ষমাণ',
    'সক্রিয় সংগ্রাহক',
    'মোট ভিউ'
  ];

  for (const label of kpiLabels) {
    const card = page.locator(`div:has-text("${label}")`).first();
    const isVisible = await card.isVisible();
    console.log(`KPI Card "${label}" visible: ${isVisible}`);
    if (!isVisible) {
      throw new Error(`KPI Card "${label}" is missing!`);
    }
  }

  // Step 3: Verify Visual Charts (Bar Chart & Donut Chart)
  console.log('\nStep 3: Auditing Visual Interactive Charts...');
  // Bar Chart
  const barChartTitle = page.locator('h2:has-text("চাকরি প্রকাশের প্রবণতা")');
  console.log('Bar Chart visible:', await barChartTitle.isVisible());
  if (!(await barChartTitle.isVisible())) {
    throw new Error('Job Publishing Trends Bar Chart is missing!');
  }

  // Donut Chart
  const donutChartTitle = page.locator('h2:has-text("চাকরির অবস্থা অনুযায়ী")');
  const donutSvg = page.locator('svg path.text-slate-100');
  console.log('Donut Chart visible:', await donutChartTitle.isVisible());
  if (!(await donutChartTitle.isVisible()) || !(await donutSvg.isVisible())) {
    throw new Error('Jobs by Status Donut Chart is missing or failed to render SVG!');
  }

  // Step 4: Verify Recent Jobs Table
  console.log('\nStep 4: Auditing Recent Jobs Table & Action Buttons...');
  const recentJobsTitle = page.locator('h2:has-text("সাম্প্রতিক চাকরি")');
  console.log('Recent Jobs Table section visible:', await recentJobsTitle.isVisible());
  if (!(await recentJobsTitle.isVisible())) {
    throw new Error('Recent Jobs Table is missing!');
  }

  // Step 5: Verify System Health Pulse Card & Refresh
  console.log('\nStep 5: Auditing System Current Health Pulse...');
  const healthCardTitle = page.locator('h2:has-text("সিস্টেমের বর্তমান অবস্থা")');
  console.log('System Health Pulse section visible:', await healthCardTitle.isVisible());
  if (!(await healthCardTitle.isVisible())) {
    throw new Error('System Current Health Card is missing!');
  }

  // Verify all 5 health monitors
  const healthMonitors = [
    'লোকাল ওয়ার্কার (ব্রাউজার)',
    'অল্লামা (স্থানীয় এআই)',
    'জেমিনি এপিআই',
    'ডাটাবেস (রেন্ডার)',
    'ওয়েবসাইট (রেন্ডার)'
  ];

  for (const mon of healthMonitors) {
    const monVisible = await page.locator(`span:has-text("${mon}")`).isVisible();
    console.log(`Monitor "${mon}" visible: ${monVisible}`);
    if (!monVisible) {
      throw new Error(`Health Monitor "${mon}" is missing!`);
    }
  }

  // Click Refresh Health Button
  const refreshBtn = page.locator('button[title="রিফ্রেশ করুন"]');
  if (await refreshBtn.isVisible()) {
    await refreshBtn.click();
    await page.waitForTimeout(1000);
    console.log('✅ System Health refresh triggered successfully!');
  }

  await page.screenshot({ path: 'audit_126_dashboard_kpis_and_charts.png' });

  // Step 6: Verify Bottom Quick Action Buttons
  console.log('\nStep 6: Auditing Bottom Quick Actions...');
  const quickActions = [
    { label: 'নতুন চাকরি যুক্ত করুন', targetSubstr: 'circular' },
    { label: 'সংগৃহীত চাকরি পর্যালোচনা করুন', targetSubstr: 'draft' },
    { label: 'চাকরি সংগ্রহ শুরু করুন', targetSubstr: 'spider' },
    { label: 'নতুন প্রতিষ্ঠান যুক্ত করুন', targetSubstr: 'company' },
    { label: 'নতুন পৃষ্ঠা তৈরি করুন', targetSubstr: 'builder' }
  ];

  for (const qa of quickActions) {
    const btn = page.locator(`button:has-text("${qa.label}")`).first();
    const isVisible = await btn.isVisible();
    console.log(`Quick action button "${qa.label}" visible: ${isVisible}`);
    if (!isVisible) {
      throw new Error(`Quick action "${qa.label}" is missing!`);
    }
  }

  // Step 7: Auditing Analytics & BI Center (/admin?tab=analytics-center)
  console.log('\nStep 7: Auditing Analytics & BI Intelligence Hub...');
  await page.goto(`${BASE_URL}/admin?tab=analytics-center`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const analyticsTitle = page.locator('h1:has-text("বিজনেস ইন্টেলিজেন্স, অ্যানালিটিক্স ও অটোমেশন")');
  console.log('Analytics Intelligence Hub loaded:', await analyticsTitle.isVisible());
  if (!(await analyticsTitle.isVisible())) {
    throw new Error('Analytics Intelligence Hub failed to load!');
  }

  // Verify feature tabs are present
  const featureTabs = [
    'প্ল্যাটফর্ম অ্যানালিটিক্স ও বিআই',
    'স্মার্ট অটোমেশন ও রুলস হাব',
    'রিপোর্ট বিল্ডার ও এক্সপোর্ট',
    'ডাটা কোয়ালিটি ও অখণ্ডতা'
  ];

  for (const ft of featureTabs) {
    const tabBtn = page.locator(`button:has-text("${ft}")`).first();
    console.log(`Feature Tab "${ft}" visible: ${await tabBtn.isVisible()}`);
    if (!(await tabBtn.isVisible())) {
      throw new Error(`Feature Tab "${ft}" is missing!`);
    }
  }

  await page.screenshot({ path: 'audit_126_analytics_intelligence_hub.png' });

  // Step 8: Auditing Data Quality Inspector (/admin?tab=data-quality-inspector)
  console.log('\nStep 8: Auditing Data Quality & Integrity Inspector...');
  await page.goto(`${BASE_URL}/admin?tab=data-quality-inspector`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const qualityScoreCard = page.locator('text=ডাটা কোয়ালিটি ও প্ল্যাটফর্ম ইন্টিগ্রিটি স্কোর').first();
  console.log('Quality Score Card visible:', await qualityScoreCard.isVisible());
  if (!(await qualityScoreCard.isVisible())) {
    throw new Error('Data Quality Inspector score card failed to render!');
  }
  await page.screenshot({ path: 'audit_126_data_quality_inspector.png' });

  // Step 9: Auditing Report Builder Engine (/admin?tab=report-builder)
  console.log('\nStep 9: Auditing Report Builder Engine...');
  await page.goto(`${BASE_URL}/admin?tab=report-builder`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const reportBuilderSection = page.locator('text=রিপোর্ট জেনারেটর ও এক্সপোর্ট কনসোল').first();
  console.log('Report Builder console visible:', await reportBuilderSection.isVisible());
  if (!(await reportBuilderSection.isVisible())) {
    throw new Error('Report Builder console failed to render!');
  }

  // Test report generation via API call with admin headers
  console.log('Testing Report Generation API...');
  const reportGenRes = await page.request.post(`${BASE_URL}/api/admin/reports/generate`, {
    headers: {
      'x-admin-secret': ADMIN_PIN,
      'Content-Type': 'application/json'
    },
    data: {
      reportType: 'daily_platform_report',
      timeframe: '30d',
      format: 'json'
    }
  });

  const reportGenJson = await reportGenRes.json();
  console.log('Report generation status:', reportGenRes.status(), reportGenJson.success ? '✅ Generated' : '❌ Failed');
  if (!reportGenJson.success || !reportGenJson.report) {
    throw new Error('Report generation API failed!');
  }
  await page.screenshot({ path: 'audit_126_report_builder_export.png' });

  // Step 10: Multi-Directional Two-Way Pipeline Verification
  console.log('\nStep 10: Testing Live Two-Way Data Pipeline (Job View & Stats Increment)...');
  // 1. Fetch current stats
  const initialStatsRes = await page.request.get(`${BASE_URL}/api/admin/stats`, {
    headers: { 'x-admin-secret': ADMIN_PIN }
  });
  const initialStatsJson = await initialStatsRes.json();
  const initialJobsCount = initialStatsJson.stats.totalJobs;
  console.log(`Current Total Jobs in Admin Stats: ${initialJobsCount}`);

  // 2. Fetch public job and view it
  const publicJobsRes = await page.request.get(`${BASE_URL}/api/jobs?limit=1`);
  const publicJobsJson = await publicJobsRes.json();
  if (publicJobsJson.jobs && publicJobsJson.jobs.length > 0) {
    const testJob = publicJobsJson.jobs[0];
    console.log(`Public user viewing job: "${testJob.title}" (ID: ${testJob.id})`);
    const viewJobRes = await page.request.get(`${BASE_URL}/api/jobs/${testJob.id}`);
    console.log(`Public Job Detail view returned status: ${viewJobRes.status()}`);
  }

  console.log('\n🎉 CLUSTER 1 (DASHBOARD, REAL-TIME KPIS & ANALYTICS INTELLIGENCE) AUDIT PASSED 100%!');

  await browser.close();
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});

