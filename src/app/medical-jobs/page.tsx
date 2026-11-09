import React from 'react';
import { Metadata } from 'next';
import JobListingView from '@/components/JobListingView';

export const metadata: Metadata = {
  title: 'মেডিকেল ও স্বাস্থ্য সেবা নিয়োগ ২০২৬ | চাকরি সেবা',
  description: 'মেডিকেল অফিসার, নার্স, ফার্মাসিস্ট ও স্বাস্থ্য সহকারী সার্কুলার।',
  alternates: {
    canonical: 'https://chakrisheba.com/medical-jobs'
  },
  openGraph: {
    title: 'মেডিকেল ও স্বাস্থ্য সেবা নিয়োগ ২০২৬',
    description: 'মেডিকেল অফিসার, নার্স, ফার্মাসিস্ট ও স্বাস্থ্য সহকারী সার্কুলার।',
    url: 'https://chakrisheba.com/medical-jobs',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    locale: 'bn_BD',
    type: 'website'
  }
};

export default function MedicalJobsPage() {
  return (
    <JobListingView
      title="মেডিকেল ও স্বাস্থ্য সেবা নিয়োগ ২০২৬"
      subtitle="মেডিকেল অফিসার, নার্স, ফার্মাসিস্ট ও স্বাস্থ্য সহকারী সার্কুলার।"
      badge="স্বাস্থ্য ও চিকিৎসা"
      breadcrumbs={[
        { label: "হোম", href: "/" }, 
        { label: "মেডিকেল চাকরি", href: "/medical-jobs" }
      ]}
      filterType="medical"
      seoTextContent={{
        heading: "স্বাস্থ্য খাতে সরকারি চাকরির সুযোগ ও যোগ্যতা",
        paragraphs: [
          "স্বাস্থ্য অধিদপ্তরের (DGHS) অধীনে সিনিয়র স্টাফ নার্স, মেডিকেল অফিসার, ফার্মাসিস্ট ও মেডিকেল টেকনোলজিস্ট পদে নিয়মিত সরকারি সার্কুলার প্রকাশিত হয়।"
        ],
        tips: [
          "বিএমডিসি (BMDC) অথবা নার্সিং কাউন্সিলের হালনাগাদ রেজিস্ট্রেশন নম্বর সঠিকভাবে উল্লেখ করুন।",
          "৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর প্রস্তুত রাখুন।",
          "শেষ দিনের সার্ভার জ্যাম এড়াতে নির্ধারিত সময়ের অন্তত ৩ দিন আগেই আবেদন সম্পন্ন করুন।"
        ]
      }}
    />
  );
}
