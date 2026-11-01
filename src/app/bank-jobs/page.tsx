import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'ব্যাংক নিয়োগ সার্কুলার ২০২৬ (Bank Jobs in Bangladesh) | চাকরি সেবা',
  description: 'বাংলাদেশ ব্যাংক, সোনালী, জনতা, অগ্রণী ও সকল বাণিজ্যিক ব্যাংকের অফিসার ও এডি নিয়োগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="ব্যাংক নিয়োগ সার্কুলার ২০২৬ (Bank Jobs in Bangladesh)"
      subtitle="বাংলাদেশ ব্যাংক, সোনালী, জনতা, অগ্রণী ও সকল বাণিজ্যিক ব্যাংকের অফিসার ও এডি নিয়োগ।"
      badge="ব্যাংক ক্যারিয়ার"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "ব্যাংক চাকরি", href: "/bank-jobs" }
      ]}
      filterType="bank"
      seoTextContent={{
        heading: "ব্যাংকার্স সিলেকশন কমিটি ও বাংলাদেশ ব্যাংক নিয়োগ পরীক্ষার প্রস্তুতি",
        paragraphs: ['"ব্যাংক নিয়োগে সাধারণত প্রিলিমিনারি এমসিকিউ, লিখিত পরীক্ষা (অনুবাদ, ফোকাস রাইটিং ও ম্যাথ) এবং ভাইভার মাধ্যমে প্রার্থী বাছাই করা হয়। সাধারণ জ্ঞান ও গণিতে সর্বোচ্চ দক্ষতা ব্যাংক জবে সফলতার চাবিকাঠি।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
