import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return 'scrypt$' + salt + '$' + hash;
}

async function auditCluster10SettingsAndSupport() {
  console.log('🚀 Starting Cluster 10: Settings & Support Comprehensive Audit...');

  const dbPath = path.resolve('src/db/local_store.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const candidate = db.candidates['USR-01712345678'];
  if (!candidate) throw new Error('Demo candidate USR-01712345678 not found in local_store.json');

  // Ensure candidate has a known passwordHash
  candidate.passwordHash = hashPassword('password123');

  // Inject session token
  const sessionToken = 'cluster10_audit_session_' + Date.now();
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
    // Context with Candidate Auth for Dashboard Settings
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
    }, { token: sessionToken, cand: candidate });

    // ----------------------------------------------------
    // TEST 1: Candidate Account Settings & Password Change (/dashboard/settings)
    // ----------------------------------------------------
    console.log('\n--- Test 1: Testing Account Settings, Device Security & Password Change (/dashboard/settings) ---');
    await page.goto('http://localhost:3000/dashboard/settings', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="settings-page"]', { timeout: 15000 });
    console.log('✓ /dashboard/settings rendered successfully');

    // Verify Session Info & GDPR Export cards
    const sessionCard = await page.locator('[data-testid="session-info-card"]').isVisible();
    const exportBtn = await page.locator('[data-testid="export-data-btn"]').isVisible();
    const logoutBtn = await page.locator('[data-testid="logout-btn"]').isVisible();
    console.log(`✓ Security Elements: Session Info Card (${sessionCard}), Export Button (${exportBtn}), Logout Button (${logoutBtn})`);

    // Perform password change
    await page.fill('[data-testid="current-password-input"]', 'password123');
    await page.fill('[data-testid="new-password-input"]', 'newsecret123');
    await page.fill('[data-testid="confirm-password-input"]', 'newsecret123');
    await page.click('[data-testid="change-password-submit-btn"]');

    await page.waitForSelector('[data-testid="password-success-badge"]', { timeout: 15000 });
    const successMsg = await page.textContent('[data-testid="password-success-badge"]');
    console.log(`✓ Password Change Success: "${successMsg?.trim()}"`);

    // Revert password back so demo candidate stays predictable
    await page.fill('[data-testid="current-password-input"]', 'newsecret123');
    await page.fill('[data-testid="new-password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="change-password-submit-btn"]');
    await page.waitForSelector('[data-testid="password-success-badge"]', { timeout: 15000 });
    console.log('✓ Reverted password cleanly back to demo default');

    // ----------------------------------------------------
    // TEST 2: Contact & Helpdesk Support Ticket Submission (/contact)
    // ----------------------------------------------------
    console.log('\n--- Test 2: Testing Helpdesk Support Ticket Submission (/contact) ---');
    await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });
    console.log('✓ /contact rendered successfully');

    // Enter ticket form details
    await page.fill('[data-testid="contact-name-input"]', 'মোঃ তানভীর হাসান');
    await page.fill('[data-testid="contact-phone-input"]', '01712345678');
    await page.fill('[data-testid="contact-email-input"]', 'audit_support@chakrisheba.com');
    await page.fill('[data-testid="contact-subject-input"]', 'টেলিটক চালান ও পেমেন্ট ভেরিফিকেশন সহায়তা');
    await page.fill('[data-testid="contact-message-input"]', 'আমার আবেদনের সরকারি চালান ফি পরিশোধ নিশ্চিতকরণ এবং অ্যাপ্লিক্যান্ট কপি ডাউনলোডের বিষয়ে সহায়তা প্রয়োজন।');

    await page.click('[data-testid="contact-submit-btn"]');
    await page.waitForSelector('[data-testid="contact-submit-success"]', { timeout: 15000 });

    const generatedTicketId = (await page.textContent('[data-testid="contact-ticket-id"]'))?.trim() || '';
    console.log(`✓ Support Ticket Created! Generated Ticket ID: "${generatedTicketId}"`);

    // ----------------------------------------------------
    // TEST 3: Support Ticket Self-Service Tracking (/contact?tab=track)
    // ----------------------------------------------------
    console.log('\n--- Test 3: Testing Support Ticket Live Tracking (/contact?tab=track) ---');
    await page.goto(`http://localhost:3000/contact?tab=track&ticketId=${encodeURIComponent(generatedTicketId)}`, { waitUntil: 'networkidle' });
    console.log(`✓ Opened tracking tab with ticket: ${generatedTicketId}`);

    // Click search if not auto-loaded
    await page.click('[data-testid="track-submit-btn"]');
    await page.waitForSelector('[data-testid="tracked-ticket-card"]', { timeout: 15000 });

    const ticketStatus = await page.textContent('[data-testid="ticket-status-badge"]');
    console.log(`✓ Ticket Found in Live Database! Status: "${ticketStatus?.trim()}"`);

    // ----------------------------------------------------
    // TEST 4: Fake Job / Circular Discrepancy Reporting (/report-a-job)
    // ----------------------------------------------------
    console.log('\n--- Test 4: Testing Fake Job & Circular Discrepancy Reporting (/report-a-job) ---');
    await page.goto('http://localhost:3000/report-a-job', { waitUntil: 'networkidle' });
    console.log('✓ /report-a-job rendered successfully');

    await page.fill('[data-testid="report-job-title-input"]', 'ভুয়া বাংলাদেশ রেলওয়ে খালাসী নিয়োগ ২০২৬');
    await page.fill('[data-testid="report-job-url-input"]', 'https://chakrisheba.com/jobs/fake-railway-scam-2026');
    await page.click('[data-testid="issue-option-fake_job"]');
    await page.fill('[data-testid="report-details-input"]', 'ফেসবুকে সরকারি বাংলাদেশ রেলওয়ের ভুয়া মনোগ্রাম ব্যবহার করে অবৈধ বিকাশ নম্বরে টাকা দাবি করা হচ্ছে। অবিলম্বে এটি ভেরিফাই করে প্রার্থীদের সতর্কবার্তা দেওয়ার অনুরোধ।');

    await page.click('[data-testid="report-submit-btn"]');
    await page.waitForSelector('[data-testid="report-submitted-card"]', { timeout: 15000 });

    const reportTrackingCode = (await page.textContent('[data-testid="report-tracking-code"]'))?.trim() || '';
    console.log(`✓ Circular Report Submitted! Generated Tracking Code: "${reportTrackingCode}"`);

    // ----------------------------------------------------
    // TEST 5: Circular Report Live Tracking (/report-a-job track tab)
    // ----------------------------------------------------
    console.log('\n--- Test 5: Testing Circular Report Live Tracking (/report-a-job) ---');
    await page.click('[data-testid="tab-report-track"]');
    await page.fill('[data-testid="report-track-input"]', reportTrackingCode);
    await page.click('[data-testid="report-track-submit-btn"]');

    await page.waitForSelector('[data-testid="report-track-result"]', { timeout: 15000 });
    const reportDetails = await page.textContent('[data-testid="report-track-result"]');
    console.log(`✓ Circular Report Tracking Verified! Content snippet: "${reportDetails?.slice(0, 100).trim()}..."`);

    // ----------------------------------------------------
    // CAPTURE SHOWCASE SCREENSHOT
    // ----------------------------------------------------
    console.log('\n--- Capturing Showcase Screenshot ---');
    await page.goto('http://localhost:3000/dashboard/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const screenshotPath = path.resolve('scripts/audit_123_settings_and_support_showcase.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✓ Showcase screenshot saved to: ${screenshotPath}`);

    // Also mirror to brain artifact directory
    const brainArtifactDir = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
    if (fs.existsSync(brainArtifactDir)) {
      const targetBrainScreenshot = path.join(brainArtifactDir, 'audit_123_settings_and_support_showcase.png');
      fs.copyFileSync(screenshotPath, targetBrainScreenshot);
      console.log(`✓ Showcase screenshot mirrored to brain artifact dir: ${targetBrainScreenshot}`);
    }

    await authContext.close();
    await browser.close();

    console.log('\n🎉 ALL 5/5 CLUSTER 10 AUDIT TESTS PASSED WITH 100% SUCCESS!');
  } catch (error) {
    console.error('❌ Audit encountered an error:', error);
    await browser.close();
    process.exit(1);
  }
}

auditCluster10SettingsAndSupport();
