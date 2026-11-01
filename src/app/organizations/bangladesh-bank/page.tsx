import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'বাংলাদেশ ব্যাংক নিয়োগ সার্কুলার ২০২৬ (Bangladesh Bank Jobs) | চাকরি সেবা',
  description: 'কেন্দ্রীয় ব্যাংক কর্তৃক সহকারী পরিচালক (AD), অফিসার ও ক্যাশ পদের সর্বশেষ নিয়োগ তথ্য।',
};

export default function Page() {
  return (
    <JobListingView
      title="বাংলাদেশ ব্যাংক নিয়োগ সার্কুলার ২০২৬ (Bangladesh Bank Jobs)"
      subtitle="কেন্দ্রীয় ব্যাংক কর্তৃক সহকারী পরিচালক (AD), অফিসার ও ক্যাশ পদের সর্বশেষ নিয়োগ তথ্য।"
      badge="বাংলাদেশ ব্যাংক"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "প্রতিষ্ঠানসমূহ", href: "/organizations" }, { label: "বাংলাদেশ ব্যাংক", href: "/organizations/bangladesh-bank" }
      ]}
      filterType="org-bb"
      seoTextContent={{
        heading: "বাংলাদেশ ব্যাংক এডি নিয়োগের সিলেবাস, মানবন্টন ও আবেদন নিয়ম",
        paragraphs: ['"বাংলাদেশ ব্যাংক ই-রিক্রুটমেন্ট পোর্টালে (erecruitment.bb.org.bd) অ্যাকাউন্ট তৈরি করে সরাসরি ঘরে বসেই আবেদন করা যায়। ব্যাংকিং সেক্টরের সবচেয়ে মর্যাদাপূর্ণ ক্যারিয়ারের শীর্ষে রয়েছে সহকারী পরিচালক পদ।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
