import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function auditCluster4DocumentVault() {
  console.log('🚀 Starting Cluster 4: Smart Document Vault & Image Resizer Comprehensive Audit...');

  // 1. Prepare candidate session in local_store.json
  const dbPath = path.resolve('src/db/local_store.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const candidate = db.candidates['USR-01712345678'];
  if (!candidate) throw new Error('Demo candidate USR-01712345678 not found in local_store.json');

  const sessionToken = 'cluster4_vault_audit_session_' + Date.now();
  if (!db.sessions) db.sessions = {};
  db.sessions[sessionToken] = {
    candidateId: 'USR-01712345678',
    role: 'candidate',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  // Clean any leftover audit custom documents
  if (db.documents && db.documents['USR-01712345678']) {
    db.documents['USR-01712345678'] = db.documents['USR-01712345678'].filter(
      (d: any) => !d.title?.includes('কম্পিউটার অফিস')
    );
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

  const browser = await chromium.launch({ headless: true });

  try {
    // ========================================================
    // TEST 1: Public Gateway (/vault) Verification
    // ========================================================
    console.log('\n--- TEST 1: Public Gateway (/vault) & Unauthenticated Interface ---');
    const guestContext = await browser.newContext({ viewport: { width: 1440, height: 950 } });
    const guestPage = await guestContext.newPage();
    guestPage.on('pageerror', err => console.log('PAGE ERROR (Guest):', err.message));

    await guestPage.goto('http://localhost:3000/vault', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await guestPage.waitForSelector('h1:has-text("স্মার্ট ডকুমেন্ট ভল্ট ও টেলিটক ইমেজ রিসাইজার")', { state: 'visible', timeout: 15000 });
    console.log('✓ Public Vault Gateway title rendered.');

    // Check login CTA on public page
    const loginLink = await guestPage.waitForSelector('a:has-text("লগইন করে ভল্ট অ্যাক্সেস করুন")', { state: 'visible', timeout: 10000 });
    const href = await loginLink.getAttribute('href');
    console.log('✓ Public login CTA correctly points to:', href);

    // Verify 10 Core Official Documents showcased in public grid
    const coreDocCards = await guestPage.$$('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-5 > div');
    console.log(`✓ Public 10-core documents grid verified: ${coreDocCards.length} cards rendered.`);
    if (coreDocCards.length !== 10) throw new Error(`Expected 10 core official documents, got ${coreDocCards.length}`);

    await guestContext.close();

    // ========================================================
    // TEST 2: Authenticated Access to Master Vault (/dashboard/vault)
    // ========================================================
    console.log('\n--- TEST 2: Authenticated Dashboard Vault Access & 10 Official Slots ---');
    const authContext = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
    await authContext.addCookies([
      { name: 'cs_session_token', value: sessionToken, domain: 'localhost', path: '/' }
    ]);
    const authPage = await authContext.newPage();
    authPage.on('pageerror', err => console.log('PAGE ERROR (Auth):', err.message));
    authPage.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    authPage.on('dialog', async dialog => {
      console.log('BROWSER DIALOG:', dialog.message());
      await dialog.accept();
    });

    await authPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await authPage.evaluate(({ token, cand }) => {
      localStorage.setItem('cs_session_token', token);
      localStorage.setItem('cs_auth_data', JSON.stringify({
        isLoggedIn: true,
        role: 'candidate',
        name: cand.nameBn || cand.name,
        phone: cand.phone,
        userId: cand.id
      }));
    }, { token: sessionToken, cand: candidate });

    // Navigate to /dashboard/vault
    await authPage.goto('http://localhost:3000/dashboard/vault', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await authPage.waitForSelector('h1:has-text("স্মার্ট ডকুমেন্ট ভল্ট ও ইমেজ রিসাইজার")', { state: 'visible', timeout: 20000 });
    console.log('✓ Authenticated Dashboard Vault rendered.');

    // Verify 10 Official Document Slots Section Header
    await authPage.waitForSelector('h2:has-text("মূল জাতীয় পরিচয়পত্র ও প্রমাণপত্র ভল্ট (১০টি অফিসিয়াল স্লট)")', { state: 'visible', timeout: 10000 });
    console.log('✓ 10 Official Document Slots Section Header verified.');

    // Verify specific official slots
    const expectedSlots = [
      'প্রার্থীর ছবি (টেলিটক স্ট্যান্ডার্ড - ৩০০×৩০০)',
      'প্রার্থীর স্বাক্ষর (টেলিটক স্ট্যান্ডার্ড - ৩০০×৮০)',
      'প্রার্থীর NID (সামনের অংশ)',
      'প্রার্থীর NID (পেছনের অংশ)',
      'পিতার জাতীয় পরিচয়পত্র (Father NID)',
      'মাতার জাতীয় পরিচয়পত্র (Mother NID)',
      'নাগরিক সনদপত্র (চেয়ারম্যান সার্টিফিকেট)',
      'অনলাইন জন্ম নিবন্ধন সনদ (ঐচ্ছিক)',
      'চারিত্রিক সনদপত্র (Character Certificate)',
      'কোটা / বিশেষ সুবিধা সনদ (যদি থাকে)'
    ];

    for (const slotTitle of expectedSlots) {
      const slot = await authPage.waitForSelector(`h3:has-text("${slotTitle}")`, { state: 'visible', timeout: 5000 });
      if (!slot) throw new Error(`Missing expected official slot: ${slotTitle}`);
    }
    console.log('✓ All 10 official document slots present in DOM.');

    // ========================================================
    // TEST 3: Teletalk Image Resizer Engine (Photo 300x300 & Signature 300x80)
    // ========================================================
    console.log('\n--- TEST 3: Teletalk Canvas Resizer Engine Verification ---');

    // Select Photo Tab (300x300)
    const photoTab = await authPage.waitForSelector('button:has-text("ছবি (300 × 300)")', { state: 'visible' });
    await photoTab.click();
    await authPage.waitForSelector('div:has-text("লক্ষ্যমাত্রা: 300 × 300 px (<100 KB)")', { state: 'visible', timeout: 5000 });
    console.log('✓ Photo preset active (300×300 px, <100 KB).');

    // 1x1 base64 transparent PNG
    const testPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );

    // Upload test image to resizer
    const resizerFileInput = await authPage.waitForSelector('input[data-testid="resizer-file-input"]', { state: 'attached', timeout: 10000 });
    if (!resizerFileInput) throw new Error('Resizer file input not found');
    await resizerFileInput.setInputFiles({
      name: 'candidate-test-photo.png',
      mimeType: 'image/png',
      buffer: testPngBuffer
    });

    // Wait for processed output preview
    await authPage.waitForSelector('strong:has-text("300 × 300 pixels")', { state: 'visible', timeout: 10000 });
    console.log('✓ Canvas resized image to exact 300×300 pixels with live preview.');

    // Verify "ভল্টে সেভ করুন" in Resizer
    const saveToVaultBtn = await authPage.waitForSelector('button[data-testid="resizer-save-btn"]', { state: 'visible', timeout: 10000 });
    await saveToVaultBtn.click();
    await authPage.waitForSelector('text=সার্ভার ভল্টে সংরক্ষিত হয়েছে', { state: 'visible', timeout: 15000 });
    console.log('✓ Resized photo saved directly to server document vault with success notification.');

    // Switch to Signature Tab (300x80)
    const sigTab = await authPage.waitForSelector('button:has-text("স্বাক্ষর (300 × 80)")', { state: 'visible' });
    await sigTab.click();
    await authPage.waitForSelector('div:has-text("লক্ষ্যমাত্রা: 300 × 80 px (<60 KB)")', { state: 'visible', timeout: 5000 });
    console.log('✓ Signature preset active (300×80 px, <60 KB).');

    // ========================================================
    // TEST 4: Custom Documents Repository & Modal Uploader
    // ========================================================
    console.log('\n--- TEST 4: Custom Documents Modal & Repository ---');

    // Open Modal
    const addCustomBtn = await authPage.waitForSelector('button:has-text("+ নতুন কাস্টম ডকুমেন্ট যোগ করুন")', { state: 'visible' });
    await addCustomBtn.click();
    await authPage.waitForSelector('h3:has-text("নতুন কাস্টম ডকুমেন্ট আপলোড")', { state: 'visible', timeout: 5000 });
    console.log('✓ Add Custom Document modal opened.');

    // Fill Title
    const customTitle = 'কম্পিউটার অফিস অ্যাপ্লিকেশন ডিপ্লোমা (৬ মাস)';
    await authPage.fill('input[placeholder*="যেমন: কম্পিউটার প্রশিক্ষণ সনদ"]', customTitle);

    // Select Category
    await authPage.selectOption('select', 'training');

    // Upload File
    const modalFileInput = await authPage.waitForSelector('input[data-testid="custom-doc-file-input"]', { state: 'attached', timeout: 10000 });
    if (!modalFileInput) throw new Error('Modal file input not found');
    await modalFileInput.setInputFiles({
      name: 'computer-diploma.png',
      mimeType: 'image/png',
      buffer: testPngBuffer
    });

    // Submit form
    const submitBtn = await authPage.waitForSelector('button:has-text("✓ ভল্টে সেভ করুন")', { state: 'visible' });
    await submitBtn.click();

    // Verify success toast & card appearing in custom documents grid
    await authPage.waitForSelector(`h4:has-text("${customTitle}")`, { state: 'visible', timeout: 15000 });
    console.log('✓ Custom document successfully added and listed with training category badge.');

    // ========================================================
    // TEST 5: Interactive In-App Document Preview Modal
    // ========================================================
    console.log('\n--- TEST 5: Interactive Document Preview Modal ---');
    const previewBtn = await authPage.waitForSelector(`div:has(h4:has-text("${customTitle}")) button:has-text("প্রিভিউ")`, { state: 'visible' });
    await previewBtn.click();

    await authPage.waitForSelector('text=সুরক্ষিত ক্লাউড ভল্ট ফাইল প্রিভিউ', { state: 'visible', timeout: 10000 });
    console.log('✓ Interactive Document Preview Modal opened.');

    // Close Modal
    const closeModalBtn = await authPage.waitForSelector('button:has-text("বন্ধ করুন")', { state: 'visible' });
    await closeModalBtn.click();
    await authPage.waitForSelector('text=সুরক্ষিত ক্লাউড ভল্ট ফাইল প্রিভিউ', { state: 'detached', timeout: 5000 });
    console.log('✓ Preview modal closed smoothly.');

    // ========================================================
    // TEST 6: Real-time Deletion & State Refresh
    // ========================================================
    console.log('\n--- TEST 6: Real-time Deletion & State Refresh ---');
    const deleteBtn = await authPage.waitForSelector('div[data-testid="custom-doc-card"] button[data-testid="delete-custom-doc-btn"]', { state: 'visible' });
    await deleteBtn.click();

    await authPage.waitForSelector(`h4:has-text("${customTitle}")`, { state: 'detached', timeout: 10000 });
    console.log('✓ Custom document successfully deleted and purged from vault.');

    // ========================================================
    // TEST 7: Full Showcase Screenshot
    // ========================================================
    console.log('\n--- TEST 7: Capture Showcase Screenshot ---');
    const screenshotPath = path.resolve('scripts/audit_117_document_vault_showcase.png');
    await authPage.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✓ Showcase screenshot saved to ${screenshotPath}`);

    // Also copy to brain artifacts directory
    const brainDir = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';
    if (fs.existsSync(brainDir)) {
      fs.copyFileSync(screenshotPath, path.join(brainDir, 'audit_117_document_vault_showcase.png'));
      console.log('✓ Copied showcase screenshot to brain artifacts directory.');
    }

    console.log('\n🎉 ALL 7 AUDIT CHECKS PASSED FOR CLUSTER 4 (MASTER DIGITAL VAULT)!');
  } finally {
    await browser.close();
  }
}

auditCluster4DocumentVault().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});

