import { chromium } from 'playwright';
import path from 'path';

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const artifactDir = 'C:\\Users\\Leon Rahman\\.gemini\\antigravity\\brain\\28ee63ba-098a-42e1-8ed2-67073b8967cd';

  console.log('1. Testing /jobs directory...');
  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(artifactDir, 'audit_09_jobs_directory.png'), fullPage: false });

  console.log('2. Testing /jobs/ssc-pass...');
  await page.goto('http://localhost:3000/jobs/ssc-pass', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(artifactDir, 'audit_10_jobs_ssc_pass.png'), fullPage: false });

  console.log('3. Testing /jobs/bachelor-degree...');
  await page.goto('http://localhost:3000/jobs/bachelor-degree', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(artifactDir, 'audit_11_jobs_bachelor.png'), fullPage: false });

  console.log('4. Testing /jobs/[id] single job detail...');
  await page.goto('http://localhost:3000/jobs/fri-teletalk-com-bd-15638', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(artifactDir, 'audit_12_job_detail.png'), fullPage: false });

  console.log('5. Testing /apply/[id] application form...');
  await page.goto('http://localhost:3000/apply/fri-teletalk-com-bd-15638', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(artifactDir, 'audit_13_job_apply.png'), fullPage: false });

  await browser.close();
  console.log('All live browser checks completed successfully!');
}

verify().catch(err => {
  console.error('Browser check failed:', err);
  process.exit(1);
});
