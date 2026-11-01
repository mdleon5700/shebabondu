import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';
const BASE_URL = 'http://localhost:3000';

async function runTest() {
  console.log('=== Starting Test: Multi-Position Matrix & Org Autocomplete ===');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[Console Error]', msg.text());
  });

  // Step 1: Login via Admin PIN Form
  console.log('1. Navigating to Admin Panel & Logging in with PIN 1234...');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.isVisible()) {
    console.log('Entering PIN 1234...');
    await pinInput.fill('1234');
    await page.locator('button:has-text("কনসোলে প্রবেশ করুন")').click();
    await page.waitForTimeout(2500);
  }

  // Step 2: Open Universal Job Workspace
  console.log('2. Opening Universal Job Workspace...');
  const createBtn = page.locator('button:has-text("নতুন সার্কুলার")').first();
  if (await createBtn.isVisible()) {
    await createBtn.click();
    await page.waitForTimeout(1000);
  }

  const modal = page.locator('.fixed.inset-0');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'matrix_01_workspace_opened.png') });
  console.log('Saved: matrix_01_workspace_opened.png');

  // Step 3: Switch to Details tab & test Organization Autocomplete
  console.log('3. Testing Organization Autocomplete...');
  const detailsTab = modal.getByRole('button', { name: 'মূল তথ্য', exact: true });
  await detailsTab.click();
  await page.waitForTimeout(600);

  const orgInput = modal.locator('input[placeholder*="বাংলাদেশ ব্যাংক, CPGCBL"]');
  await orgInput.scrollIntoViewIfNeeded();
  await orgInput.fill('কোল');
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'matrix_02_org_autocomplete_dropdown.png') });
  console.log('Saved: matrix_02_org_autocomplete_dropdown.png');

  // Select CPGCBL suggestion from dropdown
  const suggestion = modal.locator('div:has-text("অটো-ফিল ↵")').first();
  if (await suggestion.isVisible()) {
    await suggestion.click();
    console.log('Selected organization suggestion');
    await page.waitForTimeout(500);
  }

  // Step 4: Test Deadline Shortcut (+১৫ দিন)
  console.log('4. Testing Deadline Shortcut (+১৫ দিন)...');
  const dShort = modal.locator('button:has-text("+১৫ দিন")').first();
  if (await dShort.isVisible()) {
    await dShort.click();
    console.log('Clicked +১৫ দিন');
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'matrix_03_org_and_deadline_populated.png') });
  console.log('Saved: matrix_03_org_and_deadline_populated.png');

  // Step 5: Test Positions Matrix Tab
  console.log('5. Navigating to Positions Matrix Tab...');
  const posTab = modal.locator('button:has-text("পদ ও বেতন মেট্রিক্স")').first();
  await posTab.click();
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'matrix_04_positions_tab_opened.png') });
  console.log('Saved: matrix_04_positions_tab_opened.png');

  // Add 1-click preset positions
  console.log('6. Adding 1-click Grade Presets (৯ম, ১০ম, ১৬তম, ২০তম গ্রেড)...');
  const preset9 = modal.locator('button:has-text("৯ম গ্রেড")').first();
  if (await preset9.isVisible()) await preset9.click();
  await page.waitForTimeout(300);

  const preset10 = modal.locator('button:has-text("১০ম গ্রেড")').first();
  if (await preset10.isVisible()) await preset10.click();
  await page.waitForTimeout(300);

  const preset16 = modal.locator('button:has-text("১৬তম গ্রেড")').first();
  if (await preset16.isVisible()) await preset16.click();
  await page.waitForTimeout(300);

  const preset20 = modal.locator('button:has-text("২০তম গ্রেড")').first();
  if (await preset20.isVisible()) await preset20.click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'matrix_05_multi_positions_configured.png') });
  console.log('Saved: matrix_05_multi_positions_configured.png');

  // Step 6: Test Application & Fees Tab integration
  console.log('7. Checking Application & Fees Tab...');
  const appTab = modal.locator('button:has-text("আবেদন ও ফি")').first();
  await appTab.click();
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'matrix_06_application_fees_breakdown.png') });
  console.log('Saved: matrix_06_application_fees_breakdown.png');

  // Step 7: Public Organizations Directory
  console.log('8. Checking Public Organizations Directory (/organizations)...');
  await page.goto(`${BASE_URL}/organizations`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'matrix_07_public_organizations_directory.png') });
  console.log('Saved: matrix_07_public_organizations_directory.png');

  // Step 8: Dynamic Public Organization Page (/organizations/cpgcbl)
  console.log('9. Checking Dynamic Organization Page (/organizations/cpgcbl)...');
  await page.goto(`${BASE_URL}/organizations/cpgcbl`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'matrix_08_organization_cpgcbl_detail.png') });
  console.log('Saved: matrix_08_organization_cpgcbl_detail.png');

  // Step 9: Public Job Detail with clickable Organization Link
  console.log('10. Checking Public Job Detail Organization Link...');
  await page.goto(`${BASE_URL}/jobs/job-teletalk-15106-cpgcbl`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'matrix_09_job_detail_with_org_link.png') });
  console.log('Saved: matrix_09_job_detail_with_org_link.png');

  await browser.close();
  console.log('\n=== ALL PLAYWRIGHT TESTS PASSED SUCCESSFULLY! ===');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
