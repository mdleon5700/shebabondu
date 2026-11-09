import React from 'react';
import { Metadata } from 'next';
import CareerGuideDetailClient from '@/components/CareerGuideDetailClient';

export const metadata: Metadata = {
  title: 'চাকরির ইন্টারভিউ ও ভাইভায় সফল হওয়ার চূড়ান্ত কৌশল | চাকরি সেবা',
  description: 'ইন্টারভিউ বোর্ডে আত্মবিশ্বাস বজায় রাখার উপায়, সাধারণ প্রশ্নাবলীর উত্তর ও বডি ল্যাঙ্গুয়েজ টিপস।',
  openGraph: {
    title: 'ইন্টারভিউতে সফল হওয়ার কৌশল | চাকরি সেবা',
    description: 'কর্পোরেট ও সরকারি চাকরির ইন্টারভিউ মোকাবিলার কার্যকরী নিয়মাবলী।',
  },
};

export default function InterviewPreparationPage() {
  return <CareerGuideDetailClient slug="interview-preparation" />;
}
