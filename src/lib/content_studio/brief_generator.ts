import { ContentBrief, ContentOutline, OutlineSection, KeywordItem } from './types';
import { VerifiedJobFacts } from './intake';
import { classifySearchIntent } from './keyword_engine';

export function generateContentBrief(
  facts: VerifiedJobFacts,
  primaryKeyword: KeywordItem,
  secondaryKeywords: KeywordItem[],
  relatedKeywords: KeywordItem[]
): ContentBrief {
  const intentResult = classifySearchIntent(facts, primaryKeyword.keyword);

  const importantEligibilityNotes: string[] = [];
  if (facts.minEducation !== 'বিজ্ঞপ্তিতে উল্লেখ নেই') {
    importantEligibilityNotes.push(`ন্যূনতম শিক্ষাগত যোগ্যতা: ${facts.minEducation}`);
  }
  if (facts.ageLimits !== 'বিজ্ঞপ্তিতে উল্লেখ নেই') {
    importantEligibilityNotes.push(`বয়সসীমা: ${facts.ageLimits}`);
  }
  if (facts.quotaRelaxation) {
    importantEligibilityNotes.push(`কোটা সুবিধা: ${facts.quotaRelaxation}`);
  }

  const officialSourceLinks: Array<{ label: string; url: string }> = [];
  if (facts.applicationUrl && facts.applicationUrl.startsWith('http')) {
    officialSourceLinks.push({
      label: 'অনলাইন আবেদন লিংক (অফিশিয়াল)',
      url: facts.applicationUrl
    });
  }
  if (facts.pdfUrl && facts.pdfUrl.startsWith('http')) {
    officialSourceLinks.push({
      label: 'মূল সার্কুলার পিডিএফ (PDF Download)',
      url: facts.pdfUrl
    });
  }
  if (officialSourceLinks.length === 0 && facts.officialSourceUrl) {
    officialSourceLinks.push({
      label: 'অফিশিয়াল সোর্স পেজ',
      url: facts.officialSourceUrl
    });
  }

  const suggestedHeadings = [
    `${facts.organization} নিয়োগ বিজ্ঞপ্তি ২০২৬ সংক্ষেপে`,
    'পদ ও পদসংখ্যা',
    'শিক্ষাগত যোগ্যতা ও অন্যান্য শর্তাবলী',
    'বয়সসীমা ও কোটা সুবিধা',
    ...(facts.salary !== 'বিজ্ঞপ্তিতে উল্লেখ নেই' ? ['বেতন স্কেল ও সুযোগ-সুবিধা'] : []),
    'আবেদনের শেষ সময় ও গুরুত্বপূর্ণ তারিখ',
    'আবেদন ফি ও পেমেন্ট পদ্ধতি',
    'অনলাইনে আবেদন করার নিয়ম (ধাপে ধাপে)',
    'প্রয়োজনীয় কাগজপত্র ও ডকুমেন্টস',
    'গুরুত্বপূর্ণ নির্দেশনা ও নিয়োগ বিধি',
    'সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ)'
  ];

  const faqTopics = [
    `${facts.organization} নিয়োগে আবেদনের শেষ তারিখ কবে?`,
    'এই বিজ্ঞপ্তিতে আবেদনের শিক্ষাগত যোগ্যতা কী?',
    'আবেদন ফি কত টাকা এবং কীভাবে পরিশোধ করতে হবে?',
    'কোন ওয়েবসাইটে গিয়ে অনলাইনে আবেদন করতে হবে?',
    'বয়সসীমা কত এবং কোটা প্রার্থীদের ক্ষেত্রে কোনো ছাড় আছে কি?'
  ];

  const internalLinkOpportunities: Array<{ title: string; url: string; relevanceReason: string }> = [
    {
      title: 'সরকারি চাকরির খবর ২০২৬',
      url: '/government-jobs',
      relevanceReason: 'একই ধরনের সরকারি নিয়োগ বিজ্ঞপ্তি তালিকা'
    },
    {
      title: 'টেলিটক অনলাইনে আবেদনের নিয়ম ও গাইড',
      url: '/career-guides/teletalk-apply-guide',
      relevanceReason: 'টেলিটক পোর্টালে ফর্ম পূরণের বিস্তারিত সহায়িকা'
    },
    {
      title: 'বিসিএস ও ব্যাংক জব সার্কুলার',
      url: '/bank-jobs',
      relevanceReason: 'সম্পর্কিত ক্যাটাগরি পেজ'
    }
  ];

  return {
    jobIdOrDraftId: facts.draftId,
    jobTitle: facts.jobTitle,
    organization: facts.organization,
    primaryKeyword: primaryKeyword.keyword,
    secondaryKeywords: secondaryKeywords.map(k => k.keyword),
    relatedKeywords: relatedKeywords.map(k => k.keyword),
    searchIntent: intentResult.primaryIntent,
    searchIntentSummary: intentResult.intentSummary,
    requiredFacts: {
      vacancies: facts.vacancies,
      deadline: facts.applicationDeadline,
      education: facts.minEducation,
      experience: 'বিজ্ঞপ্তিতে উল্লেখ নেই',
      age: facts.ageLimits,
      salary: facts.salary,
      fee: facts.govtFee,
      applicationMethod: facts.applicationMethod,
      applicationUrl: facts.applicationUrl
    },
    importantEligibilityNotes,
    officialSourceLinks,
    suggestedHeadings,
    faqTopics,
    internalLinkOpportunities,
    warnings: facts.unresolvedWarnings || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function generateArticleOutline(brief: ContentBrief, facts: VerifiedJobFacts): ContentOutline {
  const sections: OutlineSection[] = [];
  const org = facts.organization;
  const title = facts.jobTitle;

  // H1 Title (Strictly one H1 per article)
  const h1Title = `${org} নিয়োগ বিজ্ঞপ্তি ২০২৬ — ${org} Job Circular 2026`;
  sections.push({
    id: 'sec-h1',
    level: 'h1',
    title: h1Title,
    purpose: 'আর্টিকেলের প্রধান শিরোনাম, যাতে প্রতিষ্ঠান ও প্রাথমিক কিওয়ার্ড স্বাভাবিকভাবে থাকবে।',
    suggestedPoints: [
      `${org}-এ ${title} পদের নতুন সার্কুলার ঘোষণা`,
      'আবেদনের সংক্ষিপ্ত প্রেক্ষাপট ও নিয়োগের সময়কাল'
    ],
    isLocked: true
  });

  // H2: Introduction
  sections.push({
    id: 'sec-intro',
    level: 'h2',
    title: `${org} নিয়োগ বিজ্ঞপ্তি ২০২৬ সারসংক্ষেপ`,
    purpose: 'ভূমিকা এবং সার্কুলারের প্রাথমিক পরিচিতি।',
    suggestedPoints: [
      `${org} সম্প্রতি জনবল নিয়োগের বিজ্ঞপ্তি প্রকাশ করেছে।`,
      'আগ্রহী প্রার্থীরা নির্ধারিত যোগ্যতা অনুযায়ী আবেদন করতে পারবেন।',
      'নিচে পদসংখ্যা, বেতন ও আবেদনের বিস্তারিত নিয়ম আলোচনা করা হলো।'
    ]
  });

  // H2: Overview Table
  sections.push({
    id: 'sec-overview',
    level: 'h2',
    title: `${org} জব সার্কুলার ২০২৬ সংক্ষেপে (Overview)`,
    purpose: 'একনজরে চাকরির মূল তথ্যসূচক টেবিল।',
    suggestedPoints: [
      `প্রতিষ্ঠানের নাম: ${org}`,
      `পদের নাম: ${title}`,
      `মোট শূন্যপদ: ${facts.vacancies}`,
      `শিক্ষাগত যোগ্যতা: ${facts.minEducation}`,
      `বেতন: ${facts.salary}`,
      `আবেদনের শেষ তারিখ: ${facts.applicationDeadline}`,
      `আবেদন ফি: ${facts.govtFee}`
    ]
  });

  // H2: Vacancies & Positions
  sections.push({
    id: 'sec-vacancies',
    level: 'h2',
    title: 'পদ ও পদসংখ্যা বিবরণী',
    purpose: 'পদের নাম, ক্যাটাগরি এবং অনুমোদিত শূন্যপদের সুনির্দিষ্ট সংখ্যা।',
    suggestedPoints: [
      `${title} পদে মোট ${facts.vacancies} জন প্রার্থী নিয়োগ দেওয়া হবে।`,
      'পদভিত্তিক শর্তাবলী অফিশিয়াল সার্কুলার অনুযায়ী প্রযোজ্য।'
    ]
  });

  // H2: Eligibility
  sections.push({
    id: 'sec-eligibility',
    level: 'h2',
    title: 'শিক্ষাগত যোগ্যতা ও অন্যান্য শর্তাবলী',
    purpose: 'প্রার্থীর ন্যূনতম শিক্ষাগত ডিগ্রি, বিষয় বা বিভাগ সংক্রান্ত বাধ্যবাধকতা।',
    suggestedPoints: [
      `ন্যূনতম যোগ্যতা: ${facts.minEducation}`,
      'প্রয়োজনীয় সনদ ও ফলাফল আবেদনের সময় দাখিলযোগ্য হতে হবে।'
    ]
  });

  // H2: Age & Quota
  sections.push({
    id: 'sec-age',
    level: 'h2',
    title: 'বয়সসীমা ও কোটা সুবিধা',
    purpose: 'সাধারণ প্রার্থীর বয়স ও সংরক্ষিত কোটা সংক্রান্ত বিধিমালা।',
    suggestedPoints: [
      `সাধারণ প্রার্থীদের বয়সসীমা: ${facts.ageLimits}`,
      facts.quotaRelaxation || 'বীর মুক্তিযোদ্ধা সন্তান ও প্রতিবন্ধী প্রার্থীদের ক্ষেত্রে সরকারি বিধি অনুযায়ী বয়স শিথিলযোগ্য।'
    ]
  });

  // H2: Salary (Only if present)
  if (facts.salary !== 'বিজ্ঞপ্তিতে উল্লেখ নেই') {
    sections.push({
      id: 'sec-salary',
      level: 'h2',
      title: 'বেতন স্কেল ও সুযোগ-সুবিধা',
      purpose: 'জাতীয় বেতন স্কেল ২০১৫ অনুযায়ী বেতন ও প্রাসঙ্গিক ভাতা।',
      suggestedPoints: [
        `মূল বেতন স্কেল: ${facts.salary}`,
        facts.payGrade ? `গ্রেড: ${facts.payGrade}` : 'প্রতিষ্ঠানের নির্ধারিত বেতন কাঠামো প্রযোজ্য।'
      ]
    });
  }

  // H2: Important Dates
  sections.push({
    id: 'sec-dates',
    level: 'h2',
    title: 'আবেদন শুরুর তারিখ ও শেষ সময়',
    purpose: 'অনলাইন আবেদনের সঠিক শেষ তারিখ ও সময়সীমা উল্লেখ।',
    suggestedPoints: [
      `আবেদনের শেষ সময়: ${facts.applicationDeadline}`,
      'শেষ মুহূর্তের সার্ভার জটিলতা এড়াতে নির্ধারিত সময়ের পূর্বেই আবেদন সম্পন্ন করার পরামর্শ।'
    ]
  });

  // H2: Application Fee
  sections.push({
    id: 'sec-fee',
    level: 'h2',
    title: 'আবেদন ফি ও পেমেন্ট পদ্ধতি',
    purpose: 'সরকারি আবেদন ফি এবং টেলিটক প্রিপেইড বা ব্যাংকের মাধ্যমে ফি জমার নির্দেশ।',
    suggestedPoints: [
      `নির্ধারিত ফি: ${facts.govtFee}`,
      'আবেদন ফর্ম সাবমিটের পরবর্তী ৭২ ঘণ্টার মধ্যে ফি জমা দিতে হবে।'
    ]
  });

  // H2: Application Process (Step by Step)
  sections.push({
    id: 'sec-application-process',
    level: 'h2',
    title: 'অনলাইনে আবেদন করার নিয়ম (ধাপে ধাপে)',
    purpose: 'সঠিক ওয়েবসাইটে প্রবেশ ও নির্ভুল ফর্ম পূরণের প্রামাণিক নির্দেশিকা।',
    suggestedPoints: [
      `প্রথমে অফিশিয়াল ওয়েব পোর্টাল ${facts.applicationUrl} এ প্রবেশ করুন।`,
      'সংশ্লিষ্ট পদে ক্লিক করে আবেদন ফর্মটি যথাযথ তথ্যে পূরণ করুন।',
      'প্রার্থীর ৩০০×৩০০ পিক্সেল ছবি এবং ৩০০×৮০ পিক্সেল স্বাক্ষর আপলোড করুন।',
      'আবেদন প্রিভিউ যাচাই করে সাবমিট করুন এবং Applicant Copy সংরক্ষণ করুন।'
    ]
  });

  // H2: Important Instructions
  sections.push({
    id: 'sec-instructions',
    level: 'h2',
    title: 'গুরুত্বপূর্ণ নির্দেশনা ও সতর্কতা',
    purpose: 'প্রার্থীর সতর্কতা, অসম্পূর্ণ আবেদন বাতিল ও প্রবেশপত্র বিষয়ক নির্দেশ।',
    suggestedPoints: [
      'ভুল বা অসত্য তথ্য প্রদান করলে যে কোনো পর্যায়ে প্রার্থিতা বাতিল হবে।',
      'পরবর্তী পরীক্ষা ও প্রবেশপত্র সংক্রান্ত তথ্য প্রার্থীর মোবাইলে এসএমএসের মাধ্যমে জানানো হবে।'
    ]
  });

  // H2: FAQs
  sections.push({
    id: 'sec-faq',
    level: 'h2',
    title: 'সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ)',
    purpose: 'চাকরিপ্রার্থীদের সর্বাধিক জিজ্ঞাসিত প্রশ্নের সহজ ও স্পষ্ট উত্তর।',
    suggestedPoints: brief.faqTopics
  });

  return {
    briefId: brief.jobIdOrDraftId,
    sections,
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
