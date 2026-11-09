import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'অ্যাকাউন্টিং ও ফাইন্যান্স চাকরি ২০২৬ | চাকরি সেবা',
  description: 'হিসাবরক্ষক, ক্যাশিয়ার, অডিটর ও ফাইন্যান্সিয়াল এনালিস্ট পদে নিয়োগ বিজ্ঞপ্তি।',
  alternates: {
    canonical: 'https://chakrisheba.com/accounting-finance-jobs'
  },
  openGraph: {
    title: 'অ্যাকাউন্টিং ও ফাইন্যান্স চাকরি ২০২৬',
    description: 'হিসাবরক্ষক, ক্যাশিয়ার, অডিটর ও ফাইন্যান্সিয়াল এনালিস্ট পদে নিয়োগ বিজ্ঞপ্তি।',
    url: 'https://chakrisheba.com/accounting-finance-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function AccountingFinanceJobsPage() {
  return (
    <JobListingView
      title="অ্যাকাউন্টিং ও ফাইন্যান্স চাকরি ২০২৬"
      subtitle="হিসাবরক্ষক, ক্যাশিয়ার, অডিটর ও ফাইন্যান্সিয়াল এনালিস্ট পদে নিয়োগ বিজ্ঞপ্তি।"
      badge="হিসাব ও অডিট"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "অ্যাকাউন্টিং চাকরি", href: "/accounting-finance-jobs" }
      ]}
      filterType="accounting-finance"
      seoTextContent={{
        heading: "সিএজি, জাতীয় সঞ্চয় অধিদপ্তর ও ব্যাংকে হিসাবরক্ষণ পদের ক্যারিয়ার",
        paragraphs: [
          "হিসাব মহানিয়ন্ত্রকের কার্যালয় (CGA), জাতীয় সঞ্চয় অধিদপ্তর, বাণিজ্যিক ব্যাংক ও করপোরেট হাউজে একাউন্ট্যান্ট ও ক্যাশিয়ার পদে নিয়মিত সার্কুলার আসে।"
        ],
        tips: [
          "ট্যালি (Tally), এক্সেল (Excel) ও অ্যাকাউন্টিং সফটওয়্যারের অভিজ্ঞতা উল্লেখ করুন।",
          "পরীক্ষার জন্য গণিত, অ্যানালিটিক্যাল অ্যাবিলিটি ও বেসিক অ্যাকাউন্টিং প্রিন্সিপাল রিভিশন দিন।"
        ]
      }}
    />
  );
}
