import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'ইঞ্জিনিয়ারিং ও টেকনিক্যাল চাকরি ২০২৬ | চাকরি সেবা',
  description: 'সিভিল, ইলেকট্রিক্যাল, মেকানিক্যাল ও আইটি ইঞ্জিনিয়ারিং সরকারি ও স্বায়ত্তশাসিত নিয়োগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="ইঞ্জিনিয়ারিং ও টেকনিক্যাল চাকরি ২০২৬"
      subtitle="সিভিল, ইলেকট্রিক্যাল, মেকানিক্যাল ও আইটি ইঞ্জিনিয়ারিং সরকারি ও স্বায়ত্তশাসিত নিয়োগ।"
      badge="ইঞ্জিনিয়ারিং"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "ইঞ্জিনিয়ারিং চাকরি", href: "/engineering-jobs" }
      ]}
      filterType="engineering"
      seoTextContent={{
        heading: "বিপিএসসি ও পাওয়ার সেক্টরে সহকারী প্রকৌশলী নিয়োগ",
        paragraphs: ['"নেসকো, ডিপিডিসি, ওয়াসা, এলজিইডি ও সড়ক জনপথ অধিদপ্তরে প্রকৌশলীদের আকর্ষণীয় সরকারি ক্যারিয়ার রয়েছে।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
