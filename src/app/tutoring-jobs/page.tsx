import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'টিউশন ও গৃহশিক্ষক নিয়োগ ২০২৬ (Tuition Jobs) | চাকরি সেবা',
  description: 'ঢাকা, চট্টগ্রামসহ সারাদেশে পার্ট-টাইম ও হোম টিউটরিং কাজের খবর।',
};

export default function Page() {
  return (
    <JobListingView
      title="টিউশন ও গৃহশিক্ষক নিয়োগ ২০২৬ (Tuition Jobs)"
      subtitle="ঢাকা, চট্টগ্রামসহ সারাদেশে পার্ট-টাইম ও হোম টিউটরিং কাজের খবর।"
      badge="টিউশন ও শিক্ষকতা"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "টিউশন চাকরি", href: "/tutoring-jobs" }
      ]}
      filterType="tutoring"
      seoTextContent={{
        heading: "বিশ্ববিদ্যালয় শিক্ষার্থীদের জন্য সম্মানজনক টিউশন গাইড",
        paragraphs: ['"পড়াশোনার পাশাপাশি টিউশন ও কোচিং সেন্টারে ক্লাস নিয়ে শিক্ষার্থীরা তাদের খরচ নির্বাহের পাশাপাশি শিক্ষকতার অভিজ্ঞতা অর্জন করতে পারেন।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
