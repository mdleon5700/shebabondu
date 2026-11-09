import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'জেএসসি ও ৮ম শ্রেণি পাসে সরকারি চাকরি ২০২৬ (JSC Pass Jobs) | চাকরি সেবা',
  description: 'জুনিয়র স্কুল সার্টিফিকেট (জেএসসি) বা অষ্টম শ্রেণি পাসে ১৯তম ও ২০তম গ্রেডের অফিস সহায়ক, নিরাপত্তা প্রহরী, মালি, পরিচ্ছন্নতাকর্মী ও ড্রাইভার পদে স্থায়ী সরকারি চাকরির সার্কুলার।',
  alternates: {
    canonical: 'https://chakrisheba.com/jobs/jsc-pass'
  },
  openGraph: {
    title: 'জেএসসি / ৮ম শ্রেণি পাসে সরকারি চাকরির খবর ২০২৬ | চাকরি সেবা',
    description: '৮ম শ্রেণি ও জেএসসি পাসে অফিস সহায়ক, নিরাপত্তা প্রহরী ও ড্রাইভার পদে সরকারি চাকরির বিজ্ঞপ্তি।',
    url: 'https://chakrisheba.com/jobs/jsc-pass',
    type: 'website'
  }
};

export default function JSCPassJobsPage() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'জেএসসি ও ৮ম শ্রেণি পাসে সরকারি চাকরি ২০২৬ | চাকরি সেবা',
    description: 'জুনিয়র স্কুল সার্টিফিকেট (জেএসসি) বা অষ্টম শ্রেণি পাসে আবেদনযোগ্য সকল সরকারি ও স্বায়ত্তশাসিত সার্কুলার।',
    url: 'https://chakrisheba.com/jobs/jsc-pass',
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
        name: 'সকল চাকরি',
        item: 'https://chakrisheba.com/jobs'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'জেএসসি পাস চাকরি',
        item: 'https://chakrisheba.com/jobs/jsc-pass'
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
        title="জেএসসি ও ৮ম শ্রেণি পাসে সরকারি চাকরি ২০২৬ (JSC Pass Jobs)"
        subtitle="জুনিয়র স্কুল সার্টিফিকেট (জেএসসি) বা অষ্টম শ্রেণি পাসে ১৯তম ও ২০তম গ্রেডের অফিস সহায়ক, নিরাপত্তা প্রহরী, মালি, পরিচ্ছন্নতাকর্মী ও ড্রাইভার পদে স্থায়ী সরকারি চাকরির সার্কুলার।"
        badge="জেএসসি / ৮ম শ্রেণি পাস"
        breadcrumbs={[
          { label: "হোম", href: "/" },
          { label: "সকল চাকরি", href: "/jobs" },
          { label: "জেএসসি পাস চাকরি", href: "/jobs/jsc-pass" }
        ]}
        filterType="jsc"
        canonicalUrl="https://chakrisheba.com/jobs/jsc-pass"
        seoTextContent={{
          heading: "জেএসসি ও ৮ম শ্রেণি পাসে ১৯তম ও ২০তম গ্রেডের সরকারি চাকরির সুযোগ",
          paragraphs: [
            '"বাংলাদেশের বিভিন্ন মন্ত্রণালয়, অধিদপ্তর, স্বায়ত্তশাসিত ও স্থানীয় সরকার প্রতিষ্ঠানে অফিস সহায়ক, নিরাপত্তা প্রহরী, মালি, পরিচ্ছন্নতাকর্মী ও বার্তা বাহক পদে জেএসসি বা অষ্টম শ্রেণি পাসেই স্থায়ী সরকারি চাকরির সুযোগ রয়েছে। এছাড়া হালকা ও ভারী ড্রাইভিং লাইসেন্স থাকলে অষ্টম শ্রেণি পাসে আকর্ষণীয় স্কেলে সরকারি গাড়িচালক পদেও আবেদন করা যায়।"',
            '"এই পদগুলোর লিখিত ও ব্যবহারিক পরীক্ষা সাধারণত বাংলা, সাধারণ গণিত এবং মৌখিক ভাইভার মাধ্যমে সম্পন্ন হয়ে থাকে। টেলিটকে অনলাইনে আবেদন করার সময় ন্যূনতম শিক্ষাগত যোগ্যতা হিসেবে অষ্টম শ্রেণি বা জেএসসি সার্টিফিকেট তথ্য সঠিকভাবে পূরণ করতে হবে।"'
          ],
          tips: [
            "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিজের জেলা কোটা মিলিয়ে নিন।",
            "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
            "শেষ দিনের টেলিটক সার্ভার জ্যাম এড়াতে নির্ধারিত ডেডলাইনের অন্তত ৩ দিন আগেই আবেদন ও ফি প্রদান সম্পন্ন করুন।"
          ]
        }}
      />
    </>
  );
}
