const http = require('http');
const https = require('https');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function requestJson(url, options = {}, body = null) {
  const isHttps = url.startsWith('https://');
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('🔍 AUDITING LIVE NEWS JOBS AUTO SCANNING SYSTEM');
  console.log('====================================================');

  // Step 1: Admin API Endpoint Health
  console.log('\n[Phase 1] Testing /api/admin/spider/gemini-browser with Admin Auth...');
  const statusRes = await requestJson('http://localhost:3000/api/admin/spider/gemini-browser', {
    method: 'GET',
    headers: {
      'x-admin-secret': '1234',
      'Content-Type': 'application/json'
    }
  });

  console.log('HTTP Status:', statusRes.status);
  console.log('API Success:', statusRes.data?.success);
  console.log('Current Total Jobs in System:', statusRes.data?.totalJobs);
  console.log('Alljobs Synced Count:', statusRes.data?.alljobsSyncedCount);
  console.log('Spider Capabilities:', statusRes.data?.features);

  // Step 2: Testing Job Sources Registry API
  console.log('\n[Phase 2] Checking Registered Job Sources (/api/admin/sources)...');
  const sourcesRes = await requestJson('http://localhost:3000/api/admin/sources', {
    method: 'GET',
    headers: {
      'x-admin-secret': '1234',
      'Content-Type': 'application/json'
    }
  });

  console.log('Sources HTTP Status:', sourcesRes.status);
  if (sourcesRes.data?.sources) {
    console.log(`Found ${sourcesRes.data.sources.length} registered sources:`);
    sourcesRes.data.sources.forEach(s => {
      console.log(` - [${s.id}] ${s.name} (${s.sourceUrl}) -> Method: ${s.collectionMethod}, Status: ${s.healthStatus || 'healthy'}`);
    });
  }

  // Step 3: Triggering Live Sync via Collector for 2 organizations
  console.log('\n[Phase 3] Triggering Live Sync (Limit 2 Orgs from Teletalk Alljobs)...');
  const syncRes = await requestJson('http://localhost:3000/api/admin/spider/gemini-browser', {
    method: 'POST',
    headers: {
      'x-admin-secret': '1234',
      'Content-Type': 'application/json'
    }
  }, { action: 'sync', limit: 2 });

  console.log('Sync HTTP Status:', syncRes.status);
  console.log('Sync Message:', syncRes.data?.message);
  console.log('Sync Stats:', syncRes.data?.stats);

  // Step 4: Verify synced jobs exist in public jobs list
  console.log('\n[Phase 4] Verifying Newly Synced Jobs on Public API /api/jobs...');
  const publicJobsRes = await requestJson('http://localhost:3000/api/jobs');
  const jobList = publicJobsRes.data?.jobs || [];
  const alljobsInPublic = jobList.filter(j => j.id.includes('alljobs') || j.source === 'Alljobs Teletalk');
  console.log(`Total Public Jobs: ${jobList.length}`);
  console.log(`Alljobs Teletalk Live Jobs in Public List: ${alljobsInPublic.length}`);
  if (alljobsInPublic.length > 0) {
    console.log('Sample Live Synced Job:');
    console.log('  ID:', alljobsInPublic[0].id);
    console.log('  Title:', alljobsInPublic[0].title);
    console.log('  Organization:', alljobsInPublic[0].organization);
    console.log('  Category:', alljobsInPublic[0].categoryLabel);
    console.log('  Total Posts:', alljobsInPublic[0].totalPosts);
    console.log('  Deadline:', alljobsInPublic[0].deadline);
    console.log('  Official Link:', alljobsInPublic[0].officialLink);
  }

  // Step 5: Headless Browser QA of Admin Spider Hub
  console.log('\n[Phase 5] Headless Browser Audit of Admin Console Spider Hub UI...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  await context.addCookies([
    {
      name: 'cs_session_token',
      value: 'mock-admin-session-token',
      domain: 'localhost',
      path: '/'
    }
  ]);
  const page = await context.newPage();
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
  });

  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // If still locked for any reason, submit pin
  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.count() > 0 && await pinInput.isVisible()) {
    await pinInput.fill('1234');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
  }

  // Click on the Spider / Scraping module in Admin Sidebar
  const spiderNav = page.locator('button:has-text("লাইভ ব্রাউজার"), button:has-text("এজেন্ট হাব"), button:has-text("স্পাইডার")').first();
  if (await spiderNav.count() > 0) {
    await spiderNav.click();
    await page.waitForTimeout(2000);
  }

  const artifactDir = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';
  await page.screenshot({ path: path.join(artifactDir, '23_admin_spider_hub_live_audit.png'), fullPage: false });
  console.log('Captured screenshot: 23_admin_spider_hub_live_audit.png');

  // Also switch to Source Monitoring Tab
  const sourceTab = page.locator('button:has-text("সোর্স স্ক্র্যাপার"), button:has-text("সোর্স মনিটরিং")').first();
  if (await sourceTab.count() > 0) {
    await sourceTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(artifactDir, '24_admin_source_registry_live_audit.png'), fullPage: false });
    console.log('Captured screenshot: 24_admin_source_registry_live_audit.png');
  }

  // Also navigate to public jobs page to capture live circular
  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(artifactDir, '25_public_jobs_with_synced_alljobs.png'), fullPage: false });
  console.log('Captured screenshot: 25_public_jobs_with_synced_alljobs.png');

  await browser.close();
  console.log('\n✅ Audit Finished Successfully!');
}

runAudit().catch(err => {
  console.error('Audit Error:', err);
  process.exit(1);
});
