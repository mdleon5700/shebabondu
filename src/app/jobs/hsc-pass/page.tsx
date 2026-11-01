import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'এইচএসসি পাসে সরকারি চাকরি ২০২৬ (HSC Pass Jobs) | চাকরি সেবা',
  description: 'উচ্চ মাধ্যমিক (এইচএসসি/আলিম/সমমান) পাসে আবেদনযোগ্য ১১তম থেকে ১৬তম গ্রেডের চাকরি।',
};

export default function Page() {
  return (
    <JobListingView
      title="এইচএসসি পাসে সরকারি চাকরি ২০২৬ (HSC Pass Jobs)"
      subtitle="উচ্চ মাধ্যমিক (এইচএসসি/আলিম/সমমান) পাসে আবেদনযোগ্য ১১তম থেকে ১৬তম গ্রেডের চাকরি।"
      badge="এইচএসসি পাস"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "সকল চাকরি", href: "/jobs" }, { label: "এইচএসসি পাস", href: "/jobs/hsc-pass" }
      ]}
      filterType="hsc"
      seoTextContent={{
        heading: "এইচএসসি পাসে পুলিশ, রেলওয়ে ও মন্ত্রণালয়ে নিয়োগ",
        paragraphs: ['"বাংলাদেশ রেলওয়ের সহকারী স্টেশন মাস্টার, পুলিশের এসআই/সার্জেন্ট এবং বিভিন্ন মন্ত্রণালয়ের কম্পিউটার অপারেটর পদে এইচএসসি পাসেই আবেদন করা যায়।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
