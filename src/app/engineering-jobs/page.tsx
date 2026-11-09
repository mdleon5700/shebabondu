import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'ইঞ্জিনিয়ারিং ও টেকনিক্যাল চাকরি ২০২৬ | চাকরি সেবা',
  description: 'সহকারী ও উপ-সহকারী প্রকৌশলী (পুর, তড়িৎ, যান্ত্রিক, কম্পিউটার) পদের নিয়োগ ফিল্টার।',
  alternates: {
    canonical: 'https://chakrisheba.com/engineering-jobs'
  },
  openGraph: {
    title: 'ইঞ্জিনিয়ারিং ও টেকনিক্যাল চাকরি ২০২৬',
    description: 'সহকারী ও উপ-সহকারী প্রকৌশলী (পুর, তড়িৎ, যান্ত্রিক, কম্পিউটার) পদের নিয়োগ ফিল্টার।',
    url: 'https://chakrisheba.com/engineering-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function EngineeringJobsPage() {
  return (
    <JobListingView
      title="ইঞ্জিনিয়ারিং ও টেকনিক্যাল চাকরি ২০২৬"
      subtitle="সহকারী ও উপ-সহকারী প্রকৌশলী (পুর, তড়িৎ, যান্ত্রিক, কম্পিউটার) পদের নিয়োগ ফিল্টার।"
      badge="ইঞ্জিনিয়ারিং নিয়োগ"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "ইঞ্জিনিয়ারিং চাকরি", href: "/engineering-jobs" }
      ]}
      filterType="engineering"
      seoTextContent={{
        heading: "বিপিএসসি ও পাওয়ার সেক্টরে সহকারী প্রকৌশলী নিয়োগ নির্দেশিকা",
        paragraphs: [
          "নেসকো, ডিপিডিসি, ওয়াসা, এলজিইডি, সড়ক ও জনপথ অধিদপ্তর এবং বিদ্যুৎ কেন্দ্রগুলোতে সিভিল, ইলেকট্রিক্যাল ও মেকানিক্যাল প্রকৌশলীদের জন্য আকর্ষণীয় ৯ম ও ১০ম গ্রেডের সরকারি ক্যারিয়ার রয়েছে।"
        ],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "ডিপ্লোমা ইন ইঞ্জিনিয়ারিং ও বিএসসি ইঞ্জিনিয়ারিং সনদের সঠিক গ্রেডিং পয়েন্ট উল্লেখ করুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
