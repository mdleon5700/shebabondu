/**
 * CHAKRI SHEBA — IN-SYSTEM STANDALONE CHROMIUM GEMINI AGENT RUNNER
 * 
 * Uses Playwright's dedicated standalone Chromium:
 * 1. Logged-in Google Gemini multimodal interaction (gemini.google.com/app)
 * 2. Alljobs Teletalk live visual inspection & PDF verification
 * 3. Human-in-the-loop one-time sign-in & CAPTCHA resolution
 * 4. Automatic sync with Chakri Sheba platform
 * 
 * NOTE: Operates 100% in system's internal browser profile (.browser_profile/gemini_session).
 * DOES NOT touch or interfere with user's personal Google Chrome.
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
  console.log('🤖 CHAKRI SHEBA INTERNAL CHROMIUM GEMINI AGENT');
  console.log('=====================================================');
  console.log(`Profile Directory: ${USER_DATA_DIR}`);
  console.log('Launching dedicated standalone Chromium with persistent session...');

  try {
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      viewport: { width: 1366, height: 768 },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--app=https://gemini.google.com/app'
      ]
    });

    const page1 = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
    console.log('1. Loading Google Gemini Web Workspace...');
    await page1.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded' });
    console.log('   Google Gemini Web Loaded!');

    const page2 = await context.newPage();
    console.log('2. Loading Alljobs Teletalk Live Portal...');
    await page2.goto('https://alljobs.teletalk.com.bd/', { waitUntil: 'domcontentloaded' });
    console.log('   Alljobs Portal Loaded!');

    console.log('\n✅ BROWSER READY!');
    console.log('👉 প্রদর্শিত উইন্ডোতে আপনার গুগল অ্যাকাউন্টে ১-ক্লিক সাইন-ইন করে নিন।');
    console.log('👉 সেশনটি স্থায়ীভাবে সংরক্ষিত থাকবে এবং ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে কাজ চলবে।\n');

    await new Promise(resolve => {
      context.on('close', resolve);
    });
  } catch (err) {
    console.error('Browser launch error:', err.message);
  }
})();
