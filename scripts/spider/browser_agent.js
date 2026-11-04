/**
 * CHAKRI SHEBA — PERSISTENT BROWSER & GEMINI AGENT RUNNER
 * 
 * Runs a dedicated, persistent headful Chrome session for:
 * 1. Logged-in Google Gemini multimodal interaction (gemini.google.com)
 * 2. Alljobs Teletalk live visual inspection & PDF verification
 * 3. Human-in-the-loop CAPTCHA resolution
 * 4. Automatic sync with Chakri Sheba platform
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const USER_DATA_DIR = path.join(process.cwd(), '.browser_profile', 'gemini_session');

if (!fs.existsSync(USER_DATA_DIR)) {
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
}

(async () => {
  console.log('=====================================================');
  console.log('🤖 CHAKRI SHEBA PERSISTENT BROWSER AGENT');
  console.log('=====================================================');
  console.log(`Profile Directory: ${USER_DATA_DIR}`);
  console.log('Launching dedicated Chrome instance with persistent session...');

  try {
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false, // Headful so user can see, interact, and solve captchas
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      viewport: { width: 1366, height: 768 },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox'
      ]
    });

    const page1 = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
    console.log('1. Loading Alljobs Teletalk Live Portal...');
    await page1.goto('https://alljobs.teletalk.com.bd/', { waitUntil: 'domcontentloaded' });
    console.log('   Alljobs Portal Loaded!');

    const page2 = await context.newPage();
    console.log('2. Loading Google Gemini Web Workspace...');
    await page2.goto('https://gemini.google.com/', { waitUntil: 'domcontentloaded' });
    console.log('   Google Gemini Web Loaded!');

    console.log('\n✅ BROWSER READY!');
    console.log('👉 আপনার গুগল অ্যাকাউন্টে লগইন করুন (সেশনটি সারা জীবনের জন্য সংরক্ষিত থাকবে)।');
    console.log('👉 যদি কখনো কোনো ক্যাপচা আসে, এই ব্রাউজারে সমাধান করে দিন।');
    console.log('👉 ব্রাউজার বন্ধ না করে ব্যাকগ্রাউন্ডে রেখে দিন। অটোমেটেড এজেন্ট কাজ চালিয়ে যাবে।\n');

    // Keep browser process active indefinitely until user manually closes the window
    console.log('Browser window is live and standing by. Waiting for user interaction...');
    await new Promise(resolve => {
      context.on('close', resolve);
    });
  } catch (err) {
    console.error('Browser launch error:', err.message);
  }
})();

