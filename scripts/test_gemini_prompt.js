const { chromium } = require('playwright');
const path = require('path');
const profileDir = path.join(process.cwd(), '.browser_profile', 'gemini_session');

(async () => {
  try {
    const context = await chromium.launchPersistentContext(profileDir, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
    const page = await context.newPage();
    console.log('1. Loading Gemini Web...');
    await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3000);

    const editor = page.locator('div[contenteditable="true"]').first();
    await editor.waitFor({ state: 'visible', timeout: 10000 });
    console.log('2. Editor found! Typing test message...');
    await editor.click();
    await editor.fill('Write a 1-sentence recruitment greeting in Bengali.');
    await page.keyboard.press('Enter');

    console.log('3. Waiting for Gemini response...');
    await page.waitForTimeout(6000);

    const textElements = await page.locator('.model-response-text, .response-container, message-content, [data-test-id="model-turn"]').allTextContents();
    console.log('Response elements found:', textElements.length);
    if (textElements.length > 0) {
      console.log('Gemini reply:', textElements.join('\n'));
    }

    await page.screenshot({ path: 'gemini_response_check.png' });
    console.log('Saved response screenshot to gemini_response_check.png');
    await context.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();

