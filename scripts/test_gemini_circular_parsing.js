const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(process.cwd(), '.browser_profile', 'gemini_session');

(async () => {
  console.log('Testing Real Gemini Circular Extraction...');
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const editor = page.locator('div[contenteditable="true"]').first();
  await editor.waitFor({ state: 'visible', timeout: 10000 });
  
  const testPrompt = `Analyze this DGMS recruitment notice and return JSON ONLY:
Organization: Directorate General of Medical Service (DGMS)
Positions:
১। ড্রাফটসমান - ১টি পদ - বেতন ২২,৮০০-৫৫,২০০ (১৫তম গ্রেড)
২। কম্পিউটার মুদ্রাক্ষরিক - ১টি পদ - বেতন ২১,৯০০-৫২,৯০০ (১৬তম গ্রেড)
Deadline: 21 November 2026

Respond in JSON block \`\`\`json { "title": "...", "totalPosts": 2, "positions": [...] } \`\`\``;

  console.log('Sending circular prompt to Gemini Web...');
  await editor.click();
  await editor.fill(testPrompt);
  await page.keyboard.press('Enter');

  try {
    const sendBtn = page.locator('button[aria-label*="Send"], button.send-button, mat-icon[data-mat-icon-name="send"]').first();
    if (await sendBtn.isVisible()) await sendBtn.click();
  } catch {}

  console.log('Streaming response from Gemini Web...');
  let fullResponse = '';
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(1000);
    const text = await page.evaluate(() => {
      const els = document.querySelectorAll('message-content, model-response, .model-response-text');
      if (els.length > 0) {
        return els[els.length - 1].innerText || '';
      }
      return '';
    });

    if (text && text.length > 30) {
      if (text.includes('```json') || text.includes('}')) {
        fullResponse = text;
        console.log(`Received ${text.length} chars from Gemini at second ${i + 1}`);
        if (text.includes('}') && text.length > 100) break;
      }
    }
  }

  console.log('--- RAW GEMINI RESPONSE ---');
  console.log(fullResponse.substring(0, 500));
  console.log('---------------------------');

  const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/) || fullResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    console.log('🎉 SUCCESS! PARSED FROM REAL GEMINI:');
    console.log('Title:', parsed.title);
    console.log('Positions:', parsed.positions);
  } else {
    console.log('Could not extract JSON from:', fullResponse);
  }

  await context.close();
})().catch(err => {
  console.error('Circular parsing test failed:', err);
  process.exit(1);
});
