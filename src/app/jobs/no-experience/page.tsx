import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'অভিজ্ঞতা ছাড়া সরকারি চাকরি ২০২৬ (No Experience Jobs) | চাকরি সেবা',
  description: 'যেসব চাকরির বিজ্ঞপ্তিতে কোনো পূর্ব অভিজ্ঞতার শর্ত নেই—সরাসরি পরীক্ষায় অংশ নেওয়ার সুযোগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="অভিজ্ঞতা ছাড়া সরকারি চাকরি ২০২৬ (No Experience Jobs)"
      subtitle="যেসব চাকরির বিজ্ঞপ্তিতে কোনো পূর্ব অভিজ্ঞতার শর্ত নেই—সরাসরি পরীক্ষায় অংশ নেওয়ার সুযোগ।"
      badge="অভিজ্ঞতাহীন"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "সকল চাকরি", href: "/jobs" }, { label: "অভিজ্ঞতা ছাড়া", href: "/jobs/no-experience" }
      ]}
      filterType="no-experience"
      seoTextContent={{
        heading: "অভিজ্ঞতার শর্তহীন চাকরির পূর্ণাঙ্গ তালিকা",
        paragraphs: ['"চাকরিপ্রার্থীদের সবচেয়ে বড় দুশ্চিন্তা থাকে অভিজ্ঞতার শর্ত। স্বস্তির বিষয় হলো, বাংলাদেশের বেশিরভাগ সরকারি চাকরি শুধুমাত্র মেধাভিত্তিক লিখিত ও প্রিলিমিনারি পরীক্ষার মাধ্যমেই চূড়ান্ত নিয়োগ দেয়।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
