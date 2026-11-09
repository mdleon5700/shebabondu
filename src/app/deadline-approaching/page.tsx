import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'আবেদনের শেষ সময় সমাগত (Deadline Approaching) | চাকরি সেবা',
  description: 'যেসব চাকরির আবেদনের সময় খুব শীঘ্রই (১ থেকে ৩ দিনের মধ্যে) শেষ হয়ে যাচ্ছে।',
  alternates: {
    canonical: 'https://chakrisheba.com/deadline-approaching'
  },
  openGraph: {
    title: 'আবেদনের শেষ সময় সমাগত (Deadline Approaching) | চাকরি সেবা',
    description: 'যেসব চাকরির আবেদনের সময় খুব শীঘ্রই শেষ হচ্ছে।',
    url: 'https://chakrisheba.com/deadline-approaching',
    type: 'website'
  }
};

export default function Page() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'আবেদনের শেষ সময় সমাগত চাকরির সার্কুলার | চাকরি সেবা',
    description: 'যেসব চাকরির আবেদনের সময় খুব শীঘ্রই শেষ হচ্ছে।',
    url: 'https://chakrisheba.com/deadline-approaching',
    isPartOf: {
      '@type': 'WebSite',
      name: 'চাকরি সেবা (Chakri Sheba)',
      url: 'https://chakrisheba.com'
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'হোম',
        item: 'https://chakrisheba.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'শেষ সময় সমাগত',
        item: 'https://chakrisheba.com/deadline-approaching'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <JobListingView
        title="আবেদনের শেষ সময় সমাগত (Deadline Approaching)"
        subtitle="যেসব চাকরির আবেদনের সময় খুব শীঘ্রই (১ থেকে ৩ দিনের মধ্যে) শেষ হয়ে যাচ্ছে।"
        badge="জরুরি অ্যালার্ট"
        breadcrumbs={[
          { label: "হোম", href: "/" }, { label: "শেষ সময় সমাগত", href: "/deadline-approaching" }
        ]}
        filterType="deadline"
        canonicalUrl="https://chakrisheba.com/deadline-approaching"
        seoTextContent={{
          heading: "ডেডলাইনের শেষ মুহূর্তে সার্ভার জটিলতা এড়ানোর উপায়",
          paragraphs: ['"সরকারি ও টেলিটক চাকরির আবেদনের শেষ দিনে প্রচণ্ড সার্ভার ট্রাফিকের কারণে ছবি আপলোড বা পেমেন্ট আটকে যাওয়ার ঝুঁকি থাকে। তাই আবেদনের শেষ সময়ের অন্তত ২৪ ঘণ্টা পূর্বে আবেদন ও ফি প্রদান নিশ্চিত করুন।"'],
          tips: [
            "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
            "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
            "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
          ]
        }}
      />
    </>
  );
}
