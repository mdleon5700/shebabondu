import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'মার্কেটিং ও সেলস চাকরির খবর ২০২৬ | চাকরি সেবা',
  description: 'সেলস অফিসার, ব্র্যান্ড ম্যানেজার ও টেরিটরি অফিসার পদে সার্কুলার।',
  alternates: {
    canonical: 'https://chakrisheba.com/marketing-jobs'
  },
  openGraph: {
    title: 'মার্কেটিং ও সেলস চাকরির খবর ২০২৬',
    description: 'সেলস অফিসার, ব্র্যান্ড ম্যানেজার ও টেরিটরি অফিসার পদে সার্কুলার।',
    url: 'https://chakrisheba.com/marketing-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function MarketingJobsPage() {
  return (
    <JobListingView
      title="মার্কেটিং ও সেলস চাকরির খবর ২০২৬"
      subtitle="সেলস অফিসার, ব্র্যান্ড ম্যানেজার ও টেরিটরি অফিসার পদে সার্কুলার।"
      badge="মার্কেটিং ও সেলস"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "মার্কেটিং চাকরি", href: "/marketing-jobs" }
      ]}
      filterType="marketing"
      seoTextContent={{
        heading: "ডিজিটাল ও কর্পোরেট মার্কেটিং ক্যারিয়ার ও প্রবৃদ্ধি",
        paragraphs: [
          "মার্কেটিং ও সেলস পেশায় পারফরম্যান্স ভিত্তিক আকর্ষণীয় ইনসেন্টিভ, দেশ-বিদেশে ভ্রমণের সুযোগ ও দ্রুত প্রমোশনের অবারিত ক্ষেত্র রয়েছে।"
        ],
        tips: [
          "কমিউনিকেশন ও নেগোসিয়েশন দক্ষতার ওপর গুরুত্ব দিন।",
          "ডিজিটাল মার্কেটিং টুলস ও সোশ্যাল মিডিয়া প্রচারণার বাস্তব অভিজ্ঞতা তুলে ধরুন।"
        ]
      }}
    />
  );
}
