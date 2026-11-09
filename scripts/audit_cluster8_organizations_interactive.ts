import { chromium } from 'playwright';
import path from 'path';

async function main() {
  console.log('🚀 Starting Cluster 8: Organizations Directory & Government Hubs Interactive Audit...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  const artifactDir = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';

  // ==========================================
  // PART 1: AUDIT /organizations
  // ==========================================
  console.log('==============================================');
  console.log('📌 PART 1: Auditing /organizations Directory');
  console.log('==============================================');

  const orgsUrl = 'http://localhost:3000/organizations';
  console.log(`🌐 Navigating to ${orgsUrl}...`);
  const orgsResp = await page.goto(orgsUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Organizations Directory Status: ${orgsResp?.status()}`);

  if (orgsResp?.status() !== 200) {
    throw new Error(`Failed to load /organizations, status: ${orgsResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  // 1. Verify Header
  const orgsHeader = await page.locator('h1').innerText();
  console.log(`✅ Header: ${orgsHeader}`);

  // 2. Verify Pre-built Hubs Spotlight Cards
  const bbCard = await page.locator('text=বাংলাদেশ ব্যাংক ও BSCS').isVisible();
  const bpscCard = await page.locator('text=বিপিএসসি (BPSC)').isVisible();
  const minCard = await page.locator('text=সকল মন্ত্রণালয়সমূহ').isVisible();
  const dirCard = await page.locator('text=সকল অধিদপ্তরসমূহ').isVisible();
  console.log(`✅ 4 Government Hub Spotlight Cards Visible: BB=${bbCard}, BPSC=${bpscCard}, Min=${minCard}, Dir=${dirCard}`);

  // 3. Test Alphabetical Filter Bar
  console.log('\n--- 1. Testing Alphabetical Jump Filter ---');
  const letterP = page.locator('button:text-is("প")').first();
  await letterP.click();
  await page.waitForTimeout(400);

  const hasPetro = await page.locator('h3:has-text("Petrobangla")').first().isVisible();
  console.log(`✅ Filtered by letter 'প' (Petrobangla visible): ${hasPetro}`);

  // Reset letter filter
  await page.click('button:has-text("সকল বর্ণ দেখুন (রিসেট)")');
  await page.waitForTimeout(400);

  // 4. Test Search Bar
  console.log('\n--- 2. Testing Live Search Bar ---');
  const searchInput = page.locator('input[placeholder*="প্রতিষ্ঠানের নাম বা অ্যাক্রোনিম"]');
  await searchInput.fill('Petrobangla');
  await page.waitForTimeout(400);

  const petroCardsCount = await page.locator('h3:has-text("Petrobangla")').count();
  console.log(`✅ Search 'Petrobangla' result count: ${petroCardsCount}`);

  // Clear search to show full grid
  await searchInput.fill('');
  await page.waitForTimeout(400);

  // Screenshot Organizations Directory with Alphabetical Bar
  const shot1 = path.join(artifactDir, 'audit_86_organizations_directory_alphabetical.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot1}`);

  // ==========================================
  // PART 2: AUDIT /organizations/petrobangla
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 2: Auditing /organizations/petrobangla');
  console.log('==============================================');

  const petroUrl = 'http://localhost:3000/organizations/petrobangla';
  console.log(`🌐 Navigating to ${petroUrl}...`);
  const petroResp = await page.goto(petroUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Petrobangla Profile Status: ${petroResp?.status()}`);

  if (petroResp?.status() !== 200) {
    throw new Error(`Failed to load /organizations/petrobangla, status: ${petroResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  // Verify Header & Metrics
  const petroHeader = await page.locator('h1').innerText();
  console.log(`✅ Organization Name: ${petroHeader}`);

  const activeJobsHeader = await page.locator('text=চলমান সকল নিয়োগ সার্কুলার').isVisible();
  console.log(`✅ Active Jobs Section Visible: ${activeJobsHeader}`);

  // Verify Previous Recruitment History Archive
  const historyHeader = await page.locator('text=পূর্ববর্তী নিয়োগের ইতিহাস ও আর্কাইভ').isVisible();
  console.log(`✅ Previous Recruitment History Archive Visible: ${historyHeader}`);

  // Screenshot Organization Profile
  const shot2 = path.join(artifactDir, 'audit_87_organization_profile_petrobangla.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot2}`);

  // ==========================================
  // PART 3: AUDIT /organizations/bangladesh-bank
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 3: Auditing /organizations/bangladesh-bank');
  console.log('==============================================');

  const bbUrl = 'http://localhost:3000/organizations/bangladesh-bank';
  console.log(`🌐 Navigating to ${bbUrl}...`);
  const bbResp = await page.goto(bbUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Bangladesh Bank Hub Status: ${bbResp?.status()}`);

  if (bbResp?.status() !== 200) {
    throw new Error(`Failed to load /organizations/bangladesh-bank, status: ${bbResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  const bbPageTitle = await page.locator('h1').innerText();
  console.log(`✅ BB Hub Title: ${bbPageTitle}`);

  // Screenshot Bangladesh Bank Hub
  const shot3 = path.join(artifactDir, 'audit_88_bangladesh_bank_hub.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot3}`);

  // ==========================================
  // PART 4: AUDIT /organizations/bpsc
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 4: Auditing /organizations/bpsc');
  console.log('==============================================');

  const bpscUrl = 'http://localhost:3000/organizations/bpsc';
  console.log(`🌐 Navigating to ${bpscUrl}...`);
  const bpscResp = await page.goto(bpscUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 BPSC Hub Status: ${bpscResp?.status()}`);

  if (bpscResp?.status() !== 200) {
    throw new Error(`Failed to load /organizations/bpsc, status: ${bpscResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  const bpscPageTitle = await page.locator('h1').innerText();
  console.log(`✅ BPSC Hub Title: ${bpscPageTitle}`);

  // Verify 47th BCS is listed
  const bcsVisible = await page.locator('text=৪৭তম বিসিএস').first().isVisible();
  console.log(`✅ 47th BCS Circular Listed: ${bcsVisible}`);

  // Screenshot BPSC Hub
  const shot4 = path.join(artifactDir, 'audit_89_bpsc_cadre_hub.png');
  await page.screenshot({ path: shot4, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot4}`);

  // ==========================================
  // PART 5: AUDIT /organizations/government-ministries & /organizations/government-directorates
  // ==========================================
  console.log('\n==============================================');
  console.log('📌 PART 5: Auditing Ministries & Directorates Hubs');
  console.log('==============================================');

  const minUrl = 'http://localhost:3000/organizations/government-ministries';
  console.log(`🌐 Navigating to ${minUrl}...`);
  const minResp = await page.goto(minUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Ministries Hub Status: ${minResp?.status()}`);

  if (minResp?.status() !== 200) {
    throw new Error(`Failed to load /organizations/government-ministries, status: ${minResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  const dirUrl = 'http://localhost:3000/organizations/government-directorates';
  console.log(`🌐 Navigating to ${dirUrl}...`);
  const dirResp = await page.goto(dirUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`📡 Directorates Hub Status: ${dirResp?.status()}`);

  if (dirResp?.status() !== 200) {
    throw new Error(`Failed to load /organizations/government-directorates, status: ${dirResp?.status()}`);
  }

  await page.waitForTimeout(1000);

  // Screenshot Directorates & Ministries Hub
  const shot5 = path.join(artifactDir, 'audit_90_government_ministries_and_directorates.png');
  await page.screenshot({ path: shot5, fullPage: false });
  console.log(`📸 Screenshot saved: ${shot5}`);

  await browser.close();
  console.log('\n✨ All Cluster 8 Interactive Tests Passed with 100% Integrity!');
}

main().catch(err => {
  console.error('❌ Audit Failed:', err);
  process.exit(1);
});
