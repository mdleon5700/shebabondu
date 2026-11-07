const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Mobile device viewport matching iPhone / mobile portrait (390 x 844)
  const mobilePage = await browser.newPage({ 
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });

  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  // Check if "অডিও শুনুন" or "১০০% নির্ভুল আবেদন গ্যারান্টি" is in the DOM
  const audioFound = await mobilePage.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasAudioButton: text.includes('অডিও শুনুন'),
      hasGuaranteeStrip: text.includes('১০০% নির্ভুল আবেদন গ্যারান্টি')
    };
  });

  console.log('Mobile Page Audio check:', audioFound);

  // Scroll to the BCC job card or first card
  const bccCard = await mobilePage.$('text=বাংলাদেশ কম্পিউটার কাউন্সিল');
  if (bccCard) {
    await bccCard.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(500);
  }

  await mobilePage.screenshot({ path: 'scripts/mobile_job_card_clean.png', fullPage: false });
  console.log('Saved screenshot: scripts/mobile_job_card_clean.png');

  // Also check desktop
  const desktopPage = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const desktopAudioFound = await desktopPage.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasAudioButton: text.includes('অডিও শুনুন'),
      hasGuaranteeStrip: text.includes('১০০% নির্ভুল আবেদন গ্যারান্টি')
    };
  });
  console.log('Desktop Page Audio check:', desktopAudioFound);

  await browser.close();

  if (audioFound.hasAudioButton || audioFound.hasGuaranteeStrip || desktopAudioFound.hasAudioButton || desktopAudioFound.hasGuaranteeStrip) {
    throw new Error('FAILED: Audio or Guarantee section is still found in DOM!');
  }

  console.log('✅ SUCCESS: The section is 100% completely removed from all job cards!');
})();

