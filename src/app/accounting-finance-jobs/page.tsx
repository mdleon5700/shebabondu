import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'অ্যাকাউন্টিং ও ফাইন্যান্স চাকরি ২০২৬ | চাকরি সেবা',
  description: 'অডিটর, হিসাবরক্ষক, ক্যাশিয়ার ও ফাইন্যান্স অফিসার পদে নিয়োগ বিজ্ঞপ্তি।',
};

export default function Page() {
  return (
    <JobListingView
      title="অ্যাকাউন্টিং ও ফাইন্যান্স চাকরি ২০২৬"
      subtitle="অডিটর, হিসাবরক্ষক, ক্যাশিয়ার ও ফাইন্যান্স অফিসার পদে নিয়োগ বিজ্ঞপ্তি।"
      badge="হিসাব ও অডিট"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "অ্যাকাউন্টিং চাকরি", href: "/accounting-finance-jobs" }
      ]}
      filterType="accounting-finance"
      seoTextContent={{
        heading: "সিএজি ও ব্যাংকে হিসাবরক্ষণ পদের ক্যারিয়ার",
        paragraphs: ['"বাণিজ্য শাখার স্নাতকদের জন্য মহা হিসাব-নিরীক্ষক ও নিয়ন্ত্রকের কার্যালয় (CAG) এবং ব্যাংকে প্রচুর কর্মসংস্থান সৃষ্টি হয়।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
