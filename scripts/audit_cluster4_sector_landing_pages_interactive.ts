import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Leon Rahman/.gemini/antigravity/brain/28ee63ba-098a-42e1-8ed2-67073b8967cd';

async function auditSectorPage(page: any, urlPath: string, screenshotName: string, label: string) {
  console.log(`=== AUDITING ${urlPath} ===`);
  await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, screenshotName), fullPage: true });
  const h1 = await page.locator('h1').innerText();
  console.log(`${label} H1: "${h1}"`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await auditSectorPage(page, '/government-jobs', 'audit_60_government_jobs.png', 'Govt Jobs');
  await auditSectorPage(page, '/bank-jobs', 'audit_61_bank_jobs.png', 'Bank Jobs');
  await auditSectorPage(page, '/private-jobs', 'audit_62_private_jobs.png', 'Private Jobs');
  await auditSectorPage(page, '/engineering-jobs', 'audit_63_engineering_jobs.png', 'Engineering Jobs');
  await auditSectorPage(page, '/it-jobs', 'audit_64_it_jobs.png', 'IT Jobs');
  await auditSectorPage(page, '/medical-jobs', 'audit_65_medical_jobs.png', 'Medical Jobs');
  await auditSectorPage(page, '/teacher-jobs', 'audit_66_teacher_jobs.png', 'Teacher Jobs');
  await auditSectorPage(page, '/tutoring-jobs', 'audit_67_tutoring_jobs.png', 'Tutoring Jobs');
  await auditSectorPage(page, '/ngo-jobs', 'audit_68_ngo_jobs.png', 'NGO Jobs');
  await auditSectorPage(page, '/accounting-finance-jobs', 'audit_69_accounting_finance_jobs.png', 'Accounting Finance Jobs');
  await auditSectorPage(page, '/marketing-jobs', 'audit_70_marketing_jobs.png', 'Marketing Jobs');
  await auditSectorPage(page, '/international-jobs', 'audit_71_international_overseas_jobs.png', 'International Jobs');

  // Verify redirects
  console.log('=== AUDITING OVERSEAS REDIRECT ===');
  await page.goto('http://localhost:3000/overseas-jobs');
  await page.waitForURL('**/international-jobs', { timeout: 10000 });
  console.log(`SUCCESS: /overseas-jobs redirected to: ${page.url()}`);

  await browser.close();
  console.log('=== ALL 12 SECTOR LANDING PAGES & OVERSEAS FEATURES AUDITED SUCCESSFULLY! ===');
}

main().catch((err) => {
  console.error('Audit run failed:', err);
  process.exit(1);
});
