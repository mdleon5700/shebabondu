import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'এসএসসি পাসে সরকারি ও বেসরকারি চাকরি ২০২৬ (SSC Pass Jobs) | চাকরি সেবা',
  description: 'মাধ্যমিক (এসএসসি/দাখিল/সমমান) পাসে আবেদনযোগ্য সকল সরকারি ও স্বায়ত্তশাসিত নিয়োগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="এসএসসি পাসে সরকারি ও বেসরকারি চাকরি ২০২৬ (SSC Pass Jobs)"
      subtitle="মাধ্যমিক (এসএসসি/দাখিল/সমমান) পাসে আবেদনযোগ্য সকল সরকারি ও স্বায়ত্তশাসিত নিয়োগ।"
      badge="এসএসসি পাস"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "সকল চাকরি", href: "/jobs" }, { label: "এসএসসি পাস", href: "/jobs/ssc-pass" }
      ]}
      filterType="ssc"
      seoTextContent={{
        heading: "এসএসসি পাসে ১৬তম থেকে ২০তম গ্রেডের সরকারি চাকরির সুযোগ",
        paragraphs: ['"এসএসসি পাসে অফিস সহকারী, ডাটা এন্ট্রি অপারেটর, নিরাপত্তা প্রহরী ও ড্রাইভার পদে আকর্ষণীয় স্কেলে সরকারি চাকরির সুযোগ রয়েছে।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
