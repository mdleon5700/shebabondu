import { BrowserController } from '../src/lib/testing/browser-controller';
import { SyntheticUserManager } from '../src/lib/testing/synthetic/synthetic-user-manager';
import { TestRunConfig } from '../src/lib/testing/types';

async function debug() {
  const config: TestRunConfig = {
    id: `DBG-${Date.now().toString().slice(-4)}`,
    name: 'Debug Profile Render',
    environment: 'development',
    baseUrl: 'http://localhost:3000',
    headless: true,
    browser: 'chrome',
    viewport: { width: 1280, height: 800 },
    maxRetries: 1,
    timeoutMs: 25000,
    syntheticTag: {
      isSynthetic: true,
      testRunId: 'DBG',
      testDataVersion: '2.0',
      createdAt: new Date().toISOString()
    }
  };

  const ctrl = new BrowserController(config);
  await ctrl.initialize();
  const { page } = await ctrl.createContext();

  const testUser = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-DHAKA-001')!;
  console.log('Test User info:');
  console.log('- ID:', testUser.id);
  console.log('- Phone:', testUser.phone);
  console.log('- Password:', testUser.testPasswordPlain);
  console.log('- Name BN:', testUser.nameBn);
  console.log('- Name EN:', testUser.name);
  console.log('- District:', testUser.district);

  await page.goto('http://localhost:3000/login');
  await page.locator('input[placeholder*="017XXXXXXXX"], form input[type="text"]').first().fill(testUser.phone);
  await page.locator('input[type="password"]').first().fill(testUser.testPasswordPlain);
  await page.locator('button[type="submit"]:has-text("লগইন"), button:has-text("লগইন করুন")').first().click();
  await page.waitForURL('**/dashboard**', { timeout: 8000 }).catch(() => {});

  console.log('Current URL after login:', page.url());

  // Navigate to profile
  await page.goto('http://localhost:3000/dashboard/profile');
  await page.waitForTimeout(3000);

  const bodyText = await page.innerText('body');
  const inputVals = await page.locator('input').evaluateAll((els: any[]) => els.map(e => ({ name: e.name || e.id || e.placeholder, val: e.value })));
  
  console.log('Inputs found on /dashboard/profile:');
  inputVals.slice(0, 15).forEach(i => console.log(`  - ${i.name}: "${i.val}"`));

  console.log('\nSearch checks:');
  console.log('- Includes testUser.nameBn ("' + testUser.nameBn + '"):', bodyText.includes(testUser.nameBn) || inputVals.some(i => i.val.includes(testUser.nameBn)));
  console.log('- Includes testUser.name ("' + testUser.name + '"):', bodyText.includes(testUser.name) || inputVals.some(i => i.val.includes(testUser.name)));
  console.log('- Includes testUser.district ("' + testUser.district + '"):', bodyText.includes(testUser.district) || inputVals.some(i => i.val.includes(testUser.district)));
  
  // Also check if Tanvir Hassan (mock default) is showing instead
  console.log('- Includes "তানভীর":', bodyText.includes('তানভীর') || inputVals.some(i => i.val.includes('তানভীর')));
  console.log('- Includes "Tanvir":', bodyText.includes('Tanvir') || inputVals.some(i => i.val.includes('Tanvir')));

  await ctrl.cleanup();
}

debug().catch(console.error);