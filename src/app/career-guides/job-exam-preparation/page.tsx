import React from 'react';
import { Metadata } from 'next';
import CareerGuideDetailClient from '@/components/CareerGuideDetailClient';

export const metadata: Metadata = {
  title: 'প্রথম চান্সেই সরকারি চাকরি পাওয়ার কৌশল ও দৈনিক রুটিন | চাকরি সেবা',
  description: 'বিসিএস ও সরকারি চাকরির প্রিলিমিনারি ও লিখিত পরীক্ষার দৈনিক স্টাডি রুটিন ও রিভিশন পদ্ধতি।',
  openGraph: {
    title: 'প্রথম চান্সেই সরকারি চাকরি পাওয়ার কৌশল | চাকরি সেবা',
    description: 'দৈনিক ৬ ঘণ্টার ফলপ্রসূ স্টাডি রুটিন ও রিভিশন টেকনিক।',
  },
};

export default function JobExamPreparationPage() {
  return <CareerGuideDetailClient slug="job-exam-preparation" />;
}
