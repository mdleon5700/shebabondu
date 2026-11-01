import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'মার্কেটিং ও সেলস চাকরির খবর ২০২৬ | চাকরি সেবা',
  description: 'ব্র্যান্ডিং, ডিজিটাল মার্কেটিং, সেলস এক্সিকিউটিভ ও বিজনেস ডেভেলপমেন্ট পদ।',
};

export default function Page() {
  return (
    <JobListingView
      title="মার্কেটিং ও সেলস চাকরির খবর ২০২৬"
      subtitle="ব্র্যান্ডিং, ডিজিটাল মার্কেটিং, সেলস এক্সিকিউটিভ ও বিজনেস ডেভেলপমেন্ট পদ।"
      badge="মার্কেটিং ও সেলস"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "মার্কেটিং চাকরি", href: "/marketing-jobs" }
      ]}
      filterType="marketing"
      seoTextContent={{
        heading: "ডিজিটাল ও কর্পোরেট মার্কেটিং ক্যারিয়ার",
        paragraphs: ['"মার্কেটিং পেশায় পারফরম্যান্স ভিত্তিক আকর্ষণীয় ইনসেন্টিভ ও দ্রুত প্রমোশনের অবারিত সুযোগ থাকে।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
