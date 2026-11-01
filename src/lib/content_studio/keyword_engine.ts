import { KeywordItem, KeywordCategory, SearchIntentType } from './types';
import { VerifiedJobFacts } from './intake';

export interface KeywordSuggestionSet {
  primary: KeywordItem;
  secondary: KeywordItem[];
  longtail: KeywordItem[];
  related: KeywordItem[];
  allKeywords: KeywordItem[];
}

const COMMON_ORG_TRANSLATIONS: Record<string, string> = {
  'বাংলাদেশ ব্যাংক': 'Bangladesh Bank',
  'বাংলাদেশ রেলওয়ে': 'Bangladesh Railway',
  'বাংলাদেশ পুলিশ': 'Bangladesh Police',
  'বাংলাদেশ সেনাবাহিনী': 'Bangladesh Army',
  'বাংলাদেশ বিমান বাহিনী': 'Bangladesh Air Force',
  'বাংলাদেশ নৌবাহিনী': 'Bangladesh Navy',
  'বিসিএস': 'BCS',
  'বাংলাদেশ সরকারি কর্ম কমিশন': 'BPSC',
  'দুদক': 'ACC',
  'দুর্নীতি দমন কমিশন': 'Anti-Corruption Commission',
  'রাজউক': 'RAJUK',
  'পল্লী বিদ্যুৎ': 'Palli Bidyut',
  'বিদ্যুৎ উন্নয়ন বোর্ড': 'BPDB',
  'তিতাস গ্যাস': 'Titas Gas',
  'ঢাকা উত্তর সিটি কর্পোরেশন': 'DNCC',
  'ঢাকা দক্ষিণ সিটি কর্পোরেশন': 'DSCC',
  'চট্টগ্রাম বন্দর কর্তৃপক্ষ': 'Chittagong Port Authority',
  'বাংলাদেশ সড়ক পরিবহন কর্তৃপক্ষ': 'BRTA',
  'বর্ডার গার্ড বাংলাদেশ': 'BGB',
  'জাতীয় রাজস্ব বোর্ড': 'NBR',
  'সাধারণ বীমা কর্পোরেশন': 'Sadharan Bima Corporation',
  'জীবন বীমা কর্পোরেশন': 'Jiban Bima Corporation',
  'বাংলাদেশ কৃষি ব্যাংক': 'Krishi Bank',
  'সোনালী ব্যাংক': 'Sonali Bank',
  'জনতা ব্যাংক': 'Janata Bank',
  'অগ্রণী ব্যাংক': 'Agrani Bank',
  'রূপালী ব্যাংক': 'Rupali Bank',
  'বেসিক ব্যাংক': 'BASIC Bank'
};

export function generateKeywordSuggestions(facts: VerifiedJobFacts): KeywordSuggestionSet {
  const org = facts.organization.replace(/নিয়োগ বিজ্ঞপ্তি.*/, '').trim();
  const orgEn = COMMON_ORG_TRANSLATIONS[org] || org;
  const title = facts.jobTitle;
  const yearBn = '২০২৬';
  const yearEn = '2026';

  const primaryText = `${org} নিয়োগ বিজ্ঞপ্তি ${yearBn}`;
  const primary: KeywordItem = {
    id: 'kw-pri-1',
    keyword: primaryText,
    category: 'primary',
    intent: 'informational',
    usageCount: 0,
    isPrimary: true
  };

  const secondaryKeywordsRaw: Array<{ text: string; cat: KeywordCategory; intent: SearchIntentType }> = [
    { text: `${orgEn} Job Circular ${yearEn}`, cat: 'english_search', intent: 'informational' },
    { text: `${org} Job Circular ${yearEn}`, cat: 'english_search', intent: 'informational' },
    { text: `${org} চাকরি`, cat: 'secondary', intent: 'informational' },
    { text: `${org} চাকরির খবর`, cat: 'secondary', intent: 'informational' },
    { text: `${orgEn} Recruitment`, cat: 'english_search', intent: 'informational' },
    { text: `${org}-এ চাকরি`, cat: 'secondary', intent: 'informational' },
    { text: `${org} আবেদন`, cat: 'application', intent: 'application' },
    { text: `${title} পদে নিয়োগ`, cat: 'job_title', intent: 'informational' }
  ];

  const secondary: KeywordItem[] = secondaryKeywordsRaw.map((k, idx) => ({
    id: `kw-sec-${idx + 1}`,
    keyword: k.text,
    category: k.cat,
    intent: k.intent,
    usageCount: 0,
    isPrimary: false
  }));

  const longtailKeywordsRaw: Array<{ text: string; intent: SearchIntentType }> = [
    { text: `${org} নিয়োগ বিজ্ঞপ্তি ${yearBn} PDF`, intent: 'document_download' },
    { text: `${org} চাকরিতে আবেদন করার নিয়ম`, intent: 'application' },
    { text: `${org} নিয়োগ যোগ্যতা ও শর্তাবলী`, intent: 'eligibility' },
    { text: `${org} আবেদনের শেষ তারিখ`, intent: 'deadline' },
    { text: `${org} Job Circular Apply Online`, intent: 'application' }
  ];

  const longtail: KeywordItem[] = longtailKeywordsRaw.map((k, idx) => ({
    id: `kw-long-${idx + 1}`,
    keyword: k.text,
    category: 'longtail',
    intent: k.intent,
    usageCount: 0,
    isPrimary: false
  }));

  const relatedKeywordsRaw: Array<{ text: string; intent: SearchIntentType }> = [
    { text: 'সরকারি চাকরির খবর ২০২৬', intent: 'informational' },
    { text: 'টেলিটক অনলাইন আবেদন পোর্টাল', intent: 'navigational' },
    { text: facts.category === 'bank' ? 'ব্যাংক জব সার্কুলার' : 'সরকারি নিয়োগ বিজ্ঞপ্তি', intent: 'informational' }
  ];

  const related: KeywordItem[] = relatedKeywordsRaw.map((k, idx) => ({
    id: `kw-rel-${idx + 1}`,
    keyword: k.text,
    category: 'related',
    intent: k.intent,
    usageCount: 0,
    isPrimary: false
  }));

  const allKeywords = [primary, ...secondary, ...longtail, ...related];

  return {
    primary,
    secondary,
    longtail,
    related,
    allKeywords
  };
}

export function analyzeKeywordUsage(keywords: KeywordItem[], articleText: string, titleText: string, metaDescriptionText: string): KeywordItem[] {
  const normArticle = (articleText || '').toLowerCase();
  const normTitle = (titleText || '').toLowerCase();
  const normMeta = (metaDescriptionText || '').toLowerCase();

  return keywords.map(kw => {
    const term = kw.keyword.toLowerCase().trim();
    if (!term) return kw;

    let count = 0;
    let pos = 0;
    while ((pos = normArticle.indexOf(term, pos)) !== -1) {
      count++;
      pos += term.length;
    }

    return {
      ...kw,
      usageCount: count,
      inTitle: normTitle.includes(term),
      inMetaDescription: normMeta.includes(term)
    };
  });
}

export function classifySearchIntent(facts: VerifiedJobFacts, primaryKeyword: string): {
  primaryIntent: SearchIntentType;
  intentSummary: string;
} {
  const kw = primaryKeyword.toLowerCase();
  if (kw.includes('apply') || kw.includes('আবেদন') || kw.includes('নিয়ম')) {
    return {
      primaryIntent: 'application',
      intentSummary: 'চাকরিপ্রার্থী অনলাইনে সরাসরি আবেদনের নির্দেশিকা এবং অফিসিয়াল লিংক খুঁজছেন।'
    };
  }
  if (kw.includes('pdf') || kw.includes('ডাউনলোড')) {
    return {
      primaryIntent: 'document_download',
      intentSummary: 'ব্যবহারকারী অফিশিয়াল সার্কুলার বা নিয়োগ বিজ্ঞপ্তির আসল পিডিএফ কপি ডাউনলোড করতে আগ্রহী।'
    };
  }
  if (kw.includes('যোগ্যতা') || kw.includes('বয়স')) {
    return {
      primaryIntent: 'eligibility',
      intentSummary: 'প্রার্থী তার শিক্ষাগত ডিগ্রি, বয়স ও অন্যান্য যোগ্যতা এই বিজ্ঞপ্তির সাথে যাচাই করতে চান।'
    };
  }
  return {
    primaryIntent: 'informational',
    intentSummary: `${facts.organization}-এর ${facts.jobTitle} নিয়োগ বিজ্ঞপ্তির সম্পূর্ণ বিবরণ, শূন্যপদ, বেতন ও গুরুত্বপূর্ণ তারিখ সম্পর্কিত তথ্য অনুসন্ধান।`
  };
}
