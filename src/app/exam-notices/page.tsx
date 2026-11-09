import React from 'react';
import { Metadata } from 'next';
import ExamNoticesClient from '@/components/ExamNoticesClient';

export const metadata: Metadata = {
  title: 'সকল চাকরির পরীক্ষার সময়সূচি ও নোটিশ ২০২৬ | চাকরি সেবা',
  description: 'বিসিএস, প্রাথমিক শিক্ষক, বাংলাদেশ ব্যাংক, এনটিআরসিএ ও সরকারি নিয়োগ পরীক্ষার সর্বশেষ সময়সূচি ও আসনবিন্যাস।',
  alternates: {
    canonical: 'https://chakrisheba.com/exam-notices',
  },
  openGraph: {
    title: 'সকল চাকরির পরীক্ষার সময়সূচি ও নোটিশ ২০২৬ | চাকরি সেবা',
    description: 'বিসিএস, প্রাথমিক শিক্ষক, বাংলাদেশ ব্যাংক, এনটিআরসিএ ও সরকারি নিয়োগ পরীক্ষার সর্বশেষ সময়সূচি ও আসনবিন্যাস।',
    url: 'https://chakrisheba.com/exam-notices',
    siteName: 'চাকরি সেবা (Chakri Sheba)',
    type: 'website',
    locale: 'bn_BD',
  }
};

export default function ExamNoticesPage() {
  return <ExamNoticesClient />;
}
