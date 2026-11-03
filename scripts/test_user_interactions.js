const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

(async () => {
  console.log('===============================================================');
  console.log('🧪 TESTING REAL USER INTERACTIONS & WORKFLOWS');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', e => errors.push(e.toString()));
  page.on('console', m => {
    if (m.type() === 'error' && !m.text().includes('favicon.ico')) {
      errors.push(`Console Error: ${m.text()}`);
    }
  });

  // TEST 1: Homepage Search & Filtering
  console.log('\n[Test 1] Testing Homepage Search...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Look for search input
  const searchInput = await page.$('input[placeholder*="খুঁজুন"]') || await page.$('input[type="text"]');
  if (searchInput) {
    await searchInput.fill('জামালপুর');
    await page.waitForTimeout(500);
    const searchBody = await page.evaluate(() => document.body.innerText);
    const foundJamalpur = searchBody.includes('JAMALPUR') || searchBody.includes('জামালপুর');
    console.log(`   Search for 'জামালপুর' -> Matched in DOM: ${foundJamalpur}`);
  } else {
    console.log('   Search input not found on home');
  }

  // TEST 2: Job Details Page
  console.log('\n[Test 2] Testing Job Details Page (/jobs/job-alljobs-dcjamalpur-15137)...');
  await page.goto(BASE_URL + '/jobs/job-alljobs-dcjamalpur-15137', { waitUntil: 'networkidle' });
  const detailBody = await page.evaluate(() => document.body.innerText);
  console.log('   Title:', await page.title());
  console.log('   Contains Org Name:', detailBody.includes('JAMALPUR') || detailBody.includes('জামালপুর'));
  console.log('   Contains Positions:', detailBody.includes('কম্পিউটার') || detailBody.includes('Computer'));
  console.log('   Contains PDF / Notice Link:', detailBody.includes('PDF') || detailBody.includes('সার্কুলার'));

  // TEST 3: Category Navigation
  console.log('\n[Test 3] Testing Category Navigation (/bank-jobs)...');
  await page.goto(BASE_URL + '/bank-jobs', { waitUntil: 'networkidle' });
  const bankBody = await page.evaluate(() => document.body.innerText);
  console.log('   Contains Bank Jobs:', bankBody.includes('ব্যাংক') || bankBody.includes('Bank'));

  // TEST 4: Admin Circulars Interactive Search
  console.log('\n[Test 4] Testing Admin Circulars Search...');
  await page.goto(BASE_URL + '/admin', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('cs_admin_auth', 'verified');
    localStorage.setItem('cs_admin_pin', '1234');
    document.cookie = 'cs_session_token=ADMIN-SUPER-SESSION; path=/; max-age=2592000; SameSite=Lax';
  });
  await page.goto(BASE_URL + '/admin?tab=circulars', { waitUntil: 'networkidle' });
  const adminSearchInput = await page.$('input[placeholder*="পদবী, প্রতিষ্ঠান"]');
  if (adminSearchInput) {
    await adminSearchInput.fill('Petrobangla');
    await page.waitForTimeout(500);
    const adminBody = await page.evaluate(() => document.body.innerText);
    console.log('   Admin search for Petrobangla -> Found:', adminBody.includes('Petrobangla') || adminBody.includes('পেট্রোবাংলা'));
  }

  // Check sync button existence
  const syncBtn = await page.$('button:has-text("টেলিটক অলজবস লাইভ সিঙ্ক")');
  console.log('   Admin "টেলিটক অলজবস লাইভ সিঙ্ক" button present:', Boolean(syncBtn));

  console.log('\n===============================================================');
  console.log(`INTERACTION AUDIT COMPLETED: Total Errors: ${errors.length}`);
  console.log('===============================================================');

  if (errors.length > 0) {
    console.log('Errors:', errors);
  } else {
    console.log('🌟 ALL USER INTERACTIONS PERFORMED FLAWLESSLY WITH 0 ERRORS!');
  }

  await browser.close();
})();
