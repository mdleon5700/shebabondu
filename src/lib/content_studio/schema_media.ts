import { VerifiedJobFacts } from './intake';
import { ContentStudioMetadata } from './types';

export interface GeneratedSchemas {
  jobPostingSchema?: Record<string, any>;
  breadcrumbSchema: Record<string, any>;
  faqSchema?: Record<string, any>;
  jsonLdScripts: string[];
}

function parseBengaliDateToIso(dateStr?: string): string | undefined {
  if (!dateStr || typeof dateStr !== 'string') return undefined;

  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let normalized = dateStr;
  bengaliDigits.forEach((digit, idx) => {
    normalized = normalized.split(digit).join(String(idx));
  });

  const directParse = Date.parse(normalized);
  if (!isNaN(directParse)) {
    try {
      return new Date(directParse).toISOString().split('T')[0];
    } catch {}
  }

  const slashMatch = normalized.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  const monthMap: Record<string, string> = {
    'জানুয়ারি': '01', 'ফেব্রুয়ারি': '02', 'মার্চ': '03', 'এপ্রিল': '04',
    'মে': '05', 'জুন': '06', 'জুলাই': '07', 'আগস্ট': '08',
    'সেপ্টেম্বর': '09', 'অক্টোবর': '10', 'নভেম্বর': '11', 'ডিসেম্বর': '12'
  };

  for (const [bnMonth, numMonth] of Object.entries(monthMap)) {
    if (normalized.includes(bnMonth)) {
      const match = normalized.match(/(\d{1,2})\s*([^\d\s]+)\s*(\d{4})/);
      if (match) {
        const day = match[1].padStart(2, '0');
        const year = match[3];
        return `${year}-${numMonth}-${day}`;
      }
    }
  }

  return undefined;
}

export function generateStructuredSchemas(
  facts: VerifiedJobFacts,
  metadata: ContentStudioMetadata,
  faqItems?: Array<{ question: string; answer: string }>
): GeneratedSchemas {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chakrisheba.com';
  const pageUrl = `${siteUrl}/jobs/${metadata.slug}`;
  const validThrough = parseBengaliDateToIso(facts.applicationDeadline);
  const datePosted = new Date().toISOString().split('T')[0];

  const jsonLdScripts: string[] = [];

  // 1. Google for Jobs - Rich JobPosting Schema (Only if validThrough & Org exist)
  let jobPostingSchema: Record<string, any> | undefined = undefined;
  if (facts.organization && facts.jobTitle) {
    jobPostingSchema = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": facts.jobTitle,
      "description": `
        <h3>${facts.organization} - ${facts.jobTitle} নিয়োগ বিজ্ঞপ্তি</h3>
        <p><strong>প্রতিষ্ঠানের নাম:</strong> ${facts.organization}</p>
        <p><strong>মোট শূন্যপদ:</strong> ${facts.vacancies}</p>
        <p><strong>বেতন স্কেল:</strong> ${facts.salary}</p>
        <p><strong>ন্যূনতম শিক্ষাগত যোগ্যতা:</strong> ${facts.minEducation}</p>
        <p><strong>বয়সসীমা:</strong> ${facts.ageLimits}</p>
        <p><strong>আবেদনের শেষ সময়:</strong> ${facts.applicationDeadline}</p>
        <p><strong>আবেদনের সরকারি ফি:</strong> ${facts.govtFee}</p>
        <p><strong>আবেদনের মাধ্যম:</strong> ${facts.applicationMethod}</p>
      `.trim(),
      "identifier": {
        "@type": "PropertyValue",
        "name": facts.organization,
        "value": facts.draftId
      },
      "datePosted": datePosted,
      "validThrough": validThrough || undefined,
      "employmentType": facts.category === 'govt' || facts.category === 'bank' ? 'FULL_TIME' : 'OTHER',
      "directApply": true,
      "hiringOrganization": {
        "@type": "Organization",
        "name": facts.organization,
        "sameAs": facts.applicationUrl.startsWith('http') ? facts.applicationUrl : undefined,
        "logo": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "BD",
          "addressLocality": "ঢাকা",
          "addressRegion": "ঢাকা"
        }
      }
    };
    jsonLdScripts.push(JSON.stringify(jobPostingSchema));
  }

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "হোম",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "চাকরির খবর",
        "item": `${siteUrl}/jobs`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": facts.category === 'bank' ? 'ব্যাংক জব' : 'সরকারি চাকরি',
        "item": `${siteUrl}/${facts.category === 'bank' ? 'bank-jobs' : 'government-jobs'}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": facts.organization,
        "item": pageUrl
      }
    ]
  };
  jsonLdScripts.push(JSON.stringify(breadcrumbSchema));

  // 3. FAQPage Schema
  let faqSchema: Record<string, any> | undefined = undefined;
  if (faqItems && faqItems.length > 0) {
    faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
    jsonLdScripts.push(JSON.stringify(faqSchema));
  }

  return {
    jobPostingSchema,
    breadcrumbSchema,
    faqSchema,
    jsonLdScripts
  };
}
