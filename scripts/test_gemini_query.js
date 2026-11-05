const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(process.cwd(), '.browser_profile', 'gemini_session');

(async () => {
  console.log('Connecting to Gemini Web...');
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('Looking for prompt editor...');
  // Find editor
  const editor = page.locator('div[contenteditable="true"]').first();
  await editor.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Found editor! Typing test prompt...');
  
  await editor.click();
  await page.waitForTimeout(500);
  await editor.fill('Say exactly: "YES, GEMINI IS WORKING IN CHAKRI SHEBA 2026!"');
  await page.waitForTimeout(500);

  console.log('Pressing Enter...');
  await page.keyboard.press('Enter');

  // Also try clicking the submit/send button if available
  try {
    const sendBtn = page.locator('button[aria-label*="Send"], button.send-button, mat-icon[data-mat-icon-name="send"]').first();
    if (await sendBtn.isVisible()) {
      console.log('Clicking send button...');
      await sendBtn.click();
    }
  } catch {}

  console.log('Waiting 10 seconds for Gemini response...');
  await page.waitForTimeout(10000);

  const responseText = await page.innerText('body');
  console.log('Does body include YES, GEMINI IS WORKING?:', responseText.includes('YES, GEMINI IS WORKING'));
  
  const screenshotPath = path.join(process.cwd(), 'gemini_after_prompt.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot:', screenshotPath);

  // Look for model response container
  const messageResponses = await page.locator('.model-response-text, message-content, .response-container').allInnerTexts();
  console.log('Model responses found:', messageResponses.length);
  if (messageResponses.length > 0) {
    console.log('Response content:', messageResponses);
  }

  await context.close();
  console.log('Done test.');
})().catch(err => {
  console.error('Gemini query test failed:', err);
  process.exit(1);
});

