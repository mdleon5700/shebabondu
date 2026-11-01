import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'স্নাতক / ডিগ্রি পাসে সরকারি ও ব্যাংক চাকরি ২০২৬ (Graduate Jobs) | চাকরি সেবা',
  description: 'যেকোনো বিষয়ে স্নাতক (পাস/অনার্স) যোগ্যতায় ৯ম ও ১০ম গ্রেডের প্রথম শ্রেণির চাকরির সার্কুলার।',
};

export default function Page() {
  return (
    <JobListingView
      title="স্নাতক / ডিগ্রি পাসে সরকারি ও ব্যাংক চাকরি ২০২৬ (Graduate Jobs)"
      subtitle="যেকোনো বিষয়ে স্নাতক (পাস/অনার্স) যোগ্যতায় ৯ম ও ১০ম গ্রেডের প্রথম শ্রেণির চাকরির সার্কুলার।"
      badge="স্নাতক ডিগ্রি"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "সকল চাকরি", href: "/jobs" }, { label: "স্নাতক পাস", href: "/jobs/bachelor-degree" }
      ]}
      filterType="bachelor"
      seoTextContent={{
        heading: "স্নাতকদের জন্য বিসিএস, বাংলাদেশ ব্যাংক ও মন্ত্রণালয় নিয়োগ",
        paragraphs: ['"স্নাতক ডিগ্রিধারীদের জন্য বিসিএস ক্যাডার, বাংলাদেশ ব্যাংক এডি এবং সরকারি বিভিন্ন দপ্তরে ১ম ও ২য় শ্রেণির কর্মকর্তাদের শীর্ষ পদ উন্মুক্ত থাকে।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
