import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'সকল সরকারি অধিদপ্তর নিয়োগ সার্কুলার ২০২৬ (Directorate Jobs) | চাকরি সেবা',
  description: 'প্রাথমিক শিক্ষা অধিদপ্তর, স্বাস্থ্য অধিদপ্তর, মাদকদ্রব্য নিয়ন্ত্রণ, সমাজসেবা ও খাদ্য অধিদপ্তর নিয়োগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="সকল সরকারি অধিদপ্তর নিয়োগ সার্কুলার ২০২৬ (Directorate Jobs)"
      subtitle="প্রাথমিক শিক্ষা অধিদপ্তর, স্বাস্থ্য অধিদপ্তর, মাদকদ্রব্য নিয়ন্ত্রণ, সমাজসেবা ও খাদ্য অধিদপ্তর নিয়োগ।"
      badge="অধিদপ্তর নিয়োগ"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "প্রতিষ্ঠানসমূহ", href: "/organizations" }, { label: "অধিদপ্তরসমূহ", href: "/organizations/government-directorates" }
      ]}
      filterType="org-directorates"
      seoTextContent={{
        heading: "অধিদপ্তরসমূহের মাঠপর্যায়ের আকর্ষণীয় পদসমূহ",
        paragraphs: ['"জেলা ও উপজেলা পর্যায়ে সরকারি সেবা পৌঁছে দিতে বিভিন্ন অধিদপ্তর নিয়মিতভাবে বিশাল সংখ্যক জনবল নিয়োগের বিজ্ঞপ্তি প্রকাশ করে।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
