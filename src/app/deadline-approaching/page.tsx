import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'আবেদনের শেষ সময় সমাগত (Deadline Approaching) | চাকরি সেবা',
  description: 'যেসব চাকরির আবেদনের সময় খুব শীঘ্রই (১ থেকে ৩ দিনের মধ্যে) শেষ হয়ে যাচ্ছে।',
};

export default function Page() {
  return (
    <JobListingView
      title="আবেদনের শেষ সময় সমাগত (Deadline Approaching)"
      subtitle="যেসব চাকরির আবেদনের সময় খুব শীঘ্রই (১ থেকে ৩ দিনের মধ্যে) শেষ হয়ে যাচ্ছে।"
      badge="জরুরি অ্যালার্ট"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "শেষ সময় সমাগত", href: "/deadline-approaching" }
      ]}
      filterType="deadline"
      seoTextContent={{
        heading: "ডেডলাইনের শেষ মুহূর্তে সার্ভার জটিলতা এড়ানোর উপায়",
        paragraphs: ['"সরকারি ও টেলিটক চাকরির আবেদনের শেষ দিনে প্রচণ্ড সার্ভার ট্রাফিকের কারণে ছবি আপলোড বা পেমেন্ট আটকে যাওয়ার ঝুঁকি থাকে। তাই আবেদনের শেষ সময়ের অন্তত ২৪ ঘণ্টা পূর্বে আবেদন ও ফি প্রদান নিশ্চিত করুন।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
