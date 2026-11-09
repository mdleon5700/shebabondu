import React from 'react';
import { Metadata } from 'next';
import ModelTestsClient from '@/components/ModelTestsClient';

export const metadata: Metadata = {
  title: 'অনলাইন লাইভ মডেল টেস্ট ও স্বয়ংক্রিয় মেরিট লিস্ট ২০২৬ | চাকরি সেবা',
  description: 'বিসিএস প্রিলিমিনারি, প্রাথমিক সহকারী শিক্ষক ও বাংলাদেশ ব্যাংক নিয়োগ পরীক্ষার টাইমারভিত্তিক লাইভ মডেল টেস্ট, নেগেটিভ মার্কিং ও পূর্ণাঙ্গ সমাধান।',
  openGraph: {
    title: 'অনলাইন লাইভ মডেল টেস্ট ও ফলাফল | চাকরি সেবা',
    description: 'টাইমারভিত্তিক এমসিকিউ মডেল টেস্ট দিন এবং তাৎক্ষণিক স্কোর ও ব্যাখ্যা দেখুন।',
  },
};

export default function ModelTestsPage() {
  return <ModelTestsClient />;
}
