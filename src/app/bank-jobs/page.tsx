import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'ব্যাংক নিয়োগ সার্কুলার ২০২৬ (Bank Jobs in Bangladesh) | চাকরি সেবা',
  description: 'বাংলাদেশ ব্যাংক, সমন্বিত ৯ ব্যাংক (BSCS) ও বেসরকারি ব্যাংকের অফিসার ও এডি নিয়োগ।',
  alternates: {
    canonical: 'https://chakrisheba.com/bank-jobs'
  },
  openGraph: {
    title: 'ব্যাংক নিয়োগ সার্কুলার ২০২৬ (Bank Jobs in Bangladesh)',
    description: 'বাংলাদেশ ব্যাংক, সমন্বিত ৯ ব্যাংক (BSCS) ও বেসরকারি ব্যাংকের অফিসার ও এডি নিয়োগ।',
    url: 'https://chakrisheba.com/bank-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function BankJobsPage() {
  return (
    <JobListingView
      title="ব্যাংক নিয়োগ সার্কুলার ২০২৬ (Bank Jobs in Bangladesh)"
      subtitle="বাংলাদেশ ব্যাংক, সোনালী, জনতা, অগ্রণী ও সকল বাণিজ্যিক ব্যাংকের অফিসার ও এডি নিয়োগ।"
      badge="ব্যাংক ক্যারিয়ার"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "ব্যাংক চাকরি", href: "/bank-jobs" }
      ]}
      filterType="bank"
      seoTextContent={{
        heading: "ব্যাংকার্স সিলেকশন কমিটি ও বাংলাদেশ ব্যাংক নিয়োগ পরীক্ষার প্রস্তুতি",
        paragraphs: [
          "বাংলাদেশ ব্যাংক ও ব্যাংকার্স সিলেকশন কমিটির (BSCS) মাধ্যমে সোনালী, জনতা, অগ্রণীসহ রাষ্ট্রায়ত্ত ৯টি ব্যাংকের সহকারী পরিচালক (AD), অফিসার ও ক্যাশ অফিসার পদে সমন্বিত পরীক্ষা অনুষ্ঠিত হয়।"
        ],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "বাংলাদেশ ব্যাংকের ই-রিক্রুটমেন্ট পোর্টালে আপনার সিভি ও ট্র্যাকিং নম্বর হালনাগাদ রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
