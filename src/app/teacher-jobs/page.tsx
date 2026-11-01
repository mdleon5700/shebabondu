import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'শিক্ষক নিয়োগ সার্কুলার ২০২৬ (Teacher Jobs BD) | চাকরি সেবা',
  description: 'সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক ও বেসরকারি শিক্ষক নিবন্ধন (NTRCA) সার্কুলার।',
};

export default function Page() {
  return (
    <JobListingView
      title="শিক্ষক নিয়োগ সার্কুলার ২০২৬ (Teacher Jobs BD)"
      subtitle="সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক ও বেসরকারি শিক্ষক নিবন্ধন (NTRCA) সার্কুলার।"
      badge="শিক্ষক নিয়োগ"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "শিক্ষক নিয়োগ", href: "/teacher-jobs" }
      ]}
      filterType="teacher"
      seoTextContent={{
        heading: "প্রাথমিক শিক্ষক ও হাইস্কুল/কলেজ শিক্ষক নিয়োগ নির্দেশিকা",
        paragraphs: ['"প্রাথমিক শিক্ষা অধিদপ্তর (DPE) এবং এনটিআরসিএ কর্তৃক শিক্ষক নিয়োগের ক্ষেত্রে নারী কোটা ও জেলাভিত্তিক কোটার সুনির্দিষ্ট নীতিমালা রয়েছে।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
