import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'বিপিএসসি / কর্ম কমিশন নিয়োগ সার্কুলার ২০২৬ (BPSC Jobs) | চাকরি সেবা',
  description: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC) কর্তৃক বিসিএস ও নন-ক্যাডার ১ম ও ২য় শ্রেণির নিয়োগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="বিপিএসসি / কর্ম কমিশন নিয়োগ সার্কুলার ২০২৬ (BPSC Jobs)"
      subtitle="বাংলাদেশ সরকারি কর্ম কমিশন (BPSC) কর্তৃক বিসিএস ও নন-ক্যাডার ১ম ও ২য় শ্রেণির নিয়োগ।"
      badge="বিপিএসসি"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "প্রতিষ্ঠানসমূহ", href: "/organizations" }, { label: "বিপিএসসি", href: "/organizations/bpsc" }
      ]}
      filterType="org-bpsc"
      seoTextContent={{
        heading: "বিসিএস প্রিলিমিনারি, লিখিত ও ভাইভা পরীক্ষার চূড়ান্ত প্রস্তুতি",
        paragraphs: ['"বিপিএসসি আয়োজিত বিসিএস পরীক্ষা বাংলাদেশের সবচেয়ে প্রতিযোগিতামূলক চাকরি পরীক্ষা। ২০০ নম্বরের প্রিলিমিনারি ও ৯০০ নম্বরের লিখিত পরীক্ষার মাধ্যমে ক্যাডার সার্ভিসে কর্মকর্তা নিয়োগ দেওয়া হয়।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
