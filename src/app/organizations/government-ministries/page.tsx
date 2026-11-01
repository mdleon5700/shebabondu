import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'সকল মন্ত্রণালয় নিয়োগ সার্কুলার ২০২৬ (Ministry Jobs in BD) | চাকরি সেবা',
  description: 'অর্থ মন্ত্রণালয়, গৃহায়ন ও গণপূর্ত, স্বরাষ্ট্র, জনপ্রশাসনসহ বিভিন্ন মন্ত্রণালয়ের চাকরি।',
};

export default function Page() {
  return (
    <JobListingView
      title="সকল মন্ত্রণালয় নিয়োগ সার্কুলার ২০২৬ (Ministry Jobs in BD)"
      subtitle="অর্থ মন্ত্রণালয়, গৃহায়ন ও গণপূর্ত, স্বরাষ্ট্র, জনপ্রশাসনসহ বিভিন্ন মন্ত্রণালয়ের চাকরি।"
      badge="মন্ত্রণালয় নিয়োগ"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "প্রতিষ্ঠানসমূহ", href: "/organizations" }, { label: "মন্ত্রণালয়সমূহ", href: "/organizations/government-ministries" }
      ]}
      filterType="org-ministries"
      seoTextContent={{
        heading: "মন্ত্রণালয়ে প্রশাসনিক কর্মকর্তা, অডিটর ও কম্পিউটার অপারেটর ক্যারিয়ার",
        paragraphs: ['"সচিবালয় ও বিভিন্ন মন্ত্রণালয়ের অধীনে ৯ম থেকে ২০তম গ্রেডে নিয়মিত জনবল নিয়োগের বিজ্ঞপ্তি প্রকাশিত হয়।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
