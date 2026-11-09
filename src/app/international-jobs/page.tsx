import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'প্রবাসী ও আন্তর্জাতিক চাকরির সার্কুলার ২০২৬ (Overseas Jobs BD) | চাকরি সেবা',
  description: 'বোয়েসেল (BOESL), প্রবাসী কল্যাণ মন্ত্রণালয়, জাপান, কোরিয়া, মধ্যপ্রাচ্য ও ইউরোপে সরকারি ও প্রাতিষ্ঠানিক নিয়োগ।',
  alternates: {
    canonical: 'https://chakrisheba.com/international-jobs'
  },
  openGraph: {
    title: 'প্রবাসী ও আন্তর্জাতিক চাকরির সার্কুলার ২০২৬ (Overseas Jobs BD)',
    description: 'বোয়েসেল (BOESL), প্রবাসী কল্যাণ মন্ত্রণালয়, জাপান, কোরিয়া, মধ্যপ্রাচ্য ও ইউরোপে সরকারি ও প্রাতিষ্ঠানিক নিয়োগ।',
    url: 'https://chakrisheba.com/international-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function InternationalJobsPage() {
  return (
    <JobListingView
      title="প্রবাসী ও আন্তর্জাতিক চাকরির সার্কুলার ২০২৬ (Overseas Jobs BD)"
      subtitle="বোয়েসেল (BOESL), প্রবাসী কল্যাণ মন্ত্রণালয়, জাপান, কোরিয়া, মধ্যপ্রাচ্য ও ইউরোপে সরকারি ও প্রাতিষ্ঠানিক নিয়োগ।"
      badge="প্রবাসী ও আন্তর্জাতিক নিয়োগ"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "প্রবাসী ও আন্তর্জাতিক চাকরি", href: "/international-jobs" }
      ]}
      filterType="international"
      seoTextContent={{
        heading: "প্রবাসী কল্যাণ ও বোয়েসেল-এর মাধ্যমে সরকারিভাবে বিদেশ গমনের নিয়মাবলী",
        paragraphs: [
          "বাংলাদেশ ওভারসিজ এমপ্লয়মেন্ট অ্যান্ড সার্ভিসেস লিমিটেড (বোয়েসেল) এবং প্রবাসী কল্যাণ ও বৈদেশিক কর্মসংস্থান মন্ত্রণালয়ের মাধ্যমে জর্ডান, দক্ষিণ কোরিয়া (EPS), জাপান (TITP), কুয়েত এবং ইউরোপীয় ইউনিয়নের বিভিন্ন দেশে নামমাত্র সরকারি খরচে দক্ষ ও আধা-দক্ষ কর্মী প্রেরণ করা হয়।",
          "দালাল বা অননুমোদিত রিক্রুটিং এজেন্সির প্রতারণা এড়াতে সর্বদা বিএমইটি (BMET) ডাটাবেজে বায়োমেট্রিক রেজিস্ট্রেশন সম্পন্ন করে সঠিক প্রক্রিয়ায় আবেদন করুন।"
        ],
        tips: [
          "আবেদনের পূর্বে পাসপোর্টের মেয়াদ ন্যূনতম ১ বছর আছে কি-না যাচাই করুন।",
          "বিএমইটি (BMET) ডাটাবেজে আপনার আঙুলের ছাপ ও পেশাগত দক্ষতার সনদ যুক্ত রাখুন।",
          "বোয়েসেল নির্ধারিত অফিসিয়াল চালান/ব্যাংক ড্রাফট ছাড়া কোনো ব্যক্তি বা মধ্যস্বত্বভোগীকে নগদ অর্থ প্রদান করবেন না।"
        ]
      }}
    />
  );
}

