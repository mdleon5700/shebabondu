import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'এনজিও চাকরির সার্কুলার ২০২৬ (NGO Jobs in BD) | চাকরি সেবা',
  description: 'ব্র্যাক, আশা, গ্রামীণ ব্যাংক ও আন্তর্জাতিক উন্নয়ন সহযোগী সংস্থাসমূহের নিয়োগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="এনজিও চাকরির সার্কুলার ২০২৬ (NGO Jobs in BD)"
      subtitle="ব্র্যাক, আশা, গ্রামীণ ব্যাংক ও আন্তর্জাতিক উন্নয়ন সহযোগী সংস্থাসমূহের নিয়োগ।"
      badge="এনজিও ক্যারিয়ার"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "এনজিও চাকরি", href: "/ngo-jobs" }
      ]}
      filterType="ngo"
      seoTextContent={{
        heading: "উন্নয়ন খাতে ক্যারিয়ার ও আকর্ষণীয় বেতন সুবিধা",
        paragraphs: ['"এনজিও খাতে সমাজ উন্নয়ন, শিক্ষা, স্বাস্থ্য, মাইক্রোফাইন্যান্স ও প্রজেক্ট ম্যানেজমেন্টে কাজের ব্যাপক সুযোগ রয়েছে।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
