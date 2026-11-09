import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'এনজিও চাকরির সার্কুলার ২০২৬ (NGO Jobs in BD) | চাকরি সেবা',
  description: 'ব্র্যাক, আশা, টিএমএসএসসহ জাতীয় ও আন্তর্জাতিক এনজিও সার্কুলার।',
  alternates: {
    canonical: 'https://chakrisheba.com/ngo-jobs'
  },
  openGraph: {
    title: 'এনজিও চাকরির সার্কুলার ২০২৬ (NGO Jobs in BD)',
    description: 'ব্র্যাক, আশা, টিএমএসএসসহ জাতীয় ও আন্তর্জাতিক এনজিও সার্কুলার।',
    url: 'https://chakrisheba.com/ngo-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function NGOJobsPage() {
  return (
    <JobListingView
      title="এনজিও চাকরির সার্কুলার ২০২৬ (NGO Jobs in BD)"
      subtitle="ব্র্যাক, আশা, টিএমএসএসসহ জাতীয় ও আন্তর্জাতিক এনজিও সার্কুলার।"
      badge="এনজিও ক্যারিয়ার"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "এনজিও চাকরি", href: "/ngo-jobs" }
      ]}
      filterType="ngo"
      seoTextContent={{
        heading: "উন্নয়ন খাতে ক্যারিয়ার ও আকর্ষণীয় বেতন সুবিধা",
        paragraphs: [
          "এনজিও খাতে সমাজ উন্নয়ন, স্বাস্থ্য, শিক্ষা, মাইক্রোফাইন্যান্স, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা সংক্রান্ত প্রজেক্টে আকর্ষণীয় বেতনে কাজের ব্যাপক সুযোগ রয়েছে।"
        ],
        tips: [
          "সিভিতে মাঠপর্যায়ের অভিজ্ঞতা ও প্রজেক্ট রিপোর্টিং দক্ষতা তুলে ধরুন।",
          "কমিউনিকেশন ও ইংরেজি ভাষার দক্ষতা অগ্রাধিকার পায়।"
        ]
      }}
    />
  );
}
