import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'স্নাতকোত্তর / মাস্টার্স পাসে চাকরি ২০২৬ (Masters Degree Jobs) | চাকরি সেবা',
  description: 'মাস্টার্স ডিগ্রিধারীদের জন্য গবেষণা, ব্যাংকিং, শিক্ষকতা ও ৯ম গ্রেডের চাকরির খবর।',
};

export default function Page() {
  return (
    <JobListingView
      title="স্নাতকোত্তর / মাস্টার্স পাসে চাকরি ২০২৬ (Masters Degree Jobs)"
      subtitle="মাস্টার্স ডিগ্রিধারীদের জন্য গবেষণা, ব্যাংকিং, শিক্ষকতা ও ৯ম গ্রেডের চাকরির খবর।"
      badge="স্নাতকোত্তর"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "সকল চাকরি", href: "/jobs" }, { label: "মাস্টার্স পাস", href: "/jobs/masters-degree" }
      ]}
      filterType="masters"
      seoTextContent={{
        heading: "উচ্চশিক্ষিত প্রার্থীদের জন্য বিশেষায়িত ক্যারিয়ার গাইড",
        paragraphs: ['"গবেষণা কর্মকর্তা, সিনিয়র অফিসার, প্রভাষক এবং সহকারী পরিচালক পদে মাস্টার্স উত্তীর্ণ প্রার্থীদের অগ্রাধিকার দেওয়া হয়।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
