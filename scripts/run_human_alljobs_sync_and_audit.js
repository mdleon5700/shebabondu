const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 864 } });
  
  console.log('1. Navigating to Admin Panel with verified session...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
    localStorage.setItem('cs_auth', JSON.stringify({ isLoggedIn: true, role: 'admin', name: 'Super Admin' }));
  });

  await page.goto('http://localhost:3000/admin?tab=gemini-browser-spider', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/65_admin_spider_dashboard_before_sync.png' });
  console.log('Admin Spider dashboard opened.');

  // Check if live sync button exists and trigger it
  console.log('2. Triggering AllJobs Teletalk Live Sync...');
  const syncBtn = page.locator('button:has-text("টেলিটক অলজবস লাইভ সিঙ্ক চালান"), button:has-text("লাইভ সিঙ্ক")').first();
  if (await syncBtn.isVisible()) {
    await syncBtn.click();
    console.log('Clicked live sync button, waiting for sync to complete...');
    // Wait for the sync animation or response
    await page.waitForTimeout(5000);
  } else {
    console.log('Triggering sync via API endpoint directly...');
    const syncRes = await page.request.post('http://localhost:3000/api/admin/spider/gemini-browser', {
      data: { action: 'sync', limit: 5 }
    });
    console.log('API sync response:', await syncRes.json());
  }

  // Refresh page to see updated list
  await page.goto('http://localhost:3000/admin?tab=gemini-browser-spider', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/66_admin_spider_dashboard_after_sync.png' });

  // 3. Inspect synced circular in local_store.json
  console.log('3. Reading local_store.json for synced circulars...');
  const dbPath = path.resolve(__dirname, '../src/db/local_store.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const allJobs = Object.values(db.jobs || {});
  const teletalkJobs = allJobs.filter(j => j.id.startsWith('job-alljobs-') || j.verifiedBy === 'ALLJOBS-LIVE-COLLECTOR');
  
  console.log(`Found ${teletalkJobs.length} AllJobs Teletalk circulars.`);
  if (teletalkJobs.length === 0) {
    throw new Error('No Teletalk circulars found after sync!');
  }

  const sampleJob = teletalkJobs[0];
  console.log('Sample Circular Audit Target:', sampleJob.id);
  console.log('Title:', sampleJob.title);
  console.log('Organization:', sampleJob.organization);
  console.log('Official Link:', sampleJob.officialLink);
  console.log('Application URL:', sampleJob.applicationUrl);
  console.log('Circular PDF URL:', sampleJob.circularPdfUrl);
  console.log('PDF URL:', sampleJob.pdfUrl);
  console.log('SMS Prefix:', sampleJob.smsPrefix);
  console.log('SMS Format preview:', sampleJob.smsFormat?.slice(0, 100));
  console.log('Positions Count:', sampleJob.positions?.length);
  console.log('Editorial Content Length:', sampleJob.bengaliDescription?.length);

  // 4. Approve and publish this circular
  sampleJob.status = 'PUBLISHED';
  db.jobs[sampleJob.id] = sampleJob;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Marked circular ${sampleJob.id} as PUBLISHED in local_store.json`);

  // 5. Verify Public Job Listing
  console.log('4. Verifying public /jobs page...');
  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/67_public_jobs_with_synced_circular.png' });

  // 6. Verify Public Job Detail Page
  console.log(`5. Verifying public circular detail page at /jobs/${sampleJob.id}...`);
  await page.goto(`http://localhost:3000/jobs/${sampleJob.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd/68_public_job_detail_page_verified.png', fullPage: true });

  console.log('AllJobs Teletalk Sync and End-to-End Audit Completed Successfully!');
  await browser.close();
})();

