import React from 'react';
import { Metadata } from 'next';
import CareerGuideDetailClient from '@/components/CareerGuideDetailClient';

export const metadata: Metadata = {
  title: 'আন্তর্জাতিক মানের পেশাদার সিভি (CV) তৈরির পূর্ণাঙ্গ কৌশল | চাকরি সেবা',
  description: 'ATS ফ্রেন্ডলি সিভি তৈরি, সেকশন বিন্যাস, পাওয়ার ভার্ব ও নমুনা সিভি টেমপ্লেট গাইড।',
  openGraph: {
    title: 'পেশাদার সিভি (CV) তৈরির পূর্ণাঙ্গ কৌশল | চাকরি সেবা',
    description: 'আন্তর্জাতিক মানের সিভি ও জীবনবৃত্তান্ত তৈরির এ টু জেড গাইডলাইন।',
  },
};

export default function CvWritingPage() {
  return <CareerGuideDetailClient slug="cv-writing" />;
}
