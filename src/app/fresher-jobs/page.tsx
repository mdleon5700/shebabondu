import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'অভিজ্ঞতাহীন / ফ্রেশারদের চাকরি ২০২৬ (Fresher Jobs) | চাকরি সেবা',
  description: 'সদ্য পাসকৃত গ্র্যাজুয়েটদের জন্য কোনো পূর্ব অভিজ্ঞতা ছাড়াই আবেদনের সুযোগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="অভিজ্ঞতাহীন / ফ্রেশারদের চাকরি ২০২৬ (Fresher Jobs)"
      subtitle="সদ্য পাসকৃত গ্র্যাজুয়েটদের জন্য কোনো পূর্ব অভিজ্ঞতা ছাড়াই আবেদনের সুযোগ।"
      badge="ফ্রেশার চাকরি"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "ফ্রেশার চাকরি", href: "/fresher-jobs" }
      ]}
      filterType="fresher"
      seoTextContent={{
        heading: "অভিজ্ঞতা ছাড়া সরকারি ও কর্পোরেট চাকুরিতে প্রবেশের কৌশল",
        paragraphs: ['"সরকারি বেশিরভাগ এন্ট্রি-লেভেল পদে (যেমন: বিসিএস, ব্যাংক অফিসার, শিক্ষক, অডিটর) কোনো পূর্ব অভিজ্ঞতার প্রয়োজন হয় না।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
