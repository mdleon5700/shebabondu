import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'পার্ট-টাইম চাকরির খবর ২০২৬ (Part-Time Jobs BD) | চাকরি সেবা',
  description: 'শিক্ষার্থী ও ফ্রেশারদের জন্য সুবিধাজনক শিফটের খণ্ডকালীন চাকরির সুযোগ।',
};

export default function Page() {
  return (
    <JobListingView
      title="পার্ট-টাইম চাকরির খবর ২০২৬ (Part-Time Jobs BD)"
      subtitle="শিক্ষার্থী ও ফ্রেশারদের জন্য সুবিধাজনক শিফটের খণ্ডকালীন চাকরির সুযোগ।"
      badge="পার্ট-টাইম"
      breadcrumbs={[
        { label: "হোম", href: "/" }, { label: "পার্ট-টাইম চাকরি", href: "/part-time-jobs" }
      ]}
      filterType="part-time"
      seoTextContent={{
        heading: "পড়াশোনার পাশাপাশি খণ্ডকালীন চাকরির সুযোগ",
        paragraphs: ['"কল সেন্টার, সুপারশপ, ইভেন্ট ম্যানেজমেন্ট এবং ডাটা এন্ট্রিতে পার্ট-টাইম কাজের প্রচুর চাহিদা রয়েছে।"'],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
