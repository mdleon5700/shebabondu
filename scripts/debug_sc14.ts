import { BrowserController } from '../src/lib/testing/browser-controller';
import { SyntheticUserManager } from '../src/lib/testing/synthetic/synthetic-user-manager';
import { TestRunConfig } from '../src/lib/testing/types';

async function debug() {
  const config: TestRunConfig = {
    id: `DBG-SC14`,
    name: 'Debug SC14',
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

  const candidate = SyntheticUserManager.getSyntheticUserById('SYNTH-USR-RAJSHAHI-001')!;
  console.log('Logging in as:', candidate.phone, candidate.testPasswordPlain);

  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[placeholder*="017XXXXXXXX"], form input[type="text"]').first().fill(candidate.phone);
  await page.locator('input[type="password"]').first().fill(candidate.testPasswordPlain);
  await page.locator('button[type="submit"]:has-text("লগইন"), button:has-text("লগইন করুন")').first().click();
  await page.waitForTimeout(3000);
  console.log('URL after login submit:', page.url());

  await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('URL on profile:', page.url());

  const buttons = await page.locator('button').allInnerTexts();
  console.log('Buttons on page:', buttons.slice(0, 10));

  await ctrl.cleanup();
}

debug().catch(console.error);