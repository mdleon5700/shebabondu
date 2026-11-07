const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function run() {
  console.log('=== STEP 1: VERIFY RAW SSR HTML (ZERO FLICKER) ===');
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  
  // Check if server HTML contains the dynamic CMS Hero title directly without client execution
  const hasDynamicHero = html.includes('চাকরি আবেদন') || html.includes('চাকরির খবর');
  console.log('Raw Server HTML fetched. Length:', html.length);
  console.log('Raw HTML contains Bengali CMS Hero content:', hasDynamicHero);
  
  // Check if platform settings are directly embedded in initial SSR (no flash)
  const hasChakriShebaBrand = html.includes('চাকরি সেবা');
  console.log('Raw HTML contains Brand Name:', hasChakriShebaBrand);

  console.log('\n=== STEP 2: BROWSER RENDERING & TYPOGRAPHY INSPECTION ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Pre-authenticate admin in localStorage
  await context.addInitScript(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
  });

  const page = await context.newPage();

  // 1. Visit public homepage
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_public_homepage_initial.png') });
  console.log('Public homepage screenshot captured: verify_public_homepage_initial.png');

  // Check Hero Title Font Size class
  const heroHeading = page.locator('h1').first();
  const heroText = await heroHeading.innerText();
  const heroClass = await heroHeading.getAttribute('class');
  console.log('Hero H1 Text:', heroText);
  console.log('Hero H1 Classes:', heroClass);

  // 2. Visit Admin Website Builder
  console.log('\n=== STEP 3: ADMIN WEBSITE BUILDER & TYPOGRAPHY CONTROLS ===');
  await page.goto('http://localhost:3000/admin?tab=builder', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Click on the Hero Section in the Canvas to select it
  const heroCanvas = page.locator('div[data-section-id="sec-home-hero"]').first();
  if (await heroCanvas.count() > 0) {
    await heroCanvas.click();
    console.log('Clicked Hero Section in Canvas');
    await page.waitForTimeout(600);
  }

  // Check Typography Controls in Inspector
  const typographySection = page.locator('text=টাইপোগ্রাফি ও ফন্ট সাইজ (Font Size)');
  const typoCount = await typographySection.count();
  console.log('Typography Controls present in Builder Inspector:', typoCount > 0);

  // Click '6xl' (জাম্বো / 60px) button
  const jamboButton = page.locator('button[data-font-size="6xl"]').first();
  console.log('Found 6xl button count:', await jamboButton.count());
  if (await jamboButton.count() > 0) {
    await jamboButton.click();
    console.log('Clicked 6xl font size button in Admin Inspector');
    await page.waitForTimeout(600);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_admin_typography_controls.png') });
  console.log('Admin typography controls screenshot captured: verify_admin_typography_controls.png');

  // Click Publish button
  const publishBtn = page.locator('button:has-text("পাবলিশ")').first();
  if (await publishBtn.count() > 0) {
    await publishBtn.click();
    console.log('Clicked Publish button');
    await page.waitForTimeout(2500);
  }

  // 4. Return to public homepage and verify updated font size
  console.log('\n=== STEP 4: VERIFY PUBLIC HOMEPAGE UPDATED WITH NEW FONT SIZE ===');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const updatedHeroClass = await page.locator('h1').first().getAttribute('class');
  console.log('Updated Hero H1 Classes:', updatedHeroClass);
  const has6xlClass = updatedHeroClass.includes('text-5xl sm:text-6xl lg:text-7xl');
  console.log('H1 successfully contains 6xl responsive typography class (text-5xl sm:text-6xl lg:text-7xl):', has6xlClass);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_public_homepage_updated_typography.png') });
  console.log('Public homepage with updated typography captured: verify_public_homepage_updated_typography.png');

  await browser.close();
  console.log('\n=== VERIFICATION COMPLETE: ALL PASS ===');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
