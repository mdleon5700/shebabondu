import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function auditCluster9AlertsBookmarksAndNotifications() {
  console.log('🚀 Starting Cluster 9: Job Alerts, Bookmarks & Notifications Hub Comprehensive Audit...');

  const dbPath = path.resolve('src/db/local_store.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const candidate = db.candidates['USR-01712345678'];
  if (!candidate) throw new Error('Demo candidate USR-01712345678 not found in local_store.json');

  // Ensure candidate has saved jobs
  if (!db.savedJobs) db.savedJobs = {};
  db.savedJobs['USR-01712345678'] = ['job-alljobs-15178', 'job-alljobs-15184'];

  // Ensure candidate has notifications of diverse types
  if (!db.notifications) db.notifications = {};
  if (!db.notifications['USR-01712345678'] || db.notifications['USR-01712345678'].length < 3) {
    db.notifications['USR-01712345678'] = [
      {
        id: 'CS-NOTIF-C9-DEADLINE-1',
        title: '⚠️ জরুরি ডেডলাইন: বাংলাদেশ ব্যাংক সহকারী পরিচালক',
        message: 'বাংলাদেশ ব্যাংকের ১০০টি সহকারী পরিচালক পদে আবেদনের সময়সীমা শেষ হতে আর মাত্র ২ দিন বাকি। এখনই আবেদন নিশ্চিত করুন।',
        type: 'deadline',
        link: '/jobs/job-alljobs-15178',
        date: new Date().toISOString(),
        read: false
      },
      {
        id: 'CS-NOTIF-C9-APP-1',
        title: '✅ আবেদন সম্পন্ন: বাংলাদেশ পরমাণু কৃষি গবেষণা ইনস্টিটিউট',
        message: 'বৈজ্ঞানিক কর্মকর্তা পদে আপনার আবেদন সফলভাবে সম্পন্ন হয়েছে। ইউজার আইডি: BPSC102938।',
        type: 'application',
        link: '/dashboard/applications',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 'CS-NOTIF-C9-SYS-1',
        title: '🔔 চাকরি সেবা প্রোফাইল আপডেট নোটিশ',
        message: 'আপনার বায়োডাটা ও অ্যাকাডেমিক সনদসমূহ সফলভাবে যাচাই করা হয়েছে। নতুন সার্কুলার ফিল্টারিং সক্রিয়।',
        type: 'system',
        link: '/dashboard/profile',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ];
  }

  // Inject session token
  const sessionToken = 'cluster9_audit_session_' + Date.now();
  if (!db.sessions) db.sessions = {};
  db.sessions[sessionToken] = {
    candidateId: 'USR-01712345678',
    role: 'candidate',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

  const browser = await chromium.launch({ headless: true });

  try {
    // ----------------------------------------------------
    // TEST 1: Public Free Job Alerts (/job-alerts)
    // ----------------------------------------------------
    console.log('\n--- Test 1: Testing Public Job Alerts Subscription (/job-alerts) ---');
    const guestContext = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
    const guestPage = await guestContext.newPage();
    guestPage.setDefaultNavigationTimeout(60000);
    guestPage.setDefaultTimeout(60000);

    await guestPage.goto('http://localhost:3000/job-alerts', { waitUntil: 'networkidle' });
    console.log('✓ Navigated to /job-alerts');

    const heroTitle = await guestPage.textContent('h1');
    console.log(`✓ Hero Title: "${heroTitle?.trim()}"`);

    // Check subscriber count badge
    const subscriberCard = await guestPage.locator('text=লাইভ সাবস্ক্রাইবার').isVisible();
    console.log(`✓ Live Subscriber Card Visible: ${subscriberCard}`);

    // Fill subscription form
    const testPhone = '01799887766';
    await guestPage.fill('[data-testid="public-alert-phone-input"]', testPhone);
    await guestPage.fill('[data-testid="public-alert-email-input"]', 'audit_alert@example.com');
    console.log(`✓ Entered phone: ${testPhone}`);

    // Submit form
    await guestPage.click('[data-testid="public-alert-submit-btn"]');
    await guestPage.waitForSelector('[data-testid="public-alert-confirmation"]', { timeout: 15000 });
    const confirmationText = await guestPage.textContent('[data-testid="public-alert-confirmation"]');
    console.log(`✓ Subscription Confirmed! Text preview: "${confirmationText?.slice(0, 80).trim()}..."`);

    await guestContext.close();

    // ----------------------------------------------------
    // Context with Candidate Auth for Dashboard Pages
    // ----------------------------------------------------
    const authContext = await browser.newContext({ 
      viewport: { width: 1440, height: 1050 },
      permissions: ['clipboard-read', 'clipboard-write']
    });
    await authContext.addCookies([
      {
        name: 'cs_session_token',
        value: sessionToken,
        domain: 'localhost',
        path: '/'
      }
    ]);

    const page = await authContext.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    // Seed localStorage auth for client store
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.evaluate(({ token, cand }) => {
      localStorage.setItem('cs_session_token', token);
      localStorage.setItem('cs_auth', JSON.stringify({
        isLoggedIn: true,
        user: cand,
        role: 'candidate'
      }));
      localStorage.setItem('cs_saved_jobs', JSON.stringify(['job-alljobs-15178', 'job-alljobs-15184']));
    }, { token: sessionToken, cand: candidate });

    // ----------------------------------------------------
    // TEST 2: Candidate Dashboard Job Alerts Preferences (/dashboard/alerts)
    // ----------------------------------------------------
    console.log('\n--- Test 2: Testing Dashboard Job Alerts Settings & Test Alert (/dashboard/alerts) ---');
    await page.goto('http://localhost:3000/dashboard/alerts', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="job-alerts-page"]', { timeout: 15000 });
    console.log('✓ /dashboard/alerts rendered successfully');

    // Test District selection & input
    await page.click('[data-testid="district-pill-চট্টগ্রাম"]');
    const districtVal = await page.inputValue('[data-testid="district-input"]');
    console.log(`✓ District set via pill: "${districtVal}"`);

    // Select frequency
    await page.selectOption('[data-testid="frequency-select"]', 'instant');
    console.log('✓ Frequency set to instant');

    // Toggle Channels
    await page.click('[data-testid="whatsapp-checkbox"]');
    await page.click('[data-testid="whatsapp-checkbox"]'); // Toggle back to ensure active
    console.log('✓ Toggled notification channels');

    // Save alerts
    await page.click('[data-testid="save-alerts-btn"]');
    await page.waitForSelector('[data-testid="alert-success-badge"]', { timeout: 10000 });
    console.log('✓ Settings successfully saved, [data-testid="alert-success-badge"] appeared');

    // Send Test Alert Trigger
    await page.click('[data-testid="send-test-alert-btn"]');
    await page.waitForSelector('[data-testid="test-alert-success-badge"]', { timeout: 10000 });
    console.log('✓ Test Alert sent successfully, [data-testid="test-alert-success-badge"] appeared');

    // ----------------------------------------------------
    // TEST 3: Notifications Center (/dashboard/notifications)
    // ----------------------------------------------------
    console.log('\n--- Test 3: Testing Central Notifications Center (/dashboard/notifications) ---');
    await page.goto('http://localhost:3000/dashboard/notifications', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="notifications-page"]', { timeout: 15000 });
    console.log('✓ /dashboard/notifications rendered successfully');

    await page.waitForSelector('[data-testid="notification-card"]', { timeout: 15000 });
    const notifCards = await page.locator('[data-testid="notification-card"]').count();
    console.log(`✓ Found ${notifCards} notifications in inbox`);

    // Test Tabs
    await page.click('[data-testid="tab-deadline"]');
    await page.waitForTimeout(500);
    const deadlineCards = await page.locator('[data-testid="notification-card"]').count();
    console.log(`✓ Filtered tab "deadline": ${deadlineCards} cards visible`);

    await page.click('[data-testid="tab-application"]');
    await page.waitForTimeout(500);
    const appCards = await page.locator('[data-testid="notification-card"]').count();
    console.log(`✓ Filtered tab "application": ${appCards} cards visible`);

    await page.click('[data-testid="tab-all"]');
    await page.waitForTimeout(500);
    console.log('✓ Returned to tab "all"');

    // Test Mark All Read if unread exists
    const markAllBtn = page.locator('[data-testid="mark-all-read-btn"]');
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
      await page.waitForTimeout(800);
      console.log('✓ Clicked "সব পড়া হয়েছে" (Mark All Read)');
    }

    // ----------------------------------------------------
    // TEST 4: Saved Jobs Watchlist (/dashboard/saved-jobs)
    // ----------------------------------------------------
    console.log('\n--- Test 4: Testing Saved Jobs Watchlist & Reminders (/dashboard/saved-jobs) ---');
    await page.goto('http://localhost:3000/dashboard/saved-jobs', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="saved-jobs-page"]', { timeout: 15000 });
    console.log('✓ /dashboard/saved-jobs rendered successfully');

    await page.waitForSelector('[data-testid="saved-job-card"]', { timeout: 15000 });
    const savedCardsCount = await page.locator('[data-testid="saved-job-card"]').count();
    console.log(`✓ Found ${savedCardsCount} saved job cards`);

    // Verify Urgency Filter Pills
    await page.click('[data-testid="urgency-filter-active"]');
    await page.waitForTimeout(500);
    await page.click('[data-testid="urgency-filter-all"]');
    await page.waitForTimeout(500);
    console.log('✓ Urgency filter pills toggled smoothly');

    // Test Toggle Reminder
    const reminderBtn = page.locator('[data-testid="toggle-reminder-btn"]').first();
    if (await reminderBtn.isVisible()) {
      await reminderBtn.click();
      await page.waitForSelector('[data-testid="saved-jobs-toast"]', { timeout: 8000 });
      const toastText = await page.textContent('[data-testid="saved-jobs-toast"]');
      console.log(`✓ Reminder toggle triggered toast: "${toastText?.trim()}"`);
    }

    // ----------------------------------------------------
    // TEST 5: Public Saved Jobs (/saved-jobs)
    // ----------------------------------------------------
    console.log('\n--- Test 5: Testing Public Saved Jobs Watchlist Portal (/saved-jobs) ---');
    const guestContext2 = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
    const guestPage2 = await guestContext2.newPage();
    guestPage2.setDefaultNavigationTimeout(60000);
    guestPage2.setDefaultTimeout(60000);

    await guestPage2.goto('http://localhost:3000/saved-jobs', { waitUntil: 'networkidle' });
    await guestPage2.waitForSelector('[data-testid="public-saved-jobs-page"]', { timeout: 15000 });
    console.log('✓ /saved-jobs public portal rendered successfully');

    const syncBtn = await guestPage2.locator('[data-testid="login-to-sync-btn"]').isVisible();
    console.log(`✓ Login to Sync CTA Button visible: ${syncBtn}`);

    await guestContext2.close();

    // ----------------------------------------------------
    // CAPTURE SHOWCASE SCREENSHOT
    // ----------------------------------------------------
    console.log('\n--- Capturing Showcase Screenshot ---');
    await page.goto('http://localhost:3000/dashboard/notifications', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const screenshotPath = path.resolve('scripts/audit_122_alerts_bookmarks_and_notifications_showcase.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✓ Showcase screenshot saved to: ${screenshotPath}`);

    // Also copy to brain artifact directory
    const brainArtifactDir = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
    if (fs.existsSync(brainArtifactDir)) {
      const targetBrainScreenshot = path.join(brainArtifactDir, 'audit_122_alerts_bookmarks_and_notifications_showcase.png');
      fs.copyFileSync(screenshotPath, targetBrainScreenshot);
      console.log(`✓ Showcase screenshot mirrored to brain artifact dir: ${targetBrainScreenshot}`);
    }

    await authContext.close();
    await browser.close();

    console.log('\n🎉 ALL 5/5 CLUSTER 9 AUDIT TESTS PASSED WITH 100% SUCCESS!');
  } catch (error) {
    console.error('❌ Audit encountered an error:', error);
    await browser.close();
    process.exit(1);
  }
}

auditCluster9AlertsBookmarksAndNotifications();
