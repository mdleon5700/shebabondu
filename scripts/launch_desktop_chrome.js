const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = path.join(process.cwd(), '.browser_profile', 'gemini_session');

if (!fs.existsSync(PROFILE_DIR)) {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
}

(async () => {
  try {
    console.log('🚀 Launching visible desktop Chromium for Google Gemini login...');
    const context = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: false,
      viewport: { width: 1280, height: 850 },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--start-maximized',
        '--window-name=ChakriShebaGeminiStudio'
      ]
    });

    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
    await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded' });
    console.log('✅ Visible Chrome is open at https://gemini.google.com/app');
    console.log('👉 Please log in to your Google Account. Session will be permanently saved in .browser_profile/gemini_session');

    // Wait until browser is closed by user
    await new Promise((resolve) => {
      context.on('close', resolve);
    });
    console.log('Browser window closed.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to launch visible browser:', err.message);
    process.exit(1);
  }
})();
