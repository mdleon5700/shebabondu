import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect, RedirectType } from 'next/navigation';
import { serverDB } from '@/lib/db';
import JobDetailClient from '@/components/JobDetailClient';

interface Props {
  params: { id: string };
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

function parseSalaryRange(salaryStr?: string): { min?: number; max?: number } | null {
  if (!salaryStr) return null;
  const bengaliDigits: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  let normalized = '';
  for (const char of salaryStr) {
    normalized += bengaliDigits[char] || char;
  }
  normalized = normalized.replace(/,/g, '');
  const matches = normalized.match(/\d+/g);
  if (!matches) return null;

  const salaryNumbers = matches.map(n => parseInt(n, 10)).filter(n => n >= 1000);
  if (salaryNumbers.length >= 2) {
    return {
      min: Math.min(salaryNumbers[0], salaryNumbers[1]),
      max: Math.max(salaryNumbers[0], salaryNumbers[1])
    };
  } else if (salaryNumbers.length === 1) {
    return { min: salaryNumbers[0], max: salaryNumbers[0] };
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = serverDB.getPublicJobById(params.id);
  const pubStatus = (job as any)?.publicationStatus;
  if (
    !job ||
    job.id.startsWith('draft-') ||
    (job as any).status === 'UNPUBLISHED' ||
    pubStatus === 'UNPUBLISHED' ||
    pubStatus === 'DRAFT' ||
    pubStatus === 'CONTENT_IN_PROGRESS' ||
    pubStatus === 'PENDING_REVIEW' ||
    pubStatus === 'CHANGES_REQUESTED' ||
    pubStatus === 'SCHEDULED' ||
    pubStatus === 'REJECTED' ||
    pubStatus === 'PUBLICATION_FAILED'
  ) {
    return {
      title: 'বিজ্ঞপ্তি পাওয়া যায়নি | চাকরি সেবা',
      description: 'অনুরোধকৃত নিয়োগ বিজ্ঞপ্তিটি খুঁজে পাওয়া যায়নি বা এর মেয়াদ সমাপ্ত হয়েছে।',
      robots: { index: false, follow: false }
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chakrisheba.com';
  const canonicalUrl = `${siteUrl}/jobs/${job.slug || job.id}`;

  const pageTitle = job.seoTitle && job.seoTitle.trim() !== ''
    ? job.seoTitle
    : `${job.title} - ${job.organization} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`;

  const pageDescription = job.seoDescription && job.seoDescription.trim() !== ''
    ? job.seoDescription
    : `${job.organization}-এ ${job.title} পদে নতুন নিয়োগ বিজ্ঞপ্তি। মোট পদ: ${job.totalPosts}টি, আবেদনের শেষ সময়: ${job.deadline}। শিক্ষাগত যোগ্যতা: ${job.minEducation}। সরকারি ফি: ৳${job.govtFee}। সহজে অনলাইনে আবেদনের নিয়ম দেখুন।`;

  const defaultKeywords = [
    job.title,
    job.organization,
    `${job.organization} job circular 2026`,
    `${job.title} নিয়োগ বিজ্ঞপ্তি`,
    'সরকারি চাকরির খবর ২০২৬',
    'বিসিএস ও ব্যাংক জব সার্কুলার',
    'Teletalk apply online',
    job.districts === 'সকল জেলা' ? 'সকল জেলার চাকরি' : `${job.districts} জেলা চাকরি`,
    'চাকরি সেবা',
    'chakri sheba'
  ];

  const keywords = job.seoKeywords && job.seoKeywords.length > 0
    ? Array.from(new Set([...job.seoKeywords, ...defaultKeywords]))
    : defaultKeywords;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: 'চাকরি সেবা (Chakri Sheba)',
      type: 'article',
      locale: 'bn_BD',
      publishedTime: parseBengaliDateToIso(job.publishedDate),
      modifiedTime: new Date().toISOString(),
      images: job.circularImage
        ? [
            {
              url: job.circularImage,
              width: 1200,
              height: 630,
              alt: `${job.title} - ${job.organization}`
            }
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: job.circularImage ? [job.circularImage] : undefined,
    }
  };
}

export default function SingleJobPage({ params }: Props) {
  // 1. Check for active 301/308 redirects
  const redirectRecord = serverDB.findRedirectByPath ? serverDB.findRedirectByPath(`/jobs/${params.id}`) : null;
  if (redirectRecord && redirectRecord.isActive) {
    redirect(redirectRecord.targetPath, RedirectType.replace);
  }

  // 2. Resolve job by ID or clean SEO Slug
  const job = serverDB.getPublicJobById(params.id);
  const pubStatus = (job as any)?.publicationStatus;

  // 3. Strict public visibility guard (0% leakage of drafts/unapproved/scheduled)
  if (
    !job ||
    job.id.startsWith('draft-') ||
    (job as any).status === 'UNPUBLISHED' ||
    pubStatus === 'UNPUBLISHED' ||
    pubStatus === 'DRAFT' ||
    pubStatus === 'CONTENT_IN_PROGRESS' ||
    pubStatus === 'PENDING_REVIEW' ||
    pubStatus === 'CHANGES_REQUESTED' ||
    pubStatus === 'SCHEDULED' ||
    pubStatus === 'REJECTED' ||
    pubStatus === 'PUBLICATION_FAILED'
  ) {
    redirect(`/jobs?search=${encodeURIComponent(params.id)}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chakrisheba.com';
  const canonicalUrl = `${siteUrl}/jobs/${job.slug || job.id}`;
  const datePosted = parseBengaliDateToIso(job.publishedDate) || new Date().toISOString().split('T')[0];
  const validThrough = parseBengaliDateToIso(job.deadline);
  const salaryRange = parseSalaryRange(job.salary);

  // 1. Google for Jobs - Rich JobPosting Schema
  const jobPostingSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": `
      <h3>${job.title} - ${job.organization}</h3>
      <p><strong>প্রতিষ্ঠানের নাম:</strong> ${job.organization}</p>
      <p><strong>মোট শূন্যপদ:</strong> ${job.totalPosts || 1}টি</p>
      <p><strong>বেতন স্কেল:</strong> ${job.salary}</p>
      <p><strong>ন্যূনতম শিক্ষাগত যোগ্যতা:</strong> ${job.minEducation}</p>
      <p><strong>বয়সসীমা:</strong> ${job.minAge} থেকে ${job.maxAge} বছর (কোটা প্রার্থীদের ক্ষেত্রে ৩২ বছর পর্যন্ত প্রযোজ্য)</p>
      <p><strong>আবেদনের শেষ তারিখ ও সময়:</strong> ${job.deadline}</p>
      <p><strong>সরকারি ফি:</strong> ৳${job.govtFee} | <strong>সার্ভিস ফি:</strong> ৳${job.serviceFee}</p>
      <p><strong>আবেদনের লিংক:</strong> ${job.officialLink || 'অনলাইন পোর্টাল'}</p>
    `.trim(),
    "identifier": {
      "@type": "PropertyValue",
      "name": job.organization,
      "value": job.id
    },
    "datePosted": datePosted,
    "validThrough": validThrough,
    "employmentType": "FULL_TIME",
    "directApply": true,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.organization,
      "sameAs": job.officialLink || undefined,
      "logo": job.logo?.startsWith('http') ? job.logo : undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BD",
        "addressRegion": job.districts === 'সকল জেলা' ? 'Bangladesh' : job.districts
      }
    },
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "Bangladesh"
    },
    "educationRequirements": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": job.minEducation || "স্নাতক বা সমমান"
    },
    "experienceRequirements": {
      "@type": "OccupationalExperienceRequirements",
      "monthsOfExperience": 0
    },
    "totalJobOpenings": job.totalPosts || 1
  };

  if (salaryRange && salaryRange.min) {
    jobPostingSchema["baseSalary"] = {
      "@type": "MonetaryAmount",
      "currency": "BDT",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": salaryRange.min,
        "maxValue": salaryRange.max || salaryRange.min,
        "unitText": "MONTH"
      }
    };
  }

  // 2. BreadcrumbList Schema
  const categorySlugMap: Record<string, { name: string; url: string }> = {
    govt: { name: 'সরকারি চাকরি', url: `${siteUrl}/government-jobs` },
    bank: { name: 'ব্যাংক চাকরি', url: `${siteUrl}/bank-jobs` },
    teacher: { name: 'শিক্ষক নিয়োগ', url: `${siteUrl}/teacher-jobs` },
    ngo: { name: 'এনজিও চাকরি', url: `${siteUrl}/ngo-jobs` },
    defense: { name: 'প্রতিরক্ষা বাহিনী', url: `${siteUrl}/jobs` },
    railway: { name: 'রেলওয়ে চাকরি', url: `${siteUrl}/jobs` },
    private: { name: 'বেসরকারি চাকরি', url: `${siteUrl}/private-jobs` }
  };

  const categoryMeta = categorySlugMap[job.category] || { name: job.categoryLabel || 'সকল চাকরি', url: `${siteUrl}/jobs` };

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
        "name": categoryMeta.name,
        "item": categoryMeta.url
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": job.title,
        "item": canonicalUrl
      }
    ]
  };

  // 3. Dynamic High-Intent FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `${job.organization}-এ ${job.title} পদে আবেদনের শেষ সময় কবে?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `এই পদে আবেদনের শেষ তারিখ ও সময় ${job.deadline}। নির্ধারিত তারিখ ও সময়ের পর আবেদন লিঙ্ক স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে।`
        }
      },
      {
        "@type": "Question",
        "name": `এই বিজ্ঞপ্তিতে সরকারি আবেদন ফি ও সার্ভিস চার্জ কত টাকা?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `সরকারি পরীক্ষার ফি ৳${job.govtFee} এবং চাকরি সেবার প্রক্রিয়াকরণ ফি ৳${job.serviceFee}। প্রার্থীরা বিকাশ, নগদ বা ব্যাংক চালানের মাধ্যমে নিরাপদে ফি পরিশোধ করতে পারবেন।`
        }
      },
      {
        "@type": "Question",
        "name": `প্রার্থীর সর্বোচ্চ ও সর্বনিম্ন বয়সসীমা কত হতে হবে?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `সাধারণ প্রার্থীদের জন্য বয়সসীমা ${job.minAge} থেকে ${job.maxAge} বছর। তবে বীর মুক্তিযোদ্ধা/শহীদ মুক্তিযোদ্ধার সন্তান এবং শারীরিক প্রতিবন্ধী প্রার্থীদের ক্ষেত্রে সরকারি নিয়মানুযায়ী সর্বোচ্চ ৩২ বছর পর্যন্ত আবেদন গ্রহণযোগ্য। বয়স গণনার কাট-অফ তারিখ: ${job.ageCutOffDate || 'বিজ্ঞপ্তি অনুসারে'}।`
        }
      },
      {
        "@type": "Question",
        "name": `কারা এবং কোন জেলার প্রার্থীরা এই পদের জন্য আবেদন করতে পারবেন?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `ন্যূনতম শিক্ষাগত যোগ্যতা ${job.minEducation}। অনুমোদিত জেলা: ${job.districts || 'সকল জেলা'}।${job.allowThirdDivision === false ? ' উল্লেখ্য, শিক্ষা জীবনের কোনো স্তরে ৩য় বিভাগ বা শ্রেণি গ্রহণযোগ্য হবে না।' : ''}`
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <JobDetailClient job={job} />
    </>
  );
}
