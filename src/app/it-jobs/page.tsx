import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'আইটি ও সফটওয়্যার ইঞ্জিনিয়ারিং চাকরি ২০২৬ | চাকরি সেবা',
  description: 'সফটওয়্যার ইঞ্জিনিয়ার, ডাটাবেজ এডমিন, নেটওয়ার্ক ইঞ্জিনিয়ার ও আইটি সহকারী সার্কুলার।',
  alternates: {
    canonical: 'https://chakrisheba.com/it-jobs'
  },
  openGraph: {
    title: 'আইটি ও সফটওয়্যার ইঞ্জিনিয়ারিং চাকরি ২০২৬',
    description: 'সফটওয়্যার ইঞ্জিনিয়ার, ডাটাবেজ এডমিন, নেটওয়ার্ক ইঞ্জিনিয়ার ও আইটি সহকারী সার্কুলার।',
    url: 'https://chakrisheba.com/it-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function ITJobsPage() {
  return (
    <JobListingView
      title="আইটি ও সফটওয়্যার ইঞ্জিনিয়ারিং চাকরি ২০২৬"
      subtitle="সফটওয়্যার ইঞ্জিনিয়ার, ডাটাবেজ এডমিন, নেটওয়ার্ক ইঞ্জিনিয়ার ও আইটি সহকারী সার্কুলার।"
      badge="আইটি ও সফটওয়্যার"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "আইটি চাকরি", href: "/it-jobs" }
      ]}
      filterType="it"
      seoTextContent={{
        heading: "তথ্যপ্রযুক্তি খাতে সরকারি ও কর্পোরেট ক্যারিয়ার",
        paragraphs: [
          "বাংলাদেশ নির্বাচন কমিশন, বিটিসিএল, বিভিন্ন মন্ত্রণালয় ও সংস্থায় সহকারী প্রোগ্রামার, সিস্টেম অ্যানালিস্ট ও কম্পিউটার অপারেটর পদে আকর্ষণীয় সরকারি চাকরির সুযোগ রয়েছে।"
        ],
        tips: [
          "কম্পিউটার টাইপিং স্পিড (বাংলায় ২৫ ও ইংরেজিতে ৩০ শব্দ) নিশ্চিত করতে নিয়মিত অনুশীলন করুন।",
          "স্ট্যান্ডার্ড পোর্টফোলিও ও গিটহাব প্রোফাইল সিভিতে সংযুক্ত করুন।",
          "নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
