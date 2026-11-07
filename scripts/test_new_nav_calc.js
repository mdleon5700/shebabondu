const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Simulate the calculation with new numbers
const navItems = [
  { id: 'all-jobs', label: 'সকল চাকরি' },
  { id: 'home', label: 'হোম' },
  { id: 'govt', label: 'সরকারি চাকরি' },
  { id: 'private', label: 'বেসরকারি চাকরি' },
  { id: 'categories', label: 'চাকরির ক্যাটাগরি' },
  { id: 'exam', label: 'পরীক্ষা ও ফলাফল' },
  { id: 'career', label: 'ক্যারিয়ার গাইড' },
  { id: 'urgent-jobs', label: 'জরুরি নিয়োগ' }
];

const itemWidthsMap = {
  'home': 45,
  'all-jobs': 122,
  'govt': 116,
  'private': 126,
  'categories': 128,
  'exam': 130,
  'career': 114,
  'urgent-jobs': 116
};

const moreButtonWidth = 50;
const containerDeduction = 76;

for (const headerWidth of [1280, 1366, 1440, 1536, 1920]) {
  const logoWidth = headerWidth >= 1800 ? 350 : 205;
  for (const role of ['admin', 'guest']) {
    const rightWidth = role === 'admin' ? 205 : 375;
    const availableSpace = headerWidth - logoWidth - rightWidth - containerDeduction;

    let accumulatedWidth = 0;
    let count = 0;

    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      const itemWidth = itemWidthsMap[item.id] || 120;
      const isLast = (i === navItems.length - 1);
      const neededWidth = accumulatedWidth + itemWidth + (isLast ? 0 : moreButtonWidth);

      if (neededWidth <= availableSpace) {
        accumulatedWidth += itemWidth;
        count++;
      } else if (isLast && (accumulatedWidth + itemWidth <= availableSpace)) {
        count++;
      } else {
        break;
      }
    }
    const visibleCount = Math.max(1, count);
    const visibleLabels = navItems.slice(0, visibleCount).map(n => n.label);
    console.log(`[${role.toUpperCase()}] Width ${headerWidth}: ${visibleCount}/${navItems.length} items (${visibleLabels.join(', ')})`);
  }
}

