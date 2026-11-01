import { SEOAnalysis, SEOChecklistItem, InternalLinkRecommendation, ContentStudioMetadata } from './types';
import { VerifiedJobFacts } from './intake';
import { serverDB } from '@/lib/db';

export function generateInitialMetadata(facts: VerifiedJobFacts, primaryKeyword: string): ContentStudioMetadata {
  const org = facts.organization.replace(/নিয়োগ বিজ্ঞপ্তি.*/, '').trim();
  const title = facts.jobTitle;
  const deadline = facts.applicationDeadline;
  const vacancies = facts.vacancies;

  const seoTitle = `${title} - ${org} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`;
  const seoDescription = `${org}-এ ${title} পদে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬ প্রকাশিত হয়েছে। মোট পদসংখ্যা: ${vacancies}, আবেদনের শেষ সময়: ${deadline}। শিক্ষাগত যোগ্যতা ও অনলাইনে আবেদন করার নিয়ম দেখুন।`;

  // Generate clean, stable, URL-safe slug
  const baseOrg = org.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
  const baseTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
  const slugSeed = baseOrg || baseTitle || 'job';
  const cleanSlug = `${slugSeed.slice(0, 35)}-2026-${facts.draftId.slice(-6)}`.replace(/-+/g, '-').replace(/^-|-$/g, '');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chakrisheba.com';
  const canonicalUrl = `${siteUrl}/jobs/${cleanSlug}`;

  return {
    seoTitle,
    seoDescription,
    slug: cleanSlug,
    focusKeyword: primaryKeyword,
    secondaryKeywords: [
      `${org} job circular 2026`,
      `${org} চাকরি`,
      'সরকারি চাকরির খবর ২০২৬',
      'নিয়োগ বিজ্ঞপ্তি ২০২৬'
    ],
    canonicalUrl,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogImage: facts.pdfUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
    twitterTitle: seoTitle,
    twitterDescription: seoDescription,
    twitterImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
    imageAltText: `${org} - ${title} নিয়োগ বিজ্ঞপ্তি`,
    robotsDirectives: 'index, follow'
  };
}

export function analyzeSEO(
  articleMarkdown: string,
  metadata: ContentStudioMetadata,
  facts: VerifiedJobFacts,
  internalLinks: InternalLinkRecommendation[]
): SEOAnalysis {
  const text = articleMarkdown || '';
  const normText = text.toLowerCase();
  const kw = (metadata.focusKeyword || '').toLowerCase().trim();

  // 1. Heading checks
  const lines = text.split('\n');
  let h1Count = 0;
  let h2Count = 0;
  lines.forEach(line => {
    if (line.startsWith('# ')) h1Count++;
    else if (line.startsWith('## ')) h2Count++;
  });
  const headingStructureValid = h1Count === 1 && h2Count >= 3;

  // 2. Keyword occurrences
  let primaryKeywordCount = 0;
  if (kw) {
    let pos = 0;
    while ((pos = normText.indexOf(kw, pos)) !== -1) {
      primaryKeywordCount++;
      pos += kw.length;
    }
  }

  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const primaryKeywordDensity = wordCount > 0 ? Number(((primaryKeywordCount / wordCount) * 100).toFixed(2)) : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Check first 100 words for keyword
  const first100Words = words.slice(0, 100).join(' ').toLowerCase();
  const kwInIntro = kw ? Boolean(first100Words.includes(kw) || first100Words.includes(facts.organization.toLowerCase())) : false;

  // External and internal links
  const externalLinksCount = (text.match(/https?:\/\/[^\s\)]+/g) || []).length;
  const internalLinksCount = internalLinks.filter(l => l.isApplied).length;

  const checklist: SEOChecklistItem[] = [
    {
      id: 'chk-h1-kw',
      label: 'আর্টিকেলের মূল H1 শিরোনামে প্রাথমিক কিওয়ার্ড রয়েছে',
      passed: Boolean(kw && lines.find(l => l.startsWith('# ') && l.toLowerCase().includes(kw))),
      severity: 'error',
      recommendation: 'H1 শিরোনামে প্রাথমিক কিওয়ার্ড স্বাভাবিকভাবে অন্তর্ভুক্ত করুন।',
      scoreContribution: 15
    },
    {
      id: 'chk-intro-kw',
      label: 'ভূমিকার প্রথম ১০০ শব্দের মধ্যে কিওয়ার্ড বা প্রতিষ্ঠানের নাম আছে',
      passed: kwInIntro,
      severity: 'error',
      recommendation: 'প্রথম প্যারাগ্রাফেই মূল কিওয়ার্ড বা প্রতিষ্ঠানটির নাম উল্লেখ করুন।',
      scoreContribution: 15
    },
    {
      id: 'chk-title-kw',
      label: 'এসইও মেটা টাইটেলে মূল কিওয়ার্ড অন্তর্ভুক্ত',
      passed: Boolean(kw && (metadata.seoTitle || '').toLowerCase().includes(kw)),
      severity: 'error',
      recommendation: 'এসইও টাইটেলে প্রাথমিক কিওয়ার্ড যুক্ত করুন।',
      scoreContribution: 15
    },
    {
      id: 'chk-desc-kw',
      label: 'মেটা ডেসক্রিপশনে কিওয়ার্ড ও গুরুত্বপূর্ণ তথ্য বিদ্যমান',
      passed: Boolean(kw && (metadata.seoDescription || '').toLowerCase().includes(facts.organization.toLowerCase())),
      severity: 'warning',
      recommendation: 'মেটা ডেসক্রিপশনে প্রতিষ্ঠানের নাম ও আবেদনের শেষ তারিখ রাখুন।',
      scoreContribution: 10
    },
    {
      id: 'chk-headings',
      label: 'সঠিক হেডিং হায়ারার্কি (১টি H1 এবং কমপক্ষে ৩টি H2)',
      passed: headingStructureValid,
      severity: 'error',
      recommendation: 'আর্টিকেলে অবশ্যই একটি মাত্র H1 এবং প্রয়োজনীয় H2 সাব-হেডিং বজায় রাখুন।',
      scoreContribution: 15
    },
    {
      id: 'chk-wordcount',
      label: 'পর্যাপ্ত কন্টেন্ট গভীরতা (কমপক্ষে ২৫০ শব্দ)',
      passed: wordCount >= 250,
      severity: 'warning',
      recommendation: 'চাকরিপ্রার্থীদের পূর্ণাঙ্গ নির্দেশনার জন্য আরও বিস্তারিত তথ্য যোগ করুন।',
      scoreContribution: 10
    },
    {
      id: 'chk-internal-links',
      label: 'প্রাসঙ্গিক অভ্যন্তরীণ লিংক (Internal Links) সুপারিশকৃত',
      passed: internalLinks.length > 0,
      severity: 'info',
      recommendation: 'সম্পর্কিত সরকারি বা ব্যাংক চাকরির পেজের লিংক যুক্ত করুন।',
      scoreContribution: 10
    },
    {
      id: 'chk-external-link',
      label: 'অফিশিয়াল আবেদন পোর্টাল বা সার্কুলার সোর্স লিংক বিদ্যমান',
      passed: Boolean(externalLinksCount > 0 || (facts.applicationUrl && facts.applicationUrl.startsWith('http'))),
      severity: 'warning',
      recommendation: 'সরাসরি আবেদনের অফিশিয়াল ওয়েবসাইটের লিংক যুক্ত করুন।',
      scoreContribution: 5
    },
    {
      id: 'chk-meta-len',
      label: 'মেটা ডেসক্রিপশন সাইজ আদর্শ (১০০ থেকে ১৮০ অক্ষর)',
      passed: (metadata.seoDescription || '').length >= 100 && (metadata.seoDescription || '').length <= 200,
      severity: 'info',
      recommendation: 'মেটা ডেসক্রিপশন ১২০-১৬০ অক্ষরের মধ্যে রাখা গুগল সার্চ রেজাল্টের জন্য সেরা।',
      scoreContribution: 5
    }
  ];

  let totalScore = 0;
  checklist.forEach(item => {
    if (item.passed) totalScore += item.scoreContribution;
  });

  return {
    score: Math.min(100, Math.round(totalScore)),
    checklist,
    primaryKeywordDensity,
    primaryKeywordCount,
    headingStructureValid,
    h1Count,
    h2Count,
    internalLinksCount,
    externalLinksCount,
    metaTitleLength: (metadata.seoTitle || '').length,
    metaDescLength: (metadata.seoDescription || '').length,
    wordCount,
    readingTimeMinutes,
    hasJobPostingSchema: Boolean(facts.organization && facts.jobTitle && facts.applicationDeadline)
  };
}

export function recommendInternalLinks(facts: VerifiedJobFacts): InternalLinkRecommendation[] {
  const recommendations: InternalLinkRecommendation[] = [];

  // Category based recommendation
  if (facts.category === 'govt') {
    recommendations.push({
      id: 'link-rec-1',
      targetUrl: '/government-jobs',
      anchorText: 'সরকারি চাকরির খবর ২০২৬',
      targetTitle: 'সকল সরকারি চাকরির সার্কুলার ও নিয়োগ বিজ্ঞপ্তি ২০২৬',
      relevanceType: 'category',
      relevanceScore: 95,
      isApplied: true
    });
  } else if (facts.category === 'bank') {
    recommendations.push({
      id: 'link-rec-1',
      targetUrl: '/bank-jobs',
      anchorText: 'ব্যাংক জব সার্কুলার ২০২৬',
      targetTitle: 'সরকারি ও বেসরকারি ব্যাংক নিয়োগ বিজ্ঞপ্তি ২০২৬',
      relevanceType: 'category',
      relevanceScore: 95,
      isApplied: true
    });
  }

  // Application guide recommendation
  if (facts.applicationUrl && facts.applicationUrl.includes('teletalk.com.bd')) {
    recommendations.push({
      id: 'link-rec-2',
      targetUrl: '/career-guides/teletalk-apply-guide',
      anchorText: 'টেলিটক অনলাইনে আবেদনের নিয়ম ও ছবি সাইজ গাইড',
      targetTitle: 'টেলিটক অনলাইন আবেদন ও এসএমএস পেমেন্ট নির্দেশিকা',
      relevanceType: 'guide',
      relevanceScore: 90,
      isApplied: true
    });
  }

  // Related jobs in same category
  recommendations.push({
    id: 'link-rec-3',
    targetUrl: '/latest-jobs',
    anchorText: 'চলমান সকল নিয়োগ বিজ্ঞপ্তি',
    targetTitle: 'সাম্প্রতিক চাকরির খবর ও আবেদন পোর্টাল',
    relevanceType: 'category',
    relevanceScore: 80,
    isApplied: false
  });

  return recommendations;
}
