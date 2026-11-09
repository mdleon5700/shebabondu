import React from 'react';
import { Metadata } from 'next';
import QuestionBankClient from '@/components/QuestionBankClient';

export const metadata: Metadata = {
  title: 'বিগত বছরের চাকরির পরীক্ষার প্রশ্নব্যাংক (Previous Year Questions) | চাকরি সেবা',
  description: 'বিসিএস প্রিলিমিনারি, প্রাথমিক সহকারী শিক্ষক ও বাংলাদেশ ব্যাংক নিয়োগ পরীক্ষার বিগত ১০-২০ বছরের প্রশ্ন ও ব্যাখ্যাসহ সমাধান।',
  openGraph: {
    title: 'বিগত বছরের প্রশ্নব্যাংক ও সমাধান | চাকরি সেবা',
    description: 'বিসিএস, প্রাথমিক শিক্ষক ও ব্যাংক জবস বিগত বছরের প্রশ্ন ও ব্যাখ্যাসহ সমাধান।',
  },
};

export default function PreviousYearQuestionsPage() {
  return <QuestionBankClient />;
}
