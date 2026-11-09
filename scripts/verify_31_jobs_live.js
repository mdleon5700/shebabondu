const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const artifactDir = path.resolve('C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd');

async function main() {
  console.log('--- STARTING ALL 31 ALLJOBS LIVE BROWSER VERIFICATION ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const testResults = [];

  // Test 1: Jobs Listing Page (/jobs)
  console.log('1. Checking Jobs Listing (/jobs)...');
  const res1 = await page.goto('http://localhost:3000/jobs', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  const shot1 = path.join(artifactDir, 'alljobs_31_listing_page.png');
  await page.screenshot({ path: shot1 });

  // Count job cards or text elements
  const pageContent = await page.content();
  const hasPetrobangla = pageContent.includes('পেট্রোবাংলা') || pageContent.includes('BOGMC');
  const hasBCIC = pageContent.includes('বিসিআইসি') || pageContent.includes('BCIC');
  const hasCAG = pageContent.includes('মহাহিসাব নিরীক্ষক') || pageContent.includes('CAG');
  const hasSupremeCourt = pageContent.includes('সুপ্রিম কোর্ট') || pageContent.includes('Supreme Court');

  console.log(`  - Page Status: ${res1.status()}`);
  console.log(`  - Found Petrobangla: ${hasPetrobangla}`);
  console.log(`  - Found BCIC: ${hasBCIC}`);
  console.log(`  - Found CAG: ${hasCAG}`);
  console.log(`  - Found Supreme Court: ${hasSupremeCourt}`);

  testResults.push({
    test: 'Jobs Listing (/jobs)',
    status: res1.status() === 200 && hasPetrobangla && hasBCIC && hasCAG ? 'PASSED' : 'FAILED',
    screenshot: shot1
  });

  // Test 2: Petrobangla Detail Page (/jobs/job-ai-bogmc-14989)
  console.log('\n2. Checking Petrobangla Job Detail (/jobs/job-ai-bogmc-14989)...');
  const res2 = await page.goto('http://localhost:3000/jobs/job-ai-bogmc-14989', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  const shot2 = path.join(artifactDir, 'alljobs_petrobangla_detail.png');
  await page.screenshot({ path: shot2 });

  const detailContent = await page.content();
  const hasDeadline = detailContent.includes('১৭ নভেম্বর ২০২৬');
  const hasTotalPosts = detailContent.includes('৭৫৩');
  const hasSubPositions = detailContent.includes('সহকারী ব্যবস্থাপক') || detailContent.includes('আইন');

  console.log(`  - Detail Status: ${res2.status()}`);
  console.log(`  - Has Proper Deadline (১৭ নভেম্বর ২০২৬): ${hasDeadline}`);
  console.log(`  - Has Total Posts (৭৫৩): ${hasTotalPosts}`);
  console.log(`  - Has Sub Positions: ${hasSubPositions}`);

  testResults.push({
    test: 'Petrobangla Job Detail',
    status: res2.status() === 200 && hasDeadline && hasTotalPosts ? 'PASSED' : 'FAILED',
    screenshot: shot2
  });

  // Test 3: BCIC Detail Page (/jobs/job-ai-bcic-14936)
  console.log('\n3. Checking BCIC Job Detail (/jobs/job-ai-bcic-14936)...');
  const res3 = await page.goto('http://localhost:3000/jobs/job-ai-bcic-14936', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  const shot3 = path.join(artifactDir, 'alljobs_bcic_detail.png');
  await page.screenshot({ path: shot3 });

  const bcicContent = await page.content();
  const bcicDeadline = bcicContent.includes('১২ নভেম্বর ২০২৬');
  const bcicPosts = bcicContent.includes('৩৯০');

  console.log(`  - Detail Status: ${res3.status()}`);
  console.log(`  - Has Proper Deadline (১২ নভেম্বর ২০২৬): ${bcicDeadline}`);
  console.log(`  - Has Total Posts (৩৯০): ${bcicPosts}`);

  testResults.push({
    test: 'BCIC Job Detail',
    status: res3.status() === 200 && bcicDeadline && bcicPosts ? 'PASSED' : 'FAILED',
    screenshot: shot3
  });

  // Test 4: Admin Dashboard Jobs List
  console.log('\n4. Checking Admin Jobs View (http://localhost:3000/admin)...');
  const res4 = await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  const shot4 = path.join(artifactDir, 'alljobs_admin_dashboard_31_jobs.png');
  await page.screenshot({ path: shot4 });

  testResults.push({
    test: 'Admin Dashboard (/admin)',
    status: res4.status() === 200 ? 'PASSED' : 'FAILED',
    screenshot: shot4
  });

  await browser.close();

  console.log('\n=== ALLJOBS 31 VERIFICATION SUMMARY ===');
  console.table(testResults);
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors.slice(0, 5));
  }
}

main().catch(console.error);

