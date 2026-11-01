import { BengaliQualityReport, BengaliQualityIssue } from './types';

/**
 * Analyzes Bengali language quality, grammar, readability, and natural keyword flow
 */
export function checkBengaliLanguageQuality(
  articleText: string,
  primaryKeyword: string,
  secondaryKeywords: string[]
): BengaliQualityReport {
  const issues: BengaliQualityIssue[] = [];
  const suggestions: string[] = [];

  const text = articleText || '';
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0 && !p.startsWith('#') && !p.startsWith('|'));
  const sentences = text.split(/[।\n]+/).map(s => s.trim()).filter(s => s.length > 5);

  let grammarScore = 100;
  let readabilityScore = 100;

  // 1. Check for missing punctuation (sentences ending without dā̃ṛi '।')
  let missingDariCount = 0;
  paragraphs.forEach(p => {
    const clean = p.trim();
    if (!clean.endsWith('।') && !clean.endsWith('?') && !clean.endsWith('!') && !clean.endsWith(':') && !clean.endsWith('---')) {
      missingDariCount++;
    }
  });

  if (missingDariCount > 2) {
    issues.push({
      type: 'punctuation',
      excerpt: 'কিছু প্যারাগ্রাফের শেষে দাড়ি (।) অনুপস্থিত।',
      suggestion: 'প্যারাগ্রাফের শেষ বাক্যে যথাযথ বিরামচিহ্ন (।) প্রদান করুন।',
      severity: 'low'
    });
    grammarScore -= Math.min(10, missingDariCount * 2);
  }

  // 2. Check for sentence length / readability
  let overlyLongSentences = 0;
  sentences.forEach(s => {
    const wordCount = s.split(/\s+/).length;
    if (wordCount > 40) {
      overlyLongSentences++;
      if (overlyLongSentences <= 2) {
        issues.push({
          type: 'grammar',
          excerpt: s.slice(0, 60) + '...',
          suggestion: 'বাক্যটি অতিরিক্ত দীর্ঘ (৪০+ শব্দ)। পাঠযোগ্যতা বৃদ্ধির জন্য বাক্যটি দুটি ছোট বাক্যে বিভক্ত করুন।',
          severity: 'medium'
        });
      }
    }
  });

  if (overlyLongSentences > 0) {
    readabilityScore -= Math.min(15, overlyLongSentences * 5);
  }

  // 3. Check for repeated duplicate sentences
  const seenSentences = new Set<string>();
  let duplicateSentencesCount = 0;
  sentences.forEach(s => {
    const norm = s.replace(/[\s\-_]/g, '').toLowerCase();
    if (norm.length > 15) {
      if (seenSentences.has(norm)) {
        duplicateSentencesCount++;
      } else {
        seenSentences.add(norm);
      }
    }
  });

  if (duplicateSentencesCount > 0) {
    issues.push({
      type: 'repetition',
      excerpt: `${duplicateSentencesCount}টি বাক্য একাধিকবার পুনরাবৃত্তি হয়েছে।`,
      suggestion: 'অনাবশ্যক পুনরাবৃত্তি পরিহার করে তথ্যবহুল বাক্য ব্যবহার করুন।',
      severity: 'medium'
    });
    readabilityScore -= Math.min(15, duplicateSentencesCount * 5);
  }

  // 4. Check for exaggerated promotional language / clickbait filler
  const clickbaitWords = ['সুবর্ণ সুযোগ হাতছাড়া করবেন না', 'লটারির মতো সুযোগ', 'অবিলম্বে দেখুন না হলে মিস', 'সবাই আবেদন করুন দ্রুত'];
  clickbaitWords.forEach(badWord => {
    if (text.includes(badWord)) {
      issues.push({
        type: 'filler',
        excerpt: badWord,
        suggestion: 'অতিরঞ্জিত বা চটকদার বিজ্ঞাপনধর্মী ভাষা পরিহার করে বস্তুনিষ্ঠ তথ্য উপস্থাপন করুন।',
        severity: 'high'
      });
      readabilityScore -= 8;
    }
  });

  // 5. Check for unnatural English keyword stuffing
  let englishKeywordCount = 0;
  const englishTerms = secondaryKeywords.filter(k => /^[a-zA-Z\s0-9]+$/.test(k.trim()));
  englishTerms.forEach(term => {
    const matches = text.match(new RegExp(term, 'gi'));
    if (matches) englishKeywordCount += matches.length;
  });

  const totalWords = text.split(/\s+/).length;
  const hasUnnaturalEnglishMix = englishKeywordCount > 15 || (totalWords > 0 && (englishKeywordCount / totalWords) > 0.08);

  if (hasUnnaturalEnglishMix) {
    issues.push({
      type: 'unnatural_english',
      excerpt: `ইংরেজি কিওয়ার্ড অতিরিক্ত বার ব্যবহৃত হয়েছে (${englishKeywordCount} বার)।`,
      suggestion: 'বাংলা বাক্যের স্বাভাবিকতা বজায় রাখতে অপ্রয়োজনীয় ইংরেজি কিওয়ার্ড স্টাফিং কমান।',
      severity: 'high'
    });
    readabilityScore -= 15;
    grammarScore -= 10;
  }

  grammarScore = Math.max(30, Math.min(100, grammarScore));
  readabilityScore = Math.max(30, Math.min(100, readabilityScore));
  const overallScore = Math.round((grammarScore * 0.5) + (readabilityScore * 0.5));

  if (overallScore >= 85) {
    suggestions.push('ভাষাগত মান চমৎকার ও প্রাঞ্জল। বাক্যগঠন সম্পূর্ণ স্বাভাবিক।');
  } else if (overallScore >= 70) {
    suggestions.push('ভাষা মানসম্মত। নির্দেশিত ছোট ছোট বিরামচিহ্ন ও দৈর্ঘ্য সংশোধন করলে আরও আকর্ষণীয় হবে।');
  } else {
    suggestions.push('পাঠযোগ্যতা বাড়াতে বড় বাক্য ভেঙে ছোট করুন এবং চটকদার ভাষা পরিহার করুন।');
  }

  return {
    grammarScore,
    readabilityScore,
    overallScore,
    issues,
    suggestions,
    hasUnnaturalEnglishMix
  };
}
