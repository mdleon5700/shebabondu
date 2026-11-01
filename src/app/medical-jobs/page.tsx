import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'মেডিকেল ও স্বাস্থ্য সেবা নিয়োগ ২০২৬ | চাকরি সেবা',
  description: 'স্বাস্থ্য অধিদপ্তর (DGHS), নার্সিং অধিদপ্তর ও বিভিন্ন হাসপাতালের ডাক্তার ও নার্স নিয়োগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="মেডিকেল ও স্বাস্থ্য সেবা নিয়োগ ২০২৬"
      subtitle="স্বাস্থ্য অধিদপ্তর (DGHS), নার্সিং অধিদপ্তর ও বিভিন্ন হাসপাতালের ডাক্তার ও নার্স নিয়োগ।"
      badge="স্বাস্থ্য ও চিকিৎসা"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "মেডিকেল চাকরি", href: "/medical-jobs" }
      ]}
      filterType="medical"
      seoTextContent={{
        heading: "স্বাস্থ্য খাতে সরকারি চাকরির সুযোগ ও যোগ্যতা",
        paragraphs: ['"স্বাস্থ্য অধিদপ্তরের অধীনে সিনিয়র স্টাফ নার্স, মেডিকেল অফিসার ও ফার্মাসিস্ট পদে নিয়মিত সরকারি সার্কুলার প্রকাশিত হয়।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
