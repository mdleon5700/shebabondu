import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'বেসরকারি ও কোম্পানি চাকরির খবর ২০২৬ | চাকরি সেবা',
  description: 'কোল পাওয়ার, আশুগঞ্জ পাওয়ার, কেবল শিল্প, পেট্রোবাংলাসহ কোম্পানি ও স্বায়ত্তশাসিত চাকরি।',
  alternates: {
    canonical: 'https://chakrisheba.com/private-jobs'
  },
  openGraph: {
    title: 'বেসরকারি ও কোম্পানি চাকরির খবর ২০২৬',
    description: 'কোল পাওয়ার, আশুগঞ্জ পাওয়ার, কেবল শিল্প, পেট্রোবাংলাসহ কোম্পানি ও স্বায়ত্তশাসিত চাকরি।',
    url: 'https://chakrisheba.com/private-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function PrivateJobsPage() {
  return (
    <JobListingView
      title="বেসরকারি ও কোম্পানি চাকরির খবর ২০২৬"
      subtitle="কোল পাওয়ার, আশুগঞ্জ পাওয়ার, কেবল শিল্প, পেট্রোবাংলাসহ কোম্পানি ও স্বায়ত্তশাসিত চাকরি।"
      badge="কোম্পানি ও বেসরকারি"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "বেসরকারি চাকরি", href: "/private-jobs" }
      ]}
      filterType="private"
      seoTextContent={{
        heading: "কোম্পানি ও স্বায়ত্তশাসিত প্রতিষ্ঠানে আকর্ষণীয় ক্যারিয়ার",
        paragraphs: [
          "বাংলাদেশ কেবল শিল্প লিমিটেড, আশুগঞ্জ পাওয়ার স্টেশন, কোল পাওয়ার জেনারেশন কোম্পানি এবং পেট্রোবাংলার বিভিন্ন সহযোগী প্রতিষ্ঠানে নিয়মিত অফিসার ও কারিগরি পদে আকর্ষণীয় সুযোগ সুবিধা প্রদান করা হয়।"
        ],
        tips: [
          "আবেদনের পূর্বে মূল অফিসিয়াল গ্যাজেট নোটিশটি ভালোভাবে পড়ে নিন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সঠিকভাবে রিসাইজ করে প্রস্তুত রাখুন।",
          "অনলাইন আবেদনের কপি সংরক্ষণ করুন এবং নির্ধারিত ফি নির্দিষ্ট মাধ্যমে পরিশোধ করুন।"
        ]
      }}
    />
  );
}
