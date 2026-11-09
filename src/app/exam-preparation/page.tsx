import React from 'react';
import { Metadata } from 'next';
import ExamPreparationClient from '@/components/ExamPreparationClient';

export const metadata: Metadata = {
  title: 'চাকরির পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি ও বিষয়ভিত্তিক মানবন্টন ২০২৬ | চাকরি সেবা',
  description: 'বিসিএস, প্রাথমিক শিক্ষক ও ব্যাংক জব প্রিলিমিনারি ও লিখিত পরীক্ষার সম্পূর্ণ প্রস্তুতি সহায়িকা, সিলেবাস ও স্টাডি চেকলিস্ট।',
  openGraph: {
    title: 'চাকরির পরীক্ষার প্রস্তুতি ও সিলেবাস ২০২৬ | চাকরি সেবা',
    description: 'বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞানের বিষয়ভিত্তিক সিলেবাস ও স্টাডি প্রগ্রেস ট্র্যাকার।',
  },
};

export default function ExamPreparationPage() {
  return <ExamPreparationClient />;
}
