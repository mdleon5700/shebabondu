import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'ইন্টার্নশিপ সার্কুলার ২০২৬ (Internships in Bangladesh) | চাকরি সেবা',
  description: 'ব্যাংক, করপোরেট প্রতিষ্ঠান ও গবেষণা সংস্থায় পেইড ইন্টার্নশিপ প্রোগ্রাম।',
};

export default function Page() {
  return (
    <JobListingView
      title="ইন্টার্নশিপ সার্কুলার ২০২৬ (Internships in Bangladesh)"
      subtitle="ব্যাংক, করপোরেট প্রতিষ্ঠান ও গবেষণা সংস্থায় পেইড ইন্টার্নশিপ প্রোগ্রাম।"
      badge="ইন্টার্নশিপ"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "ইন্টার্নশিপ", href: "/internships" }
      ]}
      filterType="internship"
      seoTextContent={{
        heading: "গ্র্যাজুয়েটদের জন্য সফল ইন্টার্নশিপের গুরুত্ব",
        paragraphs: ['"স্নাতক শেষ বর্ষের শিক্ষার্থীদের বাস্তব কর্মক্ষেত্রের অভিজ্ঞতা অর্জনের জন্য ইন্টার্নশিপ অত্যন্ত কার্যকর ভূমিকা পালন করে।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
