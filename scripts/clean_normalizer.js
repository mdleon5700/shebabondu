const fs = require('fs');
let normContent = fs.readFileSync('src/lib/matching/normalizer.ts', 'utf8');
const duplicateBlock = `    return { level: 'any', labelBn: 'শিক্ষাগত যোগ্যতা প্রযোজ্য নয়' };
  }
    if (lower.includes('\\u09a1\\u09bf\\u09aa\\u09cd\\u09b2\\u09cb\\u09ae\\u09be') || lower.includes('diploma') || lower.includes('\\u09aa\\u09b2\\u09bf\\u099f\\u09c7\\u0995\\u09a8\\u09bf\\u0995')) {
      return { level: 'diploma', labelBn: '\\u09a1\\u09bf\\u09aa\\u09cd\\u09b2\\u09cb\\u09ae\\u09be \\u0987\\u09a8 \\u0987\\u099e\\u09cd\\u099c\\u09bf\\u09a8\\u09bf\\u09af\\u09bc\\u09be\\u09b0\\u09bf\\u0982' };
    }
    if (lower.includes('\\u098f\\u0987\\u099a\\u098f\\u09b8\\u09b8\\u09bf') || lower.includes('\\u0989\\u099a\\u09cd\\u099a \\u09ae\\u09be\\u09a7\\u09cd\\u09af\\u09ae\\u09bf\\u0995') || lower.includes('hsc') || lower.includes('\\u0986\\u09b2\\u09bf\\u09ae')) {
      return { level: 'hsc', labelBn: '\\u098f\\u0987\\u099a\\u098f\\u09b8\\u09b8\\u09bf / \\u09b8\\u09ae\\u09ae\\u09be\\u09a8' };
    }
    if (lower.includes('\\u098f\\u09b8\\u098f\\u09b8\\u09b8\\u09bf') || lower.includes('\\u09ae\\u09be\\u09a7\\u09cd\\u09af\\u09ae\\u09bf\\u0995') || lower.includes('ssc') || lower.includes('\\u09a6\\u09be\\u0996\\u09bf\\u09b2')) {
      return { level: 'ssc', labelBn: '\\u098f\\u09b8\\u098f\\u09b8\\u09b8\\u09bf / \\u09b8\\u09ae\\u09ae\\u09be\\u09a8' };
    }
    if (lower.includes('\\u0985\\u09b7\\u09cd\\u099f\\u09ae') || lower.includes('\\u099c\\u09c7\\u098f\\u09b8\\u09b8\\u09bf') || lower.includes('jsc') || lower.includes('জেডিসি') || lower.includes('jdc')) {
      return { level: 'jsc', labelBn: '\\u09ee\\u09ae \\u09b6\\u09cd\\u09b0\\u09c7\\u09a3\\u09bf / \\u099c\\u09c7\\u098f\\u09b8\\u09b8\\u09bf' };
    }

    return { level: 'bachelor', labelBn: '\\u09b8\\u09cd\\u09a8\\u09be\\u09a4\\u0995 \\u09ac\\u09be \\u09b8\\u09ae\\u09ae\\u09be\\u09a8' };
  }`;

const cleanBlock = `    return { level: 'any', labelBn: 'শিক্ষাগত যোগ্যতা প্রযোজ্য নয়' };
  }`;

if (normContent.includes(duplicateBlock)) {
  normContent = normContent.replace(duplicateBlock, cleanBlock);
  fs.writeFileSync('src/lib/matching/normalizer.ts', normContent, 'utf8');
  console.log('✅ Removed duplicate block from normalizer.ts');
} else {
  console.log('Duplicate block not found exactly, using index slicing');
  const startIdx = normContent.indexOf("return { level: 'any', labelBn: 'শিক্ষাগত যোগ্যতা প্রযোজ্য নয়' };\n  }\n    if (lower.includes");
  const endIdx = normContent.indexOf("public static extractSubjects");
  if (startIdx !== -1 && endIdx !== -1) {
    const keepBefore = normContent.substring(0, startIdx + "return { level: 'any', labelBn: 'শিক্ষাগত যোগ্যতা প্রযোজ্য নয়' };\n  }\n\n  /**\n   *".length - 7);
    const keepAfter = normContent.substring(endIdx);
    normContent = keepBefore + "\n  /**\n   * Extracts required subjects from requirement strings\n   */\n  " + keepAfter;
    fs.writeFileSync('src/lib/matching/normalizer.ts', normContent, 'utf8');
    console.log('✅ Sliced cleanly');
  }
}
