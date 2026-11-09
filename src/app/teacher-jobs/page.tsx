import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'শিক্ষক নিয়োগ সার্কুলার ২০২৬ (Teacher Jobs BD) | চাকরি সেবা',
  description: 'এনটিআরসিএ (NTRCA), প্রাথমিক সহকারী শিক্ষক ও কলেজ প্রভাষক নিয়োগ বিজ্ঞপ্তি।',
  alternates: {
    canonical: 'https://chakrisheba.com/teacher-jobs'
  },
  openGraph: {
    title: 'শিক্ষক নিয়োগ সার্কুলার ২০২৬ (Teacher Jobs BD)',
    description: 'এনটিআরসিএ (NTRCA), প্রাথমিক সহকারী শিক্ষক ও কলেজ প্রভাষক নিয়োগ বিজ্ঞপ্তি।',
    url: 'https://chakrisheba.com/teacher-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function TeacherJobsPage() {
  return (
    <JobListingView
      title="শিক্ষক নিয়োগ সার্কুলার ২০২৬ (Teacher Jobs BD)"
      subtitle="এনটিআরসিএ, প্রাথমিক সহকারী শিক্ষক ও কলেজ প্রভাষক নিয়োগ।"
      badge="শিক্ষক নিয়োগ"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "শিক্ষক নিয়োগ", href: "/teacher-jobs" }
      ]}
      filterType="teacher"
      seoTextContent={{
        heading: "প্রাথমিক শিক্ষক ও হাইস্কুল/কলেজ শিক্ষক নিয়োগ নির্দেশিকা",
        paragraphs: [
          "প্রাথমিক শিক্ষা অধিদপ্তর (DPE) এবং বেসরকারি শিক্ষক নিবন্ধন ও প্রত্যয়ন কর্তৃপক্ষ (NTRCA) কর্তৃক শিক্ষক নিয়োগের ক্ষেত্রে নারী কোটা, পোষ্য কোটা ও জেলাভিত্তিক কোটার সুনির্দিষ্ট নীতিমালা রয়েছে।"
        ],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "শিক্ষক নিবন্ধন সনদের রোল ও ব্যাচ নম্বর সঠিকভাবে ফর্মে ইনপুট করুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
