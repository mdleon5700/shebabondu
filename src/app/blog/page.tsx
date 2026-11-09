import React from 'react';
import { Metadata } from 'next';
import BlogListClient from '@/components/BlogListClient';

export const metadata: Metadata = {
  title: 'চাকরি সেবা ব্লগ ও ক্যারিয়ার আর্টিকেল ২০২৬ | চাকরি সেবা',
  description: 'সরকারি ও ব্যাংক নিয়োগ পরীক্ষার প্রস্তুতি, বয়স বৃদ্ধি সংক্রান্ত সরকারি গেজেট আপডেট এবং শিক্ষণীয় ব্লগ পোস্ট।',
  openGraph: {
    title: 'চাকরি সেবা ব্লগ ও ক্যারিয়ার বিশ্লেষণ | চাকরি সেবা',
    description: 'বিসিএস, প্রাথমিক শিক্ষক ও ব্যাংক জবসের সর্বশেষ আর্টিকেল ও ক্যারিয়ার গাইডলাইন।',
  },
};

export default function BlogPage() {
  return <BlogListClient />;
}
